const mongoose = require('mongoose');

const talentStatsSchema = new mongoose.Schema({
    // Which character this talent belongs to
    character: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Character',
        required: true
    },

    // Which game mode
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

    // Talent type
    talentType: {
        type: String,
        enum: ['greater', 'lesser'],
        required: true
    },

    // Performance stats
    stats: {
        totalUsers: {
            type: Number,
            default: 0
            // How many times this talent was selected
        },
        wins: {
            type: Number,
            default: 0
        },
        losses: {
            type: Number,
            default: 0
        },
        avgKills: {
            type: Number,
            default: 0
        },
        avgDeaths: {
            type: Number,
            default: 0
        },
        avgDamageDealt: {
            type: Number,
            default: 0
        },
        avgAssists: {
            type: Number,
            default: 0
        },
        avgDamageTaken: {
            type: Number,
            default: 0
        }
    }
},{
    timestamps: true
});

// One document per character/gameMode/talentType/talentName combo
talentStatsSchema.index(
    { character: 1, gameMode: 1, talentType: 1, talentName: 1 },
    { unique: true }
);

// Virtual: Calculate win rate
talentStatsSchema.virtual('winRate').get(function() {
    if (this.stats.totalUses === 0) return 0;
    return parseFloat(
        ((this.stats.win / this.stats.totalUses) * 100).toFized(2)
    );
});

// Virtual: Calculate pick rate (calculated in controller relative to character picks)
talentStatsSchema.set('toJSON', { virtuals: true });
talentStatsSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TalentStats', talentStatsSchema);