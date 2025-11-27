const axios = require('axios');
const cheerio = require('cheerio');

async function inspect() {
    try {
        console.log("Fetching Numbeo Prague page...");
        const { data } = await axios.get('https://www.numbeo.com/cost-of-living/in/Prague', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);

        console.log("Searching for Market items...");

        // Numbeo usually puts these in a table with class 'data_wide_table'
        // Look for rows containing specific keywords
        const keywords = ['Milk', 'Bread', 'Eggs', 'Chicken', 'Apples'];

        keywords.forEach(keyword => {
            console.log(`\n--- Searching for "${keyword}" ---`);
            $('tr').each((i, el) => {
                const text = $(el).text().trim();
                if (text.includes(keyword)) {
                    console.log("Found Row HTML:");
                    console.log($(el).html().trim());

                    // Try to extract price specifically
                    const price = $(el).find('.priceValue').text().trim();
                    console.log(`Extracted Price: ${price}`);
                }
            });
        });

    } catch (e) {
        console.error(e.message);
    }
}

inspect();
