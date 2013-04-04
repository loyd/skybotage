var spawn = require('child_process').spawn
  , bc = spawn('bc', ['-lq']);

var globalAnswer;
bc.stdout.on('data', function(body) {
	if(globalAnswer) globalAnswer(body);
});

bc.stderr.on('data', function(body) {
	if(globalAnswer) globalAnswer('ERROR: ' + body);
});

exports.info = {
    ru : {
          command : 'бк'
        , signature : '!бс <выражение>'
        , description : 'Использует калькулятор bc (http://ru.wikipedia.org/wiki/Bc)'
    }

    , en : {
          command : 'bc'
        , signature : '!bc <expr>'
        , description : 'Uses bc calculator (http://en.wikipedia.org/wiki/Bc_programming_language)'
    }
}

exports.execute = function(input, answer) {
	if(!input.body) return;
	globalAnswer = answer;
	bc.stdin.write(input.body.replace(/halt|quit/g, '') + '\n');
};
