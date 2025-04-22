//importing the required modules
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session'); 
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

//connecting to the database
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Successfully connected to MongoDB.');
})
.catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
});

//using middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false })); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

//setting up the view engine
app.set('view engine', 'ejs');

//routes
app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
