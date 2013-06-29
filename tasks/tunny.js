"use strict";

var LURKMORE_URL = 'http://lurkmore.to/Смехуечки:Сосни_хуйца';
var request = require('request');

exports.info = {
    ru : {
          command : 'тунца'
        , signature : '!тунца'
        , description : 'Возвращает случайную смехуечку с lurkmore.to'
    }
}

var next = (function(store) {
    var tagReg = /<.*?>/g;

    function shuffler() {
        return .5 - Math.random();
    }

    return function(answer) {
        if(store.length) return answer(store.pop());

        request(LURKMORE_URL, function(err, res, body) {
            if(err) console.error(err);

            var start = body.indexOf('<ol>') + 4
              , end   = body.indexOf('</ol>');

            store = body
                .slice(start, end)
                .split('\n')
                .map(function(tip) {
                    return tip.replace(tagReg, '').trim();
                })
                .filter(String)
                .sort(shuffler);

            answer(store.pop());
        });
    }
})([]);

exports.execute = function(data, answer) {
    next(answer);
};
