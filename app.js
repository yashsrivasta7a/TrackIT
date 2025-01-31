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

server.listen(process.env.PORT, () => 
    console.log(`Example app listening on port ${process.env.PORT}!`)
);
