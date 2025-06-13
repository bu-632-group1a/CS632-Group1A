import mongoose from 'mongoose';
import BingoItem from './BingoItem.js';

const bingoGameSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    completedItems: [{
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BingoItem',
        required: true,
      },
        position: {
        type: Number,
        required: true, // <-- This enforces position is always present!
      },
      completedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    bingosAchieved: [{
      type: {
        type: String,
        enum: ['ROW', 'COLUMN', 'DIAGONAL'],
        required: true,
      },
      pattern: {
        type: [Number], // Array of positions that form the bingo
        required: true,
      },
      achievedAt: {
        type: Date,
        default: Date.now,
      },
      pointsAwarded: {
        type: Number,
        default: 200,
      },
    }],
    totalPoints: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    gameStartedAt: {
      type: Date,
      default: Date.now,
    },
    gameCompletedAt: {
      type: Date,
    },
    board: [{
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BingoItem',
        required: true,
      },
      position: {
        type: Number, // 0-15
        required: true,
      }
    }],
  },
  {
    timestamps: true,
    collection: 'bingo_games',
  }
);

// Create compound index for user-based queries
bingoGameSchema.index({ userId: 1, createdAt: -1 });

// Create index for leaderboard queries
bingoGameSchema.index({ totalPoints: -1, gameCompletedAt: 1 });

// Instance method to check for new bingos
bingoGameSchema.methods.checkForBingos = function() {
  // Create a copy of completed items to avoid mutation issues
  const completedItems = [...this.completedItems];
  const completedPositions = [];
  
  // Safely extract positions from completed items
  for (const item of completedItems) {
    if (item.position !== undefined) {
      completedPositions.push(item.position);
    }
  }
  
  const newBingos = [];
  
  // Check rows (0-3, 4-7, 8-11, 12-15)
  for (let row = 0; row < 4; row++) {
    const rowPositions = [row * 4, row * 4 + 1, row * 4 + 2, row * 4 + 3];
    if (rowPositions.every(pos => completedPositions.includes(pos))) {
      const existingBingo = this.bingosAchieved.find(bingo => 
        bingo.type === 'ROW' && 
        JSON.stringify([...bingo.pattern].sort()) === JSON.stringify([...rowPositions].sort())
      );
      if (!existingBingo) {
        newBingos.push({
          type: 'ROW',
          pattern: [...rowPositions], // Create a copy to avoid mutation
          pointsAwarded: 200,
        });
      }
    }
  }
  
  // Check columns (0,4,8,12 | 1,5,9,13 | 2,6,10,14 | 3,7,11,15)
  for (let col = 0; col < 4; col++) {
    const colPositions = [col, col + 4, col + 8, col + 12];
    if (colPositions.every(pos => completedPositions.includes(pos))) {
      const existingBingo = this.bingosAchieved.find(bingo => 
        bingo.type === 'COLUMN' && 
        JSON.stringify([...bingo.pattern].sort()) === JSON.stringify([...colPositions].sort())
      );
      if (!existingBingo) {
        newBingos.push({
          type: 'COLUMN',
          pattern: [...colPositions], // Create a copy to avoid mutation
          pointsAwarded: 200,
        });
      }
    }
  }
  
  // Check diagonals (0,5,10,15 | 3,6,9,12)
  const diagonal1 = [0, 5, 10, 15];
  const diagonal2 = [3, 6, 9, 12];
  
  if (diagonal1.every(pos => completedPositions.includes(pos))) {
    const existingBingo = this.bingosAchieved.find(bingo => 
      bingo.type === 'DIAGONAL' && 
      JSON.stringify([...bingo.pattern].sort()) === JSON.stringify([...diagonal1].sort())
    );
    if (!existingBingo) {
      newBingos.push({
        type: 'DIAGONAL',
        pattern: [...diagonal1], // Create a copy to avoid mutation
        pointsAwarded: 200,
      });
    }
  }
  
  if (diagonal2.every(pos => completedPositions.includes(pos))) {
    const existingBingo = this.bingosAchieved.find(bingo => 
      bingo.type === 'DIAGONAL' && 
      JSON.stringify([...bingo.pattern].sort()) === JSON.stringify([...diagonal2].sort())
    );
    if (!existingBingo) {
      newBingos.push({
        type: 'DIAGONAL',
        pattern: [...diagonal2], // Create a copy to avoid mutation
        pointsAwarded: 200,
      });
    }
  }
  
  return newBingos;
};

// Instance method to calculate total points
bingoGameSchema.methods.calculateTotalPoints = function() {
  const itemPoints = this.completedItems.length * 10; // 10 points per completed item
  const bingoPoints = this.bingosAchieved.reduce((total, bingo) => total + bingo.pointsAwarded, 0);
  return itemPoints + bingoPoints;
};

const BingoGame = mongoose.model('BingoGame', bingoGameSchema);

export default BingoGame;