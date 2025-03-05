// Initialize AOS
AOS.init({
    duration: 1000,
    once: true
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
        document.querySelector('.navbar').classList.add('navbar-scrolled');
    } else {
        document.querySelector('.navbar').classList.remove('navbar-scrolled');
    }
});

// Landmark data
const landmarks = [
    {
        title: "Statue of Liberty",
        description: "The Statue of Liberty, a colossal neoclassical sculpture on Liberty Island in New York Harbor, was a gift from the people of France to the United States.",
        subtitle: "Symbol of Freedom and Democracy",
        image: "https://i.postimg.cc/0jDpKtxn/Statue-of-Liberty.jpg",
        position: [40.6892, -74.0445],
        facts: [
            { icon: "fas fa-ruler-vertical", text: "Height: 151 feet (46 meters)" },
            { icon: "far fa-calendar-alt", text: "Dedicated: October 28, 1886" },
            { icon: "fas fa-users", text: "Annual Visitors: 4.5 million" },
            { icon: "fas fa-flag", text: "Gift from France to the USA" }
        ],
        visitorInfo: [
            { icon: "fas fa-ship", text: "Ferry required for access" },
            { icon: "fas fa-ticket-alt", text: "Crown access requires reservation" },
            { icon: "fas fa-camera", text: "Panoramic views of NYC skyline" }
        ]
    },
    {
        title: "Empire State Building",
        description: "The Empire State Building is a 102-story Art Deco skyscraper in Midtown Manhattan. It was the world's tallest building for nearly 40 years.",
        subtitle: "Iconic Art Deco Skyscraper",
        image: "https://i.postimg.cc/MZC5ZBxt/Empire-State-Building.jpg",
        position: [40.7484, -73.9857],
        facts: [
            { icon: "fas fa-ruler-vertical", text: "Height: 1,454 feet (443.2 meters)" },
            { icon: "far fa-calendar-alt", text: "Completed: 1931" },
            { icon: "fas fa-users", text: "Annual Visitors: 4 million" },
            { icon: "fas fa-award", text: "National Historic Landmark" }
        ],
        visitorInfo: [
            { icon: "far fa-clock", text: "Open daily: 8 AM - 2 AM" },
            { icon: "fas fa-binoculars", text: "86th and 102nd floor observatories" },
            { icon: "fas fa-camera", text: "360-degree views of NYC" }
        ]
    },
    {
        title: "Central Park",
        description: "Central Park is an urban park in New York City located between the Upper West and Upper East Sides of Manhattan. It is the most visited urban park in the United States.",
        subtitle: "Urban Oasis in Manhattan",
        image: "https://i.postimg.cc/65mrPNPg/Central-Park.jpg",
        position: [40.7829, -73.9654],
        facts: [
            { icon: "fas fa-tree", text: "Size: 843 acres (341 hectares)" },
            { icon: "far fa-calendar-alt", text: "Established: 1857" },
            { icon: "fas fa-award", text: "National Historic Landmark" },
            { icon: "fas fa-theater-masks", text: "Home to many cultural events" }
        ],
        visitorInfo: [
            { icon: "fas fa-water", text: "Boating on The Lake" },
            { icon: "fas fa-landmark", text: "Metropolitan Museum of Art" },
            { icon: "fas fa-paw", text: "Central Park Zoo" },
            { icon: "fas fa-theater-masks", text: "Delacorte Theater (Shakespeare in the Park)" }
        ]
    }
];

// Initialize map
const map = L.map('map').setView([40.7128, -74.0060], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Add markers and populate landmark list
const landmarkList = document.getElementById('landmarkList');
landmarks.forEach((landmark, index) => {
    // Add marker
    const marker = L.marker(landmark.position).addTo(map);
    marker.bindPopup(`<b>${landmark.title}</b><br>${landmark.description}`);

    // Add to landmark list
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item';
    listItem.innerHTML = `
        <h6>${landmark.title}</h6>
        <p class="mb-1">${landmark.description}</p>
        <button class="btn btn-sm btn-outline-primary me-2" onclick="focusLandmark(${index})">Show on Map</button>
        <button class="btn btn-sm btn-custom" data-bs-toggle="modal" data-bs-target="#landmarkModal" onclick="showLandmarkDetails(${index})">Learn More</button>
    `;
    landmarkList.appendChild(listItem);
});

function focusLandmark(index) {
    const landmark = landmarks[index];
    map.setView(landmark.position, 15);
}

function showLandmarkDetails(index) {
    const landmark = landmarks[index];
    document.getElementById('modalLandmarkTitle').textContent = landmark.title;
    document.getElementById('modalLandmarkImage').src = landmark.image;
    document.getElementById('modalLandmarkImage').alt = landmark.title;
    document.getElementById('modalLandmarkSubtitle').textContent = landmark.subtitle;
    document.getElementById('modalLandmarkDescription').textContent = landmark.description;

    const factsList = document.getElementById('modalLandmarkFacts');
    factsList.innerHTML = '';
    landmark.facts.forEach(fact => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="${fact.icon} me-2 text-primary"></i> ${fact.text}`;
        factsList.appendChild(li);
    });

    const visitorInfoList = document.getElementById('modalLandmarkVisitorInfo');
    visitorInfoList.innerHTML = '';
    landmark.visitorInfo.forEach(info => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="${info.icon} me-2 text-primary"></i> ${info.text}`;
        visitorInfoList.appendChild(li);
    });
}

// Weather Widget
async function fetchWeather() {
    const apiKey = 'e597f0454b011ac1ad8a410141ca2ff6';
    const city = 'New York';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

function displayWeather(data) {
    const weatherWidget = document.getElementById('weather-widget');
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;

    weatherWidget.innerHTML = `
        <h3 class="mb-3">Current Weather in New York</h3>
        <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p class="h2 mb-0">${temp}°C</p>
        <p>${description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
}

// Fetch weather data on page load
fetchWeather();

// Visitor Statistics Chart
function createVisitorChart() {
    const ctx = document.getElementById('visitorStats').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Monthly Visitors (in millions)',
                data: [3.2, 3.5, 4.1, 4.8, 5.5, 6.2, 6.8, 6.5, 5.9, 5.2, 4.5, 3.8],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Visitors (millions)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'New York City Monthly Visitor Statistics',
                    font: {
                        size: 18
                    }
                }
            }
        }
    });
}

// Create visitor chart on page load
createVisitorChart();

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form submission
document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Here you would typically send the form data to a server
    // For demonstration purposes, we'll just log it to the console
    console.log('Form submitted');
    console.log('Name:', document.getElementById('name').value);
    console.log('Email:', document.getElementById('email').value);
    console.log('Message:', document.getElementById('message').value);

    // Clear form fields
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('message').value = '';

    // Show a success message (you might want to use a modal or toast for this)
    alert('Thank you for your message. We will get back to you soon!');
});

// Function to book a tour (placeholder)
function bookTour() {
    alert('Thank you for your interest! Our booking system is currently under maintenance. Please check back later or contact us directly to book a tour.');
}

// Initialize all tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
});