"use strict";

var request = require('request')
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
exports.execute = function(data, answer) {
    var body = data.body
      , method = body ? 'api/random_by_tag/' + encodeURIComponent(body) : 'api/random';

    request({
          url : url + method
        , json : true
    }, function(err, res, body) {
        if(err || res.statusCode !== 200)
            return console.error(err || 'Status code: ' + res.statusCode);

        var text   = body.text.replace(sym151, '&#8212;')
          , result = mnem.decode(text);

        answer(result);
    });
};
