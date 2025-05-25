(function () {
    const {
        latitude = 37.7749,
        longitude = -122.4194,
        showMarker = true,
        showUserLocation = false,
        zoom = 13,
    } = configuration;

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

        // L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        //   map
        // );

        // L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        //   attribution: "&copy; OpenStreetMap contributors",
        // }).addTo(map);

        L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
            {
                attribution: "&copy; CartoDB, OpenStreetMap contributors",
            }
        ).addTo(map);

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
