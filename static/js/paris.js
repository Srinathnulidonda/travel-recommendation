      // Advanced Paris Explorer JavaScript

// IIFE to avoid polluting the global scope
(function() {
    'use strict';

    // Global variables
    let map, infoWindow, heatmap, trafficLayer;
    const paris = { lat: 48.8566, lng: 2.3522 };

    // Map styles
    const mapStyles = [
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }]
        },
        {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }]
        },
        // ... (rest of the styles remain the same)
    ];

    // Destinations data
    const destinations = [
        { 
            name: "Eiffel Tower", 
            position: { lat: 48.8584, lng: 2.2945 },
            icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            description: "Iconic iron lattice tower on the Champ de Mars",
            details: "The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris. It is named after the engineer Gustave Eiffel, whose company designed and built the tower. Constructed from 1887 to 1889 as the entrance arch to the 1889 World's Fair, it has become a global cultural icon of France and one of the most recognizable structures in the world."
        },
        { 
            name: "Louvre Museum", 
            position: { lat: 48.8606, lng: 2.3376 },
            icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            description: "World's largest art museum and home to the Mona Lisa",
            details: "The Louvre, or the Louvre Museum, is the world's largest art museum and a historic monument in Paris, France. A central landmark of the city, it is located on the Right Bank of the Seine in the city's 1st arrondissement. Approximately 38,000 objects from prehistory to the 21st century are exhibited over an area of 72,735 square meters."
        },
        { 
            name: "Arc de Triomphe", 
            position: { lat: 48.8738, lng: 2.2950 },
            icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            description: "Iconic monument honoring those who fought for France",
            details: "The Arc de Triomphe de l'Étoile is one of the most famous monuments in Paris, France, standing at the western end of the Champs-Élysées at the centre of Place Charles de Gaulle, formerly named Place de l'Étoile. The Arc de Triomphe honours those who fought and died for France in the French Revolutionary and Napoleonic Wars, with the names of all French victories and generals inscribed on its inner and outer surfaces."
        }
    ];

    // Initialize the map and features
    function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 13,
            center: paris,
            styles: mapStyles
        });

        infoWindow = new google.maps.InfoWindow();

        addDestinationMarkers();
        addCustomControls();
        addMapClickListener();
        initPlacesAutocomplete();
        addCustomOverlay();
        initializeHeatmap();
        initializeTrafficLayer();
    }

    // Function to add markers for popular destinations
    function addDestinationMarkers() {
        destinations.forEach(dest => {
            const marker = new google.maps.Marker({
                position: dest.position,
                map: map,
                title: dest.name,
                icon: dest.icon,
                animation: google.maps.Animation.DROP
            });

            marker.addListener('click', () => {
                infoWindow.setContent(`
                    <div>
                        <h3>${dest.name}</h3>
                        <p>${dest.description}</p>
                        <button onclick="showDetails('${dest.name}')">More Info</button>
                    </div>
                `);
                infoWindow.open(map, marker);
            });
        });
    }

    // Function to add custom controls
    function addCustomControls() {
        const controlDiv = document.createElement('div');
        controlDiv.style.padding = '10px';
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(controlDiv);

        const controlUI = document.createElement('div');
        controlUI.style.backgroundColor = '#fff';
        controlUI.style.border = '2px solid #fff';
        controlUI.style.borderRadius = '3px';
        controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '22px';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click to recenter the map';
        controlDiv.appendChild(controlUI);

        const controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '16px';
        controlText.style.lineHeight = '38px';
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.innerHTML = 'Center Map';
        controlUI.appendChild(controlText);

        controlUI.addEventListener('click', () => {
            map.setCenter(paris);
            map.setZoom(13);
        });
    }

    // Function to add map click listener for custom markers
    function addMapClickListener() {
        map.addListener('click', (event) => {
            addCustomMarker(event.latLng);
        });
    }

    // Function to add custom markers
    function addCustomMarker(location) {
        const marker = new google.maps.Marker({
            position: location,
            map: map,
            draggable: true,
            animation: google.maps.Animation.DROP,
            icon: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div>
                    <h4>Custom Marker</h4>
                    <p>Latitude: ${location.lat()}</p>
                    <p>Longitude: ${location.lng()}</p>
                    <button onclick="removeMarker(${marker.id})">Remove Marker</button>
                </div>
            `
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    }

    // Function to remove a custom marker
    window.removeMarker = function(markerId) {
        const marker = markers.get(markerId);
        if (marker) {
            marker.setMap(null);
            markers.delete(markerId);
        }
    };

    // Function to initialize Places Autocomplete
    function initPlacesAutocomplete() {
        const input = document.getElementById('pac-input');
        const autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                window.alert("No details available for input: '" + place.name + "'");
                return;
            }

            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);
            }

            const marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location,
                title: place.name,
                animation: google.maps.Animation.DROP
            });

            const content = `
                <div>
                    <h3>${place.name}</h3>
                    <p>${place.formatted_address}</p>
                    <p>Rating: ${place.rating ? place.rating + ' / 5' : 'N/A'}</p>
                </div>
            `;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
        });
    }

    // Function to add custom overlay
    function addCustomOverlay() {
        const overlay = new google.maps.OverlayView();
        overlay.draw = function() {
            const projection = this.getProjection();
            const position = projection.fromLatLngToDivPixel(paris);
            const div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.left = position.x + 'px';
            div.style.top = position.y + 'px';
            div.style.background = 'rgba(255, 255, 255, 0.7)';
            div.style.padding = '5px';
            div.style.borderRadius = '3px';
            div.innerHTML = 'Paris Center';
            this.getPanes().overlayLayer.appendChild(div);
        };
        overlay.setMap(map);
    }

    // Function to show more details about a destination
    window.showDetails = function(name) {
        const destination = destinations.find(dest => dest.name === name);
        if (destination) {
            const detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));
            document.getElementById('detailsModalLabel').textContent = destination.name;
            document.getElementById('detailsModalBody').innerHTML = `
                <p>${destination.details}</p>
                <img src="https://via.placeholder.com/400x200?text=${encodeURIComponent(destination.name)}" alt="${destination.name}" class="img-fluid">
            `;
            detailsModal.show();
        }
    };

    // Function to initialize heatmap
    function initializeHeatmap() {
        const heatmapData = [
            {location: new google.maps.LatLng(48.8584, 2.2945), weight: 3},
            {location: new google.maps.LatLng(48.8606, 2.3376), weight: 2},
            {location: new google.maps.LatLng(48.8738, 2.2950), weight: 1}
        ];

        heatmap = new google.maps.visualization.HeatmapLayer({
            data: heatmapData,
            dissipating: true,
            radius: 50
        });
    }

    // Function to toggle heatmap
    window.toggleHeatmap = function() {
        heatmap.setMap(heatmap.getMap() ? null : map);
    };

    // Function to initialize traffic layer
    function initializeTrafficLayer() {
        trafficLayer = new google.maps.TrafficLayer();
    }

    // Function to toggle traffic layer
    window.toggleTraffic = function() {
        trafficLayer.setMap(trafficLayer.getMap() ? null : map);
    };

    // Function to show 3D buildings
    window.show3DBuildings = function() {
        const threeDButton = document.getElementById('3dButton');
        if (map.getTilt() !== 0) {
            map.setTilt(0);
            threeDButton.textContent = 'Show 3D Buildings';
        } else {
            map.setTilt(45);
            threeDButton.textContent = 'Hide 3D Buildings';
        }
    };

    // Load the Google Maps API script
    function loadGoogleMapsScript() {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAPnLXTOd76DE4Ks3uHbj8AOEvRh30dzlo&libraries=places,visualization&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }

    // Initialize AOS
    AOS.init({
        duration: 1000,
        once: true
    });

    // Navbar color change on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.custom-navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });

    // Form validation
    (function () {
        'use strict'
        var forms = document.querySelectorAll('.needs-validation')
        Array.prototype.slice.call(forms)
            .forEach(function (form) {
                form.addEventListener('submit', function (event) {
                    if (!form.checkValidity()) {
                        event.preventDefault()
                        event.stopPropagation()
                    }
                    form.classList.add('was-validated')
                }, false)
            })
    })()

    // Call the function to load the Google Maps API script when the page loads
    window.onload = loadGoogleMapsScript;

    // Make initMap globally accessible
    window.initMap = initMap;
})();
 // Smart Itinerary Generator
 const tripDurationInput = document.getElementById('tripDuration');
 const tripDurationOutput = document.getElementById('tripDurationOutput');

 tripDurationInput.addEventListener('input', function() {
     tripDurationOutput.textContent = this.value + ' days';
 });

 document.getElementById('itineraryForm').addEventListener('submit', function(e) {
     e.preventDefault();
     const duration = tripDurationInput.value;
     const interests = Array.from(document.querySelectorAll('#itineraryForm input[type="checkbox"]:checked')).map(cb => cb.value);
     generateItinerary(duration, interests);
 });

 function generateItinerary(duration, interests) {
     const attractions = {
         art: ['Louvre Museum', 'Orsay Museum', 'Centre Pompidou', 'Rodin Museum', 'Picasso Museum'],
         history: ['Eiffel Tower', 'Notre-Dame Cathedral', 'Arc de Triomphe', 'Sainte-Chapelle', 'Catacombs'],
         food: ['Le Marais food tour', 'Cooking class at Le Cordon Bleu', 'Wine tasting in Montmartre', 'Cheese tasting at Fromagerie Danard', 'Chocolate tour in Saint-Germain'],
         shopping: ['Champs-Élysées', 'Le Bon Marché', 'Saint-Germain-des-Prés', 'Marché aux Puces de Saint-Ouen', 'Galeries Lafayette'],
         nature: ['Luxembourg Gardens', 'Bois de Boulogne', 'Jardin des Tuileries', 'Parc des Buttes-Chaumont', 'Jardin des Plantes']
     };

     const itinerary = [];
     for (let day = 1; day <= duration; day++) {
         const dayPlan = [];
         interests.forEach(interest => {
             const availableAttractions = attractions[interest].filter(attr => !itinerary.flat().includes(attr));
             if (availableAttractions.length > 0) {
                 const attraction = availableAttractions[Math.floor(Math.random() * availableAttractions.length)];
                 dayPlan.push(attraction);
             }
         });
         itinerary.push({ day, activities: dayPlan });
     }

     displayItinerary(itinerary);
 }

 function displayItinerary(itinerary) {
     const resultDiv = document.getElementById('itineraryResult');
     let html = '<h4 class="mb-4">Your Personalized Itinerary</h4>';
     itinerary.forEach(day => {
         html += `<div class="card mb-3">
                     <div class="card-header bg-primary text-white">
                         <h5 class="mb-0">Day ${day.day}</h5>
                     </div>
                     <ul class="list-group list-group-flush">`;
         day.activities.forEach(activity => {
             html += `<li class="list-group-item">${activity}</li>`;
         });
         html += `</ul></div>`;
     });
     resultDiv.innerHTML = html;
 }

 // Travel Updates
 function fetchTravelUpdates() {
     const updates = [
         { title: 'Metro Line 1 Disruption', content: 'Delays expected due to maintenance work.', icon: 'fa-train' },
         { title: 'New Exhibition at Grand Palais', content: 'Impressionist masterpieces on display from June 1st.', icon: 'fa-palette' },
         { title: 'Eiffel Tower Special Hours', content: 'Extended evening hours for summer season starting next week.', icon: 'fa-monument' }
     ];
     displayTravelUpdates(updates);
 }

 function displayTravelUpdates(updates) {
     const updatesDiv = document.getElementById('travelUpdates');
     let html = '<ul class="list-group">';
     updates.forEach(update => {
         html += `<li class="list-group-item">
                     <i class="fas ${update.icon} me-2"></i>
                     <strong>${update.title}</strong>: ${update.content}
                 </li>`;
     });
     html += '</ul>';
     updatesDiv.innerHTML = html;
 }

 // Paris Weather
 function fetchParisWeather() {
     // Simulated weather data (replace with actual API call in production)
     const weatherData = {
         temp: 22,
         humidity: 65,
         windSpeed: 3.5,
         description: 'Partly cloudy',
         icon: '02d'
     };
     displayWeather(weatherData);
 }


 // Call functions to fetch data
 fetchTravelUpdates();
 fetchParisWeather();

 // Add smooth scrolling for anchor links
 document.querySelectorAll('a[href^="#"]').forEach(anchor => {
     anchor.addEventListener('click', function (e) {
         e.preventDefault();
         document.querySelector(this.getAttribute('href')).scrollIntoView({
             behavior: 'smooth'
         });
     });
 });

 // Add a parallax effect to the header
 window.addEventListener('scroll', function() {
     const parallax = document.querySelector('.parallax-bg');
     let scrollPosition = window.pageYOffset;
     parallax.style.transform = 'translateY(' + scrollPosition * 0.5 + 'px)';
 });

 // Add a "Back to Top" button
 const backToTopButton = document.createElement('button');
 backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
 backToTopButton.classList.add('btn', 'btn-primary', 'back-to-top');
 document.body.appendChild(backToTopButton);

 window.addEventListener('scroll', () => {
     if (window.pageYOffset > 300) {
         backToTopButton.style.display = 'block';
     } else {
         backToTopButton.style.display = 'none';
     }
 });

 backToTopButton.addEventListener('click', () => {
     window.scrollTo({ top: 0, behavior: 'smooth' });
 });

 // Add a language switcher
 const languageSwitcher = document.createElement('div');
 languageSwitcher.classList.add('language-switcher');
 languageSwitcher.innerHTML = `
     <select class="form-select form-select-sm">
         <option value="en">English</option>
         <option value="fr">Français</option>
         <option value="es">Español</option>
     </select>
 `;
 document.body.appendChild(languageSwitcher);

 languageSwitcher.querySelector('select').addEventListener('change', (e) => {
     const lang = e.target.value;
     // In a real application, you would implement language switching logic here
     console.log(`Language switched to ${lang}`);
 });

 // Add a simple currency converter
 const currencyConverter = document.createElement('div');
 currencyConverter.classList.add('currency-converter', 'card', 'mt-4');
 currencyConverter.innerHTML = `
     <div class="card-body">
         <h5 class="card-title">Currency Converter</h5>
         <div class="input-group mb-3">
             <input type="number" class="form-control" id="amount" placeholder="Amount" value="1">
             <select class="form-select" id="fromCurrency">
                 <option value="USD">USD</option>
                 <option value="EUR" selected>EUR</option>
                 <option value="GBP">GBP</option>
             </select>
         </div>
         <div class="input-group mb-3">
             <input type="number" class="form-control" id="result" readonly>
             <select class="form-select" id="toCurrency">
                 <option value="USD" selected>USD</option>
                 <option value="EUR">EUR</option>
                 <option value="GBP">GBP</option>
             </select>
         </div>
         <button class="btn btn-primary" id="convertBtn">Convert</button>
     </div>
 `;
 document.querySelector('#destinations .container').appendChild(currencyConverter);

 document.getElementById('convertBtn').addEventListener('click', () => {
     const amount = document.getElementById('amount').value;
     const fromCurrency = document.getElementById('fromCurrency').value;
     const toCurrency = document.getElementById('toCurrency').value;

     // In a real application, you would use an API to get current exchange rates
     const exchangeRates = {
         USD: { EUR: 0.84, GBP: 0.72 },
         EUR: { USD: 1.19, GBP: 0.86 },
         GBP: { USD: 1.39, EUR: 1.16 }
     };

     let result;
     if (fromCurrency === toCurrency) {
         result = amount;
     } else if (fromCurrency === 'USD') {
         result = amount * exchangeRates.USD[toCurrency];
     } else if (toCurrency === 'USD') {
         result = amount / exchangeRates.USD[fromCurrency];
     } else {
         result = amount / exchangeRates.USD[fromCurrency] * exchangeRates.USD[toCurrency];
     }

     document.getElementById('result').value = result.toFixed(2);
 });

 // Add a simple photo gallery
 const photoGallery = document.createElement('div');
 photoGallery.classList.add('photo-gallery', 'mt-5');
 photoGallery.innerHTML = `
     <h3 class="text-center mb-4">Paris Photo Gallery</h3>
     <div class="row" id="galleryRow"></div>
 `;
 document.querySelector('#destinations .container').appendChild(photoGallery);

 const galleryImages = [
     { src: '/api/placeholder/400/300', alt: 'Eiffel Tower' },
     { src: '/api/placeholder/400/300', alt: 'Louvre Museum' },
     { src: '/api/placeholder/400/300', alt: 'Notre-Dame Cathedral' },
     { src: '/api/placeholder/400/300', alt: 'Arc de Triomphe' },
     { src: '/api/placeholder/400/300', alt: 'Sacré-Cœur' },
     { src: '/api/placeholder/400/300', alt: 'Champs-Élysées' }
 ];

 const galleryRow = document.getElementById('galleryRow');
 galleryImages.forEach(image => {
     const col = document.createElement('div');
     col.classList.add('col-md-4', 'mb-4');
     col.innerHTML = `
         <img src="${image.src}" alt="${image.alt}" class="img-fluid rounded">
         <p class="text-center mt-2">${image.alt}</p>
     `;
     galleryRow.appendChild(col);
 });

 // Add a simple review system
 const reviewSystem = document.createElement('div');
 reviewSystem.classList.add('review-system', 'mt-5');
 reviewSystem.innerHTML = `
     <h3 class="text-center mb-4">Visitor Reviews</h3>
     <div id="reviewList" class="mb-4"></div>
     <form id="reviewForm">
         <div class="mb-3">
             <label for="reviewName" class="form-label">Name</label>
             <input type="text" class="form-control" id="reviewName" required>
         </div>
         <div class="mb-3">
             <label for="reviewText" class="form-label">Review</label>
             <textarea class="form-control" id="reviewText" rows="3" required></textarea>
         </div>
         <div class="mb-3">
             <label for="reviewRating" class="form-label">Rating</label>
             <select class="form-select" id="reviewRating" required>
                 <option value="5">5 Stars</option>
                 <option value="4">4 Stars</option>
                 <option value="3">3 Stars</option>
                 <option value="2">2 Stars</option>
                 <option value="1">1 Star</option>
             </select>
         </div>
         <button type="submit" class="btn btn-primary">Submit Review</button>
     </form>
 `;
 document.querySelector('#destinations .container').appendChild(reviewSystem);

 const reviews = [
     { name: 'John Doe', text: 'Paris is absolutely beautiful! The Eiffel Tower at night is breathtaking.', rating: 5 },
     { name: 'Jane Smith', text: 'Loved the museums and the food. Will definitely come back!', rating: 4 }
 ];

 function displayReviews() {
     const reviewList = document.getElementById('reviewList');
     reviewList.innerHTML = '';
     reviews.forEach(review => {
         const reviewElement = document.createElement('div');
         reviewElement.classList.add('card', 'mb-3');
         reviewElement.innerHTML = `
             <div class="card-body">
                 <h5 class="card-title">${review.name}</h5>
                 <p class="card-text">${review.text}</p>
                 <p class="card-text">
                     ${'<i class="fas fa-star text-warning"></i>'.repeat(review.rating)}
                     ${'<i class="far fa-star text-warning"></i>'.repeat(5 - review.rating)}
                 </p>
             </div>
         `;
         reviewList.appendChild(reviewElement);
     });
 }

 displayReviews();

 document.getElementById('reviewForm').addEventListener('submit', (e) => {
     e.preventDefault();
     const name = document.getElementById('reviewName').value;
     const text = document.getElementById('reviewText').value;
     const rating = parseInt(document.getElementById('reviewRating').value);
     reviews.unshift({ name, text, rating });
     displayReviews();
     e.target.reset();
 });