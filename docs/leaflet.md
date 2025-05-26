## Leaflet

### How to add Custom Map Tyle Layer

Leaflet supports custom maps tyle layers that can be found in the following URL: https://leaflet-extras.github.io/leaflet-providers/preview

Some tyles requires API Keys to use but the majority of the options there allow the user for free.

A window is displayed with the following content

```js
var OpenStreetMap_DE = L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	maxZoom: 18,
});
```

You need to convert this to the following structure

```json
{
    "url": "https://tile.openstreetmap.de/{z}/{x}/{y}.png",
    "options": {
	    "attribution": "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
            "maxZoom": 18,
    }
}
```

Next step is to stringify the entire string (or parse the JSON to String)

```
{"url":"https://tile.openstreetmap.de/{z}/{x}/{y}.png","options":{"attribution":"&copy; <a href=\\"https://www.openstreetmap.org/copyright\\">OpenStreetMap</a> contributors","maxZoom":18}}
```
