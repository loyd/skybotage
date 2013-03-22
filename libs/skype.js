"use strict";

var dbus = require('dbus-native')
  , fmt  = require('util').format
  , bus  = dbus.sessionBus()
  , Emitter = require('events').EventEmitter;

var skype = module.exports = Object.create(Emitter.prototype);
Emitter.call(exports);

var tmpData = {};

var regs = {
	  inbox : /^CHATMESSAGE (\d+) STATUS (RECIEVED|SENDING)$/
    , info  : /^CHATMESSAGE (\d+) (\w+) (.*?)$/
};

bus.connection.on('message', function onmessage(info) {
    console.log('\n-- %s --------------------------',
    	new Date().toTimeString().slice(0, 8));
    console.log('0: %s', info.body[0]);
    console.log('1: %s', info.body[1]);
    console.log('--------------------------------------');
    console.assert(info.body);

    var res, body = info.body;
    if(body[0] && (res = info.body[0].match(regs.inbox))) {
        var text = info.body[0];
        var messageId = +res[1];

        invoke("GET CHATMESSAGE %d CHATNAME", messageId);
        invoke("GET CHATMESSAGE %d BODY", messageId);
    
    } else if(body[1] && (res = info.body[1].match(regs.info))) {
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

bus
    .getService('com.Skype.API')
    .getInterface('/com/Skype', 'com.Skype.API', function connect(error, skype) {
        if(error) console.error('Error: %s', error);
        invoke.cast = skype.Invoke;

        invoke('NAME Skype-bot');
        invoke('PROTOCOL 8');
    });

function invoke(cmd /*, ...*/) {
    console.assert(cmd);
    console.assert(invoke.cast);

    invoke.cast(fmt.apply(null, arguments));
}

skype.send = function(chat, message) {
    console.assert(chat && message);
    invoke('CHATMESSAGE %s %s', chat, message);
}