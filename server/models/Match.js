const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    // Game mode
    gameMode: {
        type: String,
        enum: [
            '1v1_ranked',
            '1v1_casual',
            '2v2_ranked',
            '2v2_casual',
            '3v3_ranked',
            '3v3_casual',
        ],
        required: true
    },

    // Match participants
    players: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        character: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Character',
            required: true
        },
        team: {
            type: Number,
            required: true
            // 1v1: team 1 vs team 2
            // 2v2: team 1 (2 players) vs team 2 (2 players)
            // etc...
        },
        talents: {
            greater: {
                type: mongoose.Schema.Types.ObjectId
            },
            lesser: [{
                type: mongoose.Schema.Types.ObjectId
            }]
        },
        stats: {
            kills: {
                type: Number,
                default: 0
                // Total knockouts
            },
            deaths: {
                type: Number,
                default: 0
                // times this player was knocked out
            },
            assists: {
                type: Number,
                default: 0
                // Helped team get kills
            },
            damageDealt: {
                type: Number,
                default: 0
                // total damage dealt to opponents
            },
            damageTaken: {
                type: Number,
                default: 0
                // Total Damage received
            },
            abilitiesUsed: {
                type: Number,
                default: 0
                // How many special abilities activated
            },
            highestPercentage: {
                type: Number,
                default: 0
                // Highest damage % reached
            }
        },
        result: {
            type: String,
            enum: ['win', 'loss'],
            required: true
        }
    }],

    // Winning team
    winningTeam: {
        type: Number,
        required: true
        // 1 or 2
    },

    // Match duration in seconds
    duration: {
        type: Number,
        required: true
    },

    // Map/Arena where the match took place
    arena: {
        type: String,
        default: 'Default Arena'
        // Examples: 'Savana Plateau', 'Arctic Tundra', 'Coral Reef'
    },

    // Match timestamps
    startedAt: {
        type: Date,
        required: true
    },
    endedAt: {
        type: Date,
        required: true
    },

    // Match replay data or game server ID
    replayUrl: {
        type: String
        // URL to view match replay
    },

    serverRegion: {
        type: String,
        enum: ['NA', 'EU', 'ASIA', 'SA', 'OCE'],
        default:'NA'
        // Which server region hosted the match
    }
}, {
    timestamps: true
});

// Indexes for fast queries
matchSchema.index({ gameMode: 1, createdAt: -1 });
matchSchema.index({ 'players.user': 1, createdAt: -1 });
matchSchema.index({ winningTeam: 1 });

module.exports = mongoose.model('Match', matchSchema);