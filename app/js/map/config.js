function getMap(address, idMap) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const lat = data[0].lat;
                const lon = data[0].lon;
                console.log(`Сoordinates "${address}": ${lat}, ${lon}`);
                initMap(idMap, address, lat, lon);
            } else {
                console.log('Address not found.');
            }
        })
        .catch(error => console.error('Error:', error));
}


function initMap(id, address, lat, lon) {
    const testMap = L.map(id).setView([lat, lon], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(testMap);

    const marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup(`${address}`).openPopup();
}

// Maps INIT

getMap('Canada Saint John', 'test-map')