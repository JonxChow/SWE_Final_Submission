function loadScript() {
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAUC_Uiorh11l8AXMjAoHnT4Qdu-f7sdBE&callback=initMap';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

document.addEventListener("DOMContentLoaded", function() {
    if (window.location.pathname != "/map") {
        return;
    }
    loadScript();
});

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    lat1 = lat1 * Math.PI / 180;
    lon1 = lon1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    const distance = Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)) * R;
    return distance; // Returns distance in kilometers
}

// get random location near user
function getRandomLocationNearUser(lat, lng) {
    const maxDistanceInDegrees = 5 / 111;  // Approximate value for 5km in degrees
    return {
        lat: lat + (Math.random() * 2 - 1) * maxDistanceInDegrees,
        lng: lng + (Math.random() * 2 - 1) * maxDistanceInDegrees
    };
}

// Initialise map
function initMap() {
    // Check if geolocation is supported by the browser
    if (navigator.geolocation) {
        // Get user's current location
        navigator.geolocation.getCurrentPosition(function(position) {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            let serviceProviderLocation = getRandomLocationNearUser(userLat, userLng);

            // Calculate distance between user and service provider
            const map = new google.maps.Map(document.getElementById('map'), {
                zoom: 12,
                center: serviceProviderLocation,
            });

            // Add markers to the map
            const serviceProviderMarker = new google.maps.Marker({
                position: serviceProviderLocation,
                map: map,
                icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            });

            // Add markers to the map
            const customerMarker = new google.maps.Marker({
                position: { lat: userLat, lng: userLng },
                map: map,
                icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            });

            // Add a polyline to the map
            const directionsService = new google.maps.DirectionsService();
            let pathPolyline = new google.maps.Polyline({
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2,
                map: map
            });

            const request = {
                origin: serviceProviderLocation,
                destination: { lat: userLat, lng: userLng },
                travelMode: 'WALKING',
            };

            directionsService.route(request, function(response, status) {
                if (status === 'OK') {
                    let path = response.routes[0].overview_path;
                    pathPolyline.setPath(path);

                    let currentIndex = 0;
                    const interval = setInterval(() => {
                        if (currentIndex < path.length) {
                            serviceProviderLocation = {
                                lat: path[currentIndex].lat(),
                                lng: path[currentIndex].lng()
                            };
                            serviceProviderMarker.setPosition(serviceProviderLocation);
                            currentIndex++;

                            // Update the path to only show the remaining path
                            path = path.slice(currentIndex);
                            pathPolyline.setPath(path);
                        } else {
                            clearInterval(interval);
                            console.log("Service provider has reached the customer!");
                        }
                    }, 2000);
                } else {
                    console.error('Directions request failed due to ' + status);
                }
            });
        }, function(error) {
            console.error("Error retrieving user location:", error);
        });
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

