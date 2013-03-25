var http = require('http')
  , mnem = require('../libs/mnemonic')
  , url  = 'http://fucking-great-advice.ru/';

exports.info = {
    ru : {
          command : 'обс'
        , signature : '!обс [<тэг>]'
        , description : 'Возвращает случайный совет'
    }

    , en : {
          command : 'fga'
        , signature : '!fga [<tag>]'
        , description : 'Returns random advice'
    }
}

var sym151 = /\&#151;/g;
exports.execute = function(data, callback) {
    var body = data.body
      , method = body ? 'api/random_by_tag/' + encodeURIComponent(body) : 'api/random'
      , data = '';

    http.get(url + method, function(response) {
        response.on('data', function(chunk) {
            data += chunk;
        });

        response.on('end', function() {
            try {
                var text   = JSON.parse(data).text.replace(sym151, '&#8212;')
                  , result = mnem.decode(text);
            } catch(error) {
                return;
                // return callback(error);
            }

            callback(null, result);
        });
    });
};
