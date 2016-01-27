var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var uuid = require('node-uuid');
var Message = require('./message.js');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var port = process.env.port || 1337;
var url = 'mongodb://localhost:27017/chat';

var name_dicts = {};

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile('index.html');
});

MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);

    io.on('connection', function (socket) {
        console.log('a user connected');
        
        socket.on("login", function (msg) {
            var username = msg.username;
            
            if (!username) {
                socket.emit("login_res", { status: 0, info: "The name is empty!" });
            }
            else if (username && name_dicts[username]) {
                socket.emit("login_res", { status: 0, info: "The name has been registered!" });
            } else {
                var key = uuid.v4();
                name_dicts[username] = key;
                socket.username = username;
                
                socket.emit("login_res", { status: 1, info: "OK", key: key, username : username });
                console.log("user login: " + username);
            }
        });
        
        socket.on('load_messages', function (msg) {
            if (auth_check(msg)) {
                Message.getAllMessages(db, function (result) {
                    socket.emit("load_messages", { status: 1, messages: result });
                });
            }
        });
        
        socket.on('disconnect', function () {
            var username = socket.username;
            if (username && name_dicts[username]) {
                delete name_dicts[username];
            }
            console.log('user disconnected: ' + username);
        });
        
        socket.on('chat_message', function (msg) {
            if (auth_check(msg)) {
                var username = msg.username;
                var content = msg.content;
                if (content && content !== "") {
                    var m = new Message(username, content);
                    m.save(db, function () {
                        io.emit('chat_message', m);
                    });
                }
            }
        });

        function auth_check(msg) {
            var username = msg.username;
            var key = msg.key;
            if (username && name_dicts[username] === key) {
                return true;
            }
            return false;
        }
    });
});

http.listen(port, function () {
    console.log('listening on *:3000');
});