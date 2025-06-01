function safeJSONParse(value, defaultValue) {
    try {
        return JSON.parse(value);
    } catch {
        return defaultValue;
    }
}

class HereMaps {
    constructor(configuration) {
        this.apiKey = configuration.apiKey;
        this.defaultMarkerIconURL = configuration.defaultMarkerIconURL;
        this.defaultMarkers = safeJSONParse(configuration.markersJSON, []);
        this.latitude = Number.parseFloat(configuration.latitude) || 0;
        this.longitude = Number.parseFloat(configuration.longitude) || 0;
        this.mapStyle = configuration.mapStyle || "normal";
        this.showMarker = configuration.showMarker ?? true;
        this.showUserLocation = configuration.showUserLocation ?? false;
        this.zoom = configuration.zoom || 13;

        this.defaultLayers = null;
        this.icon = null;
        this.map = null;
        this.pinnedMarkers = [];
        this.platform = null;
        this.ui = null;
    }

    addMarker({ latitude, longitude, title }) {
        const marker = new H.map.Marker(
            { lat: latitude, lng: longitude },
            { icon: this.icon }
        );

        marker.setData(title);
        marker.addEventListener("tap", (event) => {
            const bubble = new H.ui.InfoBubble(event.target.getGeometry(), {
                content: event.target.getData(),
            });
            this.ui.addBubble(bubble);
        });

        this.map.addObject(marker);
        this.pinnedMarkers.push(marker);
    }

    clearAllMarkers() {
        for (const pinnedMarker of this.pinnedMarkers) {
            this.map.removeObject(pinnedMarker);
        }
        this.pinnedMarkers = [];
    }

    fitToAllMarkers() {
        if (!this.pinnedMarkers.length) return;

        const bounds = this.pinnedMarkers.reduce((acc, marker) => {
            const pos = marker.getGeometry();
            acc.push(pos.lat, pos.lng);
            return acc;
        }, []);

        if (bounds.length >= 4) {
            const rect = new H.geo.Rect(
                bounds[0],
                bounds[1],
                bounds[2],
                bounds[3]
            );

            this.map.getViewModel().setLookAtData({ bounds: rect });
        }
    }

    initializePlatform() {
        this.platform = new H.service.Platform({
            apikey: this.apiKey,
        });

        this.defaultLayers = this.platform.createDefaultLayers();

        this.mapType = {
            normal: this.defaultLayers.raster.normal.map,
            satellite: this.defaultLayers.raster.satellite.map,
            terrain: this.defaultLayers.raster.terrain.map,
            standard: this.defaultLayers.vector.normal.map,
        }[this.mapStyle];

        this.map = new H.Map(
            document.getElementById("maps-toolkit-here-map"),
            this.mapType,
            {
                center: {
                    lat: this.latitude,
                    lng: this.longitude,
                },
                zoom: this.zoom,
                pixelRatio: window.devicePixelRatio || 1,
            }
        );

        new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));

        this.ui = H.ui.UI.createDefault(this.map, this.defaultLayers);

        if (this.defaultMarkerIconURL) {
            this.icon = new H.map.Icon(this.defaultMarkerIconURL, {
                size: { w: 32, h: 32 },
                anchor: { x: 16, y: 32 },
            });
        }
    }

    setupDefaultMarkers() {
        if (this.showMarker) {
            for (const defaultMarker of this.defaultMarkers) {
                this.addMarker(defaultMarker);
            }
        }
    }

    setupEventListeners() {
        Liferay.on("here_maps:add_marker", (event) => {
            for (const marker of event.details.flat()) {
                this.addMarker(marker);
            }
        });

        Liferay.on("here_maps:clear_markers", () => this.clearAllMarkers());
        Liferay.on("here_maps:fit_to_all_markers", () =>
            this.fitToAllMarkers()
        );
    }

    setupUserLocation() {
        if (this.showUserLocation && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(({ coords }) => {
                this.addMarker({
                    latitude: Number.parseFloat(coords.latitude),
                    longitude: Number.parseFloat(coords.longitude),
                    title: "My Location",
                });

                this.map.setCenter({
                    lat: coords.latitude,
                    lng: coords.longitude,
                });
            });
        }
    }

    initialize() {
        this.initializePlatform();

        this.setupEventListeners();
        this.setupDefaultMarkers();
        this.setupUserLocation();
    }
}

const hereMaps = new HereMaps(configuration);

hereMaps.initialize();
