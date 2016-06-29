var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var socket = io;
var secertword;
app.use(express.static('public'));


io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on("server-drawing", function({
    mousePosition: mousePosition, lastMousePosition: lastMousePosition,
    color: color,
    thickness: thickness}){
      socket.broadcast.emit("client-drawing",{
        mousePosition: mousePosition, lastMousePosition: lastMousePosition,
        color: color,
        thickness: thickness});
      });
      socket.on('server-reset', function() {
        console.log("I should be resetting");
        io.emit('client-reset');
      });
    });



    // All the functionality for the chat:
    app.get('/', function(req, res){
      res.sendFile(__dirname + '/index.html');
    });

    // connection event is triggered when the io() is called
    // on the client side
    io.on('connection', function(clientSocket){
      console.log('a user connected');

      clientSocket.on('client-join', function(username) {
        clientSocket.username = username;
        clientSocket.broadcast.emit('join', username);
      });
      // disconnect event is triggered when the user closes
      // the browser tab, for example
      clientSocket.on('disconnect', function() {
        io.emit('leave', clientSocket.username);
      });


      clientSocket.on('clientSecretWord', function(clientSecretWord){
        secretword = clientSecretWord;
        console.log(secretword);
      });

      // listen for chat messages
      clientSocket.on('message-to-server', function(msg){
        if (msg.message.indexOf(secretword)!== -1) {
          console.log("winner");
          io.emit("Winner")
        }
        clientSocket.broadcast.emit('message-to-client', msg);
      });

      clientSocket.on('start-type', function(username) {
        clientSocket.broadcast.emit('start-type', username);
      });

      clientSocket.on('end-type', function(username) {
        clientSocket.broadcast.emit('end-type', username);
      });



    });
    // This ends the functionality of the chat


    http.listen(8000, function(){
      console.log('Listening on 8000');
    });
