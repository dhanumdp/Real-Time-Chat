
let express = require('express')
let app = express();

let http = require('http');

let server = http.Server(app);

let io = require('socket.io').listen(server);

const port = process.env.PORT || 3000;



server.listen(port, () => {
    console.log(`started on port: ${port}`);
   
});

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }


io.on('connection', (socket) => {

    
    socket.on('join', function(data){

        //joining the room
        socket.join(data.room);
        var time = new Date;
        console.log(data.user + ' joined the group ' + data.room);

        //notifies other people belonging to the room that the new user has joined the same room
       
        socket.broadcast.to(data.room).emit('new user joined',{user : data.user, message : 'has joined this group at '+formatAMPM(time)});
    })


    socket.on('leave', function(data){

        //joining the room
        socket.leave(data.room);
        console.log(data.user + ' left the group ' + data.room);

        //notifies other people belonging to the room that the new user has joined the same room
        var time = new Date;
        socket.broadcast.to(data.room).emit('left the group',{user : data.user, message :'has left this group at '+formatAMPM(time) });
    })

    socket.on('message', function(data){
        var time = new Date;
        io.in(data.room).emit('new message', {user : data.user, message: data.message+' '+formatAMPM(time)})
    })
});