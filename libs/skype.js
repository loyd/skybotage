"use strict";

var spawn = require('child_process').spawn
  , path  = require('path')
  , dbus  = spawn(path.join(__dirname, '.dbus_mediator'))
  , fmt   = require('util').format
  , Emitter = require('events').EventEmitter;

var skype = module.exports = new Emitter;
var tmpData = {};

var regs = {
      inbox : /^CHATMESSAGE (\d+) STATUS (RECEIVED|SENDING)$/
    , info  : /^CHATMESSAGE (\d+) (\w+) (.*?)$/
};

dbus.stdout.on('data', function(body) {
    console.assert(body);
    body = body.toString('utf-8').trim();
    notify(body);

    var res;
    if(res = body.match(regs.inbox)) {
        var messageId = +res[1];

        invoke('GET CHATMESSAGE %d CHATNAME', messageId);
        invoke('GET CHATMESSAGE %d BODY', messageId);
    } else if(res = body.match(regs.info)) {
        var messageId = +res[1];
        var message = tmpData[messageId] = tmpData[messageId] || {};
        message[res[2].toLowerCase()] = res[3];

        if(res[2] === 'BODY') {
            console.assert('chatname' in message);
            delete tmpData[messageId];
            skype.emit('message', message.chatname, message.body);
        }
    }
});

dbus.stderr.on('data', function(body) {
    console.error(body.toString());
});

dbus.on('close', function(code) {
    console.log('Code: %d', code);
});

invoke('NAME skybotage');
invoke('PROTOCOL 8');

function notify(body) {
    var time = new Date().toTimeString().slice(0, 8);
    // Align multiline
    body = body.replace(/\n/g, '\n         | ');
    console.log('%s | %s', time, body);
}

function invoke(cmd /*, ...*/) {
    console.assert(cmd);
    dbus.stdin.write(fmt.apply(null, arguments) + '\n');
}

skype.send = function(chat, message) {
    console.assert(chat && message);
    invoke('CHATMESSAGE %s %s', chat, message);
}