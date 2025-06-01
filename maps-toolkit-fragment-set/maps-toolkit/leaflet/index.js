function safeJSONParse(value, defaultValue) {
    try {
        return JSON.parse(value);
    } catch {
        return defaultValue;
    }
}

const tileLayers = {
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

class LeafletMap {
    constructor(configuration) {
        this.customMapTyleLayer = configuration.customMapTyleLayer;
        this.defaultMarkers = safeJSONParse(configuration.markersJSON, []);
        this.latitude = configuration.latitude || 37.7749;
        this.longitude = configuration.longitude || -122.4194;
        this.mapTileLayer = configuration.mapTileLayer;
        this.markersJSON = configuration.markersJSON;
        this.showMarker = configuration.showMarker;
        this.showUserLocation = configuration.showUserLocation;
        this.zoom = configuration.zoom || 13;

        this.map = null;
        this.pinnedMarkers = [];
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

    initialize() {
        this.map = L.map("maps-toolkit-leaflet-map").setView(
            [this.latitude, this.longitude],
            this.zoom
        );

        let tileLayer = tileLayers[this.mapTileLayer] || tileLayers.default;

        if (this.mapTileLayer === "other" && this.customMapTyleLayer) {
            tileLayer = JSON.parse(this.customMapTyleLayer);
        }

        L.tileLayer(tileLayer.url, tileLayer.options).addTo(this.map);

        this.setupEventListeners();
        this.setupDefaultMarkers();
        this.setupUserLocation();
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

        Liferay.on("leaflet:clear_markers", () => this.clearAllMarkers());

        Liferay.on("leaflet:fit_to_all_markers", () => this.fitToAllMarkers());
    }

    setupUserLocation() {
        if (this.showUserLocation) {
            return;
        }

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

const leafletMap = new LeafletMap(configuration);

leafletMap.initialize();
