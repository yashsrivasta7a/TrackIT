const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

const http = require("http");
const Socket = require('socket.io');
const server = http.createServer(app);
const io = Socket(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'

io.on("connection", function(socket){
    socket.on("location", function (data){
        io.emit("recivedLocation",{
            id:socket.id,
            ...data
        })
    })
    socket.on("disconnect",function(){
        io.emit("UserDisconnected",socket.id)
    })
    console.log("connected"); // Log when a user connects
});

app.get('/', (req, res) => {
    res.render("index"); // Render 'index' from the 'views' directory
});

server.listen(port, () => 
    console.log(`Example app listening on port ${port}!`)
);

