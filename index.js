// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTeJc2NFk8_vzay1Ne_o_0CqiXodQixSg",
  authDomain: "colors-88465.firebaseapp.com",
  databaseURL: "https://colors-88465-default-rtdb.firebaseio.com",
  projectId: "colors-88465",
  storageBucket: "colors-88465.firebasestorage.app",
  messagingSenderId: "1018041730922",
  appId: "1:1018041730922:web:e43574c98741b796fe4713",
  measurementId: "G-C1EH1QCV8T",
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization failed:", error.message);
}

// Initialize Firestore
const db = firebase.firestore();
const colorsCollection = db.collection("colors");

// Navbar Toggle
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    console.log("Navbar toggled");
  });
} else {
  console.error("Nav toggle or links not found");
}

// Overlay Functions
function openOverlay() {
  const overlay = document.getElementById("color-overlay");
  const errorElement = document.getElementById("form-error");
  if (overlay && errorElement) {
    overlay.style.display = "flex";
    errorElement.style.display = "none";
    console.log("Overlay opened");
  } else {
    console.error("Overlay or error element not found");
  }
}

function closeOverlay() {
  const overlay = document.getElementById("color-overlay");
  const form = document.getElementById("color-form");
  const errorElement = document.getElementById("form-error");
  if (overlay && form && errorElement) {
    overlay.style.display = "none";
    form.reset();
    errorElement.style.display = "none";
    console.log("Overlay closed");
  } else {
    console.error("Overlay, form, or error element not found");
  }
}

// Form Submission
const colorForm = document.getElementById("color-form");
if (colorForm) {
  colorForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const errorElement = document.getElementById("form-error");
    const name = document.getElementById("color-name").value.trim();
    const hex = document.getElementById("color-hex").value.trim();
    const desc = document.getElementById("color-desc").value.trim();

    if (!errorElement) {
      console.error("Error element not found");
      return;
    }

    // Client-side validation
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      errorElement.textContent =
        "Please enter a valid hex code (e.g., #FFFFFF)";
      errorElement.style.display = "block";
      console.log("Invalid hex code");
      return;
    }
    if (name.length === 0 || name.length > 50) {
      errorElement.textContent =
        "Color name must be between 1 and 50 characters";
      errorElement.style.display = "block";
      console.log("Invalid name length");
      return;
    }
    if (desc.length === 0 || desc.length > 600) {
      errorElement.textContent =
        "Description must be between 1 and 200 characters";
      errorElement.style.display = "block";
      console.log("Invalid description length");
      return;
    }

    // Save to Firestore
    colorsCollection
      .add({
        name: name,
        hex: hex,
        description: desc,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then((docRef) => {
        console.log("Color submitted successfully:", docRef.id, {
          name,
          hex,
          desc,
        });
        closeOverlay();
      })
      .catch((error) => {
        console.error("Error submitting color:", error.message);
        errorElement.textContent = "Failed to submit color: " + error.message;
        errorElement.style.display = "block";
      });
  });
} else {
  console.error("Color form not found");
}

// Retrieve and Display Colors
const colorGrid = document.getElementById("color-grid");
if (colorGrid) {
  function displayColor(docId, colorData, index) {
    const sanitize = (str) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const card = document.createElement("div");
    card.className = "color-card";

    // Swatch
    const swatch = document.createElement("div");
    swatch.className = "swatch";
    swatch.style.backgroundColor = colorData.hex;

    // Info
    const info = document.createElement("div");
    info.className = "color-info";

    // Title (number and name)
    const title = document.createElement("div");
    title.className = "color-title";
    title.innerHTML = `<span class="color-number">${
      index + 1
    }.</span> <span class="color-name">${sanitize(colorData.name)}</span>`;

    // Description
    const desc = document.createElement("div");
    desc.className = "color-desc";
    desc.textContent = colorData.description;
    
    const hex = document.createElement ("div");
    hex.className = "hex";
    hex.textContent = colorData.hex;

    info.appendChild(title);
    info.appendChild(hex);
    info.appendChild(desc);

    card.appendChild(swatch);
    card.appendChild(info);

    colorGrid.appendChild(card);
  }

  function getContrastColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000" : "#FFF";
  }

  // Real-time listener
  colorsCollection.orderBy("timestamp", "desc").onSnapshot(
    (snapshot) => {
      colorGrid.innerHTML = "";
      snapshot.forEach((doc, idx) => {
        const colorData = doc.data();
        const docId = doc.id;
        if (colorData.name && colorData.hex && colorData.description) {
          displayColor(docId, colorData, idx);
        } else {
          console.warn("Invalid color data for ID:", docId);
        }
      });
    },
    (error) => {
      console.error("Error retrieving colors:", error.message);
    }
  );
} else {
  console.error("Color grid not found");
}
