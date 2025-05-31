class CityPlacesPreview {
    constructor() {
        this.recifeLocations = [
            {
                fly: true,
                image: "https://viagemeturismo.abril.com.br/wp-content/uploads/2024/08/marco-zero-recife.jpg?crop=1&resize=1212,909",
                latitude: -8.063149,
                longitude: -34.871139,
                title: "Marco Zero Square",
                type: "pin",
            },
            {
                fly: true,
                image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1e/02/c3/e6/riomar-recife.jpg?w=1200&h=-1&s=1",
                latitude: -8.086054,
                longitude: -34.8973235,
                title: "Shopping Rio Mar",
            },
            {
                fly: true,
                image: "https://www.royalconstrucoes.com.br/wp-content/uploads/2016/10/SHOPPING-RECIFE_5.jpg",
                latitude: -8.1190456,
                longitude: -34.9072438,
                title: "Shopping Recife",
            },
            {
                fly: true,
                image: "https://tourfacil.s3.amazonaws.com/tour-facil/servicos/tour-olinda-com-recife-antigo-saida-recife-659473e1a09d7-large.jpg?quality=75",
                latitude: -8.060345,
                longitude: -34.871073,
                title: "Recife Antigo (Old Town)",
            },
            {
                fly: true,
                image: "https://images.adsttc.com/media/images/5c11/967e/08a5/e54b/ad00/0941/large_jpg/5MG_4293.jpg?1544656467",
                latitude: -8.063872,
                longitude: -34.872913,
                title: "Cais do Sertão Museum",
            },
        ];
    }

    addLocationCard(loc) {
        const col = document.createElement("div");
        col.className = "col-sm-6 col-lg-6 mb-4";
        const card = document.createElement("div");
        card.className = "card h-100 shadow-sm";
        card.innerHTML = `
    <img src="${loc.image}" class="card-img-top" alt="${loc.title}">
    <div class="card-body d-flex flex-column">
      <h5 class="card-title">${loc.title}</h5>
      <p class="card-text mb-3">
        <small class="text-muted">
          Latitude: ${loc.latitude.toFixed(6)}<br>
          Longitude: ${loc.longitude.toFixed(6)}
        </small>
      </p>
      <button type="button" class="btn btn-primary mt-auto">
        View on Google Maps
      </button>
    </div>
  `;
        const button = card.querySelector("button");
        button.addEventListener("click", () => this.invokeLocation(loc));
        col.appendChild(card);
        this.grid.appendChild(col);
    }

    invokeLocation(marker) {
        Liferay.fire("mapbox:add_marker", marker);
    }

    run() {
        this.grid = document.getElementById("locationsGrid");
        this.recifeLocations.forEach((loc) => {
            this.addLocationCard(loc);
        });
    }
}

const cityPlacesPreviewInstance = new CityPlacesPreview();
cityPlacesPreviewInstance.run();
