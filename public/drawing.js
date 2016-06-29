var canvas = document.getElementById("canvas");
var serverSocket = io();
var ctx = canvas.getContext('2d');
var mouseDown = false;
var lastMousePosition = null;
var color;
var thickness;
var colorChoice = document.getElementById('color-picker');

colorChoice.addEventListener('change', function (event){
  color = colorChoice.value;
  console.log(color);
});

var thicknessPicker = document.getElementById('thickness-picker');
thicknessPicker.addEventListener('change', function(event){
  thickness=thicknessPicker.value;
  console.log(thickness);
});

var eraser = document.getElementById('Eraser');
eraser.addEventListener('click', function (){
  color = "white";
  thickness = 40;
});

var reset = document.getElementById("reset");


reset.addEventListener('click', function (){
  // ctx.fillStyle = 'white';
  // ctx.fillRect(0, 0, 500, 500);
  console.log("outside");
  serverSocket.emit('server-reset', function(){
    console.log("Insideeeeee");
  });
});


serverSocket.on('client-reset', function(){
  console.log("I am client reset");
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 500, 500);
});

canvas.addEventListener('mousedown', function(event) {
  mouseDown= true;
});

canvas.addEventListener('mouseup', function(event) {
  mouseDown= false;
  lastMousePosition = null;
});


serverSocket.on('client-drawing', function({
  mousePosition: mousePosition, lastMousePosition: lastMousePosition,
  color: color,
  thickness: thickness}) {
    ctx.strokeStyle = color;
    ctx.lineJoin = 'round';
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(lastMousePosition.X, lastMousePosition.Y);
    ctx.lineTo(mousePosition.X, mousePosition.Y);
    ctx.closePath();
    ctx.stroke();

  });

  canvas.addEventListener('mousemove', function(event) {
    if (mouseDown ===true) {
      var magicBrushX= event.clientX + canvas.offsetLeft;
      console.log("X postion: ", magicBrushX);
      var magicBrushY = event.clientY + canvas.offsetTop;
      console.log("Y postion: ", magicBrushY);

      var mousePosition = {
        X: magicBrushX,
        Y: magicBrushY
      };


      if (lastMousePosition!== null) {
        console.log(color);
        ctx.strokeStyle = color;
        ctx.lineJoin = 'round';
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(lastMousePosition.X, lastMousePosition.Y);
        ctx.lineTo(mousePosition.X, mousePosition.Y);
        ctx.closePath();
        ctx.stroke();
      }

      console.log("lastMousePosition is " , lastMousePosition);
      console.log("This is mousePosition ", mousePosition);
      serverSocket.emit('server-drawing', {
        mousePosition: mousePosition, lastMousePosition: lastMousePosition,
        color: color,
        thickness: thickness}
      );
      lastMousePosition = mousePosition;
    }
  });

  // This is all the functionality for the chat, username included
  var username = prompt('Username:');

  var isTyping = false;
  var lastIsTyping = false;
  $('#m').keypress(function() {
    isTyping = true;
    setTimeout(function() {
      isTyping = false;
    }, 1000);
  });

  setInterval(function() {
    if (lastIsTyping !== isTyping) {
      if (isTyping) {
        serverSocket.emit('start-type', username);
      } else {
        serverSocket.emit('end-type', username);
      }
    }
    lastIsTyping = isTyping;
  }, 250);


  var start = document.getElementById('Start');
  start.addEventListener('click', function (){
    var secretWord = prompt('Enter your secret word');
    console.log(secretWord);
    serverSocket.emit('clientSecretWord', secretWord);


  });




  serverSocket.emit('client-join', username);
  $('form').submit(function(){
    var message = $('#m').val();
    var html =
    '<span class="handle">' + username + '</span> ' + message;
    $('#messages').append($('<li>').html(html));
    serverSocket.emit('message-to-server', {
      username: username,
      message: message,
    });
    $('#m').val('');
    return false;
  });
  serverSocket.on('Winner', function() {
    console.log("there was a winner");
    io.emit(alert('Game Over!!'));
  });



  serverSocket.on('message-to-client', function(msg){
    var message =
    '<span class="handle">' + msg.username + '</span> ' + msg.message;
    $('#messages').append($('<li>').html(message));

  });
  serverSocket.on('join', function(username) {
    $('#messages').append($('<li class="join">')
    .text(username + ' has joined.'));
  });
  serverSocket.on('leave', function(username) {
    $('#messages').append($('<li class="leave">')
    .text(username + ' has left.'));
  });
  $('#typing-indicator').hide();
  serverSocket.on('start-type', function(username) {
    $('#typing-indicator .username').text(username);
    $('#typing-indicator').show();
  });
  serverSocket.on('end-type', function(username) {
    $('#typing-indicator').hide();
  });
