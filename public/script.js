/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// prints "hi" in the browser's dev tools console
console.log('hi');


var socket = io();
var username = '';

$(function () {

  if (document.cookie == ''){
    document.cookie = btoa(Math.random()).substr(5,10);
  }
  var userID = document.cookie
  socket.emit('user connected', userID);
  
  $('form#new-user').submit(function(){
    username = $('#u').val();
    socket.emit('new user', username);
    $('form#new-user').hide();
    return false;
  });
  
  $('form#message').submit(function(){
    var msg={};
    msg.text=$('#m').val();
    msg.user=username;
    socket.emit('chat message', msg);
    $('#m').val('');
    return false;
  });
  
  socket.on('display message', function(msg){
      var display=msg.user + ': ' + msg.text;
      $('#messages').
        append($('<li>').
        text(display));
    });
  
  socket.on('list users', function(users){
    var content='';
    users.forEach(function(user) {
      content+='<li>'+user+'</li>';
    })
    $('#users').html(content);
  });
  
  socket.on('begin game', function(){
    $('#messages').hide();
    $('form#message').hide();
    $('form#begin-game').hide();
  });
  
  $('form#begin-game').submit(function(){
    socket.emit('begin game');
    return false;
  });
  
});

