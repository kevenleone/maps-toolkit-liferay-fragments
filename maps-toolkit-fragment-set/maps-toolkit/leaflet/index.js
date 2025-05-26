(function () {
    const {
        customMapTyleLayer,
        latitude = 37.7749,
        longitude = -122.4194,
        mapTileLayer,
        markersJson,
        showMarker = true,
        showUserLocation = false,
        zoom = 13,
    } = configuration;

    const safeJSONParse = (value, defaultValue) => {
        try {
            return JSON.parse(value);
        } catch {
            return defaultValue;
        }
    };

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

        function addMarker(marker) {
            L.marker([marker.latitude, marker.longitude])
                .addTo(map)
                .bindPopup(marker.title);

            if (marker.fly) {
                map.panTo([marker.latitude, marker.longitude]);
            }
        }

        Liferay.on("mapbox:add_marker", (event) => {
            event.details.flat().forEach(addMarker);
        });

        let tileLayer = tileLayers[mapTileLayer] || tileLayers.default;

        if (mapTileLayer === "other" && customMapTyleLayer) {
            tileLayer = JSON.parse(customMapTyleLayer);
        }

        L.tileLayer(tileLayer.url, tileLayer.options).addTo(map);

        if (showMarker) {
            const markers = safeJSONParse(markersJson, []);

            markers.forEach(addMarker);
        }

        if (showUserLocation) {
            map.locate({ watch: false });

            map.on("locationfound", (e) => {
                L.marker(e.latlng)
                    .addTo(map)
                    .bindPopup("You are here")
                    .openPopup();

                map.panTo(e.latlng);

                L.circle(e.latlng, { radius: e.accuracy }).addTo(map);
            });

            map.on("locationerror", (e) => {
                console.error("Location error:", e.message);
                alert("Unable to retrieve your location.");
            });
        }
    };

    document.body.appendChild(leafletScript);
})();
