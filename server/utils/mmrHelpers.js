/*========================================== 
*  MMR tier definitions and helper functions
==========================================*/

// MMR ranges for visible ranks
const MMR_TIERS = {
    Bronze: {
        min: 0,
        max: 1199,
        divisions: [0, 300, 600, 900] // Division 4, 3, 2, 1 breakpoints
    },
    Silver: {
        min: 1200,
        max: 1399,
        divisions: [1200, 1250, 1300, 1350]
    },
    Gold: {
        min: 1400,
        max: 1599,
        divisions: [1400, 1450, 1500, 1550]
    },
    Platinum: {
        min: 1600, 
        max: 1799,
        divisions: [1600, 1650, 1700, 1750]
    },
    Diamond: { 
    min: 1800, 
    max: 1999, 
    divisions: [1800, 1850, 1900, 1950] 
    },
    Master: { 
        min: 2000, 
        max: 2299, 
        divisions: [2000, 2100, 2200, 2300] 
    },
    Grandmaster: { 
        min: 2300, 
        max: 9999, 
        divisions: [2300, 2500, 2700, 3000] 
    }
};

