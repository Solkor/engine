if (!window.WebSocket) {
        location.href='http://google.com/';
	    alert('WebSocket в этом браузере не поддерживается.');
        }
        var login = prompt('Введите ваше имя');
        if(login){
            var socket = new WebSocket("ws://192.168.0.100:8081"); 
        }
        else {
            alert('Неправильное имя!');
            location.reload();
        }
        var player = {};
        player.name = login;            
        player.type = 'player';
        
$(document).ready(function() {            
        var field=document.getElementById('field');
        for(var y=1;y<11;y++){
                var tr=document.createElement('tr');
                field.appendChild(tr);
                for(var x=1;x<11;x++){
                    var td=document.createElement('td');
                    tr.appendChild(td);                
                }       
        }
        $('#field').clone().attr('id','field2').appendTo('#game');
        $('#field2 caption').text('Игрок: '+player.name);
        var playerlist=document.getElementById('users');     
        $('#but').one('click',main);

        socket.onopen = function() {
             socket.send(JSON.stringify(player));
        }
            
        var form = document.getElementById('publish');
        form.onsubmit = function() {
            var msg=document.getElementById('msg');
            var outgoingMessage = {};
            outgoingMessage.text=msg.value;
            outgoingMessage.type='message';
            outgoingMessage.sender=player;
            socket.send(JSON.stringify(outgoingMessage));  
            return false;
        };

        socket.onmessage = function(event) {   
            var parsed = JSON.parse(event.data);
            console.log(parsed);
            if(parsed.type=='opponent')
                $('#field caption').text('Соперник: '+parsed.name);
            if(parsed.type=='backfire')
                backfire(parsed);
            if(parsed.type=='playerlist'){
                playerlist.innerHTML='';
                for(var key=0;key<parsed.length;key++){
                    var listElem = document.createElement('div');
                    listElem.appendChild(document.createTextNode(parsed[key]));
                    playerlist.appendChild(listElem);
                }
            }  
            if(parsed.type=='message'){
                showMessage('<span>'+parsed.sender.name+'</span>: '+parsed.text);
            }
            if(parsed[12]){
                $('#field td').one('click',fire);
                for(var y=0;y<11;y++){
                    for(var x=1;x<11;x++){
//                        $('#field2 td').eq(y*10+(x-1)).text(parsed[x][y]); 
                        if(parsed[x][y])
                            $('#field2 td').eq(y*10+(x-1)).addClass('b');              
                    }                
                }
            }
        };

        function showMessage(message) {
            var messageElem = document.createElement('div');
            messageElem.innerHTML=message;  //!!!!
            var chat = document.getElementById('subscribe');
            chat.appendChild(messageElem);
            chat.scrollTop=99999999;
            }            
            });
        
            function main(){
                $('#but').attr('disabled','disabled');
                $('#field td').css('background-color','gray');
                var playerReady={};
                playerReady.sender=player;
                playerReady.type='ready';
                socket.send(JSON.stringify(playerReady));
                
            }
            function fire(){
                var shot = {};
                shot.type = 'shot';
                shot.sender = player;
                var ys=document.getElementsByTagName('tr');
                var xs=this.parentNode.getElementsByTagName('td');
                shot.x = Array.prototype.indexOf.call(xs,this)+1;
                shot.y = Array.prototype.indexOf.call(ys,this.parentNode);
                socket.send(JSON.stringify(shot));
            }
            function backfire(answer){
                var x=answer.shot.x;
                var y=answer.shot.y;
                if(answer.success)
                    $('#field td').eq(y*10+(x-1)).addClass('d');
                else
                    $('#field td').eq(y*10+(x-1)).addClass('m');
            }