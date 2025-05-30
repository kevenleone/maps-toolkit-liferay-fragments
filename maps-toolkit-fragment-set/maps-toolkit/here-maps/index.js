const safeJSONParse = (value, defaultValue) => {
    try {
        return JSON.parse(value);
    } catch {
        return defaultValue;
    }
};

let icon;

if (configuration.markerIconURL) {
    icon = new H.map.Icon(configuration.markerIconURL, {
        size: { w: 32, h: 32 },
        anchor: { x: 16, y: 32 },
    });
}

const platform = new H.service.Platform({
    apikey: configuration.apiKey,
});

const defaultLayers = platform.createDefaultLayers();
const mapType = {
    normal: defaultLayers.raster.normal.map,
    satellite: defaultLayers.raster.satellite.map,
    terrain: defaultLayers.raster.terrain.map,
    standard: defaultLayers.vector.normal.map,
}[configuration.mapStyle || "normal"];

const map = new H.Map(
    document.getElementById("maps-toolkit-here-map"),
    mapType,
    {
        center: {
            lat: parseFloat(configuration.latitude) || 0,
            lng: parseFloat(configuration.longitude) || 0,
        },
        zoom: parseInt(configuration.zoom || "10"),
        pixelRatio: window.devicePixelRatio || 1,
    }
);

H.ui.UI.createDefault(map, defaultLayers);

const ui = H.ui.UI.createDefault(map, defaultLayers);

const markers = safeJSONParse(configuration.markersJson, []);

function addMarker({ latitude, longitude, title }) {
    const marker = new H.map.Marker(
        { lat: latitude, lng: longitude },
        { icon }
    );

    marker.setData(title);

    marker.addEventListener("tap", function (evt) {
        const bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {
            content: evt.target.getData(),
        });
        ui.addBubble(bubble);
    });

    map.addObject(marker);
}

markers.forEach((marker) => {
    addMarker(marker);
});

if (configuration.showMarker) {
    addMarker({
        latitude: parseFloat(configuration.latitude),
        longitude: parseFloat(configuration.longitude),
        title: "Default Location",
    });
}

if (configuration.showUserLocation && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(({ coords }) => {
        addMarker({
            latitude: parseFloat(coords.latitude),
            longitude: parseFloat(coords.longitude),
            title: "My Location",
        });

        map.setCenter({ lat: coords.latitude, lng: coords.longitude });
    });
}
