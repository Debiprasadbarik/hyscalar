document.addEventListener('DOMContentLoaded', function() {
  const packageForm = document.getElementById('packageForm');
  const packageTable = document.getElementById('packageTable').getElementsByTagName('tbody')[0];
  const logoutBtn = document.getElementById('logoutBtn');

  // Load existing packages
  fetchPackages();

  // Add event listener for package form submission
  packageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const holidayName = document.getElementById('holiday-name').value.trim();
    const duration = document.getElementById('duration').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const packageId = document.getElementById('packageId') ? document.getElementById('packageId').value.trim() : '';

    // Validate form fields
    if (holidayName === '' || duration === '' || destination === '') {
      alert('Please fill in all fields.');
      return;
    }

    // Check if the form is in edit mode
    const isEditMode = packageId !== '';

    if (isEditMode) {
      // Update the existing package
      updatePackage(packageId, holidayName, duration, destination);
    } else {
      // Check if the holiday package already exists
      const existingPackage = Array.from(packageTable.children).find(row => row.children[0].textContent === holidayName);
      if (existingPackage) {
        alert('Holiday package with the same name already exists.');
        return;
      }

      // Create a new package
      createPackage(holidayName, duration, destination);
    }
  });

  // Add event listener for logout button
  logoutBtn.addEventListener('click', function() {
    // Clear the authentication token or session
    // Redirect to the login page
    // Send a POST request to the /logout route
    fetch('/logout', {
      method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // Redirect to the login page
      window.location.href = 'index.html';
    })
    .catch(error => {
      console.error('Error logging out:', error);
      alert('An error occurred while logging out.');
    });
  });

  // Function to fetch and display the package list
  function fetchPackages() {
    fetch('/packages')
      .then(response => response.json())
      .then(packages => {
        const packageTable = document.getElementById('packageTable');
        const tableBody = packageTable.querySelector('tbody');
        tableBody.innerHTML = ''; // Clear the existing table rows

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

          const actionsCell = document.createElement('td');

          const editButton = document.createElement('button');
          editButton.textContent = 'Edit';
          editButton.addEventListener('click', () => editPackage(package.id, package.holiday_name, package.duration, package.destination));
          actionsCell.appendChild(editButton);

          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.addEventListener('click', () => deletePackage(package.id));
          actionsCell.appendChild(deleteButton);

          row.appendChild(actionsCell);
          tableBody.appendChild(row);
        });
      })
      .catch(error => {
        console.error('Error fetching packages:', error);
        alert('An error occurred while fetching the packages.');
      });
  }

  // Function to create a new package
  function createPackage(holidayName, duration, destination) {
    fetch('/packages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ holiday_name: holidayName, duration, destination })
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to create package');
      }
    })
    .then(data => {
      console.log(data.message);
      // Clear the form fields
      packageForm.reset();
      // Fetch and display the updated package list
      fetchPackages();
    })
    .catch(error => {
      console.error('Error creating package:', error);
      alert('An error occurred while creating the package.');
    });
  }

  // Function to update an existing package
  function updatePackage(packageId, holidayName, duration, destination) {
    fetch(`/packages/${packageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ holiday_name: holidayName, duration, destination })
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to update package');
      }
    })
    .then(data => {
      console.log(data.message);
      // Clear the form fields
      packageForm.reset();
      // Fetch and display the updated package list
      fetchPackages();
    })
    .catch(error => {
      console.error('Error updating package:', error);
      alert('An error occurred while updating the package.');
    });
  }

  // Function to delete a package
  function deletePackage(packageId) {
    if (confirm('Are you sure you want to delete this package?')) {
      fetch(`/packages/${packageId}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to delete package');
        }
      })
      .then(data => {
        console.log(data.message);
        // Fetch and display the updated package list
        fetchPackages();
      })
      .catch(error => {
        console.error('Error deleting package:', error);
        alert('An error occurred while deleting the package.');
      });
    }
  }

  // Function to fill the form with package data for editing
  function editPackage(packageId, holidayName, duration, destination) {
    const packageIdInput = document.getElementById('packageId');
    if (packageIdInput) {
      packageIdInput.value = packageId;
    }
    document.getElementById('holiday-name').value = holidayName;
    document.getElementById('duration').value = duration;
    document.getElementById('destination').value = destination;
  }
});