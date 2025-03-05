const destinationUrls = {
    'Paris': '/paris',
    'New York': '/newyork',
    'Tokyo': 'https://www.example.com/destinations/tokyo',
    'Rome': '/rome',
    'Sydney': 'https://www.example.com/destinations/sydney',
    'Rio de Janeiro': 'https://www.example.com/destinations/rio-de-janeiro',
    'London': 'https://www.example.com/destinations/london',
    'Barcelona': 'https://www.example.com/destinations/barcelona',
    'Dubai': 'https://www.example.com/destinations/dubai'
};

flatpickr("#dates, #trip-dates", {
    mode: "range",
    minDate: "today"
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
        document.querySelector('.navbar').classList.add('scrolled');
    } else {
        document.querySelector('.navbar').classList.remove('scrolled');
    }
});

function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'block';
}

function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}

function handleSearch() {
    let destination = document.getElementById('destination').value;
    let dates = document.getElementById('dates').value;
    let travelers = document.getElementById('travelers').value;

    showLoadingSpinner();

    // Simulating an API call
    setTimeout(() => {
        hideLoadingSpinner();
        console.log("Searching for", destination, dates, travelers);
        alert(`Search results for ${destination} are ready!`);
    }, 2000);
}

function nextStep() {
    let currentStep = document.querySelector('.wizard .step.active');
    let nextStep = currentStep.nextElementSibling;
    if (nextStep) {
        currentStep.classList.remove('active');
        nextStep.classList.add('active');
        if (nextStep.querySelector('h4').textContent.includes('Activities')) {
            loadActivities();
        }
    }
}

function prevStep() {
    let currentStep = document.querySelector('.wizard .step.active');
    let prevStep = currentStep.previousElementSibling;
    if (prevStep) {
        currentStep.classList.remove('active');
        prevStep.classList.add('active');
    }
}

function loadActivities() {
    const activities = [
        { id: 1, name: "City Tour", description: "Explore the city's landmarks", image: "static/images/city-tour.jpg" },
        { id: 2, name: "Museum Visit", description: "Discover local history and art", image: "static/images/museum.jpg" },
        { id: 3, name: "Outdoor Adventure", description: "Hiking and nature exploration", image: "static/images/outdoor.jpg" }
    ];

    const container = document.getElementById('activities-container');
    container.innerHTML = ''; // Clear existing content

    activities.forEach(activity => {
        const activityElement = document.createElement('div');
        activityElement.className = 'col-md-4 mb-3';
        activityElement.innerHTML = `
            <div class="card activity-card">
                <img src="${activity.image}" class="card-img-top" alt="${activity.name}">
                <div class="card-body">
                    <h5 class="card-title">${activity.name}</h5>
                    <p class="card-text">${activity.description}</p>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="${activity.id}" id="activity${activity.id}">
                        <label class="form-check-label" for="activity${activity.id}">
                            Add to itinerary
                        </label>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(activityElement);
    });
}

function submitTrip() {
    const destination = document.getElementById('wizard-destination').value;
    const dates = document.getElementById('trip-dates').value;
    const selectedActivities = Array.from(document.querySelectorAll('#activities-container input:checked'))
        .map(checkbox => checkbox.value);

    showLoadingSpinner();

    // Simulating an API call
    setTimeout(() => {
        hideLoadingSpinner();
        console.log("Submitting trip:", { destination, dates, activities: selectedActivities });
        alert('Trip submitted successfully!');
        resetWizard();
        updateItinerary({ destination, dates, activities: selectedActivities });
    }, 2000);
}

function resetWizard() {
    document.querySelectorAll('.wizard .step').forEach(step => step.classList.remove('active'));
    document.querySelector('.wizard .step').classList.add('active');
    document.getElementById('wizard-destination').value = '';
    document.getElementById('trip-dates').value = '';
}

function updateItinerary(tripDetails) {
    const itineraryContainer = document.getElementById('itinerary');
    itineraryContainer.innerHTML = `
        <h4>Your Trip to ${tripDetails.destination}</h4>
        <p><strong>Dates:</strong> ${tripDetails.dates}</p>
        <h5>Activities:</h5>
        <ul>
            ${tripDetails.activities.map(activity => `<li>${activity}</li>`).join('')}
        </ul>
    `;
    scrollToSection('route-display');
}

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 2
    });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function addRecommendation(destination, imageUrl, containerId) {
    const container = document.getElementById(containerId);
    const card = document.createElement('div');
    card.className = 'col-md-4 mb-4';
    card.innerHTML = `
        <div class="card">
            <img src="${imageUrl}" class="card-img-top" alt="${destination}">
            <div class="card-body">
                <h5 class="card-title">${destination}</h5>
                <p class="card-text">Explore the beauty of ${destination}.</p>
                <a href="${destinationUrls[destination] || '#'}" class="btn btn-primary" target="_blank">Learn More</a>
            </div>
        </div>
    `;
    container.appendChild(card);
}

function exploreDestination(destination) {
    const url = destinationUrls[destination];
    if (url) {
        window.open(url, '_blank');
    } else {
        console.log(`No URL found for ${destination}`);
        alert(`Sorry, we couldn't find more information about ${destination}. Please try another destination.`);
    }
}

function addTestimonial(name, location, text, isActive = false) {
    const carousel = document.querySelector('#testimonialCarousel .carousel-inner');
    const item = document.createElement('div');
    item.className = `carousel-item ${isActive ? 'active' : ''}`;
    item.innerHTML = `
        <div class="testimonial-card">
            <p class="testimonial-text">"${text}"</p>
            <p class="testimonial-author">- ${name}, ${location}</p>
        </div>
    `;
    carousel.appendChild(item);
}

document.addEventListener('DOMContentLoaded', function() {
    // Add recommendations
    addRecommendation('Paris', 'static/images/paris.jpg', 'recommendations-container-1');
    addRecommendation('New York', 'static/images/newyork.jpg', 'recommendations-container-1');
    addRecommendation('Tokyo', 'static/images/tokyo.jpg', 'recommendations-container-1');

    addRecommendation('Rome', 'static/images/rome.jpg', 'recommendations-container-2');
    addRecommendation('Sydney', 'static/images/sydney.jpg', 'recommendations-container-2');
    addRecommendation('Rio de Janeiro', 'static/images/rio.jpg', 'recommendations-container-2');

    addRecommendation('London', 'static/images/london.jpg', 'recommendations-container-3');
    addRecommendation('Barcelona', 'static/images/barcelona.jpg', 'recommendations-container-3');
    addRecommendation('Dubai', 'static/images/dubai.jpg', 'recommendations-container-3');

    // Add testimonials
    addTestimonial('John Doe', 'New York', 'Pro Travel Planner made our family vacation a breeze! Highly recommended!', true);
    addTestimonial('Jane Smith', 'London', 'I discovered hidden gems I never knew existed. Thanks, Pro Travel Planner!');
    addTestimonial('Mike Johnson', 'Sydney', 'The personalized itinerary was perfect. Every day was an adventure!');

    // Add event listeners for forms
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for your message. We will get back to you soon!');
        this.reset();
    });

    document.getElementById('newsletter-form').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for subscribing to our newsletter!');
        this.reset();
    });
});

// Social icons hover effect
document.addEventListener('DOMContentLoaded', function() {
    const socialIcons = document.querySelectorAll('.social-icon');
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) translateY(-5px)';
        });
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) translateY(0)';
        });
    });
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
                } else {
                    event.preventDefault()
                    // Here you would typically send the form data to a server
                    alert('Form submitted successfully!')
                    form.reset()
                }
                form.classList.add('was-validated')
            }, false)
        })
})()

// Initialize AOS (Animate on Scroll)
AOS.init({
    duration: 1000,
    once: true
});

// Weather widget functionality
document.addEventListener('DOMContentLoaded', function() {
    const weatherInfo = document.getElementById('weather-info');
    const weatherDetails = document.getElementById('weather-details');
    const refreshButton = document.getElementById('refresh-weather');
    const searchButton = document.getElementById('search-weather');
    const locationInput = document.getElementById('location-input');

    // Replace with your actual OpenWeatherMap API key
    const WEATHER_API_KEY = 'e597f0454b011ac1ad8a410141ca2ff6';

    function getWeatherByCoords(lat, lon) {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
        fetchWeather(url);
    }

    function getWeatherByCity(city) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${WEATHER_API_KEY}`;
        fetchWeather(url);
    }

    function fetchWeather(url) {
        weatherInfo.style.display = 'block';
        weatherDetails.style.display = 'none';
        weatherInfo.innerHTML = '<p>Fetching weather data...</p>';

        fetch(url)
            .then(response => response.json())
            .then(data => {
                updateWeatherUI(data);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                weatherInfo.innerHTML = '<p class="text-danger">Failed to fetch weather data. Please try again.</p>';
            });
    }

    function updateWeatherUI(data) {
        document.getElementById('location-name').textContent = data.name;
        document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
        document.getElementById('description').textContent = data.weather[0].description;
        document.getElementById('humidity').textContent = `${data.main.humidity}%`;
        document.getElementById('wind-speed').textContent = `${data.wind.speed} m/s`;
        document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
        
        const iconCode = data.weather[0].icon;
        document.getElementById('weather-icon').className = `wi wi-owm-${iconCode} display-1`;

        weatherInfo.style.display = 'none';
        weatherDetails.style.display = 'flex';
    }

    function getUserLocation() {
        weatherInfo.innerHTML = '<p>Detecting your location...</p>';
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    getWeatherByCoords(latitude, longitude);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    weatherInfo.innerHTML = '<p class="text-warning">Unable to detect location. Please use the search bar.</p>';
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            weatherInfo.innerHTML = '<p class="text-warning">Geolocation is not supported by your browser. Please use the search bar.</p>';
        }
    }

    refreshButton.addEventListener('click', getUserLocation);

    searchButton.addEventListener('click', () => {
        const city = locationInput.value.trim();
        if (city) {
            getWeatherByCity(city);
        } else {
            weatherInfo.innerHTML = '<p class="text-warning">Please enter a city name.</p>';
        }
    });

    locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });

    // Initial weather fetch - start with user's exact location
    getUserLocation();
});

function toggleFabMenu() {
    const items = document.querySelectorAll('.fab-item');
    const distances = [70, 140, 210]; // distances in pixels
    
    items.forEach((item, index) => {
        item.classList.toggle('active');
        if (item.classList.contains('active')) {
            item.style.transform = `translateY(-${distances[index]}px)`;
        } else {
            item.style.transform = 'translateY(0)';
        }
    });
}

function scrollToTop() {
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function toggleDarkMode() {
    // Toggle the 'dark-mode' class on the body
    document.body.classList.toggle('dark-mode');
    
    // Check if dark mode is now active
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // Save the user's preference to localStorage
    localStorage.setItem('darkMode', isDarkMode);
    
    // Apply the appropriate color scheme
    applyColorScheme(isDarkMode);
}

function applyColorScheme(isDarkMode) {
    if (isDarkMode) {
        document.body.style.setProperty('--background-color', '#1a1a1a');
        document.body.style.setProperty('--text-color', '#ffffff');
        document.body.style.setProperty('--link-color', '#3391ff');
    } else {
        document.body.style.setProperty('--background-color', '#ffffff');
        document.body.style.setProperty('--text-color', '#333333');
        document.body.style.setProperty('--link-color', '#0066cc');
    }
}

function loadDarkModePreference() {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
        const isDarkMode = savedMode === 'true';
        document.body.classList.toggle('dark-mode', isDarkMode);
        applyColorScheme(isDarkMode);
    }
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', loadDarkModePreference);

function shareContent() {
    if (navigator.share) {
        navigator.share({
            title: 'Check out this awesome page!',
            url: window.location.href
        }).then(() => {
            console.log('Thanks for sharing!');
        })
        .catch(console.error);
    } else {
        // Fallback for browsers that don't support Web Share API
        alert('Share this page: ' + window.location.href);
    }
}

// Show/hide FAB based on scroll position
window.addEventListener('scroll', function() {
    var fab = document.getElementById('fab-container');
    if (window.pageYOffset > 100) {
        fab.style.display = 'block';
    } else {
        fab.style.display = 'none';
    }
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
                } else {
                    event.preventDefault()
                    // Add your newsletter subscription logic here
                    alert('Thank you for subscribing to our newsletter!')
                    form.reset()
                }

                form.classList.add('was-validated')
            }, false)
        })
})()

// Intersection Observer for animation
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.footer .row > div').forEach(el => {
    observer.observe(el);
    el.style.animationPlayState = 'paused';
});

const apiKey = 'AIzaSyAPnLXTOd76DE4Ks3uHbj8AOEvRh30dzlo';

const destinationInput = document.getElementById('destination');
const recommendationsContainer = document.getElementById('destination-recommendations');

destinationInput.addEventListener('input', function() {
  const input = this.value.toLowerCase();
  fetchPlaceRecommendations(input);
});

async function fetchPlaceRecommendations(input) {
  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&types=geocode&key=${apiKey}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API request failed with status code ${response.status}: ${data.error_message}`);
    }

    displayRecommendations(data.predictions);
  } catch (error) {
    console.error('Error fetching place recommendations:', error);
    recommendationsContainer.innerHTML = '<div class="list-group-item">Error fetching recommendations. Please try again later.</div>';
  }
}

function displayRecommendations(places) {
  recommendationsContainer.innerHTML = '';

  if (places.length === 0) {
    const noResultsItem = document.createElement('a');
    noResultsItem.href = '#';
    noResultsItem.classList.add('list-group-item', 'list-group-item-action');
    noResultsItem.textContent = 'No results found';
    recommendationsContainer.appendChild(noResultsItem);
  } else {
    places.forEach(place => {
      const placeItem = document.createElement('a');
      placeItem.href = '#';
      placeItem.classList.add('list-group-item', 'list-group-item-action');
      placeItem.textContent = place.description;
      placeItem.addEventListener('click', () => {
        destinationInput.value = place.description;
        recommendationsContainer.innerHTML = '';
      });
      recommendationsContainer.appendChild(placeItem);
    });
  }
}

function displayRecommendations(destinations) {
  recommendationsContainer.innerHTML = '';
  if (destinations.length > 0 && destinationInput.value !== '') {
    destinations.forEach(dest => {
      const item = document.createElement('a');
      item.classList.add('list-group-item', 'list-group-item-action');
      item.textContent = dest;
      item.href = '#';
      item.addEventListener('click', function(e) {
        e.preventDefault();
        destinationInput.value = dest;
        recommendationsContainer.innerHTML = '';
      });
      recommendationsContainer.appendChild(item);
    });
  }
}

flatpickr("#dates", {
    mode: "range",
    dateFormat: "Y-m-d",
    minDate: "today",
    maxDate: new Date().fp_incr(365), // Allow booking up to 1 year in advance
    showMonths: 2,
    plugins: [
        new rangePlugin({ input: "#dates-end"}) // If you want two inputs for start and end dates
    ],
    onChange: function(selectedDates, dateStr, instance) {
        // You can add custom logic here when dates are selected
        console.log("Selected dates:", dateStr);
    }
});
document.getElementById('search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    handleSearch();
});

function handleSearch() {
    const destination = document.getElementById('destination').value;
    const dates = document.getElementById('dates').value;
    const travelers = document.getElementById('travelers').value;

    // Perform search logic here
    console.log('Searching for:', { destination, dates, travelers });
    // You would typically make an API call or update the page content here
}


