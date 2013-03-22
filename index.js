#!/usr/bin/env node
"use strict";

var skype = require('./libs/skype')
  , tasks = {};

'fga'.split(' ').forEach(function(name) {
    var task = require('./tasks/' + name);
    console.assert(task.command);
    console.assert(task.execute);
    tasks[task.command] = task.execute;
});

var commandReg = /!(.*?)\s*(?:\s+(.*))?$/;
skype.on('message', function(chat, message) {
    var parts = message.match(commandReg);
    if(!(parts && parts[1] in tasks)) return;

    tasks[parts[1]](parts[2], function(err, answer) {
        if(err) console.error(err);
        skype.send(chat, answer);
    });
});