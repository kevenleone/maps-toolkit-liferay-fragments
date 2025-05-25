(function () {
    const {
        accessToken,
        latitude = 37.7749,
        longitude = -122.4194,
        showMarker = true,
        showUserLocation = false,
        googleMapsScriptURL = "https://maps.googleapis.com/maps/api/js",
        zoom = 13,
    } = configuration;

    const center = {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
    };

    const waitForGoogle = () => {
        return new Promise((resolve, reject) => {
            let maxRetries = 10;
            const interval = setInterval(() => {
                if (window.google && window.google.maps) {
                    clearInterval(interval);
                    resolve(window.google.maps);
                } else if (--maxRetries === 0) {
                    clearInterval(interval);
                    reject(new Error("Google Maps API failed to load."));
                }
            }, 300);
        });
    };

    let googleMapsURL = new URL(googleMapsScriptURL);

    if (accessToken) {
        googleMapsURL.searchParams.set("key", accessToken);
    }

    const googleMapsScript = document.createElement("script");

    googleMapsScript.src = googleMapsURL.toString();

    googleMapsScript.async = true;
    googleMapsScript.defer = true;

    googleMapsScript.onload = async () => {
        try {
            await waitForGoogle();

            const map = new google.maps.Map(
                document.getElementById("maps-toolkit-google-maps"),
                {
                    center,
                    zoom: parseInt(zoom, 10),
                }
            );

            if (showMarker) {
                const marker = new google.maps.Marker({
                    position: center,
                    map,
                    title: "Configured Location",
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `<strong>Lat:</strong> ${latitude}, <strong>Lng:</strong> ${longitude}`,
                });

                marker.addListener("click", () => {
                    infoWindow.open(map, marker);
                });
            }

            if (showUserLocation && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const userPosition = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };

                        new google.maps.Marker({
                            position: userPosition,
                            map,
                            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                            title: "Your Location",
                        });

                        map.panTo(userPosition);
                    },
                    () =>
                        console.warn(
                            "Geolocation permission denied or unavailable"
                        )
                );
            }
        } catch (error) {
            console.error(error);
        }
    };

    document.body.appendChild(googleMapsScript);
})();
