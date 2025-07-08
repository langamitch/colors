// Firebase Configuration (Replace with your config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const colorsRef = database.ref('colors');

// Navbar Toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Overlay Functions
function openOverlay() {
  document.getElementById('color-overlay').style.display = 'flex';
  document.getElementById('form-error').style.display = 'none';
}

function closeOverlay() {
  document.getElementById('color-overlay').style.display = 'none';
  document.getElementById('color-form').reset();
  document.getElementById('form-error').style.display = 'none';
}

// Form Submission
document.getElementById('color-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const errorElement = document.getElementById('form-error');
  const name = document.getElementById('color-name').value.trim();
  const hex = document.getElementById('color-hex').value.trim();
  const desc = document.getElementById('color-desc').value.trim();

  // Client-side validation
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    errorElement.textContent = 'Please enter a valid hex code (e.g., #FFFFFF)';
    errorElement.style.display = 'block';
    return;
  }
  if (name.length === 0 || name.length > 50) {
    errorElement.textContent = 'Color name must be between 1 and 50 characters';
    errorElement.style.display = 'block';
    return;
  }
  if (desc.length === 0 || desc.length > 200) {
    errorElement.textContent = 'Description must be between 1 and 200 characters';
    errorElement.style.display = 'block';
    return;
  }

  // Save to Firebase
  const newColorRef = colorsRef.push();
  newColorRef.set({
    name: name,
    hex: hex,
    description: desc,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  }).then(() => {
    console.log('Color submitted successfully');
    closeOverlay();
  }).catch((error) => {
    console.error('Error submitting color:', error);
    errorElement.textContent = 'Failed to submit color. Please try again.';
    errorElement.style.display = 'block';
  });
});

// Retrieve and Display Colors
const colorGrid = document.getElementById('color-grid');

function displayColor(colorId, colorData) {
  // Sanitize inputs to prevent XSS
  const sanitize = (str) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const card = document.createElement('div');
  card.className = 'color-card';
  card.style.backgroundColor = colorData.hex;
  card.innerHTML = `
    <h3>${sanitize(colorData.name)}</h3>
    <p>${sanitize(colorData.description)}</p>
  `;
  colorGrid.appendChild(card);
}

// Clear grid before appending to avoid duplicates
colorsRef.on('value', (snapshot) => {
  colorGrid.innerHTML = ''; // Clear existing cards
  const colors = snapshot.val();
  if (colors) {
    Object.entries(colors).forEach(([colorId, colorData]) => {
      displayColor(colorId, colorData);
    });
  }
});
