import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { createClient } from 'redis';
import { MongoClient } from 'mongodb';

const redisClient = createClient();
redisClient.connect().catch(console.error);

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
});

const REDIS_KEY = 'FULLSTACK_TASK_ARVIND';
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'todoApp';
const COLLECTION_NAME = 'todos';
const CACHE_THRESHOLD = 5;

const mongoClient = new MongoClient(MONGO_URI);
mongoClient.connect()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

app.use(express.json());

app.get('/todos', async (req, res) => {
  try {
    const data = await redisClient.get(REDIS_KEY);
    const todoList = data ? JSON.parse(data) : [];
    res.json(todoList);
  } catch (err) {
    console.error('Error fetching todoList from Redis:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/fetchAllTasks', async (req, res) => {
  try {
    const redisData = await redisClient.get(REDIS_KEY);
    const redisTasks = redisData ? JSON.parse(redisData) : [];

    const collection = mongoClient.db(DB_NAME).collection(COLLECTION_NAME);
    const mongoTasks = await collection.find({}).toArray();

    const allTasks = [...redisTasks, ...mongoTasks.map(item => item.todo)];

    res.json(allTasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');

  const getTodoList = async () => {
    try {
      const data = await redisClient.get(REDIS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Error fetching todoList from Redis:', err);
      return [];
    }
  };

  getTodoList().then(todoList => {
    console.log('Initial todoList:', todoList);
    console.log('Emitting initial length,todoList.length:', todoList.length);
    socket.emit('update', todoList);
  });

  socket.on('add', async (item) => {
    try {
      const data = await redisClient.get(REDIS_KEY);
      let todoList = data ? JSON.parse(data) : [];
      todoList.push(item);

      if (todoList.length > 5) {
        const overflowItems = todoList.slice(0, todoList.length - CACHE_THRESHOLD);
        todoList = todoList.slice(-CACHE_THRESHOLD);

        const collection = mongoClient.db(DB_NAME).collection(COLLECTION_NAME);
        await collection.insertMany(overflowItems.map(todo => ({ todo })));
      }
      
      await redisClient.set(REDIS_KEY, JSON.stringify(todoList));
      io.emit('update', todoList);
    } catch (err) {
      console.error('Error handling add event:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
