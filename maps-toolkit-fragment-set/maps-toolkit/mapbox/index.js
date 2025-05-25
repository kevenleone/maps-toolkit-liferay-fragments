(function () {
    const {
        accessToken = "",
        mapStyle = "streets-v11",
        latitude = 37.7749,
        longitude = -122.4194,
        markersJson = "[]",
        showUserLocation = false,
        zoom = 15,
    } = configuration;

    if (!accessToken) {
        return console.error("Mapbox Access Token is missing");
    }

    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
        container: "maps-toolkit-mapbox-map",
        style: `mapbox://styles/mapbox/${mapStyle}`,
        center: [parseFloat(longitude), parseFloat(latitude)],
        zoom: parseFloat(zoom),
    });

    function addMarker(marker) {
        function plotMarker(element) {
            const mapboxMarker = new mapboxgl.Marker(element)
                .setLngLat([
                    parseFloat(marker.longitude),
                    parseFloat(marker.latitude),
                ])
                .addTo(map);

            if (marker.fly) {
                map.flyTo({
                    center: [marker.longitude, marker.latitude],
                    zoom,
                    speed: 1.2,
                    curve: 1.42,
                });
            }

            if (marker.title) {
                mapboxMarker.setPopup(
                    new mapboxgl.Popup({ offset: 25 }).setText(marker.title)
                );
            }
        }

        const div = document.createElement("div");

        div.className = "mapbox-marker";

        if (marker.type === "pin") {
            return plotMarker();
        }

        if (marker.icon) {
            div.style.backgroundImage = `url(${marker.icon})`;
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
        const markers = JSON.parse(markersJson);

        markers.forEach(addMarker);
    } catch (err) {
        console.error("Invalid JSON in markers:", err);
    }
})();
