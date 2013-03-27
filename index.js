#!/usr/bin/env node
"use strict";

// Global settings
require('console-trace')({ always : true });
console.assert = require('better-assert');

var skype = require('./libs/skype')
  , fs    = require('fs')
  , tasks = {};

fs.readdir('./tasks', function(err, files) {
    if(err) throw err;
    
    files.forEach(function(filename) {
        var task = require('./tasks/' + filename);
        console.assert(task.execute);
        console.assert(task.info);
        
        for(var infoMember in task.info) {
            var info = task.info[infoMember];
            console.assert(info.command);
            tasks[info.command] = task;
        }
    });
});

var commandReg = /^!(.*?)\s*(?:\s+(.*))?$/;
skype.on('message', function(chat, message) {
    var parts = message.match(commandReg);
    if(!(parts && parts[1] in tasks)) return;
    
    var params = {
          command : parts[1]
        , body : parts[2]
    };

    var answer = skype.send.bind(skype, chat);
    tasks[parts[1]].execute(params, answer);
});