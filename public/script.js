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
            var guess_index = Object.keys(game_data.guesses).find(k => game_data.guesses[k].user.ID === key)
            var guess_color = '';
            var guess_text = ''
            if (game_data.guesses[guess_index].color == 0) {
              guess_color = 'black';
              guess_text = 'guessed black';
            } else if (game_data.guesses[guess_index].color == 1) {
              guess_color = 'white';
              guess_text = 'guessed white';
            } else {
              guess_color = 'pass';
              guess_text = 'passed';
            }
            console.log('user guessed')
            box1html=`<li class="user-box user-box-1 guess-${guess_color} inactive">${guess_text}</li>`
          } else {
            box1html='<li class="user-box user-box-1 guess-white">guess white</li>';
            box2html='<li class="user-box user-box-2 guess-black">guess black</li>';
            box3html='<li class="user-box user-box-3 guess-pass">pass</li>';
          }
          color_class='';
        }
      }
      
      if(game_data.gameOver) {
        if (key==currUser.ID) {
          cardcontent='YOU';
        }
        var guess_index = Object.keys(game_data.guesses).find(k => game_data.guesses[k].user.ID === key)
        var guess_color = '';
        var guess_text = ''

        if (game_data.guesses[guess_index].color == 0) {
          guess_color = 'black';
          guess_text = 'guessed black';
        } else if (game_data.guesses[guess_index].color == 1) {
          guess_color = 'white';
          guess_text = 'guessed white';
        } else {
          guess_color = 'pass';
          guess_text = 'passed';
        }
        box1html=`<li class="user-box user-box-1 guess-${guess_color} inactive">${guess_text}</li>`
        var guessed_correctly= users[key].color == game_data.guesses[guess_index].color;
        var passed = game_data.guesses[guess_index].color == 2;
        
        var guess_result="";
        var guess_class="";
        if (passed) {
          guess_result = "¯\\_(ツ)_/¯";
          guess_class = "pass";
        } else if(guessed_correctly) {
          guess_result = "(｡◕‿◕｡)";
          guess_class = "correct";
        }
        else {
          guess_result = "ლ(｀ー´ლ)";
          guess_class = "wrong";
        }

        box2html=`<li class="user-box user-box-2 inactive guess-result ${guess_class}">${guess_result}</li>`
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
      $('form#reset-game').show();
      if (game_data.won) {
        $('#result h1').html("You all won! :D")
      } else {
        $('#result h1').html("Oh no! You lost :(")
      }
    }    
  } else {
    $('form#reset-game').hide();
    $('form#begin-game').show();
    $('form#message').show();
  }
  
  if(!currUser || !currUser.ID) {
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
  
  $('form#reset-game').submit(function(){
    socket.emit('reset game');
    return false
  });
  
  socket.on('reset game', function() {
    location.reload() 
  });

});