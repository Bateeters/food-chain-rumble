const mongoose = require('mongoose')

const characterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Character name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    image: {
        type: String,
        default: 'default-character.png'
    },
    abilities: [{
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        cooldown: {
            type: Number,
            required: true,
        },
        abilityType: {
            type: String,
            enum: ['active', 'passive', 'ultimate'],
            required: true
        }
    }],
    talents:{
        greater: [{
            name:{
                type: String,
                required: true
            },
            effects: {
                type: String,
                required: true
            }
        }],
        lesser: [{
            name: {
                type: String,
                required: true
            },
            effects: {
                type: String,
                required: true
            }
        }]
    },
    difficulty: {
        type: Number,
        required: true,
        min: 1,
        max: 3,
        default: 1
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    releaseDate: {
        type: Date,
        default: Date.now
    },
    globalStats: {
        totalPicks: {
            type: Number,
            default: 0
        },
        totalWins: {
            type: Number,
            default: 0
        },
        totalLosses: {
            type: Number,
            default: 0
        },
        totalKills: {
            type: Number,
            default: 0
        },
        totalDeaths: {
            type: Number,
            default: 0
        },
        totalAssists: {
            type: Number,
            default: 0
        },
        totalDamageDealt: {
            type: Number,
            default: 0
        },
        totalDamageTaken: {
            type: Number,
            default: 0
        }
    }
},{
    timestamps: true
});

// Virtual field to calculate win rate percentage
characterSchema.virtual('winRate').get(function() {
    const totalMatches = this.globalStats.totalWins + this.globalStats.totalLosses;
    if (totalMatches === 0) return 0;
    return parseFloat(((this.globalStats.totalWins / totalMatches) * 100).toFixed(2));
});

// Virtual: Average kills per match
characterSchema.virtual('avgKills').get(function() {
    if (this.globalStats.totalPicks === 0) return 0;
    return parseFloat(
        (this.globalStats.totalKills / this.globalStats.totalPicks).toFixed(2)
    );
});

// Virtual: Average assists per match
characterSchema.virtual('avgAssists').get(function() {
  if (this.globalStats.totalPicks === 0) return 0;
  return parseFloat(
    (this.globalStats.totalAssists / this.globalStats.totalPicks).toFixed(2)
  );
});

// Virtual: Average damage per match
characterSchema.virtual('avgDamageDealt').get(function() {
  if (this.globalStats.totalPicks === 0) return 0;
  return Math.round(
    this.globalStats.totalDamageDealt / this.globalStats.totalPicks
  );
});

// Virtual: Average damage taken per match
characterSchema.virtual('avgDamageTaken').get(function() {
  if (this.globalStats.totalPicks === 0) return 0;
  return Math.round(
    this.globalStats.totalDamageTaken / this.globalStats.totalPicks
  );
});

// Virtual field for difficulty display
characterSchema.virtual('difficultyDisplay').get(function() {
    const stars = '*'.repeat(this.difficulty);
    const labels = ['Beginner', 'Intermediate', 'Advanced'];
    return `${stars} ${labels[this.difficulty - 1]}`;
});

// Make sure virtuals are included when converting to JSON
characterSchema.set('toJSON', {virtuals: true});
characterSchema.set('toObject', {virtuals: true});

module.exports = mongoose.model('Character', characterSchema)