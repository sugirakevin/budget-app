const axios = require('axios');

async function test() {
    try {
        console.log("Testing Real Grocery Scraping (Numbeo)...");
        // Prague Center Coordinates
        const lat = 50.0755;
        const lon = 14.4378;

        const url = `http://localhost:3001/api/scrape?lat=${lat}&lon=${lon}&country=CZ&city=Prague`;
        console.log(`Fetching from: ${url}`);

        const { data } = await axios.get(url);

        console.log("Source:", data.source);
        console.log("Products Found:", data.products ? data.products.length : 0);

        if (data.products && data.products.length > 0) {
            console.log("First 3 Products:");
            data.products.slice(0, 3).forEach(p => {
                console.log(`- ${p.name}: ${p.price} ${p.currency}`);
            });
        } else {
            console.log("No products returned.");
        }

    } catch (e) {
        console.error("API Test Failed:", e.message);
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", e.response.data);
        }
    }
}

async function runTests() {
    console.log("--- Run 1 (Cold Cache) ---");
    const start1 = Date.now();
    await test();
    console.log(`Run 1 took: ${Date.now() - start1}ms`);

    console.log("\n--- Run 2 (Cached) ---");
    const start2 = Date.now();
    await test();
    console.log(`Run 2 took: ${Date.now() - start2}ms`);
}

runTests();
