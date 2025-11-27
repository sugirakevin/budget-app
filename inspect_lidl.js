const fs = require('fs');
const cheerio = require('cheerio');

async function inspect() {
    try {
        console.log('Reading lidl.html...');
        const data = fs.readFileSync('lidl.html', 'utf8');
        const $ = cheerio.load(data);

        console.log('\n--- Analyzing Scripts ---');
        $('script').each((i, el) => {
            const content = $(el).html();
            // Look for a large data object, typical in Nuxt/Next
            if (content && (content.includes('price') || content.includes('currency')) && content.length > 500) {
                console.log(`\n--- Script ${i} (First 2000 chars) ---`);
                console.log(content.substring(0, 2000));

                // Try to find a pattern like "products": [...]
                const productMatch = content.match(/"products":\s*\[(.*?)\]/);
                if (productMatch) {
                    console.log('\n!!! FOUND PRODUCTS ARRAY !!!');
                    console.log(productMatch[0].substring(0, 500) + '...');
                }
            }
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

inspect();
