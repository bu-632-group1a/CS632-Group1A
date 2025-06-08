# 🎯 Default Bingo Game API

## Get Default Project Management + Sustainability Bingo Game

### Simple Query to Get Default Game

```graphql
query GetDefaultBingoGame {
  bingoItems {
    id
    text
    position
    category
    points
    isActive
  }
  bingoGame {
    id
    userId
    completedItems {
      item {
        id
        text
        points
      }
      completedAt
    }
    bingosAchieved {
      type
      pattern
      pointsAwarded
      achievedAt
    }
    totalPoints
    isCompleted
    gameStartedAt
  }
}
```

## 🚀 How It Works

### Auto-Creation Logic
1. When `bingoItems` is called and **no items exist**, it automatically creates the default Project Management + Sustainability bingo items
2. When `bingoGame` is called and **no game exists for the user**, it creates a new game instance
3. **No manual setup required** - everything is created on-demand

### Default Bingo Items Created

The system creates a **4x4 grid (16 items)** with these categories:

#### Row 1: Planning & Documentation (Sustainable)
- Create digital project charter (no printing) - 10 pts
- Schedule virtual standup meetings - 10 pts  
- Use collaborative online tools instead of paper - 10 pts
- Set up paperless project documentation - 15 pts

#### Row 2: Team Management (Green Practices)
- Organize remote team building activity - 15 pts
- Implement digital-only meeting notes - 10 pts
- Create reusable project templates - 20 pts
- Use energy-efficient devices for work - 15 pts

#### Row 3: Process Optimization (Efficiency)
- Automate repetitive tasks to save resources - 25 pts
- Conduct virtual code/design reviews - 15 pts
- Optimize workflows to reduce waste - 20 pts
- Use cloud storage instead of physical servers - 20 pts

#### Row 4: Delivery & Sustainability
- Deploy using green hosting providers - 25 pts
- Implement sustainable coding practices - 30 pts
- Measure and reduce digital carbon footprint - 30 pts
- Complete project with zero paper usage - 35 pts

## 🎮 Easy Access APIs

### Get Just the Bingo Items
```graphql
query GetBingoItems {
  bingoItems {
    id
    text
    position
    category
    points
  }
}
```

### Get Just the User's Game
```graphql
query GetBingoGame {
  bingoGame {
    id
    totalPoints
    completedItems {
      item {
        text
        points
      }
      completedAt
    }
    isCompleted
  }
}
```

### Get Easy Items for Quick Completion
```graphql
query GetEasyBingoItems {
  easyBingoItems {
    id
    text
    category
    points
    position
  }
}
```

## 🔄 Admin Controls

### Refresh with New Default Items
```graphql
mutation RefreshBingoItems {
  refreshBingoItems {
    id
    text
    position
    category
    points
  }
}
```

## 📍 API Endpoint

**GraphQL Playground:** `http://localhost:4000/graphql`

**Authentication Required:** Include JWT token in headers:
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

## ✨ Key Features

- **Auto-loads on first access** - no setup needed
- **Project Management focused** with sustainability twist
- **16 unique items** ranging from 10-35 points
- **Categories:** DIGITAL, ENERGY, WASTE, COMMUNITY, GENERAL
- **Easy completion** items prioritized for quick wins
- **Admin refresh** creates alternative item sets for variety

The default game is **automatically created** the first time any user calls `bingoItems` or `bingoGame` - making it completely seamless!