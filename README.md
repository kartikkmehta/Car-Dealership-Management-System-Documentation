# Car-Dealership-Management-System-Documentation
 Technologies Used:
- Node.js
- Express.js
- MongoDB
- EJS (Embedded JavaScript) for templating
- bcrypt for password hashing
- multer for image uploading
- express-session for session management
-ejs 
-path
-session
-Bodyparser
-helmet

 Folder Structure:
```
car-dealership-management-system/
│
├── app.js                     Main application file
├── models/                    MongoDB models
│   ├── car.js                 Car model
│   └── user.js                User model
├── public/                    Public files (CSS, images)
│   └── uploads/               Directory for uploaded images
├── routes/                    Route definitions
│   ├── carRoutes.js           Car-related routes
│   └── userRoutes.js          User-related routes
├── views/                     EJS views
│   ├── addCars.ejs            Form for adding cars
│   ├── allCars.ejs            View to display all cars
│   ├── deleteCars.ejs         Delete car confirmation page
│   ├── index.ejs              Homepage
│   ├── login.ejs              Login page
│   ├── registration.ejs       Registration page
│   ├── search.ejs             Search form and results page
│   └── updateCar.ejs          Form for updating cars
├── .gitignore                 Git ignore file
└── package.json               Project dependencies and scripts
```

 Features:
1. Authentication and Authorization:
   - Users can register and login to access the system.
   - Admins have full access, while salespersons have restricted access.
   
2. Car Inventory Management:
   - Add, update, and delete cars from the inventory.
   - Display all cars in the inventory with details.
   
3. Image Upload:
   - Allow users to upload images for each car.

4. Search Functionality:
   - Search for cars based on VIN.

5. Error Handling and Validation:
   - Proper error handling for invalid requests.
   - Input validation to ensure data correctness.

6. Logging and Monitoring:
   - Logging application events, errors, and user activities using Winston.

7. Security Measures:
   - Implementation of security headers, HTTPS, input validation, and password hashing.

 Documentation for EJS Views:
1. addCars.ejs: Form to add a new car to the inventory.
2. allCars.ejs: View to display all cars in the inventory.
3. deleteCars.ejs: Confirmation page for deleting a car.
4. index.ejs: Homepage.
5. login.ejs: Login page.
6. registration.ejs: Registration page.
7. search.ejs: Form to search for cars by VIN.
8. updateCar.ejs: Form to update car details.









API Endpoints:
The project will be http://localhost:3000
The routes are described below
- `/register`: POST request to register a new user.
- `/login`: POST request to login.
- `/logout`: GET request to logout.
- `/addCars`: GET request to render the add car form, and POST request to add a new car.
- `/allCars`: GET request to display all cars.
- `/updateCar/:id`: GET request to render the update car form, and POST request to update car details.
- `/deleteCar/:id`: POST request to delete a car.
- `/search`: POST request to search for cars by VIN.

 Conclusion:
The Car Dealership Management System provides a user-friendly interface for managing the car inventory efficiently. With features such as authentication, role-based access control, and image uploading, it offers a robust solution for car dealership management. The documentation provides comprehensive guidance on how to use the system effectively.
