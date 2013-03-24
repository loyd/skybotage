var REPEAT_TIMEOUT = 300
  , BASH_IM_URL  = 'http://bash.im/forweb/?u'
  , BASH_ORG_URL = 'http://www.bash.org/?random1';

var http = require('http')
  , mnem = require('../libs/mnemonic');

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

var fromBashIm = (function(url) {
    var newLineReg = /<' \+ 'br( \/)?>/g, prev;
    return function request(input, callback) {
        http.get(url, function(response) {
            var data = '';
            response.on('data', function(chunk) {
                data += chunk;
            });

            response.on('end', function() {
                if(data === prev)
                    return setTimeout(function() {
                        request(input, callback);
                    }, REPEAT_TIMEOUT);
                
                prev = data;

                var start = data.indexOf('>', data.indexOf('b_q_t')) + 1;
                var end   = data.indexOf('<\' + \'/div>', start);

                var content = data.slice(start, end).trim().replace(newLineReg, '\n');
                callback(null, mnem.decode(content));
            });
        });
    };
})(BASH_IM_URL);

var fromBashOrg = (function(store, url) {
    var newLineReg = /<br \/>\s*/g
      , contentReg = /<p class="qt">([\s\S]*?)<\/p>/g

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
