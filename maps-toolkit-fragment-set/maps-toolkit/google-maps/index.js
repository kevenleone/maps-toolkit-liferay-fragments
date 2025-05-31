function safeJSONParse(value, defaultValue) {
    try {
        return JSON.parse(value);
    } catch {
        return defaultValue;
    }
}

class GoogleMaps {
    constructor(configuration) {
        // Configuration properties
        this.accessToken = configuration.accessToken;
        this.defaultMarkers = safeJSONParse(configuration.markersJSON, []);
        this.googleMapsScriptURL =
            configuration.googleMapsScriptURL ||
            "https://maps.googleapis.com/maps/api/js";
        this.latitude = configuration.latitude || 37.7749;
        this.longitude = configuration.longitude || -122.4194;
        this.showMarker = configuration.showMarker ?? true;
        this.showUserLocation = configuration.showUserLocation ?? false;
        this.zoom = configuration.zoom || 13;

        // Instance properties
        this.center = {
            lat: Number.parseFloat(this.latitude),
            lng: Number.parseFloat(this.longitude),
        };
        this.infoWindow = null;
        this.map = null;
        this.pinnedMarkers = [];
    }

    addMarker({ fly, latitude, longitude, title, icon }) {
        const position = {
            lat: Number.parseFloat(latitude),
            lng: Number.parseFloat(longitude),
        };

        const marker = new google.maps.Marker({
            position,
            map: this.map,
            title,
            icon,
        });

        marker.addListener("click", () => {
            const content = `
                <div>
                    <h6>${title}</h6>
                    <strong>Lat:</strong> ${latitude}, <strong>Lng:</strong> ${longitude}
                </div>
            `;

            this.infoWindow.setContent(content);
            this.infoWindow.open(this.map, marker);
        });

        if (fly) {
            this.map.panTo(position);
        }

        this.pinnedMarkers.push(marker);
    }

    clearAllMarkers() {
        for (const pinnedMarker of this.pinnedMarkers) {
            pinnedMarker.setMap(null);
        }
        this.pinnedMarkers = [];
    }

    fitToAllMarkers() {
        const bounds = new google.maps.LatLngBounds();
        for (const pinnedMarker of this.pinnedMarkers) {
            bounds.extend(pinnedMarker.getPosition());
        }
        this.map.fitBounds(bounds);
    }

    initializeMap() {
        this.infoWindow = new google.maps.InfoWindow();
        this.map = new google.maps.Map(
            document.getElementById("maps-toolkit-google-maps"),
            {
                center: this.center,
                zoom: Number.parseInt(this.zoom, 10),
            }
        );

        this.map.addListener("click", () => {
            this.infoWindow.close();
        });
    }

    loadScript() {
        const googleMapsURL = new URL(this.googleMapsScriptURL);
        if (this.accessToken) {
            googleMapsURL.searchParams.set("key", this.accessToken);
        }

        const googleMapsScript = document.createElement("script");
        googleMapsScript.src = googleMapsURL.toString();
        googleMapsScript.async = true;
        googleMapsScript.defer = true;

        googleMapsScript.onload = async () => {
            try {
                await this.waitForGoogle();
                this.initializeMap();
                this.setupEventListeners();
                this.setupDefaultMarkers();
                this.setupUserLocation();
            } catch (error) {
                console.error(error);
            }
        };

        document.body.appendChild(googleMapsScript);
    }

    setupDefaultMarkers() {
        if (this.showMarker) {
            for (const defaultMarker of this.defaultMarkers) {
                this.addMarker(defaultMarker);
            }
        }
    }

    setupEventListeners() {
        Liferay.on("google_maps:add_marker", (event) => {
            for (const marker of event.details.flat()) {
                this.addMarker(marker);
            }
        });

        Liferay.on("google_maps:clear_markers", () => this.clearAllMarkers());
        Liferay.on("google_maps:fit_to_all_markers", () =>
            this.fitToAllMarkers()
        );
    }

    setupUserLocation() {
        if (this.showUserLocation && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(({ coords }) => {
                this.addMarker({
                    icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    fly: true,
                    latitude: Number.parseFloat(coords.latitude),
                    longitude: Number.parseFloat(coords.longitude),
                    title: "My Location",
                });
            });
        }
    }

    waitForGoogle() {
        return new Promise((resolve, reject) => {
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
    }
}

const googleMaps = new GoogleMaps(configuration);
googleMaps.loadScript();
