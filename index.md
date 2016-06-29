# Draw Together

You will build a collaborative drawing app where multiple people on different devices can draw on the same canvas at the same time.

## Setup

Set up an Express + Socket.IO app.

1. make a directory for your app, and cd into it in your terminal.
2. use `npm init` to create a package.json file.
3. Install express and socket.io. Use the `--save` option for npm install so it goes into the dependencies section of your package.json file.
4. Create a server.js file, in it set up express and socket.io to work together. It is a 5 step process:
  0. var express = require('express');
  1. var app = express();
  2. var http = require('http').Server(app);
  3. var io = require('socket.io')(http);
  4. http.listen(8000, function() {
       console.log('Listening on 8000');
     });
5. Create a public directory where you'll put your HTML files and JS files, and serve it up using express.static: app.use(express.static('public'));
6. Create an index.html in the public directory. Put a `<canvas>` element in it, make sure you give it a specific height and width.
7. You have the option of using jQuery to make some of the DOM manipulation work easier. If you choose to do so, download jquery.js and put it in the public folder.
8. Create a draw-together.js file in the public directory and use a script tag in the index.html file to link to it. You now have a project where there is both client-side JS and server-side JS, it's important to keep them separate.
9. Run your server.js: node-dev server.js and see that it serves up your index.html on http://localhost:8000

## Add Drawing Capabilities

Allow the user to draw on the canvas. To do this, you will use a variable to store the state of whether or not the user is currently holding his mouse down. The variable might be called mouseDown, and can take the values of true or false, and it's value is updated when the events mouseup and mousedown occur on the canvas element. When the mouse moves, you will draw on the canvas whenever if mouseDown is true.

1. Make a canvas variable and set it to the canvas element on the page - you can use document.getElementById() to fetch the canvas element.
2. Create a ctx variable and set it to the drawing context of the canvas - via canvas.getContext('2d')
3. Create a mouseDown variable, and initalize it to false
4. Register a mousedown event listener for the canvas. You can use jQuery's `$(canvas).mousedown(function() {...})` or `canvas.addEventListener('mousedown', function(event) { ... })`. When the mousedown event occurs, set mouseDown to true.
5. Register a mouseup event listener for the canvas. When the mouseup event occurs, set mouseDown to false.
6. Register a mousemove event listener for the canvas. If mouseDown is true, draw a dot on the canvas at the location of the mouse.
  * the location of the mouse can be gotten via event.clientX and event.clientY where event is the 1st parameter of the event handler.
  * you will need to offset the mouse location by the top and left offsets of the canvas position, which can be gotten by canvas.offsetLeft, and canvas.offsetTop.
  * to draw a dot on the canvas, you need to use the ellipse() method of the drawing context. You will first call ctx.beginPath(), then call ctx.ellipse(...), then call ctx.fill(). See the docs: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/ellipse
7. Now, when you drag the mouse across the canvas, it should leave a trail of dots. It's not pretty, but we'll fix that later.

## Collaborative Drawing

You will now make this drawing canvas remote-simultanous editable.

1. Setup the socket.io client-side JavaScript file if you haven't already. `<script src="/socket.io/socket.io.js"></script>`. Btw, if you are wondering where this file is, it's stored inside the socket.io module in the node_modules folder. It magically appears under this URL because of the way we have setup socket.io with our web server.
2. Create a socket by simply calling the io function: var socket = io()
3. On the server-side (server.js), you'll set up a connection event handler (triggered when a socket.io client connects to the server) for socket.io. io.on('connection', function(socket) { ... }). Print out a message when a client connects.
4. When a dot is drawn on the canvas, send a message to the server using socket.emit(). socket.emit takes 2 parameters: the message name, and the message body. You can pick a message name, but I'll call it "draw". The message body needs to be an object and should contain the x and y coordinates of the location where a dot was draw.
5. In your server side (server.js), set up socket.io to relay that "draw" message to other clients using socket.broadcast.emit("draw", ...).
6. In your client-side, set up a event handler for the "draw" message, and draw a dot on the canvas based on the location that's transmitted.
7. You should now have a collaborative drawing app. Try opening 2 browsers and drawing on either one. Better yet, try connecting to the server from 2 different computers.

## Improve Drawing

Now you will improve the drawing experience by making it it draw connected lines instead of disconnected dots. To do this, you will need to draw line segments as you go instead of drawing dots as you go. This also changes the message body you send over to other clients because you will send over the information required to represent a line segment - two points, as opposed to just one point. Also, you will need to remember the last point where the mouse moved, vs where it is now, in order to draw a line between the two points.

1. In the client-side, create a variable called lastMousePosition.
2. In the mousemove event handler, perform this refactoring step: consolidate the x and y positions you were using to draw the dot into an object, and store it in a variable, say mousePosition.
3. In the last part of the mousemove event handler, save the value of mousePosition into lastMousePosition.
4. For the drawing code, replace the logic for drawing the dot with the logic for drawing a line segment. You will use this:
    ctx.strokeStyle = 'yellow'; // or some color
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(lastMousePosition.x, lastMousePosition.y);
    ctx.lineTo(mousePosition.x, mousePosition.y);
    ctx.closePath();
    ctx.stroke();

  You will only draw if lastMousePosition exists.
5. Drawing on the canvas now should yield smooth lines. But collaborative drawing is now broken - it doesn't yield smooth lines on other connected clients.

## Update Collaborative Drawing

We now want to update collaborative drawing so that line segments are draw on all clients simultaneously

1. Client-side: update the body of the "draw" message to contain two points, not just one. For example, the message body might now look like: { point1: { x: 124, y: 111 }, point2: { x: 312, y: 189 } }
2. Client-side: update the event handler for the "draw" message to draw line segments as well, not dots.

## Changing Colors

Add the ability to change colors. You have 2 options:

1. Make a group of buttons. Each button selects a specific color. Register a click event handler for each color button, to change the color. Color can be stored as a global variable.
2. Create a color input: <input type="color" id="color-picker">. Register a change event handler for the color picker and you can access its value property to get the currently selected color.

## Changing pen thickness

Add the ability to change thickness of the pen.

1. Make a group of buttons for different thicknesses.
2. Make a number input: <input type="number"> and let the user select a line thickness.

## Eraser

Add the ability to erase (just use a white stroke).

## Reset Canvas

Add a "reset" button which clears the canvas when clicked (for all participants). You may use fillRect(x, y, width, height) to draw white over the entire canvas.

## Challenge: Restoring drawings

Add the ability to restore the previous state of the drawing for new comers to the drawing. Meaning: historical strokes should restore for any new user coming to the drawing.
