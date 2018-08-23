var socket = io();
var currUser={};
var users={};
var game_data={};

function updateUserList() {
  var content='';
  for (var key in users) {
    if (users.hasOwnProperty(key)) {
      var cardcontent=users[key].name;
      var box1html='<li class="user-box user-box-1"></li>';
      var box2html='<li class="user-box user-box-2"></li>';
      var box3html='<li class="user-box user-box-3"></li>';
      var color_class="";
      if(users[key].color==0) {
        color_class='black';
      } else if (users[key].color==1) {
        color_class='white';
      }
      
      if(game_data.started) {
        if (key==currUser.ID) {
          cardcontent='YOU';
          if (currUser.guessed) {
            Object.keys(game_data.guesses).find(k => game_data.guesses[k].user.ID === {key
            console.log('user guessed')
            box1html=`<li class="user-box user-box-1 guess-
                      ${game_data.guesses[key].color}>
                      you guessed ${game_data.guesses[key].color}!</li>`
          } else {
            box1html='<li class="user-box user-box-1 guess-white">guess white</li>';
            box2html='<li class="user-box user-box-2 guess-black">guess black</li>';
            box3html='<li class="user-box user-box-3 guess-pass">pass</li>';
          }
          color_class='';
        }
      }
      
      
      content+=`
        <li class="user-card ${color_class}" id="user-${users[key].ID}">${cardcontent}</li>${box1html}${box2html}${box3html}`;
    
    } // for (var key in users)

  }
  $('#users').html(content);
  
  $('.guess-white').click(function(){
    makeGuess(currUser, 1)
    console.log('guessed white')
  });
  
  $('.guess-black').click(function(){
    makeGuess(currUser, 0)
    console.log('guessed black')
  });
  
  $('.guess-pass').click(function(){
    makeGuess(currUser, 2)
    console.log('passed')
  });
  
}

function makeGuess(user, color) {
//  $('.user-box').html('')
  socket.emit('user_guess', user, color);
}

function updateGameData(d,u){
  console.log('updateGameData');
  console.log(d);
  console.log(u);
  game_data=d;
  users=u;
  if (currUser.ID) {
    currUser = users[currUser.ID]
  }
  
  if (game_data.started){
    $('form#begin-game').hide();
    $('form#message').hide();
    
    updateUserList();
    
    for (var key in users) {
      if (users.hasOwnProperty(key)) {
        var user_color=users[key].color;
        if((users[key].ID != currUser.ID) && user_color != undefined) {
          if (user_color==0) {
              $(`li#user-${users[key].ID}`).addClass('black');
          } else if (user_color==1) {
              $(`li#user-${users[key].ID}`).addClass('white');
          }
        }
      }
    }

    if (game_data.gameOver) {
      if (game_data.won) {
        $('#result h1').html("You all won! :D")
      } else {
        $('#result h1').html("Oh no! You lost :(")
      }
    }    
  } else {
    $('form#begin-game').show();
    $('form#message').show();
  }
  
  if(!currUser.ID) {
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
      currUser = users[userID];
      $('form#new-user').hide();
      $('form#begin-game').show();
      $('form#message').show();
    }
    
    updateUserList();
  });
  
  $('form#new-user').submit(function(){
    currUser.name = $('#u').val();
    socket.emit('new user', currUser.name);
    return false;
  });
  
  $('form#message').submit(function(){
    var msg={};
    msg.text=$('#m').val();
    msg.user=currUser.name;
    socket.emit('new message', msg);
    $('#m').val('');
    return false;
  });
  
  socket.on('display messages', function(messages){
      var content='';
      
      messages.forEach(function(message){
        content+= '<li class="message-user">' +
                  message.user.name +
                  '</li><li class="message-text">' + 
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