
# Fullstack To-Do List Application

## Overview

This project is a full-stack to-do list application built with React, Node.js, Express, Socket.IO, Redis, and MongoDB. It allows users to add new items to a to-do list, store these items in a Redis cache, and move the items to MongoDB when the cache exceeds a certain limit. Users can also retrieve all items from both Redis and MongoDB via an HTTP API.

## Features

- **Add New Items**: Users can add new items to the list by sending a message with the `add` event to the WebSocket server.
- **Store Items in Redis**: Items are stored as a stringified array in a Redis cache with a single key called `FULLSTACK_TASK_ARVIND`.
- **Move Items to MongoDB**: If there are more than 5 items in the cache, they are moved to a MongoDB collection, and the cache is flushed.(Using 5 items initially , it's value can be changed in the server.js file named CACHE_THRESHOLD)
- **Retrieve All Items**: Users can retrieve all items in the list through the `/fetchAllTasks` endpoint of an HTTP API.

## Getting Started

### Prerequisites

- Node.js
- Redis
- MongoDB

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/alwenpy/todosApp
   cd todosApp
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the Redis server:

   ```bash
   redis-server
   ```

4. Start the MongoDB server:

   ```bash
   mongosh
   ```

5. Start the frontend server:

   ```bash
   npm run dev
   ```

6. Start the backend:

   ```bash
   cd backend/
   npm start
   ```

### Configuration

Ensure your MongoDB server is running on `mongodb://localhost:27017`. If it is running on a different URL, update the `MONGO_URI` in the server code.

## API Endpoints

### Add New Item

- **Event**: `add`
- **Description**: Add a new item to the to-do list.
- **Payload**: A string representing the to-do item.

### Retrieve All Items

- **Endpoint**: `/fetchAllTasks`
- **Method**: `GET`
- **Description**: Retrieve all items in the to-do list from both Redis and MongoDB.

## Code Structure

### Server

The server-side code is in `server.js` and includes the following main parts:

- **WebSocket Connection**: Handles the connection and communication with the client.
- **Redis Client**: Manages the Redis cache for storing to-do items.
- **MongoDB Client**: Manages the MongoDB database for storing to-do items when the Redis cache exceeds 50 items.
- **Endpoints**: HTTP endpoints for fetching all tasks.

### Client

The client-side code (not included in this README) should connect to the WebSocket server, listen for updates, and send new items to the server.

## Example Usage

1. **Add New Items**: Connect to the WebSocket server and send an `add` event with the to-do item.
2. **Retrieve All Items**: Send a GET request to the `/fetchAllTasks` endpoint to retrieve all items from both Redis and MongoDB.

```javascript
// Example of adding a new item
socket.emit('add', 'New Task');

// Example of fetching all tasks
fetch('http://localhost:4000/fetchAllTasks')
  .then(response => response.json())
  .then(data => console.log(data));
```
