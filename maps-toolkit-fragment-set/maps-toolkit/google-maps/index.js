const {
    accessToken,
    markersJSON,
    latitude = 37.7749,
    longitude = -122.4194,
    showMarker = true,
    showUserLocation = false,
    googleMapsScriptURL = "https://maps.googleapis.com/maps/api/js",
    zoom = 13,
} = configuration;

const safeJSONParse = (value, defaultValue) => {
    try {
        return JSON.parse(value);
    } catch {
        return defaultValue;
    }
};

const center = {
    lat: Number.parseFloat(latitude),
    lng: Number.parseFloat(longitude),
};

const defaultMarkers = safeJSONParse(markersJSON, []);

const pinnedMarkers = [];

const waitForGoogle = () =>
    new Promise((resolve, reject) => {
        let maxRetries = 10;
        const interval = setInterval(() => {
            if (window?.google?.maps) {
                clearInterval(interval);
                resolve(window.google.maps);
            } else if (--maxRetries === 0) {
                clearInterval(interval);
                reject(new Error("Google Maps API failed to load."));
            }
        }, 300);
    });

const googleMapsURL = new URL(googleMapsScriptURL);

if (accessToken) {
    googleMapsURL.searchParams.set("key", accessToken);
}

const googleMapsScript = document.createElement("script");

googleMapsScript.src = googleMapsURL.toString();

googleMapsScript.async = true;
googleMapsScript.defer = true;

googleMapsScript.onload = async () => {
    try {
        await waitForGoogle();

        const infoWindow = new google.maps.InfoWindow();

        const map = new google.maps.Map(
            document.getElementById("maps-toolkit-google-maps"),
            {
                center,
                zoom: Number.parseInt(zoom, 10),
            }
        );

        function addMarker({ fly, latitude, longitude, title }) {
            const position = {
                lat: Number.parseFloat(latitude),
                lng: Number.parseFloat(longitude),
            };

            const marker = new google.maps.Marker({
                position,
                map,
                title,
            });

            marker.addListener("click", () => {
                const content = `
                <div>
                  <h6>${title}</h6>
                  <strong>Lat:</strong> ${latitude}, <strong>Lng:</strong> ${longitude}
                </div>
              `;

                infoWindow.setContent(content);

                infoWindow.open(map, marker);
            });

            // Close InfoWindow when clicking on the map
            map.addListener("click", () => {
                infoWindow.close();
            });

            if (fly) {
                map.panTo(position);
            }

            pinnedMarkers.push(marker);
        }

        Liferay.on("google_maps:add_marker", (event) => {
            event.details.flat().forEach(addMarker);
        });

        Liferay.on("google_maps:fit_to_all_markers", () => {
            const bounds = new google.maps.LatLngBounds();

            for (const pinnedMarker of pinnedMarkers) {
                bounds.extend(pinnedMarker.getPosition());
            }

            map.fitBounds(bounds);
        });

        if (showMarker) {
            for (const defaultMarker of defaultMarkers) {
                addMarker(defaultMarker);
            }
        }

        if (showUserLocation && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(({ coords }) => {
                addMarker({
                    icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    fly: true,
                    latitude: Number.parseFloat(coords.latitude),
                    longitude: Number.parseFloat(coords.longitude),
                    title: "My Location",
                });
            });
        }
    } catch (error) {
        console.error(error);
    }
};

document.body.appendChild(googleMapsScript);
