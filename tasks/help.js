var fs = require('fs');

exports.info = {
    ru : {
          command : 'помощь'
        , signature : '!помощь [<команда>]'
        , description : 'Выводит справку'
    }

    , en : {
          command : 'help'
        , signature : '!help [<command>]'
        , description : 'Displays help'
    }
}

var infos = []
  , commands = {}
  , maxSignLen = 0;

fs.readdir(__dirname, function(err, files) {
    if(err) return;

    files.forEach(function(filename) {
        var info = require('./' + filename).info;
        infos.push(info);
        for(var lang in info) {
            var member = info[lang];
            commands[member.command] = info;
            maxSignLen = Math.max(member.signature.length, maxSignLen);
        }
    });
});

function generateHelp(lang, cmd) {
    function format(member) {
        // var numOfAddlSpaces = maxSignLen - member.signature.length
        //   , spaces = new Array(numOfAddlSpaces + 1).join(' ');

        return ' > ' + member.signature + ' (' + member.description + ')';
    }

    if(cmd) {
        var info = commands[cmd] && commands[cmd][lang];
        return info ? [format(info)] : null;
    } else {
        return infos
            .map(function(info) { return info[lang] })
            .filter(function(member) { return member })
            .map(format);
    }
}

exports.execute = function(input, answer) {
    var info = exports.info, lang;

    switch(input.command) {
        case info.ru.command : lang = 'ru'; break;
        case info.en.command : lang = 'en'; break;
    }

    var help = generateHelp(lang, input.body);
    if(help) help.forEach(answer);
};
