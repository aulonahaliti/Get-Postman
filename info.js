const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Create an express app
const app = express();

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/simpledb')
  .then(() => console.log('Connected to MongoDB...'))
  .catch((err) => console.error('Could not connect to MongoDB...', err));

// Define a simple schema and model for MongoDB
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Route to add a new user
app.post('/add-user', async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = new User({ name, email });

    await user.save();
    res.status(201).send('User added successfully');
  } catch (error) {
    res.status(500).send('Error adding user: ' + error.message);
  }
});

// Route to fetch all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send('Error fetching users: ' + error.message);
  }
});

// Route to search for a user by name
app.get('/search-user', async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).send('Name query parameter is required');
    }

    const users = await User.find({ name: { $regex: name, $options: 'i' } });

    if (users.length === 0) {
      return res.status(404).send('No users found');
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).send('Error searching for user: ' + error.message);
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});