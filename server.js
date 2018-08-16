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


var game_data={
  started :false,
  assignments : {}
};

var users={};
function broadcastUsers(users) {
  io.emit('list users', users);
}

var messages=[];
function broadcastMessages(messages) {
  io.emit('display messages', messages);
}

function gameSetup(){
  for (var key in users) {
    if (users.hasOwnProperty(key)){
      if (!(key in game_data.assignments)){
        game_data.assignments[key] = Math.floor( 2*Math.random() )
      }
    }
  }
}

io.on('connection', function (socket) {

  socket.on('user connected', function(userID, callback){
    console.log('userID: ', userID);
    socket.userID=userID;
    callback(users);
  });
  
  broadcastUsers(users);
  broadcastMessages(messages);
  
  socket.on('new user', function(username){
    console.log('new user: ' + username);
    var user = {
      'ID'   : socket.userID, 
      'name' : username
    };

    users[user.ID]=user;
    io.emit('user joined', user);
    broadcastUsers(users);
  });
  
  socket.on('new message', function(msg){
    messages.push({
      user: users[socket.userID],
      text: msg.text
    });
    broadcastMessages(messages);
  });

  socket.on('begin game', function(){
    io.emit('begin game');
    game_data.started=true;
    gameSetup()
    console.log( game_data )
  });

  socket.on('get_game_data', function (callback) {
    callback(game_data,users);
  });
  
});

