var http = require('http')
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

