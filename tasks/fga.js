// ———————————————————————————————————————

exports.info = [
    {
        lang : 'ru',
        command : 'обс',
        signature : '!обс [<тэг>]',
        description : 'Возвращает случайный совет'
    },

    {
        lang : 'en',
        command : 'fga',
        signature : '!fga [<tag>]',
        description : 'Returns random advice'
    }
];

// ———————————————————————————————————————

http = require('http');

// ———————————————————————————————————————

url = 'http://fucking-great-advice.ru/';

// ———————————————————————————————————————

exports.execute = function(body, callback) {
    if (body.length)
        method = 'api/random_by_tag/'+body;
    else
        method = 'api/random';

    http.get(url+method, function (response) {
        response.on('data', function(chunk) {
            try
                result = JSON.parse(chunk).text;
            catch (error)
                callback(error);

            callback(null, advice.text);
        });
    });
};

// ———————————————————————————————————————