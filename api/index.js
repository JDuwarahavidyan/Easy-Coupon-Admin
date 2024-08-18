const express = require('express');
const app = express();
const dotenv = require('dotenv');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const movieRoute = require('./routes/movies');
const listRoute = require('./routes/lists');
const admin = require('firebase-admin'); // Importing admin

dotenv.config();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.firestore(); // Initializing Firestore

app.use((req, res, next) => {
  req.db = db; // Making Firestore available in req
  next();
});

app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/movies', movieRoute);
app.use('/api/lists', listRoute);

app.listen(8800, () => {
  console.log('Backend Server is running!');
});
