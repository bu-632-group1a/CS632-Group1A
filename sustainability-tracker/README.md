# Sustainability Action Tracker - GraphQL Microservice

A GraphQL Apollo Express Microservice for tracking sustainability actions like reusing water bottles, taking public transport, composting, recycling, and more.

## Features

- **GraphQL API**: Full-featured API with queries, mutations, and subscriptions
- **MongoDB Integration**: Data storage with optimized indexing
- **Real-time Updates**: WebSocket-based subscriptions
- **Data Validation**: Server-side validation with Joi
- **Performance Optimization**: MongoDB indexing for efficient data aggregation
- **Error Handling**: Comprehensive error handling and user-friendly messages

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
# Start both client and server
npm run dev

# Start only the server
npm run dev:server

# Start only the client
npm run dev:client
```

4. Open your browser and navigate to:
   - GraphQL Playground: [http://localhost:4000/graphql](http://localhost:4000/graphql)
   - React Frontend: [http://localhost:5173](http://localhost:5173)

## API Documentation

### Queries

- `sustainabilityActions(filter: SustainabilityActionFilterInput)`: Get all sustainability actions with optional filtering
- `sustainabilityAction(id: ID!)`: Get a specific sustainability action by ID
- `sustainabilityMetrics`: Get aggregated metrics about sustainability actions

### Mutations

- `createSustainabilityAction(input: CreateSustainabilityActionInput!)`: Create a new sustainability action
- `updateSustainabilityAction(id: ID!, input: UpdateSustainabilityActionInput!)`: Update an existing sustainability action
- `deleteSustainabilityAction(id: ID!)`: Delete a sustainability action

### Subscriptions

- `sustainabilityActionCreated`: Subscribe to sustainability action creation events
- `sustainabilityActionUpdated`: Subscribe to sustainability action update events
- `sustainabilityActionDeleted`: Subscribe to sustainability action deletion events

## Example Queries

### Get All Sustainability Actions

```graphql
query GetSustainabilityActions {
  sustainabilityActions {
    id
    actionType
    description
    impactScore
    performedAt
    createdAt
    updatedAt
  }
}
```

### Filter Actions by Type and Date

```graphql
query GetFilteredActions {
  sustainabilityActions(filter: {
    actionType: RECYCLING
    fromDate: "2023-01-01T00:00:00.000Z"
    toDate: "2023-12-31T23:59:59.999Z"
  }) {
    id
    actionType
    description
    impactScore
    performedAt
  }
}
```

### Get Sustainability Metrics

```graphql
query GetSustainabilityMetrics {
  sustainabilityMetrics {
    totalActions
    totalImpact
    averageImpact
    actionsByType {
      actionType
      count
    }
  }
}
```

## Example Mutations

### Create a Sustainability Action

```graphql
mutation CreateSustainabilityAction {
  createSustainabilityAction(
    input: {
      actionType: REUSABLE_BOTTLE
      description: "Used my reusable water bottle today"
      performedAt: "2023-06-15T12:00:00.000Z"
    }
  ) {
    id
    actionType
    impactScore
    performedAt
  }
}
```

### Update a Sustainability Action

```graphql
mutation UpdateSustainabilityAction {
  updateSustainabilityAction(
    id: "action_id_here"
    input: {
      description: "Updated description"
      impactScore: 7.5
    }
  ) {
    id
    actionType
    description
    impactScore
    performedAt
    updatedAt
  }
}
```

### Delete a Sustainability Action

```graphql
mutation DeleteSustainabilityAction {
  deleteSustainabilityAction(id: "action_id_here")
}
```

## Example Subscription

```graphql
subscription OnSustainabilityActionCreated {
  sustainabilityActionCreated {
    id
    actionType
    description
    impactScore
    performedAt
  }
}
```

## Project Structure

```
sustainability-tracker-service/
├── server/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   └── SustainabilityAction.js
│   ├── resolvers/
│   │   └── index.js
│   ├── schema/
│   │   └── typeDefs.js
│   ├── validators/
│   │   └── actionValidators.js
│   └── index.js
├── src/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── package.json
└── README.md
```