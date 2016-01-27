var assert = require('assert');

function Message(username, content, time) {
    this.username = username;
    this.content = content;
    this.time = time ? time : new Date();
}

Message.prototype.save = function (db, callback) {
    db.collection('messages').insertOne({
        username : this.username,
        content : this.content,
        time : this.time
    }, function (err, result) {
        assert.equal(err, null);
        console.log("Inserted a document into the messages collection.");
        callback(result);
    });
}

Message.getAllMessages = function (db, callback) {
    db.collection('messages').find().toArray(function (err, result) {
        assert.equal(err, null);
        callback(result);
    });
};

module.exports = Message;
