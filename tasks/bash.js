"use strict";

var BASH_IM_URL  = 'http://bash.im/random'
  , BASH_ORG_URL = 'http://www.bash.org/?random';

var request = require('request')
  , mnem  = require('../libs/mnemonic')
  , iconv = require('iconv-lite');

exports.info = {
    ru : {
          command : 'баш'
        , signature : '!баш'
        , description : 'Возвращает случайную цитату с bash.im'
    }

    , en : {
          command : 'bash'
        , signature : '!bash'
        , description : 'Returns random quote from bash.org'
    }
}

var fromBashIm = (function(store, url) {
    var newLineReg = /<br\s*\/?>\s*/g
      , contentReg = /<div class="text">([\s\S]*?)<\/div>/g;

    return function(input, answer) {
        if(store.length) return answer(store.pop());

        request({ url : url, encoding : null }, function(err, res, body) {
            if(err || res.statusCode !== 200)
                return console.error(err || 'Status code: ' + res.statusCode);

            var data = iconv.decode(body, 'win1251').trim(), match;
            while(match = contentReg.exec(data))
                store.push(mnem.decode(match[1]
                    .replace(newLineReg, '\n')
                ));

            answer(store.pop());
        });
    };
})([], BASH_IM_URL);

var fromBashOrg = (function(store, url) {
    var newLineReg = /<br \/>\s*/g
      , contentReg = /<p class="qt">([\s\S]*?)<\/p>/g;

    return function(input, answer) {
        if(store.length) return answer(store.pop());

        request(url, function(err, res, body) {
            if(err || res.statusCode !== 200)
                return console.error(err || 'Status code: ' + res.statusCode);

            var match;
            while(match = contentReg.exec(body))
                store.push(mnem.decode(match[1]
                    .replace(newLineReg, '\n')
                ));

            answer(store.pop());
        });
    };
})([], BASH_ORG_URL);

exports.execute = function(input, answer) {
    var info = exports.info;
    switch(input.command) {
        case info.ru.command : return fromBashIm(input, answer);
        case info.en.command : return fromBashOrg(input, answer);
    }
}
