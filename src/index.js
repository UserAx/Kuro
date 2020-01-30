const express = require('express');
const socketio = require('socket.io');
const app = express();
const http = require('http');
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const io = socketio(server);
const path = require('path');
const Filter = require('bad-words');
const {generateMessage} = require('./utils/message');
const {generateLocation} = require('./utils/location');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');

const publicDirectory = path.join(__dirname, '../public');
app.use(express.static(publicDirectory));

server.listen(port, () => {
    console.log("Server is on.");
});

io.on('connection', (socket)=>{
    
    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({id:socket.id, username, room});
        if(error){
            return callback(error);
        }
        socket.join(user.room);
        socket.emit('message', generateMessage("Admin", 'Welcome!'));
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.username} has joined!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();
        if(filter.isProfane(message)){
            return callback('Foul words not allowed.');
        }
        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback();
    });

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        if(!coords.latitude || !coords.longitude){
            return callback("Unable to send location");
        }
        io.to(user.room).emit('locationMessage', generateLocation(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
    });
    
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left.`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    });
});