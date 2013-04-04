var request  = require('request')
  , urlNoise = 'http://api.oboobs.ru/noise/'
  , urlImage = 'http://media.oboobs.ru/';

exports.info = {
    ru : {
          command : 'сиськи'
        , signature : '!сиськи'
        , description : 'Возвращает ссылку на картинку'
    }

    , en : {
          command : 'boobs'
        , signature : '!boobs'
        , description : 'Returns picture link'
    }
}

exports.execute = function(data, answer) {
    request({ url : urlNoise, json : true }, function(err, res, body) {
        if(err || res.statusCode !== 200)
            return console.error(err || 'Status code: ' + res.statusCode);

        var result = body[0].preview;
        answer(urlImage + result);
    });
};
