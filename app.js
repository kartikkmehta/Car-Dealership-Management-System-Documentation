//App.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session'); // Express session for session management
const ejs = require('ejs');
const path = require('path');
const multer = require('multer'); //For images

const app = express();

//View engine configuration
app.set('view engine', 'ejs');

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware to analyze application/json
app.use(bodyParser.json());

// Middleware setup

app.use(session({
  secret: 'bingo',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to false if not using HTTPS
    maxAge: 3600000,
    httpOnly: true
  }
}));

//Setting up database connection
mongoose.connect('mongodb://127.0.0.1:27017/CarDealership');
mongoose.connection.on('connected', () => console.log('Connected'));
mongoose.connection.on('error', () => console.log('Connection failed with - ', err));

//Creating the schema for the database
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  security_q: { type: String, required: true },
  security_a: { type: String, required: true },
  role: { type: String, enum: ['admin', 'salesperson'], default: 'salesperson' }
})

const CarSchema = new mongoose.Schema({
  make: String,
  model: String,
  year: Number,
  price: String,
  color: String,
  vin: { type: String, required: true, unique: true },
  mileage: String,
  fuel: { type: String, enum: ['gasoline', 'electric', 'hybrid'] },
  transmission: { type: String, enum: ['automatic', 'manual'] },
  condition: { type: String, enum: ['new', 'used', 'refurbished'] },
  image: {
    data: Buffer,
    contentType: String
  }
})

//Creating the model
const User = mongoose.model('User', UserSchema); //To Users

const Car = mongoose.model('Car', CarSchema); // To Cars

//Home page route (EJS)
app.get('/', (req, res) => {
  res.render('index');
});

//User Register Route
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { email, username, password, security_q, security_a, role } = req.body; //Extracting the information

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    await User.create({ email, username, password: hashedPassword, security_q, security_a: hashedPassword, role }); // Create a new user with hashed password

    res.render('login');
  }

  catch (error) {
    console.log(error);

    res.status(500).send('Registration failed!'); // Send error response

  }

});

//User login Route
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    const passwordMatch = await bcrypt.compare(req.body.password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    req.session.user = user; // Setting the user in the session

    // Log the role of the user
    console.log('User role:', user.role);

    // Determine the role of the user
    const isAdmin = user.role === 'admin';

    // Fetch all cars from the database
    const cars = await Car.find({});

    // Render the allCars view with cars and isAdmin flag
    res.render('allCars', { cars, admin: isAdmin });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Login failed!');
  }
});


//*** Upload Images into MongoDB ***

// Set the storage function
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/') // Directory where files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

// Initialize the Multer middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 50 // File size limit (50MB)
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb); // Check the file type
  }
});

// Check file type
function checkFileType(file, cb) {
  // Allow file extensions
  const filetypes = /jpeg|jpg|avif|png|gif/;
  // Check the extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check MIME type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Only images are allowed!');
  }
}

//Route - addCars
app.get('/addCars', (req, res) => { //TESTE AQUI, SALESPERSON CAN'T ADD A CAR ?
  res.render('addCars');
});

const fs = require('fs');

app.post('/addCars', upload.single('image'), async (req, res) => {
  const { make, model, year, price, color, vin, mileage, fuel, transmission, condition } = req.body; //Extracting the information
  const image = {
    data: fs.readFileSync(req.file.path),
    contentType: req.file.mimetype
  }; // Extracting the uploaded image

  try {
    await Car.create({ make, model, year, price, color, vin, mileage, image, fuel, transmission, condition, image }); //Creating an entry in the database
    res.redirect('/allCars');
  }

  catch (error) {
    console.log(error);
    res.status(500).send('Registration failed!'); // Send error response
  }
});

//************************************************************************** */



// Route - Display all Cars

app.get('/allCars', async (req, res) => {
  try {
    const cars = await Car.find({});
    console.log('Session:', req.session); // Debug statement to check session
    const isAdmin = req.session.user && req.session.user.role === 'admin'; // Check if user is admin
    console.log('isAdmin:', isAdmin); // Debug statement to check isAdmin value
    res.render('allCars', { cars: cars, admin: isAdmin });
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).send('Failed to fetch cars');
  }
});

//Route Update - Form to Update a Car
app.get('/updateCar/:id', (req, res) => {
  Car.findById(req.params.id)
    .then(foundCar => {
      res.render('updateCar', { car: foundCar });
    })
    .catch(err => {
      console.log(err);
    });
});

// Update Post Route - handle form submission for update
app.post('/updateCar/:id', async (req, res) => {
  const { make, model, year, price, color, vin, mileage, fuel, transmission, condition } = req.body;
  try {
    await Car.findByIdAndUpdate(req.params.id, { make, model, year, price, color, vin, mileage, fuel, transmission, condition });
    res.redirect('/allCars');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error updating item');
  }
});

//********************************************************************** */
//Delete - Route

app.post('/deleteCar/:id', async (req, res) => {
  try {
    const deletedCar = await Car.findByIdAndDelete(req.params.id);
    if (!deletedCar) {
      return res.status(404).send('Car not found');
    }
    res.redirect('/allCars');
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).send('Error deleting car');
  }
});


// Route for searching cars by VIN
app.post('/search', async (req, res) => {
  const { vin } = req.body; // Extract the VIN from the form input

  try {
    const car = await Car.findOne({ vin });

    if (!car) {
      return res.render('search', { car: null, error: 'No car found with the specified VIN.' });
    }

    return res.render('search', { car, error: null }); // Pass null for the error variable
  } catch (error) {
    console.error('Error searching car:', error);
    res.status(500).send('Failed to search car');
  }
});


// Logout route
app.get('/logout', (req, res) => {

  req.session.destroy(err => { // Destroy session

    if (err) {

      res.status(500).send('Logout failed!'); // Send error response if logout failed

    } else {

      res.redirect('/'); // Redirect to the home page after logout

    }

  });

});

//Setting up the port number
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));