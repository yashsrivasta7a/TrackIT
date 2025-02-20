let socket = io(); // Connection request is sent 

if (!navigator.geolocation) {
    console.log("Browser doesn't support geo-location.");
} else {
    try {
        let lastEmitTime = 0;
        const emitInterval = 2000; 

        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const deviceName = "Your Device Name"; // Replace with actual device name
                console.log(`Sending location: ${latitude}, ${longitude}`); // Log sent coordinates
                const currentTime = Date.now();

                if (currentTime - lastEmitTime > emitInterval) {
                    socket.emit("location", { latitude, longitude, deviceName });
                    lastEmitTime = currentTime;
                }
            },
            (error) => {
                console.log("Geolocation error: ", error.message);
            },
            {
                enableHighAccuracy: false, // Set to false to reduce resource usage
                timeout: 10000, // Increase timeout to 10 seconds
                maximumAge: 5000 // Cache position for 5 seconds
            }
        );
    } catch (error) {
        console.log(error);
    }
}

var normal = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "©TrackIT"
});

var hot = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: "©TrackIT"
});

var openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: "©OpenTopoMap"
});

const map = L.map("map", {
    center: [0, 0],
    zoom: 15, // Reduce zoom level to optimize rendering
    layers: [normal] // Set OpenTopoMap as the default layer
});

var baseMaps = {
    "OpenStreetMap": normal,
    "OpenStreetMap.HOT": hot
};

var layerControl = L.control.layers(baseMaps).addTo(map);
layerControl.addBaseLayer(openTopoMap, "OpenTopoMap");

const marker = {};

socket.on("recivedLocation", (data) => {
    const { id, latitude, longitude, deviceName } = data;
    console.log(`Received location: ${latitude}, ${longitude}`); // Log received coordinates
    map.setView([latitude, longitude]);
    if (marker[id]) {
        marker[id].setLatLng([latitude, longitude]);
    } else {
        marker[id] = L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`${deviceName} <br>is here.`).openPopup(); 
    }
});

socket.on("UserDisconnected",(id)=>{
    if(marker[id]){
        map.removeLayer(marker[id]);
        delete marker[id];
    }
})