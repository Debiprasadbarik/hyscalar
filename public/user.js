document.addEventListener('DOMContentLoaded', function() {
    const packageTable = document.getElementById('packageTable').getElementsByTagName('tbody')[0];
    const logoutBtn = document.getElementById('logoutBtn');
    // const bookButtons = document.querySelectorAll('.book-btn');
    // Load available packages
    fetchPackages();
  
    // Add event listener for logout button
    logoutBtn.addEventListener('click', function() {
      // Clear the authentication token or session
      // Redirect to the login page
      window.location.href = 'index.html';
    });
    
    // Function to fetch and display the package list
    function fetchPackages() {
      fetch('/packages')
    .then(response => response.json())
    .then(packages => {
      const packageTableBody = document.getElementById('packageTableBody');

      packages.forEach(package => {
        const row = document.createElement('tr');

        const holidayNameCell = document.createElement('td');
        holidayNameCell.textContent = package.holiday_name;
        row.appendChild(holidayNameCell);

        const durationCell = document.createElement('td');
        durationCell.textContent = package.duration;
        row.appendChild(durationCell);

        const destinationCell = document.createElement('td');
        destinationCell.textContent = package.destination;
        row.appendChild(destinationCell);

        const actionCell = document.createElement('td');
        const bookButton = document.createElement('button');
        bookButton.textContent = 'Book';
        bookButton.dataset.packageId = package.id;
        bookButton.classList.add('book-btn');
        actionCell.appendChild(bookButton);
        row.appendChild(actionCell);

        packageTableBody.appendChild(row);
      });

      // Add event listener for book buttons
      const bookButtons = document.querySelectorAll('.book-btn');
      bookButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const packageId = e.target.dataset.packageId;
          // const userEmail = sessionStorage.getItem('userEmail');
          // console.log('packageId:', packageId);
          // console.log('userEmail:', userEmail);
          // if (!packageId || !userEmail) {
          //   console.error('Missing required fields');
          //   return;
          // }
          fetch('/bookings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({packageId }) //, userEmail
          })
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Error booking package');
            }
          })
          .then(data => {
            console.log(data.message);
            alert("Booking successful");
            // Optionally, you can show a success message or update the UI
          })
          .catch(error => {
            console.error('Error booking package:', error);
            // Handle error response
            if (error.message === 'Error booking package' && error.response) {
              return error.response.json().then(data => {
                alert(data.error);
                // Handle specific error cases (e.g., missing fields, package not found)
              });
            } else {
              alert('An error occurred while booking the package.');
            }
          });
        });
      });
    })
    .catch(error => {
      console.error('Error fetching package list:', error);
    });
  }
});
    // Function to handle package selection
    // function selectPackage(package) {
    //   // Send the selected package data to the server
    //   fetch('/bookings', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(packageId)
    //   })
    //   .then(response => response.json())
    //   .then(data => {
    //     console.log(data);
    //     alert('Package booked successfully!');
    //     // You can also implement email sending here
    //     // sendPackageEmail(package);
    //   })
    //   .catch(error => {
    //     console.error('Error booking package:', error);
    //     alert('An error occurred while booking the package.');
    //   });
    // }