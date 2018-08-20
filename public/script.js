/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// prints "hi" in the browser's dev tools console
console.log('hi');


var socket = io();
var user={};
var users={};
var game_data={};

function updateUserList() {
  var content='';
  for (var key in users) {
    if (users.hasOwnProperty(key)) {
      var cardcontent='';
      var box1content='';
      var box2content='';
      var box3content='';
      var color_class="";
      if(users[key].color==0) {
        color_class='black';
      } else if (users[key].color==1) {
        color_class='white';
      }
      
      if(game_data.started) {
        if (key==user.ID) {
          cardcontent='YOU';
          box1content='guess white';
          box2content='guess black';
          box3content='pass';
          color_class='';
        } else {
          cardcontent=users[key].name;
        }
      } else {
        cardcontent=users[key].name;
      } // if(game_data.started)
      
      
      content+=`
        <li class="user-card ${color_class}" id="user-${users[key].ID}">${cardcontent}</li>
        <li class="user-box user-box-1">${box1content}</li>
        <li class="user-box user-box-2">${box2content}</li>
        <li class="user-box user-box-3">${box3content}</li>`;
    
    } // for (var key in users)

  }
  $('#users').html(content);
}

function updateGameData(d,u){
  console.log('updateGameData');
  console.log(d);
  console.log(u);
  game_data=d;
  users=u;

  
  if (game_data.started){
    $('form#begin-game').hide();
    $('form#message').hide();
    
    updateUserList();
    
    for (var key in users) {
      if (users.hasOwnProperty(key)) {
        var user_color=users[key].color;
        if((users[key].ID != user.ID) && user_color != undefined) {
          if (user_color==0) {
              $(`li#user-${users[key].ID}`).addClass('black');
          } else if (user_color==1) {
              $(`li#user-${users[key].ID}`).addClass('white');
          }
        }
      }
    }

    
  } else {
    $('form#begin-game').show();
    $('form#message').show();
  }
  
  if(!user.ID) {
    $('form#begin-game').hide();
    $('form#message').hide();
  }

}

function getCookieValue(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}

$(function () {
  
  if (getCookieValue("hatgame")==""){
    document.cookie = "hatgame=" + btoa(Math.random()).substr(5,10);
  }
  
  var userID = getCookieValue("hatgame");
  
  socket.emit('user connected', userID, function(u){
    console.log("received users");
    console.log(u);
    users=u;

  });
  
  socket.on('connect', function(){
    socket.emit('get_game_data', function(d,u){

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
      $('form#begin-game').show();
      $('form#message').show();
    }
    
    updateUserList();
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
  
  $('form#begin-game').submit(function(){
    socket.emit('begin game');
    return false;
  });

});