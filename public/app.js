// app.js
document.addEventListener('DOMContentLoaded', () => {
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Login form submission
if (loginForm){
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    // Send a request to the /login route
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Login failed');
      }
    })
    .then(data => {
      console.log(data);
      // Handle successful login response
      // Redirect to the appropriate dashboard (admin or user)
      if (data.isAdmin) {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'user.html';
      }
    })
    .catch(error => {
      console.error(error);
      // Handle error response
      if (error.message === 'Login failed' && error.response) {
        // Handle specific error cases (e.g., invalid email or password)
        return error.response.json().then(data => {
          alert(data.error);
        });
      } else {
        alert('An error occurred during login.');
      }
    });
  });
}
// Sign up form submission
if (signupForm){
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const isAdmin = document.getElementById('isAdmin').checked;
    if (name === '') {
        alert('Please enter your name.');
        return;
    }
    if (email === '') {
        alert('Please enter your email address.');
        return;
    }

    if (password === '') {
        alert('Please enter a password.');
        return;
    }
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, isAdmin })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Registration failed');
        }
    })
    .then(data => {
        console.log(data);
        // Handle successful registration response
        alert(data.message);
        // Redirect to the login page
        window.location.href = 'index.html';
    })
    .catch(error => {
        console.error(error);
        // Handle error response
        if (error.message === 'Registration failed') {
            // Handle specific error cases (e.g., email already registered)
            return response.json().then(data => {
                alert(data.error);
            });
        } else {
            alert('An error occurred during registration.');
          }
        });
      });
    }
  });