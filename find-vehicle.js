// find-vehicle.js
// Demo-data + Leaflet kaart + filters + resultatenlijst

// ---- 1. Demo voertuigen (fictieve fleet) ----
const demoVehicles = [
    {
        id: "KG-UTR-CITY-01",
        naam: "Compact City – Utrecht Oost",
        type: "compact",
        stad: "Utrecht",
        buurt: "Oost / Rijnsweerd",
        adres: "Rijnsweerd, Utrecht",
        lat: 52.0888,
        lng: 5.1496,
        hotspot: "Utrecht Oost – Rijnsweerd",
        prijsPerDag: "€39 p/d",
        rating: 4.9,
        reviews: 124,
        snappcarUrl: "#"
    },
    {
        id: "KG-UTR-VAN-01",
        naam: "Cargo Van – Utrecht Kanaleneiland",
        type: "van",
        stad: "Utrecht",
        buurt: "Kanaleneiland",
        adres: "Kanaleneiland, Utrecht",
        lat: 52.0704,
        lng: 5.0949,
        hotspot: "Verhuis hotspot Kanaleneiland",
        prijsPerDag: "€69 p/d",
        rating: 4.8,
        reviews: 87,
        snappcarUrl: "#"
    },
    {
        id: "KG-AMS-EV-01",
        naam: "EV Compact – Amsterdam West",
        type: "ev",
        stad: "Amsterdam",
        buurt: "De Baarsjes",
        adres: "Baarsjes, Amsterdam",
        lat: 52.3694,
        lng: 4.8572,
        hotspot: "Amsterdam West – EV hub",
        prijsPerDag: "€49 p/d",
        rating: 4.95,
        reviews: 152,
        snappcarUrl: "#"
    },
    {
        id: "KG-AMS-SUV-01",
        naam: "Comfort SUV – Amsterdam Zuid",
        type: "suv",
        stad: "Amsterdam",
        buurt: "Zuid / Zuidas",
        adres: "Zuidas, Amsterdam",
        lat: 52.3370,
        lng: 4.8735,
        hotspot: "Business hotspot Zuidas",
        prijsPerDag: "€79 p/d",
        rating: 4.9,
        reviews: 96,
        snappcarUrl: "#"
    },
    {
        id: "KG-RTM-PREM-01",
        naam: "Business Premium – Rotterdam Centrum",
        type: "premium",
        stad: "Rotterdam",
        buurt: "Centrum",
        adres: "Centrum, Rotterdam",
        lat: 51.9225,
        lng: 4.4792,
        hotspot: "Rotterdam CS – Business",
        prijsPerDag: "€89 p/d",
        rating: 5.0,
        reviews: 61,
        snappcarUrl: "#"
    },
    {
        id: "KG-HOUTEN-CITY-01",
        naam: "Compact City – Houten Station",
        type: "compact",
        stad: "Houten",
        buurt: "Station",
        adres: "Stationsgebied, Houten",
        lat: 52.0295,
        lng: 5.1740,
        hotspot: "Houten – Station",
        prijsPerDag: "€35 p/d",
        rating: 4.7,
        reviews: 43,
        snappcarUrl: "#"
    }
];

// ---- 2. Leaflet kaart initialiseren ----
let map;
let markerLayerGroup;

function initVehicleMap() {
    const mapElement = document.getElementById("vehicleMap");
    if (!mapElement) {
        console.warn("vehicleMap element niet gevonden");
        return;
    }

    if (typeof L === "undefined") {
        console.error("Leaflet (L) is niet beschikbaar. Check het <script> voor Leaflet.");
        return;
    }

    map = L.map("vehicleMap", {
        zoomControl: true
    }).setView([52.1, 5.21], 8);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap"
    }).addTo(map);

    markerLayerGroup = L.layerGroup().addTo(map);

    addMarkersAndFit();
}

// ---- 3. Markers toevoegen (standaard Leaflet icon) ----
function addMarkersAndFit(filtered = null) {
    const data = filtered || demoVehicles;
    if (!markerLayerGroup) return;

    markerLayerGroup.clearLayers();

    const bounds = [];

    data.forEach(vehicle => {
        const marker = L.marker([vehicle.lat, vehicle.lng]);

        const popupHtml = `
            <div style="min-width:200px">
                <strong>${vehicle.naam}</strong><br/>
                <span style="font-size:12px;color:#6b7280;">
                    ${vehicle.stad} – ${vehicle.buurt}<br/>
                    Hotspot: ${vehicle.hotspot}
                </span>
                <div style="margin-top:6px;font-size:12px;">
                    <span>⭐ ${vehicle.rating.toFixed(1)} (${vehicle.reviews} reviews)</span><br/>
                    <span><strong>${vehicle.prijsPerDag}</strong></span>
                </div>
                <a href="${vehicle.snappcarUrl}" target="_blank" 
                   style="display:inline-block;margin-top:8px;padding:6px 10px;border-radius:999px;
                          background:#ff7a00;color:#fff;text-decoration:none;font-size:12px;font-weight:600;">
                    Nu boeken
                </a>
            </div>
        `;

        marker.bindPopup(popupHtml);
        marker.addTo(markerLayerGroup);

        vehicle._marker = marker;
        bounds.push([vehicle.lat, vehicle.lng]);
    });

    if (bounds.length > 0 && map) {
        map.fitBounds(bounds, { padding: [30, 30] });
        setTimeout(() => {
            map.invalidateSize();
        }, 200);
    }
}

// ---- 4. Filters + lijst ----
function filterVehicles() {
    const searchInput = document.getElementById("vehicleSearch");
    const typeFilter = document.getElementById("vehicleTypeFilter");

    const term = (searchInput?.value || "").toLowerCase().trim();
    const typeValue = typeFilter?.value || "";

    const filtered = demoVehicles.filter(v => {
        if (typeValue && v.type !== typeValue) return false;

        if (term) {
            const haystack = [
                v.naam,
                v.stad,
                v.buurt,
                v.adres,
                v.hotspot,
                v.type
            ]
                .join(" ")
                .toLowerCase();

            if (!haystack.includes(term)) return false;
        }

        return true;
    });

    addMarkersAndFit(filtered);
    renderVehicleList(filtered);
}

function renderVehicleList(data) {
    const listEl = document.getElementById("vehicleList");
    if (!listEl) return;

    listEl.innerHTML = "";

    if (!data || data.length === 0) {
        const empty = document.createElement("div");
        empty.textContent = "Geen voertuigen gevonden met deze filters.";
        empty.style.fontSize = "0.85rem";
        empty.style.color = "#6b7280";
        listEl.appendChild(empty);
        return;
    }

    data.forEach(vehicle => {
        const card = document.createElement("div");
        card.className = "vehicle-card";
        card.dataset.vehicleId = vehicle.id;

        card.innerHTML = `
            <div class="vehicle-card-header">
                <div class="vehicle-card-title">${vehicle.naam}</div>
                <div class="vehicle-card-type">${mapTypeToLabel(vehicle.type)}</div>
            </div>
            <div class="vehicle-card-meta">
                <span>${vehicle.stad}</span>
                <span>${vehicle.buurt}</span>
            </div>
            <div class="vehicle-card-footer">
                <div class="vehicle-card-rating">
                    <span>⭐ ${vehicle.rating.toFixed(1)}</span>
                    <span>(${vehicle.reviews})</span>
                </div>
                <div class="vehicle-card-price">${vehicle.prijsPerDag}</div>
            </div>
        `;

        card.addEventListener("click", () => {
            if (vehicle._marker && map) {
                map.setView(vehicle._marker.getLatLng(), 13, { animate: true });
                vehicle._marker.openPopup();
            }
        });

        listEl.appendChild(card);
    });
}

function mapTypeToLabel(type) {
    switch (type) {
        case "compact":
            return "Compact";
        case "suv":
            return "SUV / Crossover";
        case "van":
            return "Bestelbus";
        case "ev":
            return "Elektrisch";
        case "premium":
            return "Premium";
        default:
            return "Voertuig";
    }
}

// ---- 5. Event listeners ----
document.addEventListener("DOMContentLoaded", () => {
    console.log("vind-voertuig DOM geladen");
    initVehicleMap();
    renderVehicleList(demoVehicles);

    const searchInput = document.getElementById("vehicleSearch");
    const typeFilter = document.getElementById("vehicleTypeFilter");
    const resetBtn = document.getElementById("resetVehicleFilters");

    if (searchInput) {
        searchInput.addEventListener("input", filterVehicles);
    }

    if (typeFilter) {
        typeFilter.addEventListener("change", filterVehicles);
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            if (typeFilter) typeFilter.value = "";
            filterVehicles();
        });
    }
});
