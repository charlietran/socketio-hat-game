// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static('public'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log("Somebody connected via Websockets!");
  // Write your code here
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
