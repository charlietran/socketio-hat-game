/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// prints "hi" in the browser's dev tools console
console.log('hi');


var socket = io();
var user={};
var users=[];
var game_data={};

function updateGameData(d){
  game_data=d;
  d.users=
  
  if (game_data.started){
    $('form#begin-game').hide();
  } else {
    $('form#begin-game').show();
  }
}
$(function () {

  if (document.cookie == ''){
    document.cookie = btoa(Math.random()).substr(5,10);
  }
  var userID = document.cookie
  socket.emit('user connected', userID);

  socket.on('connect', function(){
    socket.emit('get_game_data', function(d){
      updateGameData(d);
    });
  });
  
  socket.on('game_update', function(d){
    updateGameData(d);
  });
  
  
  socket.on('list users', function(users){
    console.log(users);
    if (users[userID]) {
      user = users[userID];
      $('form#new-user').hide();
    }
    
    var content='';
    for (var key in users) {
      if (users.hasOwnProperty(key)) {
             content+='<li>'+users[key].name+'</li>'; 
      }
    }
    $('#users').html(content);
  });
  
  $('form#new-user').submit(function(){
    user.name = $('#u').val();
    socket.emit('new user', user.name);
    return false;
  });
  
  $('form#message').submit(function(){
    var msg={};
    msg.text=$('#m').val();
    msg.user=user.name;
    socket.emit('new message', msg);
    $('#m').val('');
    return false;
  });
  
  socket.on('display messages', function(messages){
      var content='';
      messages.forEach(function(message){
        content+= '<li>' +
                  message.user.name +
                  ': ' + 
                  message.text +
                  '</li>'; 
      });

      $('#messages').html(content);
    });
  
  socket.on('begin game', function(){
    $('#m').hide();
    $('form#message').hide();
    $('form#begin-game').hide();
  });
  
  $('form#begin-game').submit(function(){
    socket.emit('begin game');
    return false;
  });
  
});