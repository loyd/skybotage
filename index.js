#!/usr/bin/env node
"use strict";

var skype = require('./libs/skype')
  , tasks = {};

'fga'.split(' ').forEach(function(name) {
    var task = require('./tasks/' + name);
    console.assert(task.execute);
    console.assert(task.info);
    
    for(var name in task.info) {
        var info = task.info[name];
        console.assert(info.command);
        tasks[info.command] = task;
    }
});

var commandReg = /!(.*?)\s*(?:\s+(.*))?$/;
skype.on('message', function(chat, message) {
    var parts = message.match(commandReg);
    if(!(parts && parts[1] in tasks)) return;
    var params = parts[2];

    tasks[parts[1]].execute(params, function(err, answer) {
        if(err) console.error(err);
        skype.send(chat, answer);
    });
});