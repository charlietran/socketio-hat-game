// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.use(express.static('public'));

app.get('/', function(request, response) {
  console.log('sending index.html')
  response.sendFile(__dirname + '/index.html');
});

// listen for requests :)
server.listen(process.env.PORT, function() {
  //console.log('Your app is listening on port ' + listener.address().port);
});


io.on('connection', function (socket) {
  console.log("Somebody connected via Websockets!");
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
});