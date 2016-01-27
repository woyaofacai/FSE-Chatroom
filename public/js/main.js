var username;
var userkey;
var socket;

$(function () {
    
    $("#main").hide();
    socket = io();

    $('#login_btn').on('click', function () {
        var name = $("#login_name").val();
        if (name === "") {
            showWarning("The user name is empty!");
        } else {
            socket.emit('login', { username: name });
        }
    });

    $("#submit_btn").on('click', function () {
        var content = $('#message_input').val();
        if ($.trim(content) == '') {
            alert("Input can not be empty.");
            return;
        }
        var msg = {
            username: username,
            key: userkey,
            content : content
        };
        
        socket.emit('chat_message', msg);
        $('#message_input').val('');
    });
    
    socket.on("login_res", function (msg) {
        if (msg.status == 1) {
            afterLogin(msg);
        } else {
            showWarning(msg.info);
        }
    });
    
    socket.on('chat_message', function (msg) {
        showReceivedMessage(msg);
    });
    
    socket.on('load_messages', function (msg) {
        var msgs = msg.messages;
        if (msg.status && msgs) {
            for (var i = 0; i < msgs.length; i++) {
                showReceivedMessage(msgs[i]);
            }
        }
    });

    function showReceivedMessage(msg) {
        if (msg.username == username)
            msg.clazz = "sended";
        else
            msg.clazz = "received";

        var d = new Date(msg.time);
        msg.date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + " " +
            d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

       // msg.date = "2012-4-5";
        var template_html = $('#msg_template').html();
        var template = _.template(template_html);
        //console.log(template(msg));

        $('#message_container').append(template(msg));

        var element = $('#message_container').get(0);
        element.scrollTop = element.scrollHeight - element.clientHeight;
    }

    function showWarning(text) {
        alert(text);
    }

    function afterLogin(msg) {
        username = msg.username;
        userkey = msg.key;
        
        $("#login_panel").hide();
        $("#main").show();
        console.log(username + " login!!!" + " key: " + userkey);
        
        socket.emit('load_messages', { username: username, key: userkey });
    }

});




