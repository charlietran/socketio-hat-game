// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static('public'));

app.get('/', function(request, response) {
  console.log('sending index.html')
  response.sendFile(__dirname + '/index.html');
});

// listen for requests :)
app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});


io.on('connection', function (socket) {
  console.log("Somebody connected via Websockets!");
  // Write your code here
});