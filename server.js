const express = require('express');
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();
const port = 3000;
// const nodemailer = require('nodemailer');
// MySQL connection configuration
//mail sending 
// async function sendPackageEmail(userEmail, packageDetails) {
//   // Create a Nodemailer transporter
//   if (!userEmail) {
//     console.warn('User email not provided. Skipping email notification.');
//     return;
//   }
//   const transporter = nodemailer.createTransport({
//     service: 'gmail', // Use a different service if desired
//     auth: {
//       user: 'webtestmail.debi@gmail.com', // Your email address
//       pass: 'webtest@2024' // Your email password
//     }
//   });

  // Define the email options
  // const mailOptions = {
  //   from: 'webtestmail.debi@gmail.com', // Your email address
  //   to: userEmail,
  //   subject: 'Holiday Package Booking Confirmation',
  //   text: `You have booked the following holiday package:\n
  //          Holiday Name: ${packageDetails.holiday_name}\n
  //          Duration: ${packageDetails.duration} days\n
  //          Destination: ${packageDetails.destination}\n
  //          Thank you for your booking!`
  // };

//   try {
//     // Send the email
//     await transporter.sendMail(mailOptions);
//     console.log('Email sent successfully');
//     return true;
//   } catch (error) {
//     console.error('Error sending email:', error);
//     return false;
//   }
// }

//mail sending end
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'holiday_package_management',
  multipleStatements: true
});
connection.on('error', (err) => {
  console.error('MySQL Error:', err);
});
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});
// Session middleware
app.use(session({
  secret: 'your-secret-key', // Use a strong secret key
  resave: false,
  saveUninitialized: true
}));
// Route for the root URL
// Serve static files from the 'public' directory with correct MIME types
import('mime').then((mimeModule) => {
  const mime = mimeModule.default || mimeModule;
  app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path,stat) => {
    const mimeType = mime.getType(path);
    if (mimeType) {
      res.setHeader('Content-Type',mimeType);
    }
  }
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/signup.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});
// Connect to the MySQL database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database');
});

// Middleware to parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// User authentication middleware
const authenticateUser = (req, res, next) => {
  if (req.session.user) {
    // User is authenticated
    next();
  } else {
    // User is not authenticated
    res.redirect('/login');
  }
};

// User login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const query = 'SELECT * FROM users WHERE email = ?';
  connection.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Error logging in:', err);
      return res.status(500).json({ error: 'Error logging in' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  // Store user data in the session
  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.is_admin
  };

  res.json({ message: 'Login successful', isAdmin: user.is_admin });
});
});

// User logout
app.post('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy();
  res.json({ message: 'Logout successful' });
});
// User registration
app.post('/register', async (req, res) => {
  const { name, email, password, isAdmin } = req.body;
  // Input validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    // Check if the email already exists
    const emailCheckQuery = 'SELECT * FROM users WHERE email = ?';
    connection.query(emailCheckQuery, [email], async (err, results) => {
      if (err) {
        console.error('Error checking email:', err);
        return res.status(500).json({ error: 'Error registering user' });
      }
      if (results.length > 0) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = 'INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)';
      connection.query(query, [name, email, hashedPassword,isAdmin], (err, result) => {
        if (err) {
          console.error('Error registering user:', err);
          res.status(500).json({ error: 'Error registering user' });
        } else {
          res.status(201).json({ message: 'User registered successfully' });
        }
      });
    });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Protected routes
app.get('/admin', authenticateUser, (req, res) => {
  // Only authenticated users with admin privileges can access this route
  if (req.session.user.isAdmin) {
    // Render the admin dashboard
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  } else {
    res.status(403).json({ error: 'Access denied' });
  }
});

app.get('/user', authenticateUser, (req, res) => {
  // Only authenticated users can access this route
  res.sendFile(path.join(__dirname, 'public', 'user.html'));
});
  
// CRUD operations for holiday packages

// Create a new holiday package
app.post('/packages', authenticateUser, (req, res) => {
    const { holiday_name, duration, destination } = req.body;
  
    // Input validation
    if (!holiday_name || !duration || !destination) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    const query = 'INSERT INTO holiday_packages (holiday_name, duration, destination) VALUES (?, ?, ?)';
    connection.query(query, [holiday_name, duration, destination], (err, result) => {
      if (err) {
        console.error('Error creating holiday package:', err);
        res.status(500).json({ error: 'Error creating holiday package' });
      } else {
        res.json({ message: 'Holiday package created successfully' });
      }
    });
  });

// Get all holiday packages
app.get('/packages', authenticateUser, (req, res) => {
    const query = 'SELECT * FROM holiday_packages';
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error retrieving holiday packages:', err);
        res.status(500).json({ error: 'Error retrieving holiday packages' });
      } else {
        res.json(results);
      }
    });
  });

// Update a holiday package
app.put('/packages/:id', authenticateUser, (req, res) => {
    const packageId = req.params.id;
    const { holiday_name, duration, destination } = req.body;
  
    // Input validation
    if (!holiday_name || !duration || !destination) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    const query = 'UPDATE holiday_packages SET holiday_name = ?, duration = ?, destination = ? WHERE id = ?';
    connection.query(query, [holiday_name, duration, destination, packageId], (err, result) => {
      if (err) {
        console.error('Error updating holiday package:', err);
        res.status(500).json({ error: 'Error updating holiday package' });
      } else {
        res.json({ message: 'Holiday package updated successfully' });
      }
    });
  });

// Delete a holiday package
app.delete('/packages/:id', authenticateUser, (req, res) => {
    const packageId = req.params.id;
    const query = 'DELETE FROM holiday_packages WHERE id = ?';
    connection.query(query, [packageId], (err, result) => {
      if (err) {
        console.error('Error deleting holiday package:', err);
        if (err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD' || err.code === 'ER_BAD_FIELD_ERROR') {
          // Handle specific SQL errors related to data types or invalid field names
          res.status(500).json({ error: 'Invalid or incorrect data provided' });
        } 
        else{
        res.status(500).json({ error: 'Error deleting holiday package' });
        }
      } 
      else {
        res.json({ message: 'Holiday package deleted successfully' });
      }
    });
  });

// User registration
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
  
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      // Check if the email already exists
      const emailCheckQuery = 'SELECT * FROM users WHERE email = ?';
      connection.query(emailCheckQuery, [email], async (err, results) => {
        if (err) {
          console.error('Error checking email:', err);
          return res.status(500).json({ error: 'Error registering user' });
        }
  
        if (results.length > 0) {
          return res.status(409).json({ error: 'Email already registered' });
        }
  
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
  
        const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        connection.query(query, [name, email, hashedPassword], (err, result) => {
          if (err) {
            console.error('Error registering user:', err);
            res.status(500).json({ error: 'Error registering user' });
          } else {
            res.status(201).json({ message: 'User registered successfully' });
          }
        });
      });
    } catch (err) {
      console.error('Error registering user:', err);
      res.status(500).json({ error: 'Error registering user' });
    }
  });
 
  app.post('/bookings', authenticateUser, (req, res) => {
    const { packageId } = req.body; //, userEmail
    const userId = req.session.user.id;
    if (!packageId) {
      return res.status(400).json({ error: 'Missing package ID' });
    }
  
    // Input validation
    // if (!packageId || !userEmail) {
    //   return res.status(400).json({ error: 'Missing required fields' });
    // }
    
    // if (req.body.userEmail) {
    //   userEmail = req.body.userEmail;
    // } else {
    //   console.warn('User email not provided');
    //   // continuing with the booking process without sending an email
    // }
    // Check if the package exists
    const packageQuery = 'SELECT * FROM holiday_packages WHERE id = ?';
    connection.query(packageQuery, [packageId], (err, results) => {
      if (err) {
        console.error('Error checking package:', err);
        return res.status(500).json({ error: 'Error booking package' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'Package not found' });
      }
      const packageDetails = results[0];
      // Create a new booking
      const bookingQuery = 'INSERT INTO user_bookings (user_id, package_id) VALUES (?, ?)';
      connection.query(bookingQuery, [userId, packageId], (err, result) => {
        if (err) {
          console.error('Error creating booking:', err);
          res.status(500).json({ error: 'Error booking package' });
        }
        else {
          res.json({ message: 'Package booked successfully' });
        }
      });
    });
  });
// User login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], async (err, results) => {
      if (err) {
        console.error('Error logging in:', err);
        return res.status(500).json({ error: 'Error logging in' });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      const user = results[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      // Generate a token and send it back to the client
      const token = 'your_token_generation_logic';
      res.json({ token });
    });
  });
  
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
});