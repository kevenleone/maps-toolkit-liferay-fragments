(function () {
    const {
        customMapTyleLayer,
        latitude = 37.7749,
        longitude = -122.4194,
        mapTileLayer,
        showMarker = true,
        showUserLocation = false,
        zoom = 13,
    } = configuration;

    const tileLayers = {
        default: {
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            options: {
                attribution: "&copy; OpenStreetMap contributors",
            },
        },
        ["cartodb.light_all"]: {
            url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
            options: {
                attribution: "&copy; CartoDB, OpenStreetMap contributors",
            },
        },
        ["stadia.alidadesatellite"]: {
            url: "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}",
            options: {
                minZoom: 0,
                maxZoom: 20,
                attribution:
                    '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                ext: "jpg",
            },
        },
        ["stadia.alidadesmooth"]: {
            url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}",
            options: {
                minZoom: 0,
                maxZoom: 20,
                attribution:
                    '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                ext: "png",
            },
        },
        ["stadia.outdoors"]: {
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

    const leafletCSS = document.createElement("link");
    const leafletScript = document.createElement("script");

    leafletCSS.rel = "stylesheet";
    leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

    document.head.appendChild(leafletCSS);

    leafletScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

    leafletScript.onload = () => {
        const map = L.map("maps-toolkit-leaflet-map").setView(
            [latitude, longitude],
            zoom
        );

        let tileLayer = tileLayers[mapTileLayer] || tileLayers.default;

        if (mapTileLayer === "other" && customMapTyleLayer) {
            tileLayer = JSON.parse(customMapTyleLayer);
        }

        L.tileLayer(tileLayer.url, tileLayer.options).addTo(map);

        if (showMarker) {
            L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup("You are here!")
                .openPopup();

            L.marker([-8.0636362, -34.8727905])
                .addTo(map)
                .bindPopup("Your friend is here!")
                .openPopup();
        }

        if (showUserLocation) {
            map.locate({ setView: true, maxZoom: 10 });
        }
    };

    document.body.appendChild(leafletScript);
})();
