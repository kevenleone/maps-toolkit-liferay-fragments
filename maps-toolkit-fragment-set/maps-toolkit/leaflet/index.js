function safeJSONParse(value, defaultValue) {
    try {
        return JSON.parse(value);
    } catch {
        return defaultValue;
    }
}

class LeafletMap {
    constructor(configuration) {
        // Configuration properties
        this.customMapTyleLayer = configuration.customMapTyleLayer;
        this.defaultMarkers = safeJSONParse(configuration.markersJSON, []);
        this.latitude = configuration.latitude || 37.7749;
        this.longitude = configuration.longitude || -122.4194;
        this.mapTileLayer = configuration.mapTileLayer;
        this.markersJSON = configuration.markersJSON;
        this.showMarker = configuration.showMarker ?? true;
        this.showUserLocation = configuration.showUserLocation ?? false;
        this.zoom = configuration.zoom || 13;

        // Instance properties

        this.leafletCSS = null;
        this.leafletScript = null;
        this.map = null;
        this.pinnedMarkers = [];
        this.tileLayers = {
            default: {
                url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                options: {
                    attribution: "&copy; OpenStreetMap contributors",
                },
            },
            "cartodb.light_all": {
                url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
                options: {
                    attribution: "&copy; CartoDB, OpenStreetMap contributors",
                },
            },
            "stadia.alidadesatellite": {
                url: "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}",
                options: {
                    minZoom: 0,
                    maxZoom: 20,
                    attribution:
                        '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    ext: "jpg",
                },
            },
            "stadia.alidadesmooth": {
                url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}",
                options: {
                    minZoom: 0,
                    maxZoom: 20,
                    attribution:
                        '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    ext: "png",
                },
            },
            "stadia.outdoors": {
                url: "https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.{ext}",
                options: {
                    minZoom: 0,
                    maxZoom: 20,
                    attribution:
                        '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    ext: "png",
                },
            },
        };

        this.initializeResources();
    }

    addMarker({ fly, latitude, longitude, title, openPopup }) {
        const marker = L.marker([latitude, longitude])
            .addTo(this.map)
            .bindPopup(title);

        if (fly) {
            this.map.panTo([latitude, longitude]);
        }

        if (openPopup) {
            marker.openPopup();
        }

        this.pinnedMarkers.push(marker);
    }

    clearAllMarkers() {
        for (const pinnedMarker of this.pinnedMarkers) {
            this.map.removeLayer(pinnedMarker);
        }
        this.pinnedMarkers = [];
    }

    fitToAllMarkers() {
        const group = L.featureGroup(this.pinnedMarkers);
        this.map.fitBounds(group.getBounds());
    }

    initializeMap() {
        this.map = L.map("maps-toolkit-leaflet-map").setView(
            [this.latitude, this.longitude],
            this.zoom
        );

        let tileLayer =
            this.tileLayers[this.mapTileLayer] || this.tileLayers.default;
        if (this.mapTileLayer === "other" && this.customMapTyleLayer) {
            tileLayer = JSON.parse(this.customMapTyleLayer);
        }

        L.tileLayer(tileLayer.url, tileLayer.options).addTo(this.map);

        this.setupEventListeners();
        this.setupDefaultMarkers();
        this.setupUserLocation();
    }

    initializeResources() {
        this.leafletCSS = document.createElement("link");
        this.leafletScript = document.createElement("script");

        this.leafletCSS.rel = "stylesheet";
        this.leafletCSS.href =
            "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        this.leafletScript.src =
            "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

        document.head.appendChild(this.leafletCSS);
        this.leafletScript.onload = () => this.initializeMap();
        document.body.appendChild(this.leafletScript);
    }

    setupDefaultMarkers() {
        if (this.showMarker) {
            for (const defaultMarker of this.defaultMarkers) {
                this.addMarker(defaultMarker);
            }
        }
    }

    setupEventListeners() {
        Liferay.fire("leaflet:init", { map: this.map, timestamp: new Date() });

        Liferay.on("leaflet:add_marker", (event) => {
            for (const marker of event.details.flat()) {
                this.addMarker(marker);
            }
        });

        Liferay.on("leaflet:fit_to_all_markers", () => this.fitToAllMarkers());
        Liferay.on("leaflet:clear_markers", () => this.clearAllMarkers());
    }

    setupUserLocation() {
        if (this.showUserLocation) {
            this.map.locate({ watch: false });
            this.map.on("locationfound", (e) => {
                this.addMarker({
                    fly: true,
                    latitude: e.latitude,
                    longitude: e.longitude,
                    title: "You are here",
                });
                L.circle(e.latlng, { radius: e.accuracy }).addTo(this.map);
            });
            this.map.on("locationerror", (event) =>
                console.error("Location error:", event.message)
            );
        }
    }
}

const leafletMap = new LeafletMap(configuration);
