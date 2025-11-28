// State Management
const state = {
    step: 0,
    data: {
        country: 'US',
        currency: '$',
        unit: 'miles',
        income: 0,
        address: '',
        city: '',
        zip: '',
        rent: 0,
        transportMode: 'car', // 'car' or 'public'
        carType: 'sedan',
        commuteDistance: 10,
        savingsTarget: 0,
        savingsMonths: 0,
        lat: null,
        lon: null,
        // New Fields
        adults: 1,
        kids: 0,
        pets: { dog: false, cat: false },
        internetCost: 0,
        mobileCost: 0,
        loans: 0,
        groceryItems: ['milk', 'bread', 'eggs', 'cheese', 'chicken', 'apples', 'banana', 'potato', 'water'],
        lifestyle: {
            gym: 0,
            streaming: 0,
            music: 0,
            other: 0
        }
    },
    estimates: {
        groceries: 0,
        gas: 0,
        transport: 0,
        discretionary: 0,
        scrapedProducts: [],
        nearbyStores: [],
        nearbyGasStations: [],
        utilities: 0,
        petCost: 0,
        loanCost: 0,
        lifestyleCost: 0,
        recommendedLifestyle: 0
    }
};


// DOM Elements - will be initialized after DOM loads
let contentArea, btnNext, btnBack, stepIndicator;

// Comprehensive Country List (Simplified for Demo)
// Country List is now loaded from countries.js

const CAR_EFFICIENCY = {
    'sedan': 28,
    'suv': 20,
    'truck': 17,
    'hybrid': 45,
    'ev': 100
};

// Helper to toggle transport inputs
window.setTransportMode = (mode) => {
    state.data.transportMode = mode;
    const carSection = document.getElementById('section-car');
    const publicSection = document.getElementById('section-public');
    const btnCar = document.getElementById('btn-mode-car');
    const btnPublic = document.getElementById('btn-mode-public');

    if (mode === 'car') {
        carSection.classList.remove('hidden');
        publicSection.classList.add('hidden');
        btnCar.classList.add('bg-blue-500', 'text-white', 'border-transparent');
        btnCar.classList.remove('bg-white/5', 'border-white/10');
        btnPublic.classList.remove('bg-blue-500', 'text-white', 'border-transparent');
        btnPublic.classList.add('bg-white/5', 'border-white/10');
    } else {
        carSection.classList.add('hidden');
        publicSection.classList.remove('hidden');
        btnPublic.classList.add('bg-blue-500', 'text-white', 'border-transparent');
        btnPublic.classList.remove('bg-white/5', 'border-white/10');
        btnCar.classList.remove('bg-blue-500', 'text-white', 'border-transparent');
        btnCar.classList.add('bg-white/5', 'border-white/10');
    }
};

// Helper to toggle pets
window.togglePet = (type) => {
    state.data.pets[type] = !state.data.pets[type];
    const btn = document.getElementById(`btn-pet-${type}`);
    if (state.data.pets[type]) {
        btn.classList.add('bg-blue-500/20', 'border-blue-500');
        btn.classList.remove('border-white/10');
    } else {
        btn.classList.remove('bg-blue-500/20', 'border-blue-500');
        btn.classList.add('border-white/10');
    }
};

// Helper to toggle internet
window.toggleInternet = () => {
    state.data.internet = !state.data.internet;
    const btn = document.getElementById('btn-internet');
    if (state.data.internet) {
        btn.classList.add('bg-blue-500/20', 'border-blue-500');
        btn.classList.remove('border-white/10');
    } else {
        btn.classList.remove('bg-blue-500/20', 'border-blue-500');
        btn.classList.add('border-white/10');
    }
};

// Helper to toggle grocery items
window.toggleGroceryItem = (itemId) => {
    const index = state.data.groceryItems.indexOf(itemId);
    if (index > -1) {
        state.data.groceryItems.splice(index, 1);
    } else {
        state.data.groceryItems.push(itemId);
    }

    const btn = document.getElementById(`btn-item-${itemId}`);
    if (state.data.groceryItems.includes(itemId)) {
        btn.classList.add('bg-blue-500/20', 'border-blue-500');
        btn.classList.remove('border-white/10');
    } else {
        btn.classList.remove('bg-blue-500/20', 'border-blue-500');
        btn.classList.add('border-white/10');
    }
};

// Steps Configuration
const steps = [
    {
        id: 0,
        title: "Welcome",
        render: () => `
            <div class="space-y-8 animate-fade-in text-center">
                <div class="mb-8">
                    <div class="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <i data-lucide="wallet" class="w-10 h-10 text-blue-400"></i>
                    </div>
                    <h2 class="text-4xl font-bold text-white mb-4">Welcome to GeoBudget</h2>
                    <p class="text-slate-400 text-lg max-w-md mx-auto">
                        Smart, location-aware budgeting that adapts to your lifestyle and local costs.
                    </p>
                </div>

                <div class="grid gap-4 max-w-sm mx-auto">
                    <button onclick="isLoginMode=true; toggleAuthModal()" 
                        class="w-full p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
                        <i data-lucide="log-in" class="w-5 h-5"></i> Login
                    </button>
                    
                    <button onclick="isLoginMode=false; toggleAuthModal()" 
                        class="w-full p-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-white/10">
                        <i data-lucide="user-plus" class="w-5 h-5"></i> Create Account
                    </button>

                    <div class="relative py-2">
                        <div class="absolute inset-0 flex items-center">
                            <div class="w-full border-t border-white/10"></div>
                        </div>
                        <div class="relative flex justify-center text-xs uppercase">
                            <span class="bg-[#0f172a] px-2 text-slate-500">Or continue as guest</span>
                        </div>
                    </div>

                    <button onclick="startDemoTest()" 
                        class="w-full p-4 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-dashed border-slate-700 hover:border-slate-500">
                        <i data-lucide="flask-conical" class="w-5 h-5"></i> Demo Test
                    </button>
                </div>
            </div>
        `,
        validate: () => true
    },
    {
        id: 1,
        title: "Location",
        render: () => `
            <div class="space-y-6 animate-fade-in">
                <div class="flex justify-between items-center">
                    <h2 class="text-3xl font-bold text-white">Where do you live?</h2>
                    <button onclick="detectLocation()" class="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2">
                        <i data-lucide="map-pin" class="w-4 h-4"></i> Locate Me
                    </button>
                </div>
                <p class="text-slate-400">We'll customize currency and scan for local amenities.</p>
                <p class="text-xs text-slate-500 flex items-center gap-1">
                    <i data-lucide="info" class="w-3 h-3"></i>
                    Auto-detect may be approximate. Please verify and adjust if needed.
                </p>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm text-slate-400 mb-2">Country</label>
                        <div class="relative">
                            <select id="input-country" class="input-field w-full p-4 rounded-xl appearance-none cursor-pointer text-lg">
                                ${COUNTRIES.map(c => `
                                    <option value="${c.code}" class="bg-slate-800 text-white" ${c.code === (state.data.countryCode || 'US') ? 'selected' : ''}>
                                        ${c.name} (${c.currency})
                                    </option>
                                `).join('')}
                            </select>
                            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <i data-lucide="chevron-down"></i>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm text-slate-400 mb-2">Address Details</label>
                        <input type="text" id="input-address" value="${state.data.address}" 
                            class="input-field w-full p-4 rounded-xl mb-4" placeholder="Street Address">
                        <div class="grid grid-cols-2 gap-4">
                            <input type="text" id="input-city" value="${state.data.city}" 
                                class="input-field w-full p-4 rounded-xl" placeholder="City">
                            <input type="text" id="input-zip" value="${state.data.zip}" 
                                class="input-field w-full p-4 rounded-xl" placeholder="Postal/Zip Code">
                        </div>
                    </div>
                </div>
            </div>
        `,
        validate: async () => {
            // Validate Country
            const code = document.getElementById('input-country').value;
            const country = COUNTRIES.find(c => c.code === code);
            if (country) {
                state.data.country = country.name;
                state.data.currency = country.currency;
                state.data.unit = country.unit;
                state.data.countryCode = country.code;
            } else {
                return false;
            }

            // Validate Address
            state.data.address = document.getElementById('input-address').value;
            state.data.city = document.getElementById('input-city').value;
            state.data.zip = document.getElementById('input-zip').value;

            if (!state.data.city || !state.data.zip) {
                return false;
            }

            // Geocode the manually entered address to get coordinates
            // Only geocode if we don't already have coordinates or if the address changed
            if (!state.data.lat || !state.data.lon || state.addressChanged) {
                try {
                    const query = `${state.data.city}, ${state.data.country}`;
                    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

                    const response = await fetch(geocodeUrl, {
                        headers: { 'User-Agent': 'BudgetApp/1.0' }
                    });

                    if (response.ok) {
                        const results = await response.json();
                        if (results && results.length > 0) {
                            state.data.lat = parseFloat(results[0].lat);
                            state.data.lon = parseFloat(results[0].lon);
                            console.log('📍 Geocoded address:', { city: state.data.city, lat: state.data.lat, lon: state.data.lon });
                        }
                    }
                } catch (e) {
                    console.warn('Geocoding failed, using existing coordinates:', e);
                }
                state.addressChanged = false;
            }

            return true;
        }
    },
    {
        id: 2,
        title: "Income",
        render: () => `
            <div class="space-y-6 animate-fade-in">
                <h2 class="text-3xl font-bold text-white">Monthly Income</h2>
                <p class="text-slate-400">What is your total monthly income after tax?</p>
                <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">${state.data.currency}</span>
                    <input type="number" id="input-income" value="${state.data.income || ''}" 
                        class="input-field w-full p-4 pl-12 rounded-xl text-2xl font-bold" placeholder="3000">
                </div>
            </div>
        `,
        validate: () => {
            const val = document.getElementById('input-income').value;
            if (!val || val <= 0) return false;
            state.data.income = parseFloat(val);
            return true;
        }
    },
    {
        id: 3,
        title: "Household",
        render: () => `
            <div class="space-y-6 animate-fade-in">
                <h2 class="text-3xl font-bold text-white">Who lives with you?</h2>
                <p class="text-slate-400">This helps estimate grocery and utility costs.</p>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm text-slate-400 mb-2">Adults</label>
                        <input type="number" id="input-adults" value="${state.data.adults}" min="1"
                            class="input-field w-full p-4 rounded-xl text-xl font-bold">
                    </div>
                    <div>
                        <label class="block text-sm text-slate-400 mb-2">Kids</label>
                        <input type="number" id="input-kids" value="${state.data.kids}" min="0"
                            class="input-field w-full p-4 rounded-xl text-xl font-bold">
                    </div>
                </div>

                <label class="block text-sm text-slate-400 mt-4">Pets</label>
                <div class="grid grid-cols-2 gap-4">
                    <button id="btn-pet-dog" onclick="togglePet('dog')" 
                        class="p-4 rounded-xl border ${state.data.pets.dog ? 'bg-blue-500/20 border-blue-500' : 'border-white/10'} transition-all flex items-center justify-center gap-2">
                        <i data-lucide="dog" class="w-5 h-5"></i> Dog
                    </button>
                    <button id="btn-pet-cat" onclick="togglePet('cat')" 
                        class="p-4 rounded-xl border ${state.data.pets.cat ? 'bg-blue-500/20 border-blue-500' : 'border-white/10'} transition-all flex items-center justify-center gap-2">
                        <i data-lucide="cat" class="w-5 h-5"></i> Cat
                    </button>
                </div>
            </div>
        `,
        validate: () => {
            state.data.adults = parseInt(document.getElementById('input-adults').value) || 1;
            state.data.kids = parseInt(document.getElementById('input-kids').value) || 0;
            return true;
        }
    },
    {
        id: 4,
        title: "Grocery Preferences",
        render: () => {
            const categories = [
                {
                    name: 'Dairy & Eggs',
                    items: [
                        { id: 'milk', label: 'Milk', icon: 'milk' },
                        { id: 'eggs', label: 'Eggs', icon: 'egg' },
                        { id: 'cheese', label: 'Cheese', icon: 'cheese-wedge' }
                    ]
                },
                {
                    name: 'Meat',
                    items: [
                        { id: 'chicken', label: 'Chicken', icon: 'drumstick' }
                    ]
                },
                {
                    name: 'Produce',
                    items: [
                        { id: 'apples', label: 'Apples', icon: 'apple' },
                        { id: 'banana', label: 'Bananas', icon: 'banana' },
                        { id: 'potato', label: 'Potatoes', icon: 'carrot' }
                    ]
                },
                {
                    name: 'Staples',
                    items: [
                        { id: 'bread', label: 'Bread', icon: 'wheat' },
                        { id: 'water', label: 'Water', icon: 'droplet' }
                    ]
                },
                {
                    name: 'Beverages',
                    items: [
                        { id: 'wine', label: 'Wine', icon: 'wine' },
                        { id: 'beer', label: 'Beer', icon: 'beer' }
                    ]
                }
            ];

            return `
                <div class="space-y-6 animate-fade-in">
                    <h2 class="text-3xl font-bold text-white">What do you buy?</h2>
                    <p class="text-slate-400">Select the grocery items you regularly purchase. We'll use real prices from Numbeo.</p>
                    
                    ${categories.map(category => `
                        <div class="space-y-3">
                            <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-wide">${category.name}</h3>
                            <div class="grid grid-cols-3 gap-3">
                                ${category.items.map(item => `
                                    <button id="btn-item-${item.id}" onclick="toggleGroceryItem('${item.id}')" 
                                        class="p-4 rounded-xl border ${state.data.groceryItems.includes(item.id) ? 'bg-blue-500/20 border-blue-500' : 'border-white/10'} transition-all flex flex-col items-center gap-2 hover:bg-white/5">
                                        <i data-lucide="${item.icon}" class="w-6 h-6"></i>
                                        <span class="text-sm">${item.label}</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                    
                    <div class="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p class="text-xs text-blue-200">
                            <i data-lucide="info" class="w-4 h-4 inline"></i>
                            Select at least 3 items for accurate estimates
                        </p>
                    </div>
                </div>
            `;
        },
        validate: () => {
            return state.data.groceryItems.length >= 3;
        }
    },
    {
        id: 5,
        title: "Housing",
        render: () => `
            <div class="space-y-6 animate-fade-in">
                <h2 class="text-3xl font-bold text-white">Rent or Mortgage</h2>
                <p class="text-slate-400">Fixed monthly housing cost.</p>
                <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">${state.data.currency}</span>
                    <input type="number" id="input-rent" value="${state.data.rent || ''}" 
                        class="input-field w-full p-4 pl-12 rounded-xl text-2xl font-bold" placeholder="1200">
                </div>
            </div>
        `,
        validate: () => {
            const val = document.getElementById('input-rent').value;
            if (!val || val < 0) return false;
            state.data.rent = parseFloat(val);
            return true;
        }
    },
    {
        id: 6,
        title: "Bills & Debt",
        render: () => {
            // Calculate budget recommendations based on 50/30/20 rule
            // 50% of income for "Needs" (Rent, Bills, Debt)
            // We'll suggest Internet + Phone should be ~5-8% of income
            // And Loans should ideally be under 15% of income
            const monthlyIncome = state.data.income || 0;
            const suggestedInternet = Math.round(monthlyIncome * 0.04); // 4% for internet
            const suggestedMobile = Math.round(monthlyIncome * 0.03); // 3% for phone
            const suggestedLoansMax = Math.round(monthlyIncome * 0.15); // Max 15% for debt

            return `
            <div class="space-y-6 animate-fade-in">
                <h2 class="text-3xl font-bold text-white">Bills & Debt</h2>
                <p class="text-slate-400">Recurring monthly expenses.</p>
                
                ${monthlyIncome > 0 ? `
                <div class="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-sm font-semibold text-purple-300">Smart Budget Guide</h3>
                        <span class="text-xs text-purple-400">Based on your income</span>
                    </div>
                    <p class="text-sm text-slate-300">
                        For your income of <span class="font-bold text-white">${state.data.currency}${monthlyIncome.toLocaleString()}</span>, 
                        we recommend keeping bills under <span class="font-bold text-purple-300">${state.data.currency}${(suggestedInternet + suggestedMobile).toLocaleString()}</span>/mo 
                        and debt payments under <span class="font-bold text-purple-300">${state.data.currency}${suggestedLoansMax.toLocaleString()}</span>/mo.
                    </p>
                </div>
                ` : ''}
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm text-slate-400 mb-2 flex justify-between">
                            <span>Home Internet (Monthly)</span>
                            ${monthlyIncome > 0 ? `<span class="text-xs text-blue-400">Suggested: ${state.data.currency}${suggestedInternet}</span>` : ''}
                        </label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">${state.data.currency}</span>
                            <input type="number" id="input-internet" value="${state.data.internetCost || ''}" 
                                class="input-field w-full p-4 pl-12 rounded-xl text-xl" placeholder="0">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm text-slate-400 mb-2 flex justify-between">
                            <span>Mobile Phone (Monthly)</span>
                            ${monthlyIncome > 0 ? `<span class="text-xs text-blue-400">Suggested: ${state.data.currency}${suggestedMobile}</span>` : ''}
                        </label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">${state.data.currency}</span>
                            <input type="number" id="input-mobile" value="${state.data.mobileCost || ''}" 
                                class="input-field w-full p-4 pl-12 rounded-xl text-xl" placeholder="0">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm text-slate-400 mb-2 flex justify-between">
                            <span>Loan Repayments (Monthly)</span>
                            ${monthlyIncome > 0 ? `<span class="text-xs text-orange-400">Max recommended: ${state.data.currency}${suggestedLoansMax}</span>` : ''}
                        </label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">${state.data.currency}</span>
                            <input type="number" id="input-loans" value="${state.data.loans || ''}" 
                                class="input-field w-full p-4 pl-12 rounded-xl text-xl" placeholder="0">
                        </div>
                    </div>
                </div>
            </div>
        `;
        },
        validate: () => {
            state.data.internetCost = parseFloat(document.getElementById('input-internet').value) || 0;
            state.data.mobileCost = parseFloat(document.getElementById('input-mobile').value) || 0;
            state.data.loans = parseFloat(document.getElementById('input-loans').value) || 0;
            return true;
        }
    },
    {
        id: 7,
        title: "Lifestyle & Subscriptions",
        render: () => {
            // Calculate suggestions based on income and local data
            // 50/30/20 Rule: 30% of income for "Wants" (Lifestyle)
            // But we should be conservative, maybe 10-15% for these specific subscriptions
            const monthlyIncome = state.data.income || 0;
            const suggestedMax = Math.round(monthlyIncome * 0.15);

            // Try to find scraped gym price
            const gymItem = state.estimates.scrapedProducts ? state.estimates.scrapedProducts.find(p => p.name.includes('Gym')) : null;
            const gymSuggestion = gymItem ? `${gymItem.price} ${gymItem.currency}` : 'Avg: $40';

            return `
            <div class="space-y-6 animate-fade-in">
                <h2 class="text-3xl font-bold text-white">Lifestyle & Fun</h2>
                <p class="text-slate-400">Plan your monthly entertainment and wellness budget.</p>
                
                <div class="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-6">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-sm font-semibold text-purple-300">Smart Suggestion</h3>
                        <span class="text-xs text-purple-400">Based on your income</span>
                    </div>
                    <p class="text-sm text-slate-300">
                        For your income of <span class="font-bold text-white">${state.data.currency}${monthlyIncome}</span>, 
                        a healthy lifestyle budget (subscriptions, hobbies) is around 
                        <span class="font-bold text-purple-300">${state.data.currency}${suggestedMax}</span>/mo.
                    </p>
                </div>

                <div class="space-y-4">
                    <!-- Gym / Sports -->
                    <div>
                        <label class="block text-sm text-slate-400 mb-2 flex justify-between">
                            <span>Sports & Gym</span>
                            <span class="text-xs text-blue-400">Local Avg: ${gymSuggestion}</span>
                        </label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">${state.data.currency}</span>
                            <input type="number" id="input-gym" value="${state.data.lifestyle.gym || ''}" 
                                class="input-field w-full p-4 pl-12 rounded-xl text-xl" placeholder="0">
                        </div>
                    </div>

                    <!-- Streaming -->
                    <div>
                        <label class="block text-sm text-slate-400 mb-2 flex justify-between">
                            <span>Streaming (Netflix, HBO, etc.)</span>
                            <span class="text-xs text-slate-500">Std: $15-20</span>
                        </label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">${state.data.currency}</span>
                            <input type="number" id="input-streaming" value="${state.data.lifestyle.streaming || ''}" 
                                class="input-field w-full p-4 pl-12 rounded-xl text-xl" placeholder="0">
                        </div>
                    </div>

                    <!-- Music -->
                    <div>
                        <label class="block text-sm text-slate-400 mb-2 flex justify-between">
                            <span>Music (Spotify, Apple Music)</span>
                            <span class="text-xs text-slate-500">Std: $10</span>
                        </label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">${state.data.currency}</span>
                            <input type="number" id="input-music" value="${state.data.lifestyle.music || ''}" 
                                class="input-field w-full p-4 pl-12 rounded-xl text-xl" placeholder="0">
                        </div>
                    </div>

                    <!-- Other -->
                    <div>
                        <label class="block text-sm text-slate-400 mb-2">Other Hobbies</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">${state.data.currency}</span>
                            <input type="number" id="input-other" value="${state.data.lifestyle.other || ''}" 
                                class="input-field w-full p-4 pl-12 rounded-xl text-xl" placeholder="0">
                        </div>
                    </div>
                </div>
            </div>
            `;
        },
        validate: () => {
            state.data.lifestyle.gym = parseFloat(document.getElementById('input-gym').value) || 0;
            state.data.lifestyle.streaming = parseFloat(document.getElementById('input-streaming').value) || 0;
            state.data.lifestyle.music = parseFloat(document.getElementById('input-music').value) || 0;
            state.data.lifestyle.other = parseFloat(document.getElementById('input-other').value) || 0;
            return true;
        }
    },
    {
        id: 8,
        title: "Transport",
        render: () => `
            <div class="space-y-6 animate-fade-in">
                <h2 class="text-3xl font-bold text-white">How do you get around?</h2>
                <p class="text-slate-400">Choose your primary mode of transport.</p>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <button id="btn-mode-car" onclick="setTransportMode('car')" 
                        class="p-4 rounded-xl border ${state.data.transportMode === 'car' ? 'bg-blue-500 text-white border-transparent' : 'bg-white/5 border-white/10'} transition-all flex flex-col items-center gap-2">
                        <i data-lucide="car" class="w-6 h-6"></i>
                        <span class="font-semibold">Own Car</span>
                    </button>
                    <button id="btn-mode-public" onclick="setTransportMode('public')" 
                        class="p-4 rounded-xl border ${state.data.transportMode === 'public' ? 'bg-blue-500 text-white border-transparent' : 'bg-white/5 border-white/10'} transition-all flex flex-col items-center gap-2">
                        <i data-lucide="bus" class="w-6 h-6"></i>
                        <span class="font-semibold">Public Transport</span>
                    </button>
                </div>

                <!--Car Section-->
                <div id="section-car" class="${state.data.transportMode === 'car' ? '' : 'hidden'} space-y-4">
                    <label class="block text-sm text-slate-400">Vehicle Type</label>
                    <div class="grid grid-cols-3 gap-3">
                        ${['Sedan', 'SUV', 'Truck', 'Hybrid', 'EV'].map(type => `
                            <button onclick="selectCarType('${type.toLowerCase()}')" 
                                class="car-btn p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-all ${state.data.carType === type.toLowerCase() ? 'bg-blue-500/20 border-blue-500' : ''}"
                                data-type="${type.toLowerCase()}">
                                ${type}
                            </button>
                        `).join('')}
                    </div>

                    <label class="block text-sm text-slate-400 mt-4">Daily Commute (${state.data.unit})</label>
                    <input type="number" id="input-commute" value="${state.data.commuteDistance}" 
                        class="input-field w-full p-4 rounded-xl" placeholder="${state.data.unit} per day">
                </div>

                <!--Public Transport Section-->
    <div id="section-public" class="${state.data.transportMode === 'public' ? '' : 'hidden'} space-y-4">
        <div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div class="flex items-start gap-3">
                <i data-lucide="info" class="w-5 h-5 text-blue-400 mt-1"></i>
                <div>
                    <p class="text-sm text-blue-200">We'll scan for local public transport prices (Monthly Pass) in <strong>${state.data.city || 'your area'}</strong>.</p>
                </div>
            </div>
        </div>
    </div>
            </div>
        `,
        validate: () => {
            if (state.data.transportMode === 'car') {
                state.data.commuteDistance = parseFloat(document.getElementById('input-commute').value) || 0;
            }
            return true;
        }
    },
    {
        id: 9,
        title: "Savings Goal",
        render: () => `
            <div class="space-y-6 animate-fade-in">
                <h2 class="text-3xl font-bold text-white">What is your Goal?</h2>
                <p class="text-slate-400">We'll calculate how much you need to save monthly.</p>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm text-slate-400 mb-2">Total Amount to Save</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">${state.data.currency}</span>
                            <input type="number" id="input-savings-target" value="${state.data.savingsTarget || ''}" 
                                class="input-field w-full p-4 pl-12 rounded-xl text-2xl font-bold" placeholder="60000">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm text-slate-400 mb-2">Timeframe (Months)</label>
                        <input type="number" id="input-savings-months" value="${state.data.savingsMonths || ''}" 
                            class="input-field w-full p-4 rounded-xl text-xl" placeholder="6">
                    </div>
                </div>
            </div>
        `,
        validate: () => {
            const target = parseFloat(document.getElementById('input-savings-target').value);
            const months = parseFloat(document.getElementById('input-savings-months').value);

            if (!target || target <= 0) return false;
            if (!months || months <= 0) return false;

            state.data.savingsTarget = target;
            state.data.savingsMonths = months;
            return true;
        }
    },
    {
        id: 10,
        title: "Analyzing...",
        render: () => `
            <div class="flex flex-col items-center justify-center space-y-6 text-center animate-fade-in">
                <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <h2 class="text-2xl font-bold text-white">Scanning ${state.data.city}...</h2>
                <p class="text-slate-400" id="analysis-status">Locating nearby stores...</p>
            </div>
        `,
        validate: () => true,
        onEnter: async () => {
            await performAnalysis();
        }
    },
    {
        id: 11,
        title: "Your Budget",
        render: () => renderDashboard()
    }
];

// Helper Functions
window.detectLocation = async () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    // Prevent multiple clicks
    if (state.isLocating) return;

    // Check permissions API first if available
    if (navigator.permissions && navigator.permissions.query) {
        try {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            console.log('📍 Permission state:', result.state);
            if (result.state === 'denied') {
                showLocationError("Access blocked. Click the 🔒 lock icon in your address bar to reset.");
                return;
            }
        } catch (e) {
            console.warn('Permissions API error:', e);
        }
    }

    state.isLocating = true;

    const btn = document.querySelector('button[onclick="detectLocation()"]');
    if (!btn) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Locating...`;
    btn.disabled = true;
    btn.classList.add('opacity-50', 'cursor-not-allowed');
    lucide.createIcons();

    // Clear any previous error messages
    const existingError = document.getElementById('location-error');
    if (existingError) existingError.remove();

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        state.data.lat = latitude;
        state.data.lon = longitude;

        console.log('📍 Got coordinates:', { latitude, longitude, accuracy: `${Math.round(accuracy)}m` });

        // Show accuracy warning if location is not precise
        if (accuracy > 1000) {
            showLocationError(`Location accuracy: ±${Math.round(accuracy / 1000)}km. Please verify the address below.`, "yellow");
        } else if (accuracy > 100) {
            showLocationError(`Location accuracy: ±${Math.round(accuracy)}m. Please verify the address below.`, "yellow");
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1&accept-language=en`;
            console.log('🌐 Fetching from Nominatim:', nominatimUrl);

            const response = await fetch(nominatimUrl, {
                headers: { 'User-Agent': 'BudgetApp/1.0' },
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`Geocoding API returned ${response.status}`);

            const data = await response.json();
            console.log('✅ Nominatim response:', data);

            if (data.address) {
                const addr = data.address;
                const streetAddress = `${addr.house_number || ''} ${addr.road || addr.pedestrian || addr.street || ''}`.trim();

                let city = addr.city || addr.town || addr.village || addr.municipality || addr.county || addr.state_district || data.name || '';
                if (city) {
                    city = city.replace(/^(Capital City of|City of|Municipality of)\s+/i, '');
                    if (city.includes(' of ')) city = city.split(' of ').pop();
                }

                const zip = addr.postcode || '';
                const countryCode = (addr.country_code || 'us').toUpperCase();

                // Update State
                state.data.address = streetAddress || 'Address not found';
                state.data.city = city;
                state.data.zip = zip;

                const country = COUNTRIES.find(c => c.code === countryCode);
                if (country) {
                    state.data.country = country.name;
                    state.data.currency = country.currency;
                    state.data.unit = country.unit;
                    state.data.countryCode = country.code;
                    const select = document.getElementById('input-country');
                    if (select) select.value = country.code;
                }

                // Update UI
                const addrInput = document.getElementById('input-address');
                if (addrInput) addrInput.value = state.data.address;
                const cityInput = document.getElementById('input-city');
                if (cityInput) cityInput.value = state.data.city;
                const zipInput = document.getElementById('input-zip');
                if (zipInput) zipInput.value = state.data.zip;

                btn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> Located!`;
                lucide.createIcons();

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.classList.remove('opacity-50', 'cursor-not-allowed');
                    state.isLocating = false;
                    lucide.createIcons();
                }, 2000);

                if (!city) {
                    showLocationError("City name not found, please enter manually.", "yellow");
                }
            } else {
                throw new Error('No address data returned');
            }
        } catch (e) {
            console.error("❌ Geocoding error:", e);
            let errorMsg = "Address lookup failed. Please enter manually.";
            if (e.name === 'AbortError') errorMsg = "Request timed out. Please try again.";

            showLocationError(errorMsg);
            resetButton(btn, originalText);
        }
    }, (err) => {
        console.error("❌ Geolocation error:", err);
        let errorMsg = "Location access failed.";
        if (err.code === 1) {
            errorMsg = "Access denied. Check browser 🔒 icon or System Settings.";
        } else if (err.code === 2) {
            errorMsg = "Location unavailable. Try refreshing.";
        } else if (err.code === 3) {
            errorMsg = "Request timed out. Please try again.";
        }

        showLocationError(errorMsg);
        resetButton(btn, originalText);
    }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });
};

function showLocationError(msg, color = "red") {
    const btn = document.querySelector('button[onclick="detectLocation()"]');
    if (!btn) return;

    const errorDiv = document.createElement('div');
    errorDiv.id = 'location-error';
    errorDiv.className = `text-${color}-400 text-xs mt-2 animate-fade-in flex items-center gap-1`;
    errorDiv.innerHTML = `<i data-lucide="${color === 'red' ? 'alert-circle' : 'alert-triangle'}" class="w-3 h-3"></i> ${msg}`;
    btn.parentNode.appendChild(errorDiv);
    lucide.createIcons();
}

function resetButton(btn, originalText) {
    btn.innerHTML = `<i data-lucide="alert-circle" class="w-4 h-4"></i> Failed`;
    lucide.createIcons();
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
        state.isLocating = false;
        lucide.createIcons();
    }, 3000);
}

window.selectCarType = (type) => {
    state.data.carType = type;
    document.querySelectorAll('.car-btn').forEach(btn => {
        if (btn.dataset.type === type) {
            btn.classList.add('bg-blue-500/20', 'border-blue-500');
        } else {
            btn.classList.remove('bg-blue-500/20', 'border-blue-500');
        }
    });
};

// Demo Test Function - Simplified version that just sets state and progresses
window.startDemoTest = () => {
    // Fill demo data
    state.data = {
        country: 'Czech Republic',
        countryCode: 'CZ',
        currency: 'Kč',
        unit: 'km',
        address: '123 Main Street',
        city: 'Prague',
        zip: '110 00',
        lat: 50.0755,
        lon: 14.4378,
        income: 50000,
        dependents: 2,
        hasCar: true,
        carType: 'sedan',
        carUsage: 500,
        rent: 15000,
        loans: 5000,
        subscriptions: 2000,
        savingsGoal: 10000
    };

    // Jump directly to dashboard
    state.step = 11;
    renderStep();
};

async function performAnalysis() {
    const status = document.getElementById('analysis-status');

    try {
        // 1. Get Location Coordinates (if not already set)
        if (!state.data.lat || !state.data.lon) {
            status.innerText = "Geocoding address...";
            const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(state.data.address + ', ' + state.data.city + ', ' + state.data.country)}`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

            if (geoData && geoData.length > 0) {
                state.data.lat = geoData[0].lat;
                state.data.lon = geoData[0].lon;
            }
        }

        // 2. Scrape Data (Store Prices, Gas, Transport, Utilities)
        status.innerText = "Scanning local prices (Groceries, Gas, Transport, Utilities)...";
        console.log('Selected grocery items:', state.data.groceryItems);
        const scrapeUrl = `/api/scrape?lat=${state.data.lat}&lon=${state.data.lon}&country=${state.data.countryCode}&city=${state.data.city}&items=${state.data.groceryItems.join(',')}`;
        console.log('Scrape URL:', scrapeUrl);
        const scrapeRes = await fetch(scrapeUrl);
        const scrapeData = await scrapeRes.json();

        state.estimates.scrapedProducts = scrapeData.products || [];
        state.estimates.nearbyStores = scrapeData.nearbyStores || [];
        state.estimates.nearbyGasStations = scrapeData.nearbyGasStations || [];

        // 3. Calculate Estimates
        status.innerText = "Calculating budget...";

        // Transport
        if (state.data.transportMode === 'car') {
            const gasPrice = scrapeData.gasPrice || 1.50; // Default fallback
            state.estimates.gasPrice = gasPrice; // Save for dashboard
            const efficiency = CAR_EFFICIENCY[state.data.carType];
            const dailyCost = (state.data.commuteDistance / efficiency) * gasPrice;
            state.estimates.gas = Math.round(dailyCost * 30); // Monthly
            state.estimates.transport = state.estimates.gas + 100; // + Insurance/Maintenance
        } else {
            state.estimates.transport = scrapeData.transportPrice || 50; // Fallback $50
            state.estimates.gasPrice = 0;
        }

        // Groceries (Calculate from real Numbeo data)
        let monthlyGroceryCost = 0;

        if (state.estimates.scrapedProducts.length > 0) {
            const groceryItems = state.estimates.scrapedProducts.filter(p => !p.name.includes('Internet') && !p.name.includes('Phone'));

            // Calculate average price of selected items as a cost-of-living indicator
            const avgItemPrice = groceryItems.reduce((sum, item) => sum + item.price, 0) / groceryItems.length;

            // Use the average price as a multiplier for the base grocery cost
            // Higher average prices indicate higher cost of living
            const countryData = COUNTRIES.find(c => c.code === state.data.countryCode);
            const baseGroceryPerPerson = countryData ? countryData.groceries : 400;

            // Calculate price index relative to expected baseline (e.g., 30 currency units as baseline)
            const priceIndex = avgItemPrice / 30;

            const householdSize = state.data.adults + (state.data.kids * 0.6);
            monthlyGroceryCost = Math.round(baseGroceryPerPerson * householdSize * priceIndex);
        } else {
            const countryData = COUNTRIES.find(c => c.code === state.data.countryCode);
            const baseGroceryPerPerson = countryData ? countryData.groceries : 400;
            const householdSize = state.data.adults + (state.data.kids * 0.6);
            monthlyGroceryCost = Math.round(baseGroceryPerPerson * householdSize * (scrapeData.groceryMultiplier || 1.0));
        }

        state.estimates.groceries = monthlyGroceryCost;
        state.estimates.nearbyPetStores = scrapeData.nearbyPetStores || [];

        // Utilities & Bills - Use user-provided costs directly
        state.estimates.utilities = Math.round(state.data.internetCost + state.data.mobileCost);

        // Pets
        const countryData = COUNTRIES.find(c => c.code === state.data.countryCode);
        const basePetCostPerPet = countryData && countryData.petCare ? countryData.petCare : 50;

        let basePetCost = 0;
        if (state.data.pets.dog) basePetCost += basePetCostPerPet;
        if (state.data.pets.cat) basePetCost += (basePetCostPerPet * 0.6);

        state.estimates.petCost = Math.round(basePetCost * (scrapeData.groceryMultiplier || 1.0));

        // Loans
        state.estimates.loanCost = state.data.loans;

        // Lifestyle
        const lifestyleTotal = state.data.lifestyle.gym + state.data.lifestyle.streaming + state.data.lifestyle.music + state.data.lifestyle.other;
        state.estimates.lifestyleCost = lifestyleTotal;
        state.estimates.recommendedLifestyle = Math.round(state.data.income * 0.15);

        // Savings
        state.estimates.savings = Math.round(state.data.savingsTarget / state.data.savingsMonths);

        // Total Discretionary
        const totalExpenses = state.data.rent + state.estimates.transport + state.estimates.groceries + state.estimates.utilities + state.estimates.petCost + state.estimates.loanCost + state.estimates.lifestyleCost + state.estimates.savings;
        state.estimates.discretionary = Math.round(state.data.income - totalExpenses);

        // Wait a bit to show completion
        await new Promise(r => setTimeout(r, 1000));
        nextStep();

    } catch (error) {
        console.error(error);
        status.innerText = "Error analyzing data. Please try again.";
        status.innerHTML += `<br><button onclick="performAnalysis()" class="mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">Retry</button>`;
    }
}

function renderDashboard() {
    // Check if estimates need recalculation (e.g., if they were calculated with old buggy logic)
    const needsRecalculation = state.estimates.groceries > (state.data.income * 0.5);

    if (needsRecalculation) {
        console.log('[renderDashboard] Estimates appear incorrect, recalculating...');
        console.log(`  Groceries: ${state.estimates.groceries}, Income: ${state.data.income}`);

        // Recalculate groceries using the new simplified logic
        const countryData = COUNTRIES.find(c => c.code === state.data.countryCode);
        const baseGroceryPerPerson = countryData ? countryData.groceries : 400;
        const householdSize = state.data.adults + (state.data.kids * 0.6);
        state.estimates.groceries = Math.round(baseGroceryPerPerson * householdSize);

        console.log(`  Recalculated groceries: ${state.estimates.groceries}`);

        // Recalculate total discretionary
        const totalExpenses = state.data.rent + state.estimates.transport + state.estimates.groceries + (state.estimates.utilities || 0) + state.estimates.petCost + state.estimates.loanCost + state.estimates.lifestyleCost + state.estimates.savings;
        state.estimates.discretionary = Math.round(state.data.income - totalExpenses);

        // Save the corrected estimates
        saveUserData();
    }

    const { income, currency, rent } = state.data;
    const { transport, transportMode, groceries, discretionary, nearbyStores, utilities, petCost, loanCost, lifestyleCost, recommendedLifestyle } = state.estimates;
    const isPositive = discretionary >= 0;
    const savingsMonthly = Math.round(state.data.savingsTarget / state.data.savingsMonths);

    return `
        <div class="animate-fade-in h-full flex flex-col">
            <div class="text-center mb-6">
                <h2 class="text-3xl font-bold text-white">Monthly Budget</h2>
                <p class="text-slate-400">For <span class="text-blue-400">${state.data.city}</span>, ${state.data.country}</p>
            </div >

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p class="text-slate-400 text-sm">Income</p>
                    <p class="text-2xl font-bold text-green-400">${currency}${income.toLocaleString()}</p>
                </div>
                <div class="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p class="text-slate-400 text-sm">Remaining</p>
                    <p class="text-2xl font-bold ${isPositive ? 'text-blue-400' : 'text-red-400'}">${currency}${discretionary.toLocaleString()}</p>
                </div>
            </div>

            <div class="space-y-4 flex-grow overflow-y-auto pr-2">
                <!-- Map Container -->
                <div id="map" class="mb-4 border border-white/10"></div>

                <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="font-semibold text-blue-300 flex items-center gap-2">
                            <i data-lucide="map-pin" class="w-4 h-4"></i> Estimates
                        </h3>
                    </div>
                    
                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="text-white">Groceries (${state.data.adults} Adults, ${state.data.kids} Kids)</p>
                                <p class="text-xs text-slate-400">
                                    ${nearbyStores.length > 0 && typeof nearbyStores[0] === 'object'
            ? `Found: ${nearbyStores.map(s => s.name).join(', ')}`
            : 'Based on local pricing'}
                                </p>
                            </div>
                            <p class="font-bold text-white">${currency}${groceries}</p>
                        </div>

                        <!-- Live Prices Section -->
                        ${state.estimates.scrapedProducts.length > 0 ? `
                            <div class="mt-2 pl-4 border-l-2 border-blue-500/20">
                                <h4 class="text-xs font-semibold text-blue-300 mb-2">Live Prices Found (Numbeo)</h4>
                                ${(() => {
                // Category mapping
                const categoryMap = {
                    'Dairy & Eggs': ['milk', 'eggs', 'cheese'],
                    'Meat': ['chicken'],
                    'Produce': ['apples', 'banana', 'potato'],
                    'Staples': ['bread', 'water'],
                    'Beverages': ['wine', 'beer']
                };

                // Group products by category
                const categorizedProducts = {};
                state.estimates.scrapedProducts.forEach(p => {
                    const productId = p.name.toLowerCase().split(' ')[0].replace(/[^a-z]/g, '');
                    for (const [category, items] of Object.entries(categoryMap)) {
                        if (items.some(item => productId.includes(item) || item.includes(productId))) {
                            if (!categorizedProducts[category]) categorizedProducts[category] = [];
                            categorizedProducts[category].push(p);
                            break;
                        }
                    }
                });

                // Render categories
                return Object.entries(categorizedProducts).map(([category, products]) => `
                                        <div class="mb-2">
                                            <h5 class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">${category}</h5>
                                            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-300">
                                                ${products.map(p => `
                                                    <div class="flex justify-between">
                                                        <span>${p.name.split('(')[0]}</span>
                                                        <span class="text-white">${p.price} ${p.currency}</span>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    `).join('');
            })()}
                            </div>
                        ` : ''}



                        ${state.estimates.petCost > 0 ? `
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="text-white">Pet Care (Monthly)</p>
                                <p class="text-xs text-slate-400">
                                    ${state.estimates.nearbyPetStores && state.estimates.nearbyPetStores.length > 0
                ? `Found: ${state.estimates.nearbyPetStores.map(s => s.name).join(', ')}`
                : 'Estimated based on local pricing'}
                                </p>
                            </div>
                            <p class="font-bold text-white">${currency}${petCost}</p>
                        </div>
                        ` : ''}
                    </div>


                </div>

                <div class="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h3 class="font-semibold text-slate-300 mb-3">Fixed Costs</h3>
                    <div class="space-y-2">
                        ${(() => {
            // Calculate budget status for each expense
            const getBudgetStatus = (amount, recommendedPercent) => {
                const recommended = income * recommendedPercent;
                const threshold90 = recommended * 0.9; // 90% of recommended

                if (amount <= threshold90) {
                    return { color: 'green', icon: '●', label: 'In budget' };
                } else if (amount <= recommended) {
                    return { color: 'yellow', icon: '●', label: 'Close to limit' };
                } else {
                    return { color: 'red', icon: '●', label: 'Over budget' };
                }
            };

            const rentStatus = getBudgetStatus(rent, 0.30); // 30% for housing
            const utilitiesStatus = getBudgetStatus(utilities, 0.07); // 7% for internet + phone
            const transportStatus = getBudgetStatus(transport, 0.10); // 10% for transport
            const loanStatus = getBudgetStatus(loanCost, 0.15); // 15% for debt

            return `
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <span class="text-${rentStatus.color}-400 text-lg">${rentStatus.icon}</span>
                                <span class="text-slate-400">Rent/Mortgage</span>
                            </div>
                            <span class="text-white font-bold">${currency}${rent.toLocaleString()}</span>
                        </div>
                        ${utilities > 0 ? `
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <span class="text-${utilitiesStatus.color}-400 text-lg">${utilitiesStatus.icon}</span>
                                <span class="text-slate-400">Internet & Phone</span>
                            </div>
                            <span class="text-white font-bold">${currency}${utilities.toLocaleString()}</span>
                        </div>
                        ` : ''}
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <span class="text-${transportStatus.color}-400 text-lg">${transportStatus.icon}</span>
                                <span class="text-slate-400">Transport (${transportMode})</span>
                            </div>
                            <span class="text-white font-bold">${currency}${transport.toLocaleString()}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <span class="text-${loanStatus.color}-400 text-lg">${loanStatus.icon}</span>
                                <span class="text-slate-400">Loan Repayments</span>
                            </div>
                            <span class="text-white font-bold">${currency}${loanCost.toLocaleString()}</span>
                        </div>
                            `;
        })()}
                        ${lifestyleCost > 0 ? `
                        <div class="flex justify-between items-center">
                            <div>
                                <span class="text-slate-400">Lifestyle & Subs</span>
                                ${lifestyleCost > recommendedLifestyle ?
                `<span class="block text-[10px] text-orange-400">⚠️ Over recommended (${currency}${recommendedLifestyle})</span>` :
                `<span class="block text-[10px] text-green-400">✅ Within budget</span>`}
                            </div>
                            <span class="text-white font-bold">${currency}${lifestyleCost.toLocaleString()}</span>
                        </div>
                        ` : ''}
                        <div class="flex justify-between">
                            <span class="text-slate-400">Savings Goal</span>
                            <span class="text-white font-bold">${currency}${savingsMonthly.toLocaleString()}</span>
                        </div>
                    </div >
                </div>
            </div>
        </div>
    `;
}

function initMap() {
    setTimeout(() => {
        if (!state.data.lat || !state.data.lon) return;

        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        mapContainer.style.height = "200px";
        mapContainer.style.width = "100%";
        mapContainer.style.borderRadius = "0.75rem";

        const map = L.map('map').setView([state.data.lat, state.data.lon], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        L.marker([state.data.lat, state.data.lon])
            .addTo(map)
            .bindPopup("You are here")
            .openPopup();

        if (state.estimates.nearbyStores) {
            const storeIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            state.estimates.nearbyStores.forEach(store => {
                if (store.lat && store.lon) {
                    L.marker([store.lat, store.lon], { icon: storeIcon })
                        .addTo(map)
                        .bindPopup(`< b > ${store.name}</b > <br>${store.brand}`);
                }
            });
        }

        if (state.estimates.nearbyGasStations) {
            const gasIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            state.estimates.nearbyGasStations.forEach(station => {
                if (station.lat && station.lon) {
                    L.marker([station.lat, station.lon], { icon: gasIcon })
                        .addTo(map)
                        .bindPopup(`<b>${station.name}</b><br>Gas Station`);
                }
            });
        }

        if (state.estimates.nearbyPetStores) {
            const petIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            state.estimates.nearbyPetStores.forEach(store => {
                if (store.lat && store.lon) {
                    L.marker([store.lat, store.lon], { icon: petIcon })
                        .addTo(map)
                        .bindPopup(`<b>${store.name}</b><br>${store.type === 'vet' ? 'Veterinary' : 'Pet Shop'}`);
                }
            });
        }

    }, 500);
}

// Navigation Logic
function renderStep() {
    console.log('🔍 renderStep called, state.step:', state.step);
    console.log('🔍 contentArea:', contentArea);
    console.log('🔍 steps array length:', steps.length);

    const currentStep = steps.find(s => s.id === state.step);
    console.log('🔍 currentStep:', currentStep);

    if (!currentStep) {
        console.error('❌ No step found for state.step:', state.step);
        return;
    }

    if (!contentArea) {
        console.error('❌ contentArea is null or undefined!');
        return;
    }

    // Hide step indicator on Welcome screen
    if (state.step === 0) {
        stepIndicator.classList.add('hidden');
    } else {
        stepIndicator.classList.remove('hidden');
        stepIndicator.textContent = `${state.step} / ${steps.length - 1}`;
    }

    contentArea.innerHTML = currentStep.render();
    lucide.createIcons();

    if (state.step === 11) { // Updated step index for dashboard
        initMap();
        saveUserData(); // Auto-save when reaching dashboard
    }

    // Hide Back button on Welcome (0), Location (1), and Dashboard (11)
    if (state.step <= 1 || state.step === 11) {
        btnBack.classList.add('hidden');
    } else {
        btnBack.classList.remove('hidden');
    }

    // Hide Next button on Welcome (0), Analyzing (10), and Dashboard (11)
    if (state.step === 0 || state.step === steps.length - 1 || state.step === 10) {
        btnNext.classList.add('hidden');
    } else {
        btnNext.classList.remove('hidden');
        btnNext.innerHTML = `Next <i data-lucide="arrow-right" class="w-4 h-4"></i>`;
    }

    if (currentStep.onEnter) {
        currentStep.onEnter();
    }
}

async function nextStep() {
    const currentStep = steps.find(s => s.id === state.step);
    if (currentStep.validate) {
        const isValid = await currentStep.validate();
        if (!isValid) {
            const input = contentArea.querySelector('input');
            if (input) {
                input.classList.add('border-red-500');
                setTimeout(() => input.classList.remove('border-red-500'), 500);
            }
            return;
        }
    }

    if (state.step < steps.length - 1) {
        state.step++;
        renderStep();
    }
}

function prevStep() {
    if (state.step > 0) {
        state.step--;
        renderStep();
    }
}

// Event listeners and initialization are now in DOMContentLoaded above

// Authentication Logic
let isLoginMode = true;

window.toggleAuthModal = () => {
    const modal = document.getElementById('auth-modal');
    modal.classList.toggle('hidden');
    document.getElementById('auth-error').classList.add('hidden');
};

window.toggleAuthMode = () => {
    isLoginMode = !isLoginMode;
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const btn = document.getElementById('btn-auth-submit');
    const switchText = document.getElementById('auth-switch-text');
    const switchBtn = document.getElementById('auth-switch-btn');

    if (isLoginMode) {
        title.innerText = "Welcome Back";
        subtitle.innerText = "Sign in to save your budget progress.";
        btn.innerText = "Login";
        switchText.innerText = "Don't have an account?";
        switchBtn.innerText = "Sign Up";
    } else {
        title.innerText = "Create Account";
        subtitle.innerText = "Start your journey to financial freedom.";
        btn.innerText = "Create Account";
        switchText.innerText = "Already have an account?";
        switchBtn.innerText = "Login";
    }
};

window.handleAuth = async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const errorDiv = document.getElementById('auth-error');
    const btn = document.getElementById('btn-auth-submit');

    errorDiv.classList.add('hidden');
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin inline"></i> Processing...`;
    lucide.createIcons();

    const endpoint = isLoginMode ? '/api/login' : '/api/register';

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Authentication failed');

        // Success
        localStorage.setItem('budget_token', data.token);
        localStorage.setItem('budget_user', JSON.stringify(data.user));

        updateAuthUI(data.user);
        toggleAuthModal();

        // Load saved data if available
        await loadUserData();

    } catch (err) {
        errorDiv.innerText = err.message;
        errorDiv.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.innerText = isLoginMode ? "Login" : "Create Account";
    }
};

// Profile Functions
window.toggleProfileModal = () => {
    const modal = document.getElementById('profile-modal');
    modal.classList.toggle('hidden');
    // Reset password form
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('pass-msg').classList.add('hidden');
};

window.handleChangePassword = async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const btn = document.getElementById('btn-change-pass');
    const msg = document.getElementById('pass-msg');

    btn.disabled = true;
    btn.innerText = "Updating...";

    try {
        const token = localStorage.getItem('budget_token');
        const res = await fetch('/api/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await res.json();

        msg.classList.remove('hidden');
        if (res.ok) {
            msg.className = "text-center text-xs text-green-400 mt-2";
            msg.innerText = "Password updated successfully!";
            setTimeout(() => {
                document.getElementById('current-password').value = '';
                document.getElementById('new-password').value = '';
                msg.classList.add('hidden');
            }, 2000);
        } else {
            throw new Error(data.error || "Failed to update");
        }
    } catch (err) {
        msg.className = "text-center text-xs text-red-400 mt-2";
        msg.innerText = err.message;
    } finally {
        btn.disabled = false;
        btn.innerText = "Update Password";
    }
};

window.restartWizard = () => {
    if (confirm("This will restart the wizard steps. Your data will be preserved until you change it.")) {
        state.step = 1; // Go to Location step
        renderStep();
        toggleProfileModal();
    }
};

window.updateAuthUI = (user) => {
    const authBtn = document.getElementById('btn-auth-trigger');
    const btnText = document.getElementById('auth-btn-text');

    if (user) {
        // Logged In State
        if (btnText) btnText.innerText = user.email.split('@')[0]; // Show username
        authBtn.onclick = toggleProfileModal;
        authBtn.innerHTML = `<i data-lucide="user" class="w-4 h-4"></i> <span id="auth-btn-text">${user.email.split('@')[0]}</span>`;
        authBtn.classList.add('bg-blue-500/20', 'text-blue-400');
        authBtn.classList.remove('bg-white/10');

        // Update profile email in modal
        const profileEmail = document.getElementById('profile-email');
        if (profileEmail) profileEmail.innerText = user.email;

        // Fetch Notifications
        try {
            fetchNotifications();
            document.getElementById('btn-notifications')?.classList.remove('hidden');
        } catch (err) {
            console.error('Error initializing notifications:', err);
        }
    } else {
        // Logged Out State
        authBtn.onclick = toggleAuthModal;
        authBtn.innerHTML = `<i data-lucide="log-in" class="w-4 h-4"></i> <span id="auth-btn-text">Login</span>`;
        authBtn.classList.remove('bg-blue-500/20', 'text-blue-400');
        authBtn.classList.add('bg-white/10');
        document.getElementById('btn-notifications').classList.add('hidden');
    }
    lucide.createIcons();
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM element references
    contentArea = document.getElementById('app-content');
    btnNext = document.getElementById('btn-next');
    btnBack = document.getElementById('btn-back');
    stepIndicator = document.getElementById('step-indicator');

    // Set up event listeners
    btnNext.addEventListener('click', nextStep);
    btnBack.addEventListener('click', prevStep);

    // Check auth on load
    const savedUser = localStorage.getItem('budget_user');
    if (savedUser) {
        updateAuthUI(JSON.parse(savedUser));
        loadUserData();
    } else {
        // Start wizard if not logged in - render the initial step
        renderStep();
    }
});

// Data Persistence Functions
async function saveUserData() {
    const token = localStorage.getItem('budget_token');
    if (!token) return;

    try {
        // Save both input data and calculated estimates
        const payload = {
            data: state.data,
            estimates: state.estimates
        };

        await fetch('/api/budget', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ data: payload })
        });
        console.log('✅ Budget data & estimates saved');
    } catch (e) {
        console.error('❌ Error saving budget data:', e);
    }
}

async function loadUserData() {
    const token = localStorage.getItem('budget_token');
    if (!token) return;

    try {
        const res = await fetch('/api/budget', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const { data } = await res.json();
            if (data) {
                console.log('✅ Budget data loaded:', data);

                // Restore data and estimates
                if (data.data) state.data = { ...state.data, ...data.data };
                if (data.estimates) state.estimates = { ...state.estimates, ...data.estimates };

                // Check if data is "complete" enough to jump to dashboard
                // Criteria: Has income and city
                if (state.data.income > 0 && state.data.city) {
                    state.step = 11; // Jump to Dashboard
                    renderStep();
                } else {
                    // Has partial data, continue from where they left off
                    renderStep();
                }
            } else {
                // No data saved yet, start from step 1 (Location) for logged-in users
                console.log('No saved data, starting at Location step');
                state.step = 1; // Skip welcome screen for logged-in users
                renderStep();
            }
        } else {
            // API error, start at step 1 for logged-in users
            console.log('API error, starting at Location step');
            state.step = 1;
            renderStep();
        }
    } catch (e) {
        console.error('❌ Error loading budget data:', e);
        state.step = 1; // Start at Location step on error
        renderStep();
    }
}

// Notification Logic
window.toggleNotifications = () => {
    const dropdown = document.getElementById('notification-dropdown');
    dropdown.classList.toggle('hidden');
};

window.fetchNotifications = async () => {
    try {
        const token = localStorage.getItem('budget_token');
        if (!token) return;

        const res = await fetch('/api/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.notifications) {
            renderNotifications(data.notifications);
        }
    } catch (err) {
        console.error("Error fetching notifications:", err);
    }
};

function renderNotifications(notifications) {
    const list = document.getElementById('notification-list');
    const badge = document.getElementById('notif-badge');

    // Safety check - if elements don't exist, exit gracefully
    if (!list || !badge) {
        console.warn('Notification elements not found in DOM');
        return;
    }

    if (notifications.length === 0) {
        list.innerHTML = '<p class="text-center text-slate-500 text-sm py-4">No new notifications</p>';
        badge.classList.add('hidden');
        return;
    }

    const unreadCount = notifications.filter(n => !n.is_read).length;
    if (unreadCount > 0) {
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    list.innerHTML = notifications.map(n => `
        <div class="p-3 bg-white/5 rounded-lg border border-white/10 ${!n.is_read ? 'border-l-blue-500 border-l-4' : ''}">
            <p class="text-sm text-white">${n.message}</p>
            <p class="text-xs text-slate-400 mt-1">${new Date(n.created_at).toLocaleDateString()}</p>
        </div>
    `).join('');
}

// DIAGNOSTIC: Test if this script is loading
console.log('✅ app.js loaded successfully');
console.log('📊 State:', state);
console.log('📋 Steps array:', steps ? `${steps.length} steps` : 'undefined');

window.logout = () => {
    localStorage.removeItem('budget_token');
    localStorage.removeItem('budget_user');
    updateAuthUI(null);
    document.getElementById('profile-modal').classList.add('hidden');

    // Reset state to initial values
    state.step = 0;
    state.data = {
        income: 0,
        country: '',
        city: '',
        address: '',
        zip: '',
        lat: null,
        lon: null,
        adults: 1,
        kids: 0,
        pets: { dog: false, cat: false },
        groceryItems: [],
        dependents: 0,
        hasCar: false,
        carType: 'sedan',
        carUsage: 0,
        rent: 0,
        loans: 0,
        subscriptions: 0,
        savingsTarget: 0,
        savingsMonths: 12,
        internet: true,
        mobileCount: 1,
        lifestyle: { gym: 0, streaming: 0, music: 0, other: 0 }
    };
    state.estimates = {};

    // Redirect to welcome page
    renderStep();
};
