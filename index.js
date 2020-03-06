var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var usernames = {};
var name;

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
    /*if(name) {
        res.sendFile(__dirname + '/index.html');
    }
    else {
        res.redirect('setName');
    }*/
});

app.get('/setName', function(req,res) {
    res.sendFile(__dirname + '/setName.html');
});

app.post('/setNamePost', function(req, res) {
    name = req.body.username;
    usernames.push(name);
    res.redirect('/');
});

io.on('connection', function(socket) {
    //console.log('a user has connected');

    socket.emit('name request', usernames);
    socket.on('name response', function(name) {
        usernames[socket.id] = name;
        //console.log('newname\n',usernames);
    });

    socket.on('client chat message', function(dict) {
        let msg = dict['message'];
        let senderName = dict['senderName'];
        io.emit('backend chat message',senderName + ": " + msg);
    });

    socket.on('disconnect', function() {
        //console.log('a user has disconnected');
        nameRemoved = usernames[socket.id];
        delete usernames[socket.id];
        io.emit('backend disconnect',nameRemoved + ' has disconnected');
        //console.log('disconnect\n',usernames);
    });

    socket.on('currently typing', function(name) {
        //console.log('currently typing ', usernames[socket.id]);
        //io.emit('typing response',usernames[socket.id] + ' is typing');
        //socket.broadcast.emit('typing response',usernames[socket.id] + ' is typing');
        socket.broadcast.emit('typing response',name);
    });
    socket.on('stopped typing', function(name) {
        //io.emit('stopped typing response',name);
        socket.broadcast.emit('stopped typing response',name);
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});


///// TODO TODO TODO TODO TODO
// show who is online
// make certain names not allowed
// make name a requirement (can't press 'cancel')
// send message to everyone when someone enters the chatroom