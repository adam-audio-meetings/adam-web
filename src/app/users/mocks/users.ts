import { User } from '../interfaces/user';

export const USERS: User[] = [
  {  
    "teams": [],
    "_id": "5f86663c9bbfe465a8310025",
    "role": "coordinator",
    "name": "Albert Einstein",
    "avatar": "",
    "username": "coord",
    "password": "$2b$10$zdLxljjIy1o/aS5Y1oIhbeFibzUE985wIGGHhNN1OiIQHmKahGoMO",
    "email": "a.einstein@gmail.com"
  },
  {
    "teams": [
      {
        "_id": "5f8666fa9bbfe465a8310027",
        "category": "TI",
        "name": "Devs",
        "description": "A tough thing."
      }
    ],
    "_id": "5f8666459bbfe465a8310026",
    "role": "member",
    "name": "Galileu Galilei",
    "avatar": "",
    "username": "member",
    "password": "$2b$10$tM/0hMMrnUByTJnzGyAO6.r4ziZyDb3pqMWkjXyDXRuis.sZHYBV6",
    "email": "g.galilei@gmail.com"
  },
  {
    "teams": [],
    "_id": "5f8761119e70a410b8857f20",
    "role": "admin",
    "name": "Master Admin",
    "avatar": "",
    "username": "admin",
    "password": "$2b$10$nEVlkAW5aWGZTdo3WnApeuPRL7SC7hzkJqQ/DbkXPC1m1CEVuUeoK",
    "email": "admin@gmail.com"
  }
];