var request  = require('request')
  , urlNoise = 'http://api.obutts.ru/noise/'
  , urlImage = 'http://media.obutts.ru/';

exports.info = {
    ru : {
          command : 'попки'
        , signature : '!попки'
        , description : 'Возвращает ссылку на картинку'
    }

    , en : {
          command : 'butts'
        , signature : '!butts'
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
