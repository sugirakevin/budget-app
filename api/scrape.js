const axios = require('axios');
const cheerio = require('cheerio');

// In-Memory Cache
const CACHE = {
    data: {},
    timestamps: {}
};

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 Hours

// Helper to check cache
function getFromCache(key) {
    const timestamp = CACHE.timestamps[key];
    if (timestamp && (Date.now() - timestamp < CACHE_TTL)) {
        console.log(`⚡ Using cached data for: ${key}`);
        return CACHE.data[key];
    }
    return null;
}

// Helper to save to cache
function saveToCache(key, data) {
    CACHE.data[key] = data;
    CACHE.timestamps[key] = Date.now();
}

// Helper delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data for Fallback (when scraping fails or for demo)
const MOCK_DATA = {
    'CZ': [
        { name: 'Mléko trvanlivé 1,5% (Lidl)', price: 19.90, currency: 'Kč' },
        { name: 'Chléb konzumní 1200g', price: 34.90, currency: 'Kč' },
        { name: 'Vejce M 10ks', price: 49.90, currency: 'Kč' },
        { name: 'Máslo 250g', price: 59.90, currency: 'Kč' },
        { name: 'Banány 1kg', price: 29.90, currency: 'Kč' },
        { name: 'Kuřecí prsní řízky 1kg', price: 189.00, currency: 'Kč' }
    ]
};

// Country Name Mapping for GlobalPetrolPrices
const COUNTRY_MAP = {
    'CZ': 'Czech Republic',
    'US': 'USA',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'ES': 'Spain',
    'IT': 'Italy',
    'PL': 'Poland',
    'SK': 'Slovakia',
    'AT': 'Austria',
    'HU': 'Hungary'
};

const MOCK_GAS_PRICES = {
    'CZ': 38.50, // CZK
    'US': 3.50,  // USD (Gallon? Need to check unit) - Site is usually Liter
    'DE': 1.85,  // EUR
    'default': 1.50 // Generic
};

// Store Tiers for Price Estimation
const STORE_TIERS = {
    budget: ['lidl', 'aldi', 'penny', 'netto', 'kaufland', 'biedronka', 'dia', 'winco', 'save-a-lot', 'grocery outlet'],
    premium: ['whole foods', 'waitrose', 'marks & spencer', 'erewhon', 'trader joe\'s', 'sprouts', 'wegmans', 'harris teeter'],
    standard: ['tesco', 'carrefour', 'walmart', 'kroger', 'safeway', 'publix', 'albert', 'billa', 'rewe', 'edeka', 'sainsbury\'s', 'asda', 'morrisons']
};

async function getNearbyStores(lat, lon) {
    const cacheKey = `stores_${lat.toFixed(3)}_${lon.toFixed(3)}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
        // Overpass API Query: Find supermarkets within 3000m (3km)
        const query = `
            [out:json];
            (
              node["shop"="supermarket"](around:3000, ${lat}, ${lon});
              way["shop"="supermarket"](around:3000, ${lat}, ${lon});
              relation["shop"="supermarket"](around:3000, ${lat}, ${lon});
            );
            out tags center;
        `;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

        console.log(`Fetching nearby stores from Overpass...`);
        const { data } = await axios.get(url, { timeout: 8000 });

        if (data && data.elements) {
            const results = data.elements.map(el => {
                return {
                    name: el.tags.name || 'Unknown Supermarket',
                    brand: el.tags.brand || el.tags.name || '',
                    lat: el.lat || (el.center && el.center.lat),
                    lon: el.lon || (el.center && el.center.lon),
                    distance: 'Unknown' // Overpass doesn't give distance directly without calc
                };
            }).slice(0, 5); // Limit to top 5

            saveToCache(cacheKey, results);
            return results;
        }
        return [];
    } catch (e) {
        console.warn("Overpass API failed:", e.message);
        return [];
    }
}

function calculateStoreMultiplier(stores) {
    if (!stores || stores.length === 0) return 1.0;

    let totalScore = 0;
    let count = 0;

    stores.forEach(store => {
        const name = (store.name + ' ' + store.brand).toLowerCase();
        if (STORE_TIERS.budget.some(b => name.includes(b))) {
            totalScore += 0.85; // 15% cheaper
        } else if (STORE_TIERS.premium.some(p => name.includes(p))) {
            totalScore += 1.35; // 35% more expensive
        } else {
            totalScore += 1.0; // Standard
        }
        count++;
    });

    return count > 0 ? (totalScore / count) : 1.0;
}

async function getNearbyGasStations(lat, lon) {
    const cacheKey = `gas_stations_${lat.toFixed(3)}_${lon.toFixed(3)}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    // Rate Limiting Delay for Cache Miss
    await delay(2000);

    try {
        // Overpass API Query: Find gas stations within 5000m (5km)
        const query = `
            [out:json];
            (
              node["amenity"="fuel"](around:5000, ${lat}, ${lon});
              way["amenity"="fuel"](around:5000, ${lat}, ${lon});
              relation["amenity"="fuel"](around:5000, ${lat}, ${lon});
            );
            out tags center;
        `;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

        console.log(`Fetching nearby gas stations from Overpass...`);
        const { data } = await axios.get(url, { timeout: 8000 });

        if (data && data.elements) {
            const results = data.elements.map(el => {
                return {
                    name: el.tags.name || el.tags.brand || 'Local Station',
                    brand: el.tags.brand || '',
                    lat: el.lat || (el.center && el.center.lat),
                    lon: el.lon || (el.center && el.center.lon),
                    distance: 'Unknown'
                };
            }).slice(0, 3); // Limit to top 3

            saveToCache(cacheKey, results);
            return results;
        }
        return [];
    } catch (e) {
        console.warn("Overpass API (Gas) failed:", e.message);
        return [];
    }
}

async function getNearbyPetStores(lat, lon) {
    const cacheKey = `pet_stores_${lat.toFixed(3)}_${lon.toFixed(3)}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    // Rate Limiting Delay for Cache Miss
    await delay(2000);

    try {
        // Overpass API Query: Find pet shops and vets within 5000m (5km)
        const query = `
            [out:json];
            (
              node["shop"="pet"](around:5000, ${lat}, ${lon});
              way["shop"="pet"](around:5000, ${lat}, ${lon});
              relation["shop"="pet"](around:5000, ${lat}, ${lon});
              node["amenity"="veterinary"](around:5000, ${lat}, ${lon});
              way["amenity"="veterinary"](around:5000, ${lat}, ${lon});
              relation["amenity"="veterinary"](around:5000, ${lat}, ${lon});
            );
            out tags center;
        `;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

        console.log(`Fetching nearby pet stores from Overpass...`);
        const { data } = await axios.get(url, { timeout: 8000 });

        if (data && data.elements) {
            const results = data.elements.map(el => {
                return {
                    name: el.tags.name || (el.tags.amenity === 'veterinary' ? 'Veterinary Clinic' : 'Pet Shop'),
                    type: el.tags.amenity === 'veterinary' ? 'vet' : 'shop',
                    lat: el.lat || (el.center && el.center.lat),
                    lon: el.lon || (el.center && el.center.lon),
                    distance: 'Unknown'
                };
            }).slice(0, 5); // Limit to top 5

            saveToCache(cacheKey, results);
            return results;
        }
        return [];
    } catch (e) {
        console.warn("Overpass API (Pet) failed:", e.message);
        return [];
    }
}

async function getPublicTransportPrice(city, country) {
    const cacheKey = `transport_${city}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
        if (!city) return null;

        // Special handling for Prague (PID)
        if (city.toLowerCase() === 'prague' || city.toLowerCase() === 'praha') {
            console.log('Fetching Prague transport price from PID...');
            const pidUrl = 'https://pid.cz/en/tickets-and-fare/';
            const { data } = await axios.get(pidUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                timeout: 6000
            });
            const $ = cheerio.load(data);

            // PID structure: Look for "550" (Monthly) and "30" (30min/One-way approx)
            // This is a simplified scrape for demo purposes
            let monthly = 550;
            let oneWay = 30; // 30 CZK for 30 min ticket

            // Validate if site still has 550
            let confirmed = false;
            $('td').each((i, el) => {
                if ($(el).text().includes('550')) confirmed = true;
            });

            if (confirmed) {
                const result = { monthly, oneWay, source: 'Official (PID)' };
                saveToCache(cacheKey, result);
                return result;
            }
        }

        // Default Numbeo Scraper
        const formattedCity = city.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('_');

        const url = `https://www.numbeo.com/cost-of-living/in/${formattedCity}`;
        console.log(`Fetching transport price from: ${url}`);

        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 6000
        });

        const $ = cheerio.load(data);

        let monthly = null;
        let oneWay = null;

        $('tr').each((i, el) => {
            const text = $(el).text().trim();
            const priceText = $(el).find('.priceValue').text().trim();

            if (!priceText) return;

            let numStr = priceText.replace(/[^0-9.,]/g, '');
            if (numStr.includes(',')) {
                if (numStr.indexOf(',') > numStr.indexOf('.')) {
                    numStr = numStr.replace(/\./g, '').replace(',', '.');
                } else {
                    numStr = numStr.replace(/,/g, '');
                }
            }
            const price = parseFloat(numStr);

            if (text.includes('Monthly Pass (Regular Price)')) {
                monthly = price;
            } else if (text.includes('One-way Ticket (Local Transport)')) {
                oneWay = price;
            }
        });

        if (monthly || oneWay) {
            const result = { monthly, oneWay, source: 'Numbeo' };
            saveToCache(cacheKey, result);
            return result;
        }
        return null;

    } catch (e) {
        console.warn("Transport Scrape failed:", e.message);
        return null;
    }
}

async function getGroceryPrices(city, country, selectedItems = []) {
    const cacheKey = `groceries_${city}_${selectedItems.join('_')}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
        if (!city) return [];

        const formattedCity = city.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('_');

        const url = `https://www.numbeo.com/cost-of-living/in/${formattedCity}`;
        console.log(`Fetching grocery prices from: ${url}`);

        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 8000
        });

        const $ = cheerio.load(data);
        const products = [];

        $('tr').each((i, el) => {
            const name = $(el).find('td').first().text().trim();
            const priceText = $(el).find('.priceValue').text().trim();

            if (name && priceText) {
                // Filter based on selected items if provided
                const isSelected = selectedItems.length === 0 || selectedItems.some(item => name.toLowerCase().includes(item.toLowerCase()));

                if (isSelected) {
                    let numStr = priceText.replace(/[^0-9.,]/g, '');
                    if (numStr.includes(',')) {
                        if (numStr.indexOf(',') > numStr.indexOf('.')) {
                            numStr = numStr.replace(/\./g, '').replace(',', '.');
                        } else {
                            numStr = numStr.replace(/,/g, '');
                        }
                    }

                    const price = parseFloat(numStr);
                    const currency = priceText.replace(/[0-9.,\s]/g, '');

                    if (!isNaN(price)) {
                        products.push({ name, price, currency });
                    }
                }
            }
        });

        if (products.length > 0) saveToCache(cacheKey, products);
        return products;

    } catch (e) {
        console.warn("Grocery Scrape failed:", e.message);
        return [];
    }
}

const EXA_API_KEY = 'ddc94469-f902-4275-ae3c-44a2761bee87';

async function getGasPriceFromExa(city, countryName) {
    const cacheKey = `gas_exa_${countryName}_${city || 'general'}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
        console.log(`🔍 Exa.ai: Searching for gas prices in ${city}, ${countryName}...`);

        // 1. Search for recent gas price news/data
        const query = `current price of 1 liter of gasoline in ${city} ${countryName} ${new Date().getFullYear()}`;

        const response = await axios.post(
            'https://api.exa.ai/search',
            {
                query: query,
                numResults: 3,
                useAutoprompt: true,
                contents: {
                    text: true,
                    highlights: {
                        numSentences: 2,
                        query: "price of gasoline liter"
                    }
                }
            },
            {
                headers: {
                    'x-api-key': EXA_API_KEY,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        const results = response.data.results;
        if (!results || results.length === 0) return null;

        // 2. Try to extract a price from the text
        // Regex to look for currency-like numbers (e.g., $1.50, 35.50 CZK, 1.50 EUR)
        // This is a simple heuristic and might need refinement
        let foundPrice = null;

        for (const result of results) {
            const text = (result.highlights && result.highlights[0]) || result.text || '';
            console.log(`   📄 Checking result: ${result.title}`);

            // Look for patterns like "1.50 EUR", "$1.50", "35 CZK"
            // We prioritize the currency of the country if possible, but for now just look for numbers near "gas" or "petrol"
            const priceMatch = text.match(/(\d+[.,]\d{2})\s?(EUR|USD|CZK|GBP|\$|€|Kč)/i);

            if (priceMatch) {
                foundPrice = parseFloat(priceMatch[1].replace(',', '.'));
                console.log(`   💰 Found price: ${foundPrice} (from text: "${priceMatch[0]}")`);
                break;
            }
        }

        if (foundPrice) {
            saveToCache(cacheKey, foundPrice);
            return foundPrice;
        }

    } catch (error) {
        console.warn("Exa.ai Gas Search failed:", error.message);
    }
    return null;
}

module.exports = async (req, res) => {
    const { country, lat, lon, city, items } = req.query;
    const countryCode = country || 'CZ';
    const countryName = COUNTRY_MAP[countryCode] || 'Czech Republic';

    const result = {
        products: [],
        gasPrice: null,
        transportPrice: null,
        nearbyStores: [],
        nearbyGasStations: [],
        nearbyPetStores: [],
        groceryMultiplier: 1.0,
        source: 'mixed'
    };

    try {
        // 1. Scrape Gas Prices (Exa.ai -> Fallback)
        const gasPrice = await getGasPriceFromExa(city, countryName);
        if (gasPrice) {
            result.gasPrice = gasPrice;
            result.gasSource = 'exa_ai';
        } else {
            // Fallback to Mock if Exa fails
            result.gasPrice = MOCK_GAS_PRICES[countryCode] || MOCK_GAS_PRICES['default'];
            result.gasSource = 'fallback_mock';
        }

        // 2. Scrape Transport Prices (Numbeo or PID)
        if (city) {
            const transportPrice = await getPublicTransportPrice(city, countryName);
            if (transportPrice) result.transportPrice = transportPrice;
        }

        // 3. Get Nearby Stores (Overpass API)
        if (lat && lon) {
            // Add delays between Overpass calls to avoid 429
            const stores = await getNearbyStores(parseFloat(lat), parseFloat(lon));
            result.nearbyStores = stores;

            // Calculate grocery multiplier based on store tiers
            result.groceryMultiplier = calculateStoreMultiplier(stores);

            await delay(1000);
            const gasStations = await getNearbyGasStations(parseFloat(lat), parseFloat(lon));
            result.nearbyGasStations = gasStations;

            await delay(1000);
            const petStores = await getNearbyPetStores(parseFloat(lat), parseFloat(lon));
            result.nearbyPetStores = petStores;
        }

        // 4. Scrape Grocery Prices (Numbeo) with selected items
        if (city) {
            const selectedItems = items ? items.split(',') : [];
            console.log(`Selected grocery items: ${selectedItems.join(', ') || 'all'}`);
            const groceries = await getGroceryPrices(city, countryName, selectedItems);
            if (groceries.length > 0) {
                result.products = groceries;
                result.source = 'live_numbeo';
            } else {
                result.products = MOCK_DATA[countryCode] || MOCK_DATA['CZ']; // Fallback
                result.source = 'fallback_mock';
            }
        } else {
            result.products = MOCK_DATA[countryCode] || MOCK_DATA['CZ'];
        }
    } catch (error) {
        console.error('Scrape Error:', error.message);
    }

    // Final Fallback for Gas if everything failed (should be covered above, but safety check)
    if (!result.gasPrice) {
        result.gasPrice = MOCK_GAS_PRICES[countryCode] || MOCK_GAS_PRICES['default'];
        result.gasSource = 'fallback_final';
    }

    res.json(result);
};
