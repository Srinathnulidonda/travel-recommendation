// Use strict mode for better error catching and performance
'use strict';

// Wrap all code in an Immediately Invoked Function Expression (IIFE) to avoid polluting the global scope
(() => {
  // Constants
  const WEATHER_API_KEY = 'e597f0454b011ac1ad8a410141ca2ff6';
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=Rome,IT&units=metric&appid=${WEATHER_API_KEY}`;
  const EXCHANGE_RATES = {
    USD: 1,
    EUR: 0.84,
    GBP: 0.72
  };
  const ROME_COORDINATES = { lat: 41.9028, lng: 12.4964 };
  const DESTINATIONS = [
    { position: { lat: 41.8902, lng: 12.4922 }, title: 'Colosseum' },
    { position: { lat: 41.9022, lng: 12.4539 }, title: 'Vatican City' },
    { position: { lat: 41.9009, lng: 12.4833 }, title: 'Trevi Fountain' },
    { position: { lat: 41.8986, lng: 12.4769 }, title: 'Pantheon' },
    { position: { lat: 41.8925, lng: 12.4853 }, title: 'Roman Forum' }
  ];

  // Utility functions
  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);

  // Initialize AOS
  const initAOS = () => {
    AOS.init({
      duration: 1000,
      once: true
    });
  };

  // Navbar color change on scroll
  const initNavbarScroll = () => {
    const navbar = $('.navbar');
    const toggleNavbarColor = () => {
      navbar.classList.toggle('navbar-scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', toggleNavbarColor);
  };

  // Weather API
  const fetchWeather = async () => {
    try {
      const response = await fetch(WEATHER_API_URL);
      if (!response.ok) throw new Error('Weather data fetch failed');
      const data = await response.json();
      const { temp } = data.main;
      const { description, icon } = data.weather[0];
      $('#weather-info').innerHTML = `
        <img src="http://openweathermap.org/img/w/${icon}.png" alt="${description}">
        <p>${temp}°C - ${description}</p>
      `;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      $('#weather-info').innerHTML = 'Weather information unavailable';
    }
  };

  // Currency Converter
  const initCurrencyConverter = () => {
    const convertCurrency = () => {
      const amount = parseFloat($('#amount').value);
      const from = $('#from-currency').value;
      const to = $('#to-currency').value;
      
      if (isNaN(amount)) {
        $('#conversion-result').textContent = 'Please enter a valid amount';
        return;
      }
      
      const convertedAmount = (amount / EXCHANGE_RATES[from]) * EXCHANGE_RATES[to];
      $('#conversion-result').textContent = `${amount} ${from} = ${convertedAmount.toFixed(2)} ${to}`;
    };

    $('#convert-btn').addEventListener('click', convertCurrency);
  };

  // Google Maps
  let map, marker, infoWindow, directionsService, directionsRenderer;

  const initMap = () => {
    map = new google.maps.Map($('#map'), {
      zoom: 13,
      center: ROME_COORDINATES,
      styles: [
        // ... (map styles remain unchanged)
      ]
    });

    infoWindow = new google.maps.InfoWindow();
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    directionsRenderer.setPanel($('#directions-panel'));

    setupLocationButton();
    setupShowOnMapButtons();
    setupDirectionsForm();
    setupAutocomplete();
    setupMapErrorHandling();

    // Add markers for Rome and popular destinations
    addMarker(ROME_COORDINATES, 'Rome, Italy');
    DESTINATIONS.forEach(dest => addMarker(dest.position, dest.title));
  };

  const addMarker = (position, title) => {
    new google.maps.Marker({ position, map, title });
  };

  const setupLocationButton = () => {
    const locationButton = document.createElement("button");
    locationButton.textContent = "Find My Location";
    locationButton.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
    locationButton.addEventListener("click", findMyLocation);
  };

  const findMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          infoWindow.setPosition(pos);
          infoWindow.setContent("Your location");
          infoWindow.open(map);
          map.setCenter(pos);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      handleLocationError(false, infoWindow, map.getCenter());
    }
  };

  const setupShowOnMapButtons = () => {
    $$('.show-on-map').forEach(button => {
      button.addEventListener('click', (e) => {
        const item = e.target.closest('.list-group-item');
        const lat = parseFloat(item.dataset.lat);
        const lng = parseFloat(item.dataset.lng);
        const title = item.querySelector('h6').textContent;
        showLocationOnMap(lat, lng, title);
      });
    });
  };

  const setupDirectionsForm = () => {
    $('#directions-form').addEventListener('submit', (e) => {
      e.preventDefault();
      calculateAndDisplayRoute();
    });
  };

  const setupAutocomplete = () => {
    new google.maps.places.Autocomplete($('#start'));
    new google.maps.places.Autocomplete($('#end'));
  };

  const setupMapErrorHandling = () => {
    const errorMessageDiv = $('#error-message');
    google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
      errorMessageDiv.style.display = 'none';
    });
    google.maps.event.addListenerOnce(map, 'error', () => {
      errorMessageDiv.textContent = 'Error loading the map. Please check your API key and network connection.';
      errorMessageDiv.style.display = 'block';
    });
  };

  const showLocationOnMap = (lat, lng, title) => {
    const position = { lat, lng };
    map.setCenter(position);
    map.setZoom(15);

    if (marker) {
      marker.setMap(null);
    }

    marker = new google.maps.Marker({
      position: position,
      map: map,
      title: title
    });

    infoWindow.setContent(title);
    infoWindow.open(map, marker);
  };

  const calculateAndDisplayRoute = () => {
    const start = $('#start').value;
    const end = $('#end').value;
    const errorMessageDiv = $('#error-message');

    directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.WALKING,
      },
      (response, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(response);
          errorMessageDiv.style.display = 'none';
        } else {
          directionsRenderer.setDirections({ routes: [] });
          errorMessageDiv.textContent = getErrorMessage(status);
          errorMessageDiv.style.display = 'block';
        }
      }
    );
  };

  const getErrorMessage = (status) => {
    const errorMessages = {
      REQUEST_DENIED: 'Direction request was denied. Please check your API key and ensure it has the necessary permissions.',
      ZERO_RESULTS: 'No route could be found between the origin and destination.',
      MAX_WAYPOINTS_EXCEEDED: 'Too many waypoints were provided in the request.',
      INVALID_REQUEST: 'The request was invalid. Please check your inputs.',
      OVER_QUERY_LIMIT: 'The webpage has gone over its request quota.',
      UNKNOWN_ERROR: 'A directions request could not be processed due to a server error. Please try again.',
    };
    return errorMessages[status] || 'An unknown error occurred. Please try again.';
  };

  const handleLocationError = (browserHasGeolocation, infoWindow, pos) => {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
  };

  // Booking modal
  const initBookingModal = () => {
    const bookingModal = new bootstrap.Modal($('#booking-modal'));
    const bookingForm = $('#booking-form');
    const activityInput = $('#activity');

    $$('.book-activity').forEach(button => {
      button.addEventListener('click', () => {
        activityInput.value = button.getAttribute('data-activity');
        bookingModal.show();
      });
    });

    bookingForm.addEventListener('submit', e => {
      e.preventDefault();
      const formData = new FormData(bookingForm);
      const bookingData = Object.fromEntries(formData.entries());
      
      // Here you would typically send the booking data to a server
      console.log('Booking submitted:', bookingData);
      
      alert('Booking submitted successfully!');
      bookingModal.hide();
      bookingForm.reset();
    });
  };

  // Smooth scrolling
  const initSmoothScrolling = () => {
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        $(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
  };

  // Newsletter subscription
  const initNewsletter = () => {
    $('#newsletter-form').addEventListener('submit', e => {
      e.preventDefault();
      const email = $('#newsletter-form input[type="email"]').value;
      
      // Here you would typically send the email to a server for subscription
      console.log('Newsletter subscription:', email);
      
      alert('Thank you for subscribing to our newsletter!');
      e.target.reset();
    });
  };

  // Virtual Tour
  const initVirtualTour = () => {
    const virtualTourModal = $('#virtual-tour-modal');
    const virtualTourContainer = $('#virtual-tour-container');
    let viewer;

    virtualTourModal.addEventListener('show.bs.modal', event => {
      const button = event.relatedTarget;
      const destination = button.getAttribute('data-destination');
      $('.modal-title', virtualTourModal).textContent = `Virtual Tour - ${destination.charAt(0).toUpperCase() + destination.slice(1)}`;

      virtualTourContainer.innerHTML = '';

      const panoramaUrl = `https://example.com/${destination}-panorama.jpg`;
      const panorama = new PANOLENS.ImagePanorama(panoramaUrl);
      viewer = new PANOLENS.Viewer({
        container: virtualTourContainer,
        autoRotate: true,
        autoRotateSpeed: 0.3,
        controlBar: false,
      });
      viewer.add(panorama);
    });

    virtualTourModal.addEventListener('hidden.bs.modal', () => {
      if (viewer) {
        viewer.dispose();
        viewer = null;
      }
    });
  };

  // Lazy loading images
  const initLazyLoading = () => {
    if ('IntersectionObserver' in window) {
      const lazyImageObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const lazyImage = entry.target;
            lazyImage.src = lazyImage.dataset.src;
            lazyImage.classList.remove('lazy');
            lazyImageObserver.unobserve(lazyImage);
          }
        });
      });

      $$('img.lazy').forEach(lazyImage => lazyImageObserver.observe(lazyImage));
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      const lazyLoad = () => {
        const lazyImages = $$('img.lazy');
        const scrollTop = window.pageYOffset;
        lazyImages.forEach(img => {
          if (img.offsetTop < (window.innerHeight + scrollTop)) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
          }
        });
        if (lazyImages.length === 0) { 
          document.removeEventListener('scroll', lazyLoad);
          window.removeEventListener('resize', lazyLoad);
          window.removeEventListener('orientationChange', lazyLoad);
        }
      };

      document.addEventListener('scroll', lazyLoad);
      window.addEventListener('resize', lazyLoad);
      window.addEventListener('orientationChange', lazyLoad);
    }
  };

  // Activity booking and filtering
  const initActivityBooking = () => {
    $$('.book-activity').forEach(button => {
      button.addEventListener('click', function() {
        const activity = this.getAttribute('data-activity');
        alert(`Thank you for booking the ${activity}! We'll contact you shortly with more details.`);
      });
    });

    const activityCards = $$('.activity-grid .card');
    $$('.filter-btn').forEach(button => {
      button.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');
        
        activityCards.forEach(card => {
          card.style.display = (filter === 'all' || card.getAttribute('data-category') === filter) ? 'block' : 'none';
        });

        $$('.filter-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
      });
    });
  };

  // Error handling
  const handleErrors = (error, context) => {
    console.error(`Error in ${context}:`, error);
    // You could add more sophisticated error handling here, such as displaying a user-friendly error message
  };

  // Initialize all functions when the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", function() {
    const navbar = document.querySelector('.custom-navbar');
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  });
  document.addEventListener('DOMContentLoaded', () => {
    try {
      initAOS();
      initNavbarScroll();
      fetchWeather().catch(error => handleErrors(error, 'weather fetch'));
      initCurrencyConverter();
      initMap();
      initBookingModal();
      initSmoothScrolling();
      initNewsletter();
      initVirtualTour();
      initLazyLoading();
      initActivityBooking();
    } catch (error) {
      handleErrors(error, 'initialization');
    }
  });
})();