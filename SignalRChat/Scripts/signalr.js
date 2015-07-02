﻿// Declare a proxy to reference the hub.
//var url = window.location.href;
//trace('url = ' + url);
var scripts = document.getElementsByTagName("script"),
    src = toLocation(scripts[scripts.length - 1].src).origin;
$.connection.hub.url = src + "/signalr";
trace('connection url = ' + $.connection.hub.url);
var chat = $.connection.chatHub;

function starting() {   

    
    // Create a function that the hub can call to broadcast messages.
    chat.client.broadcastMessage = function (priv, name, message) {
        // Html encode display name and message.      
        var encodedName = $('<div />').text(name).html();
        var encodedMsg = $('<div />').text(message).html();
        // Add the message to the page.
        //$('#discussion').prepend('<li><strong>' + encodedName
        //    + '</strong>:&nbsp;&nbsp;' + encodedMsg + '</li>');
        if (priv) {
            message = "<font color='blue'><small>[" + priv + "]</small></font>  " + message;
        }
        $('#discussion').prepend('<li><strong>' + encodedName
            + '</strong>:&nbsp;&nbsp;' + message + '</li>');

        var audio = new Audio('/sound/page-flip-01a.mp3');
        audio.play();
    };
    chat.client.showUsersOnLine = function (keys, connection) {
        var keysarray = keys.toString().split(',');
        var conarray = connection.toString().split(',');
        var number = keysarray.indexOf($('#displayname').val());
        keysarray.splice(number, 1);
        conarray.splice(number, 1);
        //trace('keys = ' + keysarray);
        //trace('users = ' + users);        
        if (keysarray[0] != null) {
            var audio = new Audio('/sound/bottle-open-1.mp3');
            audio.play();
            var i;
            $('#users').empty();
            for (i = 0; i < keysarray.length; i++) {
                var connectionId = conarray[i];
                //trace(connectionId);
                $('#users').append('<input type="radio" value= connectionId name="user" checked><label>' + keysarray[i] + '</label><br/>');
                $('input[name="user"]:checked').val(conarray[i]);                
            }
            $('input[name="user"][value="public"]').prop('checked', true);
            //var connectionId = $('input:radio[name ="user"]:checked', '#users').val();
            //trace('connectionId = ', + connectionId);
            //var conn = $('input[name="user"]:checked', '#users').val();
            //trace('conn = '+ conn);
        }
        else {
            $('#users').empty();
        }
    };

    chat.client.hangUpVideo = function () {
        hangup();
    };

    chat.client.sendOffer = function (desc) {
        trace('Offer sent ' + desc);
        answer(JSON.parse(desc));
    };

    chat.client.sendIce = function (desc) {
        trace('Ice sent ' + desc);
        addIceCandidate(JSON.parse(desc));
    };

    chat.client.sendAnswer = function (desc) {
        trace('Answer sent ' + desc);
        getAnswer(JSON.parse(desc));
    };

    // Get the user name and store it to prepend to messages.
    var name = "";
    name = getUrlVars()["user"];
    trace('user1 = ' + name);
    if (!(name) || name == "undefined") {
        var name = prompt('Enter your name:', '');
    }
    trace('user2 = ' + name);
    if (!(name) || name == null) {
        name = generateQuickGuid();//Math.round(new Date().getTime());
        //trace('user = ' + name);
    }
    $('#myname').val(name);
    $('#displayname').val(name);
    //$('#myName').val(name);
    //trace('prompt ' + name);  
    // Set initial focus to message input box.
    $('#message').focus();
    // Start the connection.
    $.connection.hub.qs = "userName=" + name;
    $.connection.hub.start().done(function () {
        $('#sendmessage').click(function () {
            // Call the Send method on the hub.
            //trace('remove = ' + remoteVideo.hidden);
            //trace('remove = ' + $('#video').hidden);
            var conn = $('input[name="user"]:checked').val();
            //var conname = ($("label[for='" + conn + "']").text());
            //var conname = $('input[name="user"]:checked').parent().next().find('label').text();
            var conname = $('input[name="user"]:checked').next().text();
            //trace('conn = ' + conn + '/' + conname);
            if (conn == "public") {
                chat.server.send($('#displayname').val(), $('#message').val());
            }
            else {                
                chat.server.sendToUser(conname, conn, $('#displayname').val(), $('#message').val());
            }
            //var conn = $('input[name="user"]:checked', '#users').val();
            //trace('conn = ' + conn);
            //chat.server.sendToUser(conn, $('#displayname').val(), $('#message').val());
            // Clear text box and reset focus for next comment.
            $('#message').val('').focus();
        });

        $('#message').keypress(function (e) {
            if (e.which == 13) {//Enter key pressed
                $('#sendmessage').click();//Trigger search button click event
            }
        });
        $('#clearMessages').click(function () {
            $('#discussion').empty();
        });
        start(true);
    });
};

    function getUrlVars() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }

    function toLocation(url) {
        var a = document.createElement('a');
        a.href = url;
        return a;
    };