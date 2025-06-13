curl -X POST https://cs632-group1a.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODRiMzRmY2ZjMDc3YzVkM2Q3NjdkYjEiLCJyb2xlIjoiQURNSU4iLCJmaXJzdE5hbWUiOiJKdWRhaCIsImxhc3ROYW1lIjoiQmVybnN0ZWluIiwiZnVsbE5hbWUiOiJKdWRhaCBCZXJuc3RlaW4iLCJlbWFpbCI6Imp1ZGFoYkBidS5lZHUiLCJ1c2VybmFtZSI6Imp1ZGFoYkBidS5lZHUiLCJjaXR5IjpudWxsLCJzdGF0ZSI6bnVsbCwiY29tcGFueSI6bnVsbCwibG9jYXRpb24iOm51bGwsImlzRW1haWxWZXJpZmllZCI6dHJ1ZSwiY3JlYXRlZEF0IjoiMjAyNS0wNi0xMlQyMDoxMzo0OC41NjNaIiwiaWF0IjoxNzQ5Nzk1MzAxLCJleHAiOjE3NDk3OTYyMDF9.B0mvT6nusY15-yAvxD4npa-D-nCT9aJX3B719PWoQr4" \
  -d '{
    "operationName": "GetBingoGame",
    "variables": {},
    "query": "query GetBingoGame {\n  bingoGame {\n    id\n    userId\n    completedItems {\n      item {\n        id\n        text\n        category\n        points\n        isActive\n        createdBy\n        createdAt\n        updatedAt\n        __typename\n      }\n      position\n      completedAt\n      __typename\n    }\n    bingosAchieved {\n      type\n      pattern\n      achievedAt\n      pointsAwarded\n      __typename\n    }\n    board {\n      item {\n        id\n        text\n        category\n        points\n        isActive\n        createdBy\n        createdAt\n        updatedAt\n        __typename\n      }\n      position\n      __typename\n    }\n    totalPoints\n    isCompleted\n    gameStartedAt\n    gameCompletedAt\n    createdAt\n    updatedAt\n    __typename\n  }\n}"
}'

curl -X POST https://cs632-group1a.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODRiMzRmY2ZjMDc3YzVkM2Q3NjdkYjEiLCJyb2xlIjoiQURNSU4iLCJmaXJzdE5hbWUiOiJKdWRhaCIsImxhc3ROYW1lIjoiQmVybnN0ZWluIiwiZnVsbE5hbWUiOiJKdWRhaCBCZXJuc3RlaW4iLCJlbWFpbCI6Imp1ZGFoYkBidS5lZHUiLCJ1c2VybmFtZSI6Imp1ZGFoYkBidS5lZHUiLCJjaXR5IjpudWxsLCJzdGF0ZSI6bnVsbCwiY29tcGFueSI6bnVsbCwibG9jYXRpb24iOm51bGwsImlzRW1haWxWZXJpZmllZCI6dHJ1ZSwiY3JlYXRlZEF0IjoiMjAyNS0wNi0xMlQyMDoxMzo0OC41NjNaIiwiaWF0IjoxNzQ5Nzk2OTI0LCJleHAiOjE3NDk3OTc4MjR9.twS8Zwejfw77haaldmYPPNSAwcvznskpZfca4PiXaVs" \
  -d '{
    "operationName": "GetBingoGame",
    "variables": {},
    "query": "query GetBingoGame {\n  bingoGame {\n    id\n    userId\n    completedItems {\n      item {\n        id\n        text\n        category\n        points\n        isActive\n        createdBy\n        createdAt\n        updatedAt\n        __typename\n      }\n      position\n      completedAt\n      __typename\n    }\n    bingosAchieved {\n      type\n      pattern\n      achievedAt\n      pointsAwarded\n      __typename\n    }\n    board {\n      item {\n        id\n        text\n        category\n        points\n        isActive\n        createdBy\n        createdAt\n        updatedAt\n        __typename\n      }\n      position\n      __typename\n    }\n    totalPoints\n    isCompleted\n    gameStartedAt\n    gameCompletedAt\n    createdAt\n    updatedAt\n    __typename\n  }\n}"
}'
