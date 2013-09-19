"use strict";

var botName  = 'skybotage'
  , protocol = 8;

var spawn = require('child_process').spawn
  , path  = require('path')
  , dbus  = spawn(path.join(__dirname, '.dbus_mediator'))
  , fmt   = require('util').format
  , Emitter = require('events').EventEmitter;

var skype = module.exports = new Emitter;

var msgTypes = {
      inbox : /^CHATMESSAGE (\d+) STATUS (RECEIVED|SENT)$/
    , info  : /^CHATMESSAGE (\d+) (\w+) ([\s\S]*?)$/
};

dbus.stdout.setEncoding('utf8');
dbus.stdout.on('data', (function() {
    var headerPat = /^M(\d+)$/;
    var message, waited;

    return function(body) {
        console.assert(body[body.length-1] === '\n');
        body.slice(0, -1).split('\n').forEach(function(line) {
            if(!waited) {
                var res = line.match(headerPat);
                console.assert(res);
                message = '';
                waited  = +res[1];
            } else {
                message += '\n' + line;
                if(--waited === 0)
                    handleMessage(message.trim());
            }
        });
    };
})());

var tmpData = {};
function handleMessage(body) {
    console.assert(body);
    console.log(body);

    var res;
    if(res = body.match(msgTypes.inbox)) {
        var messageId = +res[1];

        invoke('GET CHATMESSAGE %d CHATNAME', messageId);
        invoke('GET CHATMESSAGE %d BODY', messageId);
    } else if(res = body.match(msgTypes.info)) {
        var messageId = +res[1];
        var message = tmpData[messageId] = tmpData[messageId] || {};
        message[res[2].toLowerCase()] = res[3];

        if('body' in message && 'chatname' in message) {
            delete tmpData[messageId];
            skype.emit('message', message.chatname, message.body);
        }
    }
}

dbus.stderr.setEncoding('utf8');
dbus.stderr.on('data', console.error);
dbus.on('close', console.info.bind(null, 'Code: %d'));

invoke('NAME %s', botName);
invoke('PROTOCOL %d', protocol);

var newLinePat = /\n/g;
function invoke(cmd /*, ...*/) {
    console.assert(cmd);
    var message = fmt.apply(null, arguments) + '\n'
      , numOfLines = message.match(newLinePat).length;

    var result = 'M' + numOfLines + '\n' + message;
    dbus.stdin.write(result);
}

skype.send = function(chat, message) {
    console.assert(chat && message);
    invoke('CHATMESSAGE %s %s', chat, message);
}
