// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var BLACK=0;
var WHITE=1;
var PASS=2;

app.use(express.static('public'));

app.get('/', function(request, response) {
  console.log('sending index.html')
  response.sendFile(__dirname + '/index.html');
});

// listen for requests :)
server.listen(process.env.PORT, function() {
  console.log('Your app is listening on its port');
});


var gameData={
  guesses: []
};

var users={};
function broadcastUsers(users) {
  io.emit('list users', users);
}
    var foo=1;
var messages=[];
function broadcastMessages(messages) {
  io.emit('display messages', messages);
}

function broadcastGameData(){
  io.emit('game_update', gameData, users);
}

function gameSetup(){
  for (var key in users) {
    if (users.hasOwnProperty(key)){
        users[key].color = Math.floor( 2*Math.random() )
    }
  }
  broadcastGameData()
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
    gameData.started=true;
    gameSetup()
    console.log( users )
  });

  socket.on('get_game_data', function (callback) {
    broadcastGameData()
  });
  
  socket.on('user_guess', function(user, guess_color) {
    gameData.guesses.push({
      user: users[user.id],
      color: guess_color
    });
    checkGuesses();
  });
  
});

function checkGuesses() {
  // check guesses length
  if (gameData.guesses.length == users.length) {
    gameOver();
  } 
  broadcastGameData();
}

function gameOver() {
  gameData.gameOver = true;
  gameData.won = checkGameWon();
}

function checkGameWon() {
  gameData.correctGuesses=0;
  gameData.passes=0;
  gameData.wrongGuesses=0;
  
  gameData.guesses.forEach(function(guess){
    if (guess.color == guess.user.color) {
      gameData.correctGuesses += 1;
    } else if (guess.color == PASS) {
      gameData.passes += 1;
    } else {
      gameData.wrongGuesses += 1;
    }
  });
  
  if (gameData.wrongGuesses > 0 || gameData.correctGuesses==0) {
    return false;
  } else {
    return true;
  }
  // Easier game:
  // return (gameData.correctGuesses > gameData.wrongGuesses);
}