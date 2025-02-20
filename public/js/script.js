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
                console.log(`Sending location: ${latitude}, ${longitude}`); 
                const currentTime = Date.now();

                if (currentTime - lastEmitTime > emitInterval) {
                    socket.emit("location", { latitude, longitude });
                    lastEmitTime = currentTime;
                }
            },
            (error) => {
                console.log("Geolocation error: ", error.message);
            },
            {
                enableHighAccuracy: false, 
                timeout: 10000,
                maximumAge: 5000 
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
    zoom: 15, 
    layers: [normal] 
});

var baseMaps = {
    "OpenStreetMap": normal,
    "OpenStreetMap.HOT": hot
};

var layerControl = L.control.layers(baseMaps).addTo(map);
layerControl.addBaseLayer(openTopoMap, "OpenTopoMap");

const marker = {};
let otherPersonLocation = null; 

socket.on("recivedLocation", (data) => {
    const { id, latitude, longitude, deviceName } = data;
    console.log(`Received location: ${latitude}, ${longitude}`); 
    otherPersonLocation = { latitude, longitude }; 
    map.setView([latitude, longitude]);
    if (marker[id]) {
        marker[id].setLatLng([latitude, longitude]);
    } else {
        marker[id] = L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`${deviceName} <br>is here.`).openPopup(); 
    }
});

// Add button to go to the location of another person
const button = document.createElement('button');
button.id = 'go-to-other-person';
button.innerText = 'Go to Other Person';
button.onclick = () => {
    if (otherPersonLocation) {
        map.setView([otherPersonLocation.latitude, otherPersonLocation.longitude], 15);
    } else {
        alert('No location data available for the other person.');
    }
};
document.body.appendChild(button); 

socket.on("UserDisconnected",(id)=>{
    if(marker[id]){
        map.removeLayer(marker[id]);
        delete marker[id];
    }
})