import mongoose from 'mongoose';

// Define the sustainability action schema
const sustainabilityActionSchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      required: [true, 'Action type is required'],
      enum: [
        'REUSABLE_BOTTLE',
        'PUBLIC_TRANSPORT',
        'COMPOSTING',
        'RECYCLING',
        'DIGITAL_OVER_PRINT',
        'RIDESHARE',
        'ENERGY_SAVING',
        'WATER_CONSERVATION',
        'WASTE_REDUCTION',
        'OTHER',
      ],
      index: true, // Index for faster filtering by action type
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    impactScore: {
      type: Number,
      required: [true, 'Impact score is required'],
      default: function() {
        // Default impact scores based on action type
        const impactScores = {
          'REUSABLE_BOTTLE': 5,
          'PUBLIC_TRANSPORT': 8,
          'COMPOSTING': 7,
          'RECYCLING': 6,
          'DIGITAL_OVER_PRINT': 4,
          'RIDESHARE': 3,
          'ENERGY_SAVING': 7,
          'WATER_CONSERVATION': 7,
          'WASTE_REDUCTION': 6,
          'OTHER': 2,
        };
        return impactScores[this.actionType] || 1;
      },
      min: [0, 'Impact score must be at least 0'],
      index: true, // Index for aggregation operations
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true, // Index for faster user-based queries
    },
    performedAt: {
      type: Date,
      required: [true, 'Date of action is required'],
      default: Date.now,
      index: true, // Index for date-based filtering
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    collection: 'sustainability_actions', // Explicitly set collection name
  }
);

// Create compound index for date range queries
sustainabilityActionSchema.index({ performedAt: 1, actionType: 1 });

// Create compound index for user-specific queries
sustainabilityActionSchema.index({ userId: 1, performedAt: -1 });

// Create index for aggregation operations
sustainabilityActionSchema.index({ actionType: 1, impactScore: 1 });

// Virtual for formatted date
sustainabilityActionSchema.virtual('formattedDate').get(function() {
  return this.performedAt.toISOString().split('T')[0];
});

// Instance method to calculate the carbon footprint reduction
sustainabilityActionSchema.methods.calculateCarbonReduction = function() {
  const carbonFactors = {
    'REUSABLE_BOTTLE': 0.5, // kg CO2 equivalent
    'PUBLIC_TRANSPORT': 2.3,
    'COMPOSTING': 1.5,
    'RECYCLING': 1.2,
    'DIGITAL_OVER_PRINT': 0.8,
    'RIDESHARE': 0.6,
    'ENERGY_SAVING': 1.4,
    'WATER_CONSERVATION': 0.9,
    'WASTE_REDUCTION': 1.1,
    'OTHER': 0.3,
  };
  
  return carbonFactors[this.actionType] || 0;
};

// Static method to calculate total impact
sustainabilityActionSchema.statics.calculateTotalImpact = async function(userId = null) {
  const match = userId ? { userId } : {};
  
  const result = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalImpact: { $sum: '$impactScore' },
        count: { $sum: 1 },
      },
    },
  ]);
  
  return result.length > 0 ? result[0] : { totalImpact: 0, count: 0 };
};

// Create the model
const SustainabilityAction = mongoose.model('SustainabilityAction', sustainabilityActionSchema);

export default SustainabilityAction;