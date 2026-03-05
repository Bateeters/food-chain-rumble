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

    // Talent name (actual talent)
    talentName: {
        type: String,
        required: true
    },

    // Performance stats
    stats: {
        totalUses: {
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
    const totalMatches = this.stats.wins + this.stats.losses;
    if (totalMatches === 0) return 0;
    return parseFloat(
        ((this.stats.wins / totalMatches) * 100).toFixed(2)
    );
});

// Virtual: Calculate actual averages (running average)
talentStatsSchema.virtual('avgKills').get(function() {
    return this.stats.totalUses > 0
        ? parseFloat((this.stats.avgKills / this.stats.totalUses).toFixed(2))
        : 0;
});
talentStatsSchema.virtual('avgDeaths').get(function() {
    return this.stats.totalUses > 0
        ? parseFloat((this.stats.avgDeaths / this.stats.totalUses).toFixed(2))
        : 0;
});
talentStatsSchema.virtual('avgAssists').get(function() {
    return this.stats.totalUses > 0
        ? parseFloat((this.stats.avgAssists / this.stats.totalUses).toFixed(2))
        : 0;
});
talentStatsSchema.virtual('avgDamageDealt').get(function() {
    return this.stats.totalUses > 0
        ? parseFloat((this.stats.avgDamageDealt / this.stats.totalUses).toFixed(2))
        : 0;
});
talentStatsSchema.virtual('avgDamageTaken').get(function() {
    return this.stats.totalUses > 0
        ? parseFloat((this.stats.avgDamageTaken / this.stats.totalUses).toFixed(2))
        : 0;
});


// Include virtuals in JSON/Object output
talentStatsSchema.set('toJSON', { virtuals: true });
talentStatsSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TalentStats', talentStatsSchema);