import mongoose from 'mongoose';
const bingoItemSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Bingo item text is required'],
      trim: true,
      maxlength: [200, 'Bingo item text cannot exceed 200 characters'],
    },
    category: {
      type: String,
      enum: [
        'TRANSPORT',
        'ENERGY',
        'WASTE',
        'WATER',
        'FOOD',
        'COMMUNITY',
        'DIGITAL',
        'GENERAL',
      ],
      default: 'GENERAL',
    },
    points: {
      type: Number,
      default: 10,
      min: [0, 'Points must be at least 0'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      required: [true, 'Creator ID is required'],
    },
  },
  {
    timestamps: true,
    collection: 'bingo_items',
  }
);

// Create index for category-based queries
bingoItemSchema.index({ category: 1, isActive: 1 });

const BingoItem = mongoose.model('BingoItem', bingoItemSchema);

export default BingoItem;