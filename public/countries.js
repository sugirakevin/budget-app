const COUNTRIES = [
    { code: 'US', name: 'United States', currency: '$', unit: 'miles', gas: 3.50, groceries: 400, petCare: 60 },
    { code: 'GB', name: 'United Kingdom', currency: '£', unit: 'miles', gas: 6.50, groceries: 300, petCare: 45 },
    { code: 'CA', name: 'Canada', currency: 'CA$', unit: 'km', gas: 1.60, groceries: 450, petCare: 70 },
    { code: 'AU', name: 'Australia', currency: 'A$', unit: 'km', gas: 1.80, groceries: 500, petCare: 80 },
    { code: 'DE', name: 'Germany', currency: '€', unit: 'km', gas: 1.90, groceries: 350, petCare: 50 },
    { code: 'FR', name: 'France', currency: '€', unit: 'km', gas: 1.95, groceries: 380, petCare: 55 },
    { code: 'JP', name: 'Japan', currency: '¥', unit: 'km', gas: 170, groceries: 40000, petCare: 6000 },
    { code: 'IN', name: 'India', currency: '₹', unit: 'km', gas: 100, groceries: 8000, petCare: 2000 },
    { code: 'CN', name: 'China', currency: '¥', unit: 'km', gas: 8, groceries: 1500, petCare: 400 },
    { code: 'BR', name: 'Brazil', currency: 'R$', unit: 'km', gas: 5.50, groceries: 1200, petCare: 250 },
    { code: 'MX', name: 'Mexico', currency: 'MX$', unit: 'km', gas: 24, groceries: 3000, petCare: 800 },
    { code: 'IT', name: 'Italy', currency: '€', unit: 'km', gas: 1.90, groceries: 360, petCare: 50 },
    { code: 'ES', name: 'Spain', currency: '€', unit: 'km', gas: 1.70, groceries: 300, petCare: 45 },
    { code: 'NL', name: 'Netherlands', currency: '€', unit: 'km', gas: 2.10, groceries: 380, petCare: 55 },
    { code: 'SE', name: 'Sweden', currency: 'kr', unit: 'km', gas: 20, groceries: 4000, petCare: 600 },
    { code: 'CH', name: 'Switzerland', currency: 'CHF', unit: 'km', gas: 1.90, groceries: 600, petCare: 80 },
    { code: 'ZA', name: 'South Africa', currency: 'R', unit: 'km', gas: 23, groceries: 4000, petCare: 800 },
    { code: 'NG', name: 'Nigeria', currency: '₦', unit: 'km', gas: 600, groceries: 100000, petCare: 25000 },
    { code: 'AR', name: 'Argentina', currency: '$', unit: 'km', gas: 300, groceries: 80000, petCare: 20000 },
    { code: 'CZ', name: 'Czech Republic', currency: 'Kč', unit: 'km', gas: 35, groceries: 7000, petCare: 1500 },
    // Add a generic fallback for others if needed, or just list many more
    { code: 'OTHER', name: 'Other / International', currency: '$', unit: 'km', gas: 1.50, groceries: 300, petCare: 50 }
].sort((a, b) => a.name.localeCompare(b.name));
