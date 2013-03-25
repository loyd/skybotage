var http = require('http')
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

exports.execute = function(data, callback) {
    http.get(urlNoise, function(response) {
        var data = '';
        response.on('data', function(chunk) {
            data += chunk;
        });

        response.on('end', function() {
            try {
                var result = JSON.parse(data)[0].preview;
            } catch(error) {
                callback(error);
            }

            callback(null, urlImage + result);
        });
    });
};
