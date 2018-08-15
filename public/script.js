/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// prints "hi" in the browser's dev tools console
console.log('hi');


var socket = io();

$(function () {
  $('form#newUser').submit(function(){
    socket.emit('new user', $('#u').val());
    return false;
  });
  
  $('form#message').submit(function(){
    var msg={};
    msg.text=$('#m').val();
    msg.user=$('#u').val();
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
  
});

