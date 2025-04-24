// Pub Golf Route with Google Maps Integration

// Sample pub data - should match with scorecard.js
const pubs = [
  {
    id: 1,
    name: "The King's Arms",
    drink: "Pint of Lager",
    par: 4,
    location: { lat: 51.5074, lng: -0.1278 },
    address: "22 Oxford Street, London",
    hours: "12:00 - 23:00",
    phone: "020 1234 5678"
  },
  {
    id: 2,
    name: "The Red Lion",
    drink: "Gin & Tonic",
    par: 3,
    location: { lat: 51.5080, lng: -0.1290 },
    address: "48 Parliament Street, London",
    hours: "11:00 - 23:30",
    phone: "020 2345 6789"
  },
  {
    id: 3,
    name: "The Crown",
    drink: "Glass of Wine",
    par: 5,
    location: { lat: 51.5085, lng: -0.1300 },
    address: "10 Dean Street, London",
    hours: "12:00 - 00:00",
    phone: "020 3456 7890"
  },
  {
    id: 4,
    name: "The Rose & Crown",
    drink: "Vodka Shot",
    par: 2,
    location: { lat: 51.5090, lng: -0.1310 },
    address: "35 Broadwick Street, London",
    hours: "12:00 - 01:00",
    phone: "020 4567 8901"
  },
  {
    id: 5,
    name: "The White Hart",
    drink: "Pint of Cider",
    par: 4,
    location: { lat: 51.5095, lng: -0.1320 },
    address: "89 Wardour Street, London",
    hours: "11:00 - 00:00",
    phone: "020 5678 9012"
  },
  {
    id: 6,
    name: "The Black Horse",
    drink: "Rum & Coke",
    par: 3,
    location: { lat: 51.5100, lng: -0.1330 },
    address: "76 Berwick Street, London",
    hours: "12:00 - 23:00",
    phone: "020 6789 0123"
  },
  {
    id: 7,
    name: "The Plough",
    drink: "Tequila Shot",
    par: 1,
    location: { lat: 51.5105, lng: -0.1340 },
    address: "27 Great Marlborough Street, London",
    hours: "12:00 - 01:00",
    phone: "020 7890 1234"
  },
  {
    id: 8,
    name: "The Swan",
    drink: "Pint of Guinness",
    par: 5,
    location: { lat: 51.5110, lng: -0.1350 },
    address: "58 Beak Street, London",
    hours: "11:00 - 00:00",
    phone: "020 8901 2345"
  }
];

// Local storage key for saving data
const STORAGE_KEY = 'pubGolfGameData';

// Game data structure
let gameData = {
  players: [],
  visited: Array(pubs.length).fill(false),
  currentPubIndex: 0,
  gameStarted: false,
  gameDate: null
};

// Google Maps objects
let map;
let markers = [];
let directionsService;
let directionsRenderer;
let infoWindow;
let userLocationMarker;
let routePath;

// Load game data from localStorage
function loadGameData() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      // Validate the parsed data has the expected structure
      if (parsedData && 
          Array.isArray(parsedData.visited) &&
          parsedData.visited.length === pubs.length) {
        gameData = parsedData;
        return true;
      }
    } catch (e) {
      console.error('Error parsing saved game data:', e);
    }
  }
  return false;
}

// Save game data to localStorage
function saveGameData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameData));
    return true;
  } catch (e) {
    console.error('Error saving game data:', e);
    return false;
  }
}

// Initialize Google Maps
function initMap() {
  // Hide the loading indicator
  document.getElementById('map-loading').style.display = 'none';
  
  // Create map centered on the first pub
  map = new google.maps.Map(document.getElementById('map'), {
    center: pubs[0].location,
    zoom: 14,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: true,
    styles: [
      {
        featureType: 'poi.business',
        stylers: [{visibility: 'on'}]
      },
      {
        featureType: 'transit',
        elementType: 'labels.icon',
        stylers: [{visibility: 'on'}]
      }
    ]
  });
  
  // Initialize directions service and renderer
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: '#29b980',
      strokeWeight: 5,
      strokeOpacity: 0.7
    }
  });
  
  // Create info window for markers
  infoWindow = new google.maps.InfoWindow();
  
  // Add markers for each pub
  addPubMarkers();
  
  // Try to get user location
  getUserLocation();
  
  // Load saved game data
  loadGameData();
  
  // Update UI
  updateCurrentPubDisplay();
  updatePubList();
  
  // Draw route between pubs
  drawPubRoute();
  
  // Set up event listeners
  setupMapEventListeners();
}

// Add markers for each pub
function addPubMarkers() {
  // Clear existing markers
  markers.forEach(marker => marker.setMap(null));
  markers = [];
  
  // Add a marker for each pub
  pubs.forEach((pub, index) => {
    const isVisited = gameData.visited[index];
    const isCurrent = index === gameData.currentPubIndex;
    
    // Create marker
    const marker = new google.maps.Marker({
      position: pub.location,
      map: map,
      title: pub.name,
      label: {
        text: (index + 1).toString(),
        color: 'white'
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: isVisited ? '#29b980' : (isCurrent ? '#1e6f5c' : '#666'),
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: 'white',
        scale: 12
      },
      zIndex: isCurrent ? 10 : (isVisited ? 5 : 1),
      animation: isCurrent ? google.maps.Animation.BOUNCE : null
    });
    
    // Stop animation after a short time
    if (isCurrent) {
      setTimeout(() => {
        marker.setAnimation(null);
      }, 1500);
    }
    
    // Add click event to marker
    marker.addListener('click', () => {
      showPubInfo(pub, index, marker);
      setCurrentPub(index);
    });
    
    // Store marker reference
    markers.push(marker);
  });
}

// Show pub info in info window
function showPubInfo(pub, index, marker) {
  // Create info window content
  const content = `
    <div class="map-info-window">
      <h3>${pub.name}</h3>
      <p><strong>Hole ${index + 1}</strong></p>
      <p>
        <i class="fas fa-beer"></i> ${pub.drink}<br>
        <i class="fas fa-flag"></i> Par: ${pub.par}<br>
        <i class="fas fa-map-marker-alt"></i> ${pub.address}<br>
        <i class="fas fa-clock"></i> ${pub.hours}
      </p>
      <div class="info-window-actions">
        <button id="info-set-current" class="info-btn">Set as Current</button>
        <button id="info-directions" class="info-btn">Directions</button>
      </div>
    </div>
  `;
  
  // Set content to info window
  infoWindow.setContent(content);
  infoWindow.open(map, marker);
  
  // Add event listeners to buttons after a short delay
  setTimeout(() => {
    const setCurrent = document.getElementById('info-set-current');
    const getDirections = document.getElementById('info-directions');
    
    if (setCurrent) {
      setCurrent.addEventListener('click', () => {
        setCurrentPub(index);
        infoWindow.close();
      });
    }
    
    if (getDirections) {
      getDirections.addEventListener('click', () => {
        getDirectionsToPub(index);
        infoWindow.close();
      });
    }
  }, 10);
}

// Get user's current location
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Add marker for user location
        if (userLocationMarker) {
          userLocationMarker.setMap(null);
        }
        
        userLocationMarker = new google.maps.Marker({
          position: userPos,
          map: map,
          title: 'Your Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: 'white',
            scale: 8
          },
          zIndex: 100
        });
        
        // Center map on user if this is first load
        if (!loadGameData() || !gameData.gameStarted) {
          map.setCenter(userPos);
          
          // Calculate distances to all pubs from user location
          calculateDistancesToPubs(userPos);
        }
      },
      (error) => {
        console.error('Error getting user location:', error);
        // Use default location if geolocation fails
        handleLocationError(true);
      }
    );
  } else {
    // Browser doesn't support geolocation
    handleLocationError(false);
  }
}

// Handle geolocation errors
function handleLocationError(browserHasGeolocation) {
  console.warn(
    browserHasGeolocation
      ? 'Error: The Geolocation service failed.'
      : 'Error: Your browser doesn\'t support geolocation.'
  );
}

// Calculate distances from user to all pubs
function calculateDistancesToPubs(userPos) {
  // Use the Distance Matrix API (not implemented in this demo)
  console.log('Would calculate distances to all pubs from', userPos);
}

// Draw route between all pubs
function drawPubRoute() {
  // If we have a path already, remove it
  if (routePath) {
    routePath.setMap(null);
  }
  
  // Create path between pubs
  const path = pubs.map(pub => pub.location);
  
  routePath = new google.maps.Polyline({
    path: path,
    geodesic: true,
    strokeColor: '#FF6D00',
    strokeOpacity: 0.7,
    strokeWeight: 3,
    map: map
  });
}

// Get directions from user location to a pub
function getDirectionsToPub(pubIndex) {
  // Check if user location is available
  if (!userLocationMarker) {
    alert('Your location is not available. Please enable location services.');
    return;
  }
  
  const destination = pubs[pubIndex].location;
  const origin = userLocationMarker.getPosition();
  
  // Show loading indicator
  showDirectionsLoading(true);
  
  // Request directions
  directionsService.route(
    {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.WALKING
    },
    (response, status) => {
      // Hide loading indicator
      showDirectionsLoading(false);
      
      if (status === google.maps.DirectionsStatus.OK) {
        // Display the route
        directionsRenderer.setDirections(response);
        
        // Hide the regular route
        if (routePath) {
          routePath.setMap(null);
        }
        
        // Show directions panel if on desktop
        if (window.innerWidth > 768) {
          const directionsPanel = document.getElementById('directions-panel');
          if (directionsPanel) {
            directionsPanel.innerHTML = '';
            directionsRenderer.setPanel(directionsPanel);
          }
        }
      } else {
        // Show error
        alert('Directions request failed due to ' + status);
      }
    }
  );
}

// Show/hide directions loading indicator
function showDirectionsLoading(show) {
  const loadingIndicator = document.getElementById('map-loading');
  if (loadingIndicator) {
    loadingIndicator.style.display = show ? 'flex' : 'none';
  }
}

// Set up map-related event listeners
function setupMapEventListeners() {
  // Center map button
  const centerMapBtn = document.getElementById('center-map-btn');
  if (centerMapBtn) {
    centerMapBtn.addEventListener('click', () => {
      centerMapOnCurrentPub();
    });
  }
  
  // Directions button
  const directionsBtn = document.getElementById('directions-btn');
  if (directionsBtn) {
    directionsBtn.addEventListener('click', () => {
      getDirectionsToPub(gameData.currentPubIndex);
    });
  }
  
  // Pub navigation buttons
  const prevPubBtn = document.getElementById('prev-pub-btn');
  const nextPubBtn = document.getElementById('next-pub-btn');
  
  if (prevPubBtn) {
    prevPubBtn.addEventListener('click', () => {
      navigateToPrevPub();
    });
  }
  
  if (nextPubBtn) {
    nextPubBtn.addEventListener('click', () => {
      navigateToNextPub();
    });
  }
  
  // Mark as visited button
  const markVisitedBtn = document.getElementById('mark-visited-btn');
  if (markVisitedBtn) {
    markVisitedBtn.addEventListener('click', () => {
      togglePubVisited(gameData.currentPubIndex);
    });
  }
  
  // Pub directions button
  const pubDirectionsBtn = document.getElementById('pub-directions-btn');
  if (pubDirectionsBtn) {
    pubDirectionsBtn.addEventListener('click', () => {
      getDirectionsToPub(gameData.currentPubIndex);
    });
  }
  
  // Pub filter
  const pubFilter = document.getElementById('pub-status-filter');
  if (pubFilter) {
    pubFilter.addEventListener('change', () => {
      updatePubList();
    });
  }
}

// Center map on current pub
function centerMapOnCurrentPub() {
  const currentPub = pubs[gameData.currentPubIndex];
  map.setCenter(currentPub.location);
  map.setZoom(15);
}

// Navigate to previous pub
function navigateToPrevPub() {
  if (gameData.currentPubIndex > 0) {
    setCurrentPub(gameData.currentPubIndex - 1);
  }
}

// Navigate to next pub
function navigateToNextPub() {
  if (gameData.currentPubIndex < pubs.length - 1) {
    setCurrentPub(gameData.currentPubIndex + 1);
  }
}

// Toggle pub visited status
function togglePubVisited(pubIndex) {
  // Toggle the visited status
  gameData.visited[pubIndex] = !gameData.visited[pubIndex];
  
  // If this is the first marked pub, set game as started
  if (gameData.visited[pubIndex] && !gameData.gameStarted) {
    gameData.gameStarted = true;
    gameData.gameDate = new Date().toISOString();
  }
  
  // Save game data
  saveGameData();
  
  // Update UI
  updateCurrentPubDisplay();
  updatePubList();
  
  // Update marker
  updateMarkers();
  
  // Show notification
  showVisitedNotification(pubIndex, gameData.visited[pubIndex]);
}

// Show notification for visited status change
function showVisitedNotification(pubIndex, isVisited) {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('visit-notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'visit-notification';
    notification.style.position = 'fixed';
    notification.style.bottom = '70px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '20px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1000';
    notification.style.transition = 'all 0.3s ease';
    notification.style.opacity = '0';
    
    document.body.appendChild(notification);
  }
  
  // Set text, color and show
  if (isVisited) {
    notification.textContent = `Marked ${pubs[pubIndex].name} as visited!`;
    notification.style.background = '#29b980';
    notification.style.color = 'white';
  } else {
    notification.textContent = `Marked ${pubs[pubIndex].name} as not visited.`;
    notification.style.background = '#f0f0f0';
    notification.style.color = '#666';
  }
  
  notification.style.opacity = '1';
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
  }, 3000);
}

// Set current pub
function setCurrentPub(pubIndex) {
  // Update current pub index
  gameData.currentPubIndex = pubIndex;
  
  // Save game data
  saveGameData();
  
  // Update UI
  updateCurrentPubDisplay();
  updatePubList();
  updateMarkers();
  
  // Center map on the pub
  map.panTo(pubs[pubIndex].location);
  
  // Close any open info windows
  infoWindow.close();
}

// Update the current pub display
function updateCurrentPubDisplay() {
  const currentPub = pubs[gameData.currentPubIndex];
  
  // Update pub counter
  const pubCounter = document.getElementById('pub-counter');
  if (pubCounter) {
    pubCounter.textContent = `${gameData.currentPubIndex + 1}/${pubs.length}`;
  }
  
  // Update current pub name
  const currentPubName = document.getElementById('current-pub-name');
  if (currentPubName) {
    currentPubName.textContent = currentPub.name;
  }
  
  // Update hole number
  const holeNumber = document.querySelector('.hole-number');
  if (holeNumber) {
    holeNumber.textContent = gameData.currentPubIndex + 1;
  }
  
  // Update pub details
  const currentPubDrink = document.getElementById('current-pub-drink');
  const currentPubPar = document.getElementById('current-pub-par');
  const currentPubHours = document.getElementById('current-pub-hours');
  const currentPubPhone = document.getElementById('current-pub-phone');
  
  if (currentPubDrink) currentPubDrink.textContent = currentPub.drink;
  if (currentPubPar) currentPubPar.textContent = currentPub.par;
  if (currentPubHours) currentPubHours.textContent = currentPub.hours;
  if (currentPubPhone) currentPubPhone.textContent = currentPub.phone;
  
  // Update visited button
  const markVisitedBtn = document.getElementById('mark-visited-btn');
  if (markVisitedBtn) {
    const isVisited = gameData.visited[gameData.currentPubIndex];
    
    if (isVisited) {
      markVisitedBtn.innerHTML = '<i class="fas fa-check-circle"></i> Visited';
      markVisitedBtn.classList.add('visited');
    } else {
      markVisitedBtn.innerHTML = '<i class="fas fa-check-circle"></i> Mark as Visited';
      markVisitedBtn.classList.remove('visited');
    }
  }
  
  // Update navigation buttons
  const prevPubBtn = document.getElementById('prev-pub-btn');
  const nextPubBtn = document.getElementById('next-pub-btn');
  
  if (prevPubBtn) {
    prevPubBtn.disabled = gameData.currentPubIndex === 0;
  }
  
  if (nextPubBtn) {
    nextPubBtn.disabled = gameData.currentPubIndex === pubs.length - 1;
  }
}

// Update pub list
function updatePubList() {
  const pubList = document.getElementById('pub-list');
  if (!pubList) return;
  
  // Get filter value
  const filterSelect = document.getElementById('pub-status-filter');
  const filter = filterSelect ? filterSelect.value : 'all';
  
  pubList.innerHTML = '';
  
  pubs.forEach((pub, index) => {
    const isVisited = gameData.visited[index];
    const isCurrent = index === gameData.currentPubIndex;
    
    // Apply filter
    if (filter === 'visited' && !isVisited) return;
    if (filter === 'remaining' && isVisited) return;
    
    const pubItem = document.createElement('li');
    pubItem.className = 'pub-item';
    if (isCurrent) pubItem.classList.add('active');
    if (isVisited) pubItem.classList.add('visited');
    
    pubItem.innerHTML = `
      <div class="pub-number">${index + 1}</div>
      <div class="pub-info">
        <h3>${pub.name}</h3>
        <p><i class="fas fa-beer"></i> ${pub.drink}</p>
        <p><i class="fas fa-flag"></i> Par: ${pub.par}</p>
      </div>
      <div class="pub-actions">
        <button class="pub-action-icon directions-btn" data-index="${index}">
          <i class="fas fa-directions"></i>
        </button>
      </div>
    `;
    
    // Add click event to select this pub
    pubItem.addEventListener('click', () => {
      setCurrentPub(index);
    });
    
    pubList.appendChild(pubItem);
  });
  
  // Add click events to direction buttons
  const directionBtns = document.querySelectorAll('.directions-btn');
  directionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering the pub item click
      const pubIndex = parseInt(e.currentTarget.getAttribute('data-index'));
      getDirectionsToPub(pubIndex);
    });
  });
}

// Update map markers to reflect current state
function updateMarkers() {
  markers.forEach((marker, index) => {
    const isVisited = gameData.visited[index];
    const isCurrent = index === gameData.currentPubIndex;
    
    // Update icon
    marker.setIcon({
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: isVisited ? '#29b980' : (isCurrent ? '#1e6f5c' : '#666'),
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: 'white',
      scale: 12
    });
    
    // Update z-index
    marker.setZIndex(isCurrent ? 10 : (isVisited ? 5 : 1));
    
    // Add bounce animation to current pub marker
    if (isCurrent) {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      
      // Stop animation after a short time
      setTimeout(() => {
        marker.setAnimation(null);
      }, 1500);
    } else {
      marker.setAnimation(null);
    }
  });
}