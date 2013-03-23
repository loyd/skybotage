var http = require('http')
  , url = 'http://fucking-great-advice.ru/';

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

exports.execute = function(body, callback) {
    var method = body ? 'api/random_by_tag/' + body : 'api/random'
      , data = '';

    http.get(url + method, function(response) {
        response.on('data', function(chunk) {
            data += chunk;
        });

        response.on('end', function() {
            try {
                var result = JSON.parse(data).text;
            } catch(error) {
                callback(error);
            }

            callback(null, result);
        });
    });
};

