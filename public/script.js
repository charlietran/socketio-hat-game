/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// prints "hi" in the browser's dev tools console
console.log('hi');


var socket = io();
var user={};
var users=[];
var game_data={};

function updateGameData(d,u){
  game_data=d;
  users=u;
  
  if (game_data.started){
    $('form#begin-game').hide();
  } else {

  }
}

$(function () {

  $('#message_container').hide();
  $('form#begin-game').hide();
  
  if (document.cookie == ''){
    document.cookie = btoa(Math.random()).substr(5,10);
  }
  var userID = document.cookie
  
  socket.emit('user connected', userID, function(u){
    console.log("received users");
    console.log(u);
    users=u;
    
    if (users[userID]) {
      $('#message_container').show();
      $('form#begin-game').show();
    }
  });
  
  socket.on('connect', function(){
    socket.emit('get_game_data', function(d,u){
      updateGameData(d,u);
    });
  });
  
  socket.on('game_update', function(d,u){
    updateGameData(d,u);
  });
  
  
  socket.on('list users', function(u){
    users=u;
    
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
        console.log(message);
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