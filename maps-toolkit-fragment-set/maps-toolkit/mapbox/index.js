const {
    accessToken = "",
    mapStyle = "streets-v11",
    latitude = 37.7749,
    longitude = -122.4194,
    markersJSON = "[]",
    showUserLocation = false,
    zoom = 15,
} = configuration;

if (!accessToken) {
    throw new Error("Mapbox Access Token is missing");
}

mapboxgl.accessToken = accessToken;

const map = new mapboxgl.Map({
    container: "maps-toolkit-mapbox-map",
    style: `mapbox://styles/mapbox/${mapStyle}`,
    center: [Number.parseFloat(longitude), Number.parseFloat(latitude)],
    zoom: Number.parseFloat(zoom),
});

const pinnedMarkers = [];

function addMarker({ icon, fly, latitude, longitude, title, type }) {
    function plotMarker(element) {
        const mapboxMarker = new mapboxgl.Marker(element)
            .setLngLat([
                Number.parseFloat(longitude),
                Number.parseFloat(latitude),
            ])
            .addTo(map);

        if (fly) {
            map.flyTo({
                center: [longitude, latitude],
                zoom,
                speed: 1.2,
                curve: 1.42,
            });
        }

        if (title) {
            mapboxMarker.setPopup(
                new mapboxgl.Popup({ offset: 25 }).setText(title)
            );
        }

        pinnedMarkers.push(mapboxMarker);
    }

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

Liferay.on("mapbox:add_marker", (event) => {
    event.details.flat().forEach(addMarker);
});

Liferay.on("mapbox:fit_to_all_markers", () => {
    const bounds = new mapboxgl.LngLatBounds();

    for (const pinnedMarker of pinnedMarkers) {
        bounds.extend([pinnedMarker.longitude, pinnedMarker.latitude]);
    }

    map.fitBounds(bounds, { padding: 50 });
});

if (showUserLocation) {
    map.addControl(
        new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true,
            },
            // When active the map will receive updates to the device's location as it changes.
            trackUserLocation: true,
            // Draw an arrow next to the location dot to indicate which direction the device is heading.
            showUserHeading: true,
        })
    );
}

map.addControl(new mapboxgl.NavigationControl());

// Add markers
try {
    const markers = JSON.parse(markersJSON);

    markers.forEach(addMarker);
} catch (error) {
    console.error("Invalid JSON in markers:", error);
}
