const mongoose = require('mongoose');
//const io = require('socket.io').listen(3000).sockets;
mongoose.connect('mongodb://127.0.0.1/AngularChat', { useUnifiedTopology: true ,   useNewUrlParser: true  }, (err,db)=>{
    if(err)
    {
        console.log(err);
    }
    else
    {
        console.log("Db Connected");
    }
})
let express = require('express')

const app = express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Request-With, x-access-token, x-refresh-token, Content-Type, Accept, _id");
    res.header("Access-Control-Expose-Headers", "x-access-token, x-refresh-token");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});




let http = require('http');

let server = http.Server(app);

let io = require('socket.io').listen(server);

const port = process.env.PORT || 3000;




server.listen(port, () => {
    console.log(`started on port: ${port}`);
   
});

//For getting time in 12 Hrs Format
function formatAMPM(date) {
    
    var dd = date.getDate();

var mm = date.getMonth()+1; 
var yyyy = date.getFullYear();
if(dd<10) 
{
    dd='0'+dd;
} 

if(mm<10) 
{
    mm='0'+mm;
} 
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = dd+'/'+mm+'/'+yyyy+' '+hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }


io.on('connection', (socket) => {

  
 //for getting messages from database

 app.get('/:grp',function(req,res){

   // console.log(req.body.grp);
   var grp = req.params.grp;
    var collection=mongoose.connection.db.collection(grp);
    collection.find({}).toArray((err,docs)=>{
        if(err) console.log("Error in Retrieving Data");
        else 
        {
            
            res.send(docs);
        }
    })
})


   
    
    //For Joining the Room
    socket.on('join', function(data){
        //joining the room
        socket.join(data.room);
        console.log(data.user + ' joined the group ' + data.room);
       var time = new Date;
        //notifies other people belonging to the room that the new user has joined the same room
        socket.broadcast.to(data.room).emit('new user joined',{user : data.user, message : 'has joined this group at '+formatAMPM(time)});        
    })

   //For Sending Notification After Joining the Room 
    // socket.on('notifyUserAfterJoining', function(data){
    //     var time = new Date;
    //     socket.emit('joined grp',{message : 'You Joined '+data.room+' at '+formatAMPM(time)+'.'});
    // })
    //For Leaving the room
    socket.on('leave', function(data){

        //joining the room
        socket.leave(data.room);
        console.log(data.user + ' left the group ' + data.room);

        //notifies other people belonging to the room that the new user has joined the same room
        var time = new Date;
        socket.broadcast.to(data.room).emit('left the group',{user : data.user, message :'has left this group at '+formatAMPM(time) });
    })


    //For Sending Notification After Leaving the Room 
    // socket.on('notifyUserAfterLeaving', function(data){
    //     var time = new Date;
    //     socket.emit('left grp',{message:'You Left'+data.room+' at '+formatAMPM(time)+'.'});
    // })



    //For Sending Message

    socket.on('message', function(data){
        var time = new Date;
        io.in(data.room).emit('new message', {user : '['+formatAMPM(time)+'] '+data.user, message: data.message})

        var collection = mongoose.connection.db.collection(data.room);
        let msg = {
                user : data.user,
                msg : data.message,
                sentTime: formatAMPM(time)
        }
        collection.insertOne( msg, (err,docs)=>
        {
            if(err)
            {
                console.log("Error in Storing Data");
            }
            else
            {
                console.log("Message saved to db");
            }
        }

        )

    })

});