const { COUNTRIES, CAR_EFFICIENCY } = require('./constants');

function calculateTotal(userData, scrapeData) {
    const estimates = {};
    const scrapedProducts = scrapeData.products || [];

    // 1. Transport
    if (userData.transportMode === 'car') {
        const gasPrice = scrapeData.gasPrice || 1.50;
        const efficiency = CAR_EFFICIENCY[userData.carType] || 25;
        const dailyCost = (userData.commuteDistance / efficiency) * gasPrice;
        estimates.gas = Math.round(dailyCost * 30);
        estimates.transport = estimates.gas + 100; // + Insurance/Maintenance
    } else {
        estimates.transport = scrapeData.transportPrice || 50;
    }

    // 2. Groceries - Use base country values (scraped prices are unit prices, not budgets)
    const countryData = COUNTRIES.find(c => c.code === userData.countryCode) || COUNTRIES.find(c => c.code === 'OTHER');
    const baseGroceryPerPerson = countryData ? countryData.groceries : 400;
    const householdSize = userData.adults + (userData.kids * 0.6);
    const monthlyGroceryCost = Math.round(baseGroceryPerPerson * householdSize);
    estimates.groceries = monthlyGroceryCost;

    // 3. Fixed Costs (Internet & Phone) - Calculate once and add to rent
    let fixedUtilityCost = 0;
    if (userData.internet) {
        const internetItem = scrapedProducts.find(p => p.name.includes('Internet'));
        fixedUtilityCost += internetItem ? internetItem.price : 50;
    }
    if (userData.mobileCount > 0) {
        const phoneItem = scrapedProducts.find(p => p.name.includes('Phone'));
        const phonePrice = phoneItem ? phoneItem.price : 30;
        fixedUtilityCost += phonePrice * userData.mobileCount;
    }
    // Add fixed utility costs to rent
    const totalFixedCosts = userData.rent + fixedUtilityCost;

    // 4. Pets
    const petCountryData = COUNTRIES.find(c => c.code === userData.countryCode) || COUNTRIES.find(c => c.code === 'OTHER');
    const basePetCostPerPet = petCountryData && petCountryData.petCare ? petCountryData.petCare : 50;

    let basePetCost = 0;
    if (userData.pets.dog) basePetCost += basePetCostPerPet;
    if (userData.pets.cat) basePetCost += (basePetCostPerPet * 0.6);

    estimates.petCost = Math.round(basePetCost * (scrapeData.groceryMultiplier || 1.0));

    // 5. Loans
    estimates.loanCost = userData.loans || 0;

    // 6. Lifestyle
    const lifestyleTotal = (userData.lifestyle.gym || 0) + (userData.lifestyle.streaming || 0) + (userData.lifestyle.music || 0) + (userData.lifestyle.other || 0);
    estimates.lifestyleCost = lifestyleTotal;

    // 7. Savings
    estimates.savings = Math.round(userData.savingsTarget / (userData.savingsMonths || 12));

    // Total (internet and phone now included in fixed costs with rent)
    const totalExpenses = totalFixedCosts + estimates.transport + estimates.groceries + estimates.petCost + estimates.loanCost + estimates.lifestyleCost + estimates.savings;

    console.log(`[calculateTotal] Breakdown for user:`);
    console.log(`  Fixed Costs (Rent + Internet + Phone): ${totalFixedCosts}`);
    console.log(`  Transport: ${estimates.transport}`);
    console.log(`  Groceries: ${estimates.groceries}`);
    console.log(`  Pet Cost: ${estimates.petCost}`);
    console.log(`  Loan Cost: ${estimates.loanCost}`);
    console.log(`  Lifestyle: ${estimates.lifestyleCost}`);
    console.log(`  Savings: ${estimates.savings}`);
    console.log(`  TOTAL: ${totalExpenses}`);

    return totalExpenses;
}

// Calculate only variable costs that change with market prices (for daily monitoring)
function calculateVariableCosts(userData, scrapeData) {
    const estimates = {};

    // 1. Gas (only if user has a car)
    if (userData.transportMode === 'car') {
        const gasPrice = scrapeData.gasPrice || 1.50;
        const efficiency = CAR_EFFICIENCY[userData.carType] || 25;
        const dailyCost = (userData.commuteDistance / efficiency) * gasPrice;
        estimates.gas = Math.round(dailyCost * 30);
    } else {
        estimates.gas = 0;
    }

    // 2. Groceries - Use base country values (same as calculateTotal)
    const groceryCountryData = COUNTRIES.find(c => c.code === userData.countryCode) || COUNTRIES.find(c => c.code === 'OTHER');
    const baseGroceryPerPerson = groceryCountryData ? groceryCountryData.groceries : 400;
    const householdSize = userData.adults + (userData.kids * 0.6);
    const monthlyGroceryCost = Math.round(baseGroceryPerPerson * householdSize);

    console.log(`[calculateVariableCosts] Base grocery per person: ${baseGroceryPerPerson}`);
    console.log(`[calculateVariableCosts] Household size: ${householdSize.toFixed(1)}`);
    console.log(`[calculateVariableCosts] Final grocery cost: ${monthlyGroceryCost}`);

    estimates.groceries = monthlyGroceryCost;

    // 3. Pets
    const petCountryData = COUNTRIES.find(c => c.code === userData.countryCode) || COUNTRIES.find(c => c.code === 'OTHER');
    const basePetCostPerPet = petCountryData && petCountryData.petCare ? petCountryData.petCare : 50;

    let basePetCost = 0;
    if (userData.pets.dog) basePetCost += basePetCostPerPet;
    if (userData.pets.cat) basePetCost += (basePetCostPerPet * 0.6);

    estimates.petCost = Math.round(basePetCost * (scrapeData.groceryMultiplier || 1.0));

    // Total variable costs
    const totalVariableCosts = estimates.gas + estimates.groceries + estimates.petCost;

    return { estimates, totalVariableCosts };
}

module.exports = { calculateTotal, calculateVariableCosts };
