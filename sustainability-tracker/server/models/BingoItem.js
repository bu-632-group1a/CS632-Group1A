import mongoose from 'mongoose';

const bingoItemSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Bingo item text is required'],
      trim: true,
      maxlength: [200, 'Bingo item text cannot exceed 200 characters'],
    },
    position: {
      type: Number,
      required: [true, 'Position is required'],
      min: [0, 'Position must be at least 0'],
      max: [15, 'Position must be at most 15'],
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

// Create compound index for position uniqueness within active items
bingoItemSchema.index({ position: 1, isActive: 1 }, { unique: true });

// Create index for category-based queries
bingoItemSchema.index({ category: 1, isActive: 1 });

const BingoItem = mongoose.model('BingoItem', bingoItemSchema);

export default BingoItem;