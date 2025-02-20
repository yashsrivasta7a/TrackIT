const express = require('express');
const app = express();
const path = require('path');

const http = require("http");
const Socket = require('socket.io');
const dotenv = require('dotenv');
const server = http.createServer(app);
const io = Socket(server);

dotenv.config();

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'

let userCounter = 1; // Initialize user counter
const userNames = new Map(); // Map to store user IDs and their names

io.on("connection", function(socket){
    const userName = `User ${userCounter++}`;
    userNames.set(socket.id, userName);

    socket.on("location", function (data){
        io.emit("recivedLocation",{
            id: socket.id,
            deviceName: userNames.get(socket.id),
            ...data
        });
    });

    socket.on("disconnect", function(){
        io.emit("UserDisconnected", socket.id);
        userNames.delete(socket.id);
    });

    console.log("connected"); // Log when a user connects
});

app.get('/', (req, res) => {
    res.render("index"); // Render 'index' from the 'views' directory
});

server.listen(process.env.PORT, () => 
    console.log(`Example app listening on port ${process.env.PORT}!`)
);
