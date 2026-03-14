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