function safeJSONParse(value, defaultValue) {
    try {
        return JSON.parse(value);
    } catch {
        return defaultValue;
    }
}

class MapboxMap {
    constructor(configuration) {
        this.accessToken = configuration.accessToken || "";
        this.defaultMarkers = safeJSONParse(configuration.markersJSON, []);
        this.latitude = configuration.latitude || 37.7749;
        this.longitude = configuration.longitude || -122.4194;
        this.mapStyle = configuration.mapStyle || "streets-v11";
        this.markersJSON = configuration.markersJSON;
        this.showUserLocation = configuration.showUserLocation ?? false;
        this.zoom = configuration.zoom || 15;

        this.map = null;
        this.pinnedMarkers = [];
    }

    addMarker({ icon, fly, latitude, longitude, title, type }) {
        const plotMarker = (element) => {
            const mapboxMarker = new mapboxgl.Marker(element)
                .setLngLat([
                    Number.parseFloat(longitude),
                    Number.parseFloat(latitude),
                ])
                .addTo(this.map);

            if (fly) {
                this.map.flyTo({
                    center: [longitude, latitude],
                    zoom: this.zoom,
                    speed: 1.2,
                    curve: 1.42,
                });
            }

            if (title) {
                mapboxMarker.setPopup(
                    new mapboxgl.Popup({ offset: 25 }).setText(title)
                );
            }

            this.pinnedMarkers.push(mapboxMarker);
        };

        const div = document.createElement("div");

        div.className = "mapbox-marker";

        if (type === "pin") {
            return plotMarker();
        }

        if (icon) {
            div.style.backgroundImage = `url(${icon})`;
            div.style.width = "32px";
            div.style.height = "32px";
            div.style.backgroundSize = "cover";
            div.style.borderRadius = "50%";
        } else {
            div.style.backgroundColor = "#3FB1CE";
            div.style.width = "12px";
            div.style.height = "12px";
            div.style.borderRadius = "50%";
        }

        plotMarker(div);
    }

    clearAllMarkers() {
        for (const pinnedMarker of this.pinnedMarkers) {
            pinnedMarker.remove();
        }

        this.pinnedMarkers = [];
    }

    fitToAllMarkers() {
        const bounds = new mapboxgl.LngLatBounds();

        for (const pinnedMarker of this.pinnedMarkers) {
            const lngLat = pinnedMarker.getLngLat();

            bounds.extend([lngLat.lng, lngLat.lat]);
        }

        this.map.fitBounds(bounds, { padding: 50 });
    }

    initializeMap() {
        if (!this.accessToken) {
            throw new Error("Mapbox Access Token is missing");
        }

        mapboxgl.accessToken = this.accessToken;

        this.map = new mapboxgl.Map({
            center: [
                Number.parseFloat(this.longitude),
                Number.parseFloat(this.latitude),
            ],
            container: "maps-toolkit-mapbox-map",
            style: `mapbox://styles/mapbox/${this.mapStyle}`,
            zoom: Number.parseFloat(this.zoom),
        });

        this.map.addControl(new mapboxgl.NavigationControl());

        this.setupDefaultMarkers();
        this.setupEventListeners();
        this.setupUserLocation();
    }

    setupDefaultMarkers() {
        try {
            for (const defaultMarker of this.defaultMarkers) {
                this.addMarker(defaultMarker);
            }
        } catch (error) {
            console.error("Invalid JSON in markers:", error);
        }
    }

    setupEventListeners() {
        Liferay.on("mapbox:add_marker", (event) => {
            for (const marker of event.details.flat()) {
                this.addMarker(marker);
            }
        });

        Liferay.on("mapbox:clear_markers", () => this.clearAllMarkers());
        Liferay.on("mapbox:fit_to_all_markers", () => this.fitToAllMarkers());
    }

    setupUserLocation() {
        if (!this.showUserLocation) {
            return;
        }

        this.map.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
                showUserHeading: true,
            })
        );
    }
}

const mapboxMap = new MapboxMap(configuration);

mapboxMap.initializeMap();
