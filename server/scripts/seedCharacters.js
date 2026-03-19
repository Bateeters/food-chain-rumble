const mongoose = require('mongoose');
const Character = require('../models/Character');
require('dotenv').config();

const characters = [
    {
        name: 'Lion',
        description: 'The king of the savanna. A powerful melee fighter with high damage and sustain.',
        image: 'lion.png',
        role: 'fighter',
        difficulty: 1,
        primaryColor: '#ddb00f',
        secondaryColor: '#795605',
        textColor: "#000000",
        abilities: [
            // Damage numbers and cooldowns will need to be adjusted later
            // These are just for placeholders
            {
                name: 'Roar',
                description: 'Unleashes a powerful roar that stuns nearby enemies.',
                cooldown: 12,
                damage: 150,
                abilityType: 'active'
            },
            {
                name: 'Pounce',
                description: 'Leaps to target, dealing massive damage and increase your speed.',
                cooldown: 8,
                damage: 220,
                abilityType: 'active'
            },
            {
                name: 'rend',
                description: 'Strike forward and send a wave of force that damages and slows enemies.',
                cooldown: 8,
                damage: 200,
                abilityType: 'active'
            },
            {
                // Need to add duration to this
                name: 'Savanna Dominance',
                description: 'Gain increased attack damage, attack speed, and movement speed for a brief period of time.',
                cooldown: 60, // This will be based on charge percent, not time.
                damage: 300, 
                abilityType: 'ultimate'
            }
        ],
        lore: 'The undisputed ruler of the grasslands, Lion commands respect through raw power and tactical prowess. Ancient and wise, this apex predator has mastered the art of combat through countless battles.',
        isAvailable: true
    },
    {
        name: 'Bull',
        description: 'A melee fighter self-made in the fields with endless strength. Has high damage and mobility at the risk of safety.',
        image: 'bull.png',
        role: 'fighter',
        difficulty: 1,
        primaryColor: '#b26d0c',
        secondaryColor: '#6a420b',
        textColor: "#ffffff",
        abilities: [
            {
                name: 'Charge',
                description: 'Charges forward, hitting all enemies in the path and dealing damage.',
                cooldown: 14,
                damage: 180,
                abilityType: 'active'
            },
            {
                name: 'Upheave',
                description: 'Crushes the ground and launches a boulder forward hitting all enemies in the path.',
                cooldown: 8,
                damage: 160,
                abilityType: 'active'
            },
            {
                name: 'Hop',
                description: 'Leap into the air, land with force dealing damage and extra knockback to enemies.',
                cooldown: 12,
                damage: 200,
                abilityType: 'active'
            },
            {
                name: 'Buck Off',
                description: 'Enrage for a brief period of time, gaining invincibility and unblockable attacks.',
                cooldown: 60,
                damage: 300,
                abilityType: 'ultimate'
            }
        ],
        lore: 'A force of nature, Bull stands as an ultimate damage aggressor. What it lacks in defense, it makes up for in strength and brute force.',
        isAvailable: true
    },
    {
        name: 'Porcupine',
        description: 'A defensive creature that excels at timing and punishing her enemies with sharp quills. Turn enemy attacks against them.',
        image: 'porcupine.png',
        role: 'tank',
        difficulty: 3,
        primaryColor: '#37270b',
        secondaryColor: '#644819',
        textColor: "#ffffff",
        abilities: [
            {
                name: 'Quill',
                description: 'Launch a quill forward, piercing all enemies.',
                cooldown: 8,
                damage: 160,
                abilityType: 'active'
            },
            {
                name: 'Parry',
                description: 'Bunker down, displaying your quills and damaging any attacking enemy for a brief moment.',
                cooldown: 10,
                damage: 200,
                abilityType: 'active'
            },
            {
                name: 'Spike',
                description: 'Leap into the air and land, quills down on an area damaging enemies hit and giving yourself minor damage reduction for a brief moment.',
                cooldown: 12,
                damage: 160,
                abilityType: 'active'
            },
            {
                name: 'Quill Rain',
                description: 'Send a volley of quills into the air that progress forward, dealing massive damage to enemies hit.',
                cooldown: 60,
                damage: 300,
                abilityType: 'ultimate'
            }
        ],
        lore: 'A simple competitor focused with self-preservation. She succeeds at timing out her fights methodically to have as little risk as possible.',
        isAvailable: true
    },
    {
        name: 'Phoenix',
        description: 'A fiery rebirth warrior that burns enemies and rises from defeat. High risk, high reward.',
        image: 'phoenix.png',
        role: 'fighter',
        difficulty: 2,
        primaryColor: '#e84118',
        secondaryColor: '#fbc531',
        textColor: '#000000',
        abilities: [
            {
                name: 'Ability 1',
                description: 'Placeholder ability description.',
                cooldown: 10,
                damage: 180,
                abilityType: 'active'
            },
            {
                name: 'Ability 2',
                description: 'Placeholder ability description.',
                cooldown: 8,
                damage: 160,
                abilityType: 'active'
            },
            {
                name: 'Ability 3',
                description: 'Placeholder ability description.',
                cooldown: 12,
                damage: 200,
                abilityType: 'active'
            },
            {
                name: 'Ultimate',
                description: 'Placeholder ultimate description.',
                cooldown: 60,
                damage: 300,
                abilityType: 'ultimate'
            }
        ],
        lore: 'Placeholder lore.',
        isAvailable: true
    },
    {
        name: 'Polar Bear',
        description: 'A massive arctic brawler with incredible durability and freezing attacks. Slow but unstoppable.',
        image: 'polar_bear.png',
        role: 'tank',
        difficulty: 1,
        primaryColor: '#dfe6e9',
        secondaryColor: '#74b9ff',
        textColor: '#000000',
        abilities: [
            {
                name: 'Ability 1',
                description: 'Placeholder ability description.',
                cooldown: 10,
                damage: 160,
                abilityType: 'active'
            },
            {
                name: 'Ability 2',
                description: 'Placeholder ability description.',
                cooldown: 12,
                damage: 140,
                abilityType: 'active'
            },
            {
                name: 'Ability 3',
                description: 'Placeholder ability description.',
                cooldown: 14,
                damage: 180,
                abilityType: 'active'
            },
            {
                name: 'Ultimate',
                description: 'Placeholder ultimate description.',
                cooldown: 60,
                damage: 300,
                abilityType: 'ultimate'
            }
        ],
        lore: 'Placeholder lore.',
        isAvailable: true
    },
    {
        name: 'Heron',
        description: 'A graceful and precise fighter that strikes from unexpected angles. Excels at poking and evasion.',
        image: 'heron.png',
        role: 'assassin',
        difficulty: 2,
        primaryColor: '#6a8087',
        secondaryColor: '#d5dbde',
        textColor: '#000000',
        abilities: [
            {
                name: 'Ability 1',
                description: 'Placeholder ability description.',
                cooldown: 8,
                damage: 170,
                abilityType: 'active'
            },
            {
                name: 'Ability 2',
                description: 'Placeholder ability description.',
                cooldown: 10,
                damage: 190,
                abilityType: 'active'
            },
            {
                name: 'Ability 3',
                description: 'Placeholder ability description.',
                cooldown: 8,
                damage: 160,
                abilityType: 'active'
            },
            {
                name: 'Ultimate',
                description: 'Placeholder ultimate description.',
                cooldown: 60,
                damage: 300,
                abilityType: 'ultimate'
            }
        ],
        lore: 'Placeholder lore.',
        isAvailable: true
    },
    {
        name: 'Chameleon',
        description: 'A deceptive predator that uses stealth and misdirection to outmaneuver opponents.',
        image: 'chameleon.png',
        role: 'assassin',
        difficulty: 3,
        primaryColor: '#00b894',
        secondaryColor: '#55efc4',
        textColor: '#000000',
        abilities: [
            {
                name: 'Ability 1',
                description: 'Placeholder ability description.',
                cooldown: 10,
                damage: 150,
                abilityType: 'active'
            },
            {
                name: 'Ability 2',
                description: 'Placeholder ability description.',
                cooldown: 12,
                damage: 170,
                abilityType: 'active'
            },
            {
                name: 'Ability 3',
                description: 'Placeholder ability description.',
                cooldown: 8,
                damage: 160,
                abilityType: 'active'
            },
            {
                name: 'Ultimate',
                description: 'Placeholder ultimate description.',
                cooldown: 60,
                damage: 300,
                abilityType: 'ultimate'
            }
        ],
        lore: 'Placeholder lore.',
        isAvailable: true
    },
    {
        name: 'Bat',
        description: 'A fast and elusive nocturnal hunter that disorients enemies with echolocation and swift strikes.',
        image: 'bat.png',
        role: 'assassin',
        difficulty: 2,
        primaryColor: '#2d3436',
        secondaryColor: '#6c5ce7',
        textColor: '#ffffff',
        abilities: [
            {
                name: 'Ability 1',
                description: 'Placeholder ability description.',
                cooldown: 8,
                damage: 150,
                abilityType: 'active'
            },
            {
                name: 'Ability 2',
                description: 'Placeholder ability description.',
                cooldown: 10,
                damage: 170,
                abilityType: 'active'
            },
            {
                name: 'Ability 3',
                description: 'Placeholder ability description.',
                cooldown: 8,
                damage: 160,
                abilityType: 'active'
            },
            {
                name: 'Ultimate',
                description: 'Placeholder ultimate description.',
                cooldown: 60,
                damage: 300,
                abilityType: 'ultimate'
            }
        ],
        lore: 'Placeholder lore.',
        isAvailable: true
    },
    {
        name: 'Bee',
        description: 'A small but relentless attacker that overwhelms enemies with rapid stings and swarm tactics.',
        image: 'bee.png',
        role: 'fighter',
        difficulty: 2,
        primaryColor: '#fdcb6e',
        secondaryColor: '#2d3436',
        textColor: '#000000',
        abilities: [
            {
                name: 'Ability 1',
                description: 'Placeholder ability description.',
                cooldown: 6,
                damage: 130,
                abilityType: 'active'
            },
            {
                name: 'Ability 2',
                description: 'Placeholder ability description.',
                cooldown: 8,
                damage: 150,
                abilityType: 'active'
            },
            {
                name: 'Ability 3',
                description: 'Placeholder ability description.',
                cooldown: 10,
                damage: 160,
                abilityType: 'active'
            },
            {
                name: 'Ultimate',
                description: 'Placeholder ultimate description.',
                cooldown: 60,
                damage: 300,
                abilityType: 'ultimate'
            }
        ],
        lore: 'Placeholder lore.',
        isAvailable: true
    },
    {
        name: 'Shark',
        description: 'An apex predator of the deep that relentlessly hunts wounded enemies. The more damage dealt, the deadlier it becomes.',
        image: 'shark.png',
        role: 'fighter',
        difficulty: 2,
        primaryColor: '#0984e3',
        secondaryColor: '#dfe6e9',
        textColor: '#000000',
        abilities: [
            {
                name: 'Ability 1',
                description: 'Placeholder ability description.',
                cooldown: 10,
                damage: 200,
                abilityType: 'active'
            },
            {
                name: 'Ability 2',
                description: 'Placeholder ability description.',
                cooldown: 8,
                damage: 180,
                abilityType: 'active'
            },
            {
                name: 'Ability 3',
                description: 'Placeholder ability description.',
                cooldown: 12,
                damage: 210,
                abilityType: 'active'
            },
            {
                name: 'Ultimate',
                description: 'Placeholder ultimate description.',
                cooldown: 60,
                damage: 300,
                abilityType: 'ultimate'
            }
        ],
        lore: 'Placeholder lore.',
        isAvailable: true
    },
    {
        name: 'Wolf',
        description: 'A cunning pack hunter that grows stronger alongside allies. Balanced offense and utility.',
        image: 'wolf.png',
        role: 'fighter',
        difficulty: 1,
        primaryColor: '#636e72',
        secondaryColor: '#2d3436',
        textColor: '#ffffff',
        abilities: [
            {
                name: 'Ability 1',
                description: 'Placeholder ability description.',
                cooldown: 10,
                damage: 170,
                abilityType: 'active'
            },
            {
                name: 'Ability 2',
                description: 'Placeholder ability description.',
                cooldown: 8,
                damage: 190,
                abilityType: 'active'
            },
            {
                name: 'Ability 3',
                description: 'Placeholder ability description.',
                cooldown: 12,
                damage: 180,
                abilityType: 'active'
            },
            {
                name: 'Ultimate',
                description: 'Placeholder ultimate description.',
                cooldown: 60,
                damage: 300,
                abilityType: 'ultimate'
            }
        ],
        lore: 'Placeholder lore.',
        isAvailable: true
    },
    {
        name: 'Jellyfish',
        description: 'A mysterious drifter that deals damage over time with paralyzing tentacles. Difficult to pin down.',
        image: 'jellyfish.png',
        role: 'assassin',
        difficulty: 3,
        primaryColor: '#a29bfe',
        secondaryColor: '#bc51a2',
        textColor: '#000000',
        abilities: [
            {
                name: 'Ability 1',
                description: 'Placeholder ability description.',
                cooldown: 8,
                damage: 140,
                abilityType: 'active'
            },
            {
                name: 'Ability 2',
                description: 'Placeholder ability description.',
                cooldown: 10,
                damage: 130,
                abilityType: 'active'
            },
            {
                name: 'Ability 3',
                description: 'Placeholder ability description.',
                cooldown: 12,
                damage: 150,
                abilityType: 'active'
            },
            {
                name: 'Ultimate',
                description: 'Placeholder ultimate description.',
                cooldown: 60,
                damage: 300,
                abilityType: 'ultimate'
            }
        ],
        lore: `Legend has it there's a large jellyfish in the deep that's capable of surviving on land. Fishermen have never seen it but everyone collectively calls it "Jeff" without reason.`,
        isAvailable: true
    }
];

const seedCharacters = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing characters
        await Character.deleteMany({});
        console.log('Cleared existing characters');

        // Insert new characters
        await Character.insertMany(characters);
        console.log(`successfully seeded ${characters.length} characters!`);

        // Disconnect
        await mongoose.disconnect();
        console.log('MongoDB Disconnected');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding characters:', error);
        process.exit(1);
    }
};

// Run the seed function
seedCharacters();