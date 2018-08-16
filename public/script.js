/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// prints "hi" in the browser's dev tools console
console.log('hi');


var socket = io();
var username = '';

$(function () {
  $('form#newUser').submit(function(){
    username = $('#u').val();
    socket.emit('new user', username);
    $('form#newUser').hide();
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
    $('#messages').hide()
    $('form#message').hide()
  });
  
  $('form#beginGame').submit(function(){
    socket.emit('begin game');
  });
  
});

