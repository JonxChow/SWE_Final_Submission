import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './firebaseAdminConfig.js';  // Import the db instance from firebaseAdminConfig.js
import sendEmail from './emailConfig.js';   // Import default export from emailConfig.js

// ES module alternative to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Add body parser to handle JSON payloads
app.use(express.json());

// Serve static files from the 'Frontend' directory
app.use(express.static(path.join(__dirname, 'view')));
app.use(express.static(path.join(__dirname, 'controller')));
app.use(express.static(path.join(__dirname, 'model')));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Route for Home Page (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'view/pages/index.html'));
});

// Add routes for other HTML pages
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'view/pages/login.html'));
});

app.get('/confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, 'view/pages/confirmation.html'));
});

app.get('/history', (req, res) => {
  res.sendFile(path.join(__dirname, 'view/pages/history.html'));
});

app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, 'view/pages/map.html'));
});

app.get('/provider', (req, res) => {
    res.sendFile(path.join(__dirname, 'view/pages/provider.html'));
});

app.get('/request', (req, res) => {
    res.sendFile(path.join(__dirname, 'view/pages/request.html'));
});

app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'view/pages/services.html'));
});

app.get('/aboutus', (req, res) => {
  res.sendFile(path.join(__dirname, 'view/pages/aboutus.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'view/pages/contact.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'view/pages/profile.html'));
});

app.use(express.json());

// Send an email using EmailJS
app.post('/api/send-email', async (req, res) => {
  try {
    const emailResponse = await sendEmail(req.body);
    res.json({ message: 'Email sent successfully', response: emailResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch data from Firebase
//Example route to fetch data from Firebase
app.get('/api/data', (req, res) => {
    const ref = db.ref('users');
    ref.once('value', (snapshot) => {
      res.json(snapshot.val());
    }, (error) => {
      res.status(500).json({ error: error.message });
    });
});

// Example route to post data to Firebase
app.post('/api/data', (req, res) => {
  const ref = db.ref('users');  // Correct the path reference here, no need for './'
  ref.push(req.body, (error) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json({ message: 'Data saved successfully' });
    }
  });
});

// 404 error handling
app.use((req, res) => {
    res.status(404).send('404: Page not found');
});


