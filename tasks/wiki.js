var COMMON_API_URL = 'wikipedia.org/w/api.php';
var request = require('request');

exports.info = {
    ru : {
          command : 'вики'
        , signature : '!вики <запрос>'
        , description : 'Возвращает результат с ru.wikipedia.org'
    }

    , en : {
          command : 'wiki'
        , signature : '!wiki <request>'
        , description : 'Returns search result from en.wikipedia.org'
    }
}

function search(lang, body, done) {
    request({
          url : 'http://' + lang + '.' + COMMON_API_URL
        , qs : {
              action : 'opensearch'
            , search : body
            , limit  : 10
            , format : 'json'
        }
        , json : true
    }, function(err, res, body) {
        if(err) console.error(err);
        if(body[1].length) done(body[1]);
    });
}

function queryIntro(lang, title, done) {
    request({
          url : 'http://' + lang + '.' + COMMON_API_URL
        , json : true
        , qs : {
              action : 'query'
            , prop   : 'extracts'
            , format : 'json'
            , titles : title
            , exlimit : 1
            , exintro : ''
            , redirects : ''
            , explaintext : ''
            , exsentences : 3
            , exsectionformat : 'raw'
        }
    }, function(err, res, body) {
        if(err) console.error(err);
        try {
            var pages   = body.query.pages
              , pageId  = Object.keys(pages)[0]
              , content = pages[pageId].extract;

            done(content);
        } catch(err) {
            console.error(err);
        }
    });
}

exports.execute = function(input, answer) {
    if(!input.body) return;

    var info = exports.info, lang;
    switch(input.command) {
        case info.ru.command : lang = 'ru'; break;
        case info.en.command : lang = 'en'; break;
    }

    search(lang, input.body, function(result) {
        var isSwitch = result.length > 1 && ~result[1].indexOf(' (');
        isSwitch ? answer(result.slice(1).join('\n'))
                 : queryIntro(lang, result[0], answer);
    });
}
