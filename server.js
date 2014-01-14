var http = require('http');
var Static = require('node-static');
var WebSocketServer = new require('ws');

var clients = {};
var room=[];
var matrix=[];


var fileServer = new Static.Server('.');
http.createServer(function (req, res) {
  
  fileServer.serve(req, res);

}).listen(80);
console.log("Сервер запущен на портах 80,8081");

var webSocketServer = new WebSocketServer.Server({port: 8081});
webSocketServer.on('connection', function(ws) {

    var id = Math.random();   
    clients[id] = ws;

  ws.on('message', function(msg) {
      var message = JSON.parse(msg);
      
      if(message.type=='player'){           
            clients[id].username=message.name;
//            console.log("новое соединение " + id);
            var playerlist={};
            playerlist.type='playerlist';
            for(var key in clients) { 
                Array.prototype.push.call(playerlist,clients[key].username); 
            }
            for(var j in clients){
                clients[j].send(JSON.stringify(playerlist));
            }                       
            console.log("новый игрок " + ws.username);
      }
      if(message.type=='message'){   
            console.log('получено сообщение от '+message.sender.name+': ' + message.text);          
            for(var key in clients) 
                clients[key].send(msg);
        }
      if(message.type=='ready'){
            console.log(message.sender.name+' готов!');
            for(var j in clients){
                if(clients[j].username==message.sender.name){
                    message.sender.id=j;
                    room.push(message.sender);
                }   
            } 
            if(room.length==2)
                startGame(room);
        }
       if(message.type=='shot'){
            var backfire={};
           backfire.type = 'backfire';
           backfire.shot = message;
            var index=0;
            if(room[0].name==message.sender.name)
                   index=1;
            if(matrix[index][message.x][message.y]){
                        console.log(message.sender.name+' popal');
                        backfire.success=true;
           }
            else {
                        backfire.success=false;
                        console.log(message.sender.name+' ne popal');
            }
           clients[room[Number(!index)].id].send(JSON.stringify(backfire));
        }
  });

  ws.on('close', function() {
    console.log('соединение закрыто ' + id);
    delete clients[id]; 
      
    for(var j in room){
        if(room[j].id==id){
            console.log('игра прекращена');
            room=[];
            matrix=[];
            break;
        }
    }
      
    var playerlist={};
    playerlist.type='playerlist';  
    for(var key in clients)  
        Array.prototype.push.call(playerlist,clients[key].username); 
    for(var j in clients)              
        clients[j].send(JSON.stringify(playerlist));
  });
});

function startGame(room) {
            matrix.push(createField(room[0].id));
            var opp1={'type':'opponent','name':room[1].name};
            clients[room[0].id].send(JSON.stringify(opp1));
            matrix.push(createField(room[1].id));
            var opp2={'type':'opponent','name':room[0].name};
            clients[room[1].id].send(JSON.stringify(opp2));
            console.log('игра началась!!! '+room[0].name+' vs '+room[1].name);
}
function createField(id) {
            var xy=[[],[],[],[],[],[],[],[],[],[],[],[],[]];
            xy.push({'type':'field'});
                
            createQuadroDeck();
            createTripleDeck();
            createDoubleDeck();
            createOneDeck();                         
      
            function margin(){            
                xy[x][y-1]=xy[x][y+1]=xy[x-1][y-1]=xy[x-1][y]=
                xy[x-1][y+1]=xy[x+1][y]=xy[x+1][y+1]=xy[x+1][y-1]=0;
                xy[x][y]=1;  
                var n=y*10+(x-1);
            }
            function addDeck(vector) {
                switch (vector) {
                    case 3: x=x-1; xy[x][y-1]=xy[x][y+1]=xy[x-1][y-1]=xy[x-1][y]=
                    xy[x-1][y+1]=xy[x+1][y+1]=xy[x+1][y-1]=0; break;
                    case 4: y=y-1; xy[x][y-1]=xy[x-1][y-1]=xy[x-1][y]=
                    xy[x-1][y+1]=xy[x+1][y]=xy[x+1][y+1]=xy[x+1][y-1]=0; break;
                    case 1: y=y+1; xy[x][y+1]=xy[x-1][y-1]=xy[x-1][y]=
                    xy[x-1][y+1]=xy[x+1][y]=xy[x+1][y+1]=xy[x+1][y-1]=0;break;            
                    case 0: x=x+1; xy[x][y-1]=xy[x][y+1]=xy[x-1][y-1]=
                    xy[x-1][y+1]=xy[x+1][y]=xy[x+1][y+1]=xy[x+1][y-1]=0;break;
                    }                
                var n=y*10+(x-1);
                xy[x][y]=1; 
            }
            function createOneDeck(){
                var k=1;
                while(k<=4){
                x=Math.floor(Math.random()*10+1);
                y=Math.floor(Math.random()*10);
                if(xy[x][y]==undefined){                   
                margin();
                k++;
            }}}
            function createDoubleDeck(){
                var k=1;
                while(k<=3){                
                x=Math.floor(Math.random()*10+1);
                y=Math.floor(Math.random()*10);
                var vector=Math.floor(Math.random()*2);
                if(x==10) {
                    if(xy[x-1][y]==undefined)
                        vector=3;
                    else x=Math.floor(Math.random()*10+1);
                }
                if(y==9) {
                    if(xy[x][y-1]==undefined)
                        vector=4;
                    else y=Math.floor(Math.random()*10);
                }
                if(xy[x][y]==undefined){
                    if(xy[x][y+1]==undefined&&xy[x+1][y]==undefined){
                        margin();
                        addDeck(vector);
                        k++;
                }}}}              
            function createTripleDeck(){
                var k=1;
                while(k<=2){                
                x=Math.floor(Math.random()*10+1);
                y=Math.floor(Math.random()*10);
                var vector=Math.floor(Math.random()*2);
                if(x>=9) {
                    if(xy[x-1][y]==undefined&&xy[x-2][y]==undefined)
                        vector=3;
                    else x=Math.floor(Math.random()*10+1);
                }
                if(y>=8) {
                    if(xy[x][y-1]==undefined&&xy[x][y-2]==undefined)
                        vector=4;
                    else y=Math.floor(Math.random()*10);
                }
                if(xy[x][y]==undefined){
                    if(xy[x][y+1]==undefined&&xy[x+1][y]==undefined&&xy[x][y+2]==undefined&&xy[x+2][y]==undefined){
                        margin();
                        addDeck(vector);
                        addDeck(vector);                 
                k++;   
                }}}} 
            function createQuadroDeck(){                              
                x=Math.floor(Math.random()*10+1);
                y=Math.floor(Math.random()*10);
                var vector=Math.floor(Math.random()*2);
                if(x>=8) {
                        if(xy[x-1][y]==undefined&&xy[x-2][y]==undefined&&xy[x-3][y]==undefined)
                        vector=3;
                        else x=Math.floor(Math.random()*10+1);
                }
                if(y>=7) {
                        if(xy[x][y-1]==undefined&&xy[x][y-2]==undefined&&xy[x][y-3]==undefined)
                        vector=4;
                        else y=Math.floor(Math.random()*10);
                }
                if(xy[x][y]==undefined){
                    if(xy[x][y+1]==undefined&&xy[x+1][y]==undefined&&xy[x][y+2]==undefined&&xy[x+2][y]==undefined){
                        margin(); 
                        addDeck(vector);
                        addDeck(vector);
                        addDeck(vector);                
                }}} 
    clients[id].send(JSON.stringify(xy));
    return xy;
}