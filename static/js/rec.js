let map, service, directionsRenderer;
        const markers = [];
        let userMarker;
        let searchTimeout;

        function initMap() {
            map = new google.maps.Map(document.getElementById("map"), {
                zoom: 12,
                mapTypeControl: false,
                fullscreenControl: true,
                streetViewControl: false,
                styles: [
                    {
                        featureType: "all",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#64748b" }]
                    },
                    {
                        featureType: "landscape",
                        elementType: "geometry.fill",
                        stylers: [{ color: "#f8fafc" }]
                    },
                    {
                        featureType: "water",
                        elementType: "geometry.fill",
                        stylers: [{ color: "#bfdbfe" }]
                    },
                    {
                        featureType: "poi",
                        elementType: "geometry.fill",
                        stylers: [{ color: "#e2e8f0" }]
                    }
                ]
            });

            directionsRenderer = new google.maps.DirectionsRenderer({
                suppressMarkers: true,
                polylineOptions: {
                    strokeColor: "#2563eb",
                    strokeWeight: 4,
                    strokeOpacity: 0.8
                }
            });
            directionsRenderer.setMap(map);

            service = new google.maps.places.PlacesService(map);

            const input = document.getElementById('search-input');
            const autocomplete = new google.maps.places.Autocomplete(input, {
                types: ['(cities)'],
                fields: ['geometry', 'name']
            });
            
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.geometry) {
                    map.panTo(place.geometry.location);
                    map.setZoom(13);
                    showLoading();
                    searchNearbyPlaces(place.geometry.location);
                }
            });

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        map.setCenter(pos);
                        addUserMarker(pos);
                        showLoading();
                        searchNearbyPlaces(pos);
                    },
                    () => {
                        handleLocationError(true, map.getCenter());
                    }
                );
            }

            // Add event listeners for filters
            document.getElementById('type-select').addEventListener('change', () => {
                if (map.getCenter()) {
                    showLoading();
                    searchNearbyPlaces(map.getCenter());
                }
            });

            document.getElementById('rating-select').addEventListener('change', () => {
                if (map.getCenter()) {
                    showLoading();
                    searchNearbyPlaces(map.getCenter());
                }
            });
        }

        function showLoading() {
            document.getElementById('loading-spinner').style.display = 'block';
        }

        function hideLoading() {
            document.getElementById('loading-spinner').style.display = 'none';
        }

        function addUserMarker(position) {
            if (userMarker) {
                userMarker.setMap(null);
            }

            userMarker = new google.maps.Marker({
                position: position,
                map: map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#2563eb",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 2
                },
                title: "Your Location"
            });
        }

        function searchNearbyPlaces(location) {
            clearTimeout(searchTimeout);
            
            searchTimeout = setTimeout(() => {
                const type = document.getElementById('type-select').value;
                const minRating = parseFloat(document.getElementById('rating-select').value) || 0;

                const request = {
                    location: location,
                    radius: '2000',
                    type: type || ['tourist_attraction', 'restaurant', 'lodging', 'museum', 'park']
                };

                service.nearbySearch(request, (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        const filteredResults = results.filter(place => 
                            !minRating || (place.rating && place.rating >= minRating)
                        );

                        const resultsContainer = document.getElementById('search-results');
                        resultsContainer.innerHTML = '';

                        if (filteredResults.length === 0) {
                            resultsContainer.innerHTML = `
                                <div class="alert alert-info">
                                    <i class="fas fa-info-circle me-2"></i>
                                    No places found matching your criteria. Try adjusting your filters.
                                </div>
                            `;
                            hideLoading();
                            return;
                        }

                        let loadedPlaces = 0;
                        const totalPlaces = Math.min(filteredResults.length, 10);

                        filteredResults.slice(0, 10).forEach(place => {
                            service.getDetails({ 
                                placeId: place.place_id,
                                fields: ['name', 'formatted_address', 'rating', 'photos', 'reviews', 'place_id', 'website', 'formatted_phone_number', 'opening_hours']
                            }, (placeDetails, detailsStatus) => {
                                loadedPlaces++;
                                if (detailsStatus === google.maps.places.PlacesServiceStatus.OK) {
                                    createPlaceCard(placeDetails, resultsContainer);
                                }
                                if (loadedPlaces === totalPlaces) {
                                    hideLoading();
                                }
                            });
                        });
                    } else {
                        hideLoading();
                        document.getElementById('search-results').innerHTML = `
                            <div class="alert alert-danger">
                                <i class="fas fa-exclamation-circle me-2"></i>
                                Error loading places. Please try again.
                            </div>
                        `;
                    }
                });
            }, 300);
        }

        function createPlaceCard(place, container) {
            const card = document.createElement('div');
            card.className = 'place-card';
            
            const photoUrl = place.photos && place.photos[0] 
                ? place.photos[0].getUrl({ maxWidth: 400, maxHeight: 300 }) 
                : '/api/placeholder/400/300';
            
            const openStatus = place.opening_hours 
                ? (place.opening_hours.isOpen() 
                    ? '<span class="badge bg-success">Open</span>' 
                    : '<span class="badge bg-danger">Closed</span>')
                : '';

            const stars = '★'.repeat(Math.round(place.rating || 0)) + '☆'.repeat(5 - Math.round(place.rating || 0));

            card.innerHTML = `
                <div class="card border-0">
                    <div class="position-relative">
                        <img src="${photoUrl}" class="place-image" alt="${place.name}">
                        <div class="rating-badge">
                            <i class="fas fa-star text-warning"></i> ${place.rating?.toFixed(1) || 'N/A'}
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0">${place.name}</h5>
                            ${openStatus}
                        </div>
                        <p class="card-text small text-muted mb-2">
                            <i class="fas fa-map-marker-alt me-1"></i>${place.formatted_address || ''}
                        </p>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div class="text-warning small">${stars}</div>
                            <button class="btn btn-primary btn-sm" onclick="addToRoute('${place.place_id}')">
                                <i class="fas fa-plus me-1"></i>Add to Route
                            </button>
                        </div>
                        
                        ${place.reviews ? `
                            <div class="review-section">
                                <h6 class="mb-3">
                                    <i class="fas fa-comments me-2"></i>Recent Reviews
                                </h6>
                                ${place.reviews.slice(0, 3).map(review => `
                                    <div class="d-flex mb-3">
                                        <img src="${review.profile_photo_url || '/api/placeholder/40/40'}" 
                                             class="user-avatar me-2" 
                                             alt="${review.author_name}">
                                        <div>
                                            <div class="d-flex justify-content-between align-items-center">
                                                <div class="fw-bold">${review.author_name}</div>
                                                <div class="text-warning small">
                                                    ${'★'.repeat(Math.round(review.rating))}
                                                </div>
                                            </div>
                                            <div class="small text-muted">${review.relative_time_description}</div>
                                            <div class="small mt-1">${review.text.slice(0, 150)}${review.text.length > 150 ? '...' : ''}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="small text-muted">No reviews available</p>'}
                    </div>
                </div>
            `;

            container.appendChild(card);
        }

        function addToRoute(placeId) {
            service.getDetails({ placeId: placeId }, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    const marker = new google.maps.Marker({
                        position: place.geometry.location,
                        map: map,
                        title: place.name,
                        animation: google.maps.Animation.DROP
                    });
                    
                    markers.push({
                        marker: marker,
                        place: place
                    });

                    const toast = document.createElement('div');
                    toast.className = 'toast position-fixed bottom-0 end-0 m-3';
                    toast.innerHTML = `
                        <div class="toast-header">
                            <i class="fas fa-check-circle text-success me-2"></i>
                            <strong class="me-auto">Added to Route</strong>
                            <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                        </div>
                        <div class="toast-body">
                            ${place.name} has been added to your route.
                        </div>
                    `;
                    document.body.appendChild(toast);
                    const bsToast = new bootstrap.Toast(toast);
                    bsToast.show();
                    
                    toast.addEventListener('hidden.bs.toast', () => {
                        toast.remove();
                    });

                    if (markers.length >= 2) {
                        calculateRoute();
                    }
                }
            });
        }

        function calculateRoute() {
            if (markers.length < 2) return;

            const directionsService = new google.maps.DirectionsService();
            const travelMode = document.getElementById('travel-mode-select').value;

            const waypoints = markers.slice(1, -1).map(m => ({
                location: m.marker.getPosition(),
                stopover: true
            }));

            const request = {
                origin: markers[0].marker.getPosition(),
                destination: markers[markers.length - 1].marker.getPosition(),
                waypoints: waypoints,
                travelMode: google.maps.TravelMode[travelMode],
                optimizeWaypoints: true
            };

            directionsService.route(request, (result, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    directionsRenderer.setDirections(result);
                }
            });
        }

        function calculateShortestPath() {
            if (markers.length < 2) {
                const toast = document.createElement('div');
                toast.className = 'toast position-fixed bottom-0 end-0 m-3';
                toast.innerHTML = `
                    <div class="toast-header bg-warning text-dark">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        <strong class="me-auto">Not Enough Locations</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                    </div>
                    <div class="toast-body">
                        Please add at least 2 locations to calculate a route.
                    </div>
                `;
                document.body.appendChild(toast);
                const bsToast = new bootstrap.Toast(toast);
                bsToast.show();
                
                toast.addEventListener('hidden.bs.toast', () => {
                    toast.remove();
                });
                return;
            }

            calculateRoute();
        }

        function clearMarkers() {
            markers.forEach(m => m.marker.setMap(null));
            markers.length = 0;
            directionsRenderer.setDirections({ routes: [] });
        }

        function handleLocationError(browserHasGeolocation, pos) {
            const toast = document.createElement('div');
            toast.className = 'toast position-fixed bottom-0 end-0 m-3';
            toast.innerHTML = `
                <div class="toast-header bg-danger text-white">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    <strong class="me-auto">Location Error</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${browserHasGeolocation 
                        ? 'Error: The Geolocation service failed.' 
                        : 'Error: Your browser doesn\'t support geolocation.'}
                </div>
            `;
            document.body.appendChild(toast);
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
            
            toast.addEventListener('hidden.bs.toast', () => {
                toast.remove();
            });
        }

        window.addEventListener('load', initMap);