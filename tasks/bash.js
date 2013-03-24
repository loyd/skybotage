var REPEAT_TIMEOUT = 300
  , BASH_IM_URL  = 'http://bash.im/random'
  , BASH_ORG_URL = 'http://www.bash.org/?random';

var http  = require('http')
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

    return function(input, callback) {
        if(store.length) return callback(null, store.pop());

        http.get(url, function(response) {
            response.setEncoding('binary');

            var data = '';
            response.on('data', function(chunk) {
                data += chunk;
            });

            response.on('end', function() {
                var buf = new Buffer(data, 'binary');
                data = iconv.decode(buf, 'win1251').trim();

                while(match = contentReg.exec(data))
                    store.push(mnem.decode(match[1]
                        .replace(newLineReg, '\n')
                    ));

                callback(null, store.pop());
            });
        });
    };
})([], BASH_IM_URL);

var fromBashOrg = (function(store, url) {
    var newLineReg = /<br \/>\s*/g
      , contentReg = /<p class="qt">([\s\S]*?)<\/p>/g;

    return function(input, callback) {
        if(store.length) return callback(null, store.pop());

        http.get(url, function(response) {
            var data = '';
            response.on('data', function(chunk) {
                data += chunk;
            });

            response.on('end', function() {
                while(match = contentReg.exec(data))
                    store.push(mnem.decode(match[1]
                        .replace(newLineReg, '\n')
                    ));

                callback(null, store.pop());
            });
        });
    };
})([], BASH_ORG_URL);

exports.execute = function(input, callback) {
    var info = exports.info;
    switch(input.command) {
        case info.ru.command : return fromBashIm(input, callback);
        case info.en.command : return fromBashOrg(input, callback);
    }
}
