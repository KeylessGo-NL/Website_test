// fleet.js
// Kaart + simpele filters voor homepage (#liveMap)

const homepageVehicles = [
    {
        id: "HP-UTR-CITY-01",
        naam: "Compact City – Utrecht Oost",
        type: "compact",
        stad: "Utrecht",
        beschrijving: "Compacte stadsauto in Utrecht Oost, ideaal voor korte ritten.",
        lat: 52.0888,
        lng: 5.1496
    },
    {
        id: "HP-UTR-VAN-01",
        naam: "Cargo Van – Utrecht Kanaleneiland",
        type: "van",
        stad: "Utrecht",
        beschrijving: "Ruime bestelbus voor verhuizingen en klussen.",
        lat: 52.0704,
        lng: 5.0949
    },
    {
        id: "HP-AMS-EV-01",
        naam: "EV Compact – Amsterdam West",
        type: "ev",
        stad: "Amsterdam",
        beschrijving: "Elektrische stadsauto in Amsterdam West.",
        lat: 52.3694,
        lng: 4.8572
    },
    {
        id: "HP-AMS-SUV-01",
        naam: "Comfort SUV – Amsterdam Zuid",
        type: "suv",
        stad: "Amsterdam",
        beschrijving: "Comfortabele SUV voor gezin en business.",
        lat: 52.3370,
        lng: 4.8735
    },
    {
        id: "HP-RTM-PREM-01",
        naam: "Business Premium – Rotterdam Centrum",
        type: "premium",
        stad: "Rotterdam",
        beschrijving: "Premium sedan in hartje Rotterdam.",
        lat: 51.9225,
        lng: 4.4792
    },
    {
        id: "HP-HOUTEN-CITY-01",
        naam: "Compact City – Houten Station",
        type: "compact",
        stad: "Houten",
        beschrijving: "Compacte auto bij station Houten.",
        lat: 52.0295,
        lng: 5.1740
    }
];

const homepageHotspots = [
    {
        naam: "Utrecht Oost – Rijnsweerd",
        lat: 52.0888,
        lng: 5.1496
    },
    {
        naam: "Amsterdam West – EV hub",
        lat: 52.3694,
        lng: 4.8572
    },
    {
        naam: "Business hotspot Zuidas",
        lat: 52.3370,
        lng: 4.8735
    },
    {
        naam: "Rotterdam CS – Business",
        lat: 51.9225,
        lng: 4.4792
    }
];

let homepageMap;
let homepageVehicleLayer;
let homepageHotspotLayer;

function initHomepageMap() {
    const mapElement = document.getElementById("liveMap");
    if (!mapElement) return;

    if (typeof L === "undefined") {
        console.error("Leaflet is niet geladen op de homepage.");
        return;
    }

    homepageMap = L.map("liveMap", {
        zoomControl: true
    }).setView([52.1, 5.21], 8);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap"
    }).addTo(homepageMap);

    homepageVehicleLayer = L.layerGroup().addTo(homepageMap);
    homepageHotspotLayer = L.layerGroup().addTo(homepageMap);

    renderHomepageHotspots();
    renderHomepageVehicles();
}

function renderHomepageHotspots() {
    if (!homepageHotspotLayer) return;
    homepageHotspotLayer.clearLayers();

    homepageHotspots.forEach(h => {
        const circle = L.circleMarker([h.lat, h.lng], {
            radius: 8,
            color: "#ff7a00",
            fillColor: "#ff7a00",
            fillOpacity: 0.8
        }).bindPopup(`<strong>Hotspot</strong><br/>${h.naam}`);

        circle.addTo(homepageHotspotLayer);
    });
}

function renderHomepageVehicles(filtered = null) {
    if (!homepageVehicleLayer) return;

    const data = filtered || homepageVehicles;
    homepageVehicleLayer.clearLayers();

    const bounds = [];

    data.forEach(v => {
        const marker = L.marker([v.lat, v.lng]);
        marker.bindPopup(`
            <div style="min-width:200px">
                <strong>${v.naam}</strong><br/>
                <span style="font-size:12px;color:#6b7280;">${v.stad}</span>
                <p style="margin-top:4px;font-size:12px;">${v.beschrijving}</p>
                <a href="vind-voertuig.html" style="display:inline-block;margin-top:6px;
                    padding:6px 10px;border-radius:999px;background:#ff7a00;color:#fff;
                    text-decoration:none;font-size:12px;font-weight:600;">
                    Bekijk en boek
                </a>
            </div>
        `);
        marker.addTo(homepageVehicleLayer);
        bounds.push([v.lat, v.lng]);
    });

    if (bounds.length > 0 && homepageMap) {
        homepageMap.fitBounds(bounds, { padding: [30, 30] });
        setTimeout(() => homepageMap.invalidateSize(), 200);
    }
}

function filterHomepageMap() {
    const searchInput = document.getElementById("searchInput");
    const typeFilter = document.getElementById("typeFilter");

    const term = (searchInput?.value || "").toLowerCase().trim();
    const typeValue = typeFilter?.value || "";

    const filtered = homepageVehicles.filter(v => {
        if (typeValue && v.type !== typeValue) return false;

        if (term) {
            const haystack = (v.naam + " " + v.stad + " " + v.beschrijving)
                .toLowerCase();
            if (!haystack.includes(term)) return false;
        }

        return true;
    });

    renderHomepageVehicles(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
    initHomepageMap();

    const searchInput = document.getElementById("searchInput");
    const typeFilter = document.getElementById("typeFilter");
    const resetBtn = document.getElementById("resetFilters");

    if (searchInput) {
        searchInput.addEventListener("input", filterHomepageMap);
    }
    if (typeFilter) {
        typeFilter.addEventListener("change", filterHomepageMap);
    }
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            if (typeFilter) typeFilter.value = "";
            filterHomepageMap();
        });
    }
});
