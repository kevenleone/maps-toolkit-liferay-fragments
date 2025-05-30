const safeJSONParse = (value, defaultValue) => {
    try {
        return JSON.parse(value);
    } catch {
        return defaultValue;
    }
};

let icon;

if (configuration.defaultMarkerIconURL) {
    icon = new H.map.Icon(configuration.defaultMarkerIconURL, {
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
            lat: Number.parseFloat(configuration.latitude) || 0,
            lng: Number.parseFloat(configuration.longitude) || 0,
        },
        zoom: Number.parseInt(configuration.zoom || "10"),
        pixelRatio: window.devicePixelRatio || 1,
    }
);

H.ui.UI.createDefault(map, defaultLayers);

const ui = H.ui.UI.createDefault(map, defaultLayers);

const pinnedMarkers = [];
const defaultMarkers = safeJSONParse(configuration.markersJSON, []);

function addMarker({ latitude, longitude, title }) {
    const marker = new H.map.Marker(
        { lat: latitude, lng: longitude },
        { icon }
    );

    marker.setData(title);

    marker.addEventListener("tap", (event) => {
        const bubble = new H.ui.InfoBubble(event.target.getGeometry(), {
            content: event.target.getData(),
        });

        ui.addBubble(bubble);
    });

    map.addObject(marker);

    pinnedMarkers.push(marker);
}

Liferay.on("here_maps:add_marker", (event) => {
    event.details.flat().forEach(addMarker);
});

Liferay.on("here_maps:fit_to_all_markers", () => {
    const bounds = new H.geo.Rect(
        ...markers.reduce((acc, { latitude, longitude }) => {
            acc.push(latitude, longitude);

            return acc;
        }, [])
    );

    map.getViewModel().setLookAtData({ bounds });
});

if (configuration.showMarker) {
    for (const defaultMarker of defaultMarkers) {
        addMarker(defaultMarker);
    }
}

if (configuration.showUserLocation && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(({ coords }) => {
        addMarker({
            latitude: Number.parseFloat(coords.latitude),
            longitude: Number.parseFloat(coords.longitude),
            title: "My Location",
        });

        map.setCenter({ lat: coords.latitude, lng: coords.longitude });
    });
}
