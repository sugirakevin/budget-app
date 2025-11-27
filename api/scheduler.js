const db = require('./database');
const scrapeHandler = require('./scrape'); // We need to adapt scrapeHandler to be callable internally
const { calculateTotal, calculateVariableCosts } = require('./calculator');

// Helper to promisify db.all
const getAllUsers = () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM users WHERE budget_data IS NOT NULL`, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// Helper to call scrape internally
// scrapeHandler expects (req, res), so we need to mock it or refactor scrape.js
// Refactoring scrape.js is better, but for now let's mock.
const fetchScrapeData = async (lat, lon, country, city, items) => {
    // We can't easily import the logic from scrape.js if it's designed as an express handler.
    // Let's assume we can fetch from the running server or refactor scrape.js.
    // For simplicity, let's fetch from the local API if the server is running.
    // But we are inside the server process.

    // Better approach: Refactor scrape.js to export the core logic.
    // I will assume I can require the core logic if I refactor scrape.js next.
    // For now, I'll use a placeholder and then refactor scrape.js.
    return {};
};

async function checkPrices() {
    console.log('🕒 Running Daily Price Check...');
    try {
        const users = await getAllUsers();
        console.log(`Found ${users.length} users with budget data.`);

        for (const user of users) {
            try {
                const budgetData = JSON.parse(user.budget_data);
                const { data, estimates } = budgetData;

                if (!data || !estimates) continue;

                // 1. Scrape Fresh Data
                // We need to call the scraper. 
                // Since we haven't refactored scrape.js yet, I'll use a fetch to localhost
                // assuming the server is running on port 3001.
                const items = data.groceryItems ? data.groceryItems.join(',') : '';
                const url = `http://localhost:3001/api/scrape?lat=${data.lat}&lon=${data.lon}&country=${data.countryCode}&city=${encodeURIComponent(data.city)}&items=${items}`;

                const res = await fetch(url);
                const freshScrapeData = await res.json();

                // 2. Calculate New Variable Costs (only groceries, gas, pets)
                const { estimates: newEstimates, totalVariableCosts: newVariableCosts } = calculateVariableCosts(data, freshScrapeData);

                // Calculate old variable costs from saved estimates
                const oldGas = (data.transportMode === 'car' && estimates.gas) ? estimates.gas : 0;
                const oldGroceries = estimates.groceries || 0;
                const oldPetCost = estimates.petCost || 0;
                const oldVariableCosts = oldGas + oldGroceries + oldPetCost;

                const diff = Math.abs(newVariableCosts - oldVariableCosts);

                console.log(`\n=== User ${user.email} ===`);
                console.log(`Income: ${data.currency}${data.income}`);
                console.log(`Old Variable Costs: ${data.currency}${oldVariableCosts}`);
                console.log(`  - Gas: ${oldGas}`);
                console.log(`  - Groceries: ${oldGroceries}`);
                console.log(`  - Pet Cost: ${oldPetCost}`);
                console.log(`New Variable Costs: ${data.currency}${newVariableCosts}`);
                console.log(`  - Gas: ${newEstimates.gas}`);
                console.log(`  - Groceries: ${newEstimates.groceries}`);
                console.log(`  - Pet Cost: ${newEstimates.petCost}`);
                console.log(`Difference: ${data.currency}${diff}`);

                if (diff > 500) {
                    const msg = `Price Alert: Your estimated expenses have changed by ${data.currency}${diff.toLocaleString()}.`;

                    db.run(`INSERT INTO notifications (user_id, message, diff_amount) VALUES (?, ?, ?)`,
                        [user.id, msg, diff], (err) => {
                            if (err) console.error("Failed to save notification", err);
                            else console.log(`🔔 Notification saved for ${user.email}`);
                        });
                }

            } catch (err) {
                console.error(`Error processing user ${user.id}:`, err);
            }
        }
    } catch (err) {
        console.error("Scheduler Error:", err);
    }
}

function startScheduler() {
    // Run immediately on startup for testing
    setTimeout(checkPrices, 5000);

    // Run every 24 hours (86400000 ms)
    setInterval(checkPrices, 86400000);
}

module.exports = { startScheduler };
