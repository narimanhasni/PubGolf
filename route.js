// Sample pub data - this would ideally be the same data source as used in scorecard.js
const pubs = [
  {
    id: 1,
    name: "The King's Arms",
    drink: "Pint of Lager",
    par: 4,
    location: { lat: 51.5074, lng: -0.1278 } // Example coordinates (this is central London)
  },
  {
    id: 2,
    name: "The Red Lion",
    drink: "Gin & Tonic",
    par: 3,
    location: { lat: 51.5080, lng: -0.1290 }
  },
  {
    id: 3,
    name: "The Crown",
    drink: "Glass of Wine",
    par: 5,
    location: { lat: 51.5085, lng: -0.1300 }
  },
  {
    id: 4,
    name: "The Rose & Crown",
    drink: "Vodka Shot",
    par: 2,
    location: { lat: 51.5090, lng: -0.1310 }
  },
  {
    id: 5,
    name: "The White Hart",
    drink: "Pint of Cider",
    par: 4,
    location: { lat: 51.5095, lng: -0.1320 }
  },
  {
    id: 6,
    name: "The Black Horse",
    drink: "Rum & Coke",
    par: 3,
    location: { lat: 51.5100, lng: -0.1330 }
  },
  {
    id: 7,
    name: "The Plough",
    drink: "Tequila Shot",
    par: 1,
    location: { lat: 51.5105, lng: -0.1340 }
  },
  {
    id: 8,
    name: "The Swan",
    drink: "Pint of Guinness",
    par: 5,
    location: { lat: 51.5110, lng: -0.1350 }
  }
];

// Current pub index (1-based)
let currentPubIndex = 1;

// DOM Elements
document.addEventListener("DOMContentLoaded", () => {
  // Initialize pub list events
  initializePubListEvents();

  // Center map button
  const centerMapBtn = document.getElementById("center-map-btn");
  centerMapBtn.addEventListener("click", () => {
    // In a real app, this would center the map on the current location
    alert("This would center the map on your current location");
  });

  // Initialize map (in a real app)
  initializeMap();
});

// Initialize pub list event listeners
function initializePubListEvents() {
  const pubItems = document.querySelectorAll(".pub-item");
  const directionBtns = document.querySelectorAll(".directions-btn");

  // Add click events to pub items
  pubItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      // Update current pub
      setCurrentPub(index + 1);
    });
  });

  // Add click events to direction buttons
  directionBtns.forEach((btn, index) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent triggering the pub item click
      
      // In a real app, this would open directions to this pub
      alert(`Getting directions to ${pubs[index].name}`);
    });
  });
}

// Set current pub in the list
function setCurrentPub(index) {
  // Update current pub index
  currentPubIndex = index;
  
  // Update UI to reflect current pub
  const pubItems = document.querySelectorAll(".pub-item");
  
  pubItems.forEach((item, i) => {
    if (i === index - 1) {
      item.classList.add("current");
    } else {
      item.classList.remove("current");
    }
  });
  
  // In a real app, this would update the map to center on this pub
  updateMap(index);
  
  // Scroll to the current pub in the list
  const currentPubElement = pubItems[index - 1];
  if (currentPubElement) {
    currentPubElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// Initialize map (placeholder function)
function initializeMap() {
  // This is a placeholder for map initialization
  // In a real app, this would initialize Google Maps or similar
  console.log("Map would be initialized here");
  
  // For now, we'll just show a message in the map placeholder
  const mapPlaceholder = document.querySelector(".map-placeholder");
  mapPlaceholder.innerHTML = `
    <i class="fas fa-map-marked-alt"></i>
    <p>Interactive map would display ${pubs.length} pubs</p>
    <p><small>Starting at ${pubs[0].name}</small></p>
  `;
}

// Update map when switching pubs (placeholder function)
function updateMap(pubIndex) {
  // This is a placeholder for updating the map
  // In a real app, this would pan the map to the selected pub
  console.log(`Map would pan to pub ${pubIndex}: ${pubs[pubIndex - 1].name}`);
  
  // Update the map placeholder message
  const mapPlaceholder = document.querySelector(".map-placeholder");
  mapPlaceholder.innerHTML = `
    <i class="fas fa-map-marked-alt"></i>
    <p>Map focused on pub ${pubIndex}: ${pubs[pubIndex - 1].name}</p>
    <p><small>${pubs[pubIndex - 1].drink} (Par: ${pubs[pubIndex - 1].par})</small></p>
  `;
}