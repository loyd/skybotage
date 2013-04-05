var WAITING_TIME = 2 * 3600 * 1000; // [ms]

var spawn = require('child_process').spawn
  , path  = require('path');

process.env['BC_ENV_ARGS'] = path.join(__dirname, '../misc/extensions.bc');

var manager = {
      bcs : { /* chat : { process, timer, destroy } */ }
    
    , use : function(chat, answer) {
        if(chat in this.bcs)
            this.prolong(chat);
        else
            this.create(chat, answer);

        return this;
    }
    
    , send : function(chat, message) {
        console.assert(chat in this.bcs);
        this.bcs[chat].process.stdin.write(message + '\n');
    }

    , prolong : function(chat) {
        var bc = this.bcs[chat];
        clearTimeout(bc.timer);
        bc.timer = setTimeout(bc.destroy, WAITING_TIME);
    }

    , create : function(chat, answer) {
        var bc = spawn('bc', ['-lq']);
        bc.stdout.on('data', answer);
        bc.stderr.on('data', answer);
        bc.on('close', this.create.bind(this, chat, answer));

        var destroy = function() {
            bc.removeAllListeners('close');
            bc.kill();
            delete manager.bcs[chat];
        };

        this.bcs[chat] = {
              process : bc
            , destroy : destroy
            , timer : setTimeout(destroy, WAITING_TIME)
        };
    }
}

var miscLink = 'http://x-bc.sourceforge.net/extensions.bc ';
exports.info = {
    ru : {
          command : 'бк'
        , signature : '!бк <выражение>'
        , description : 'Использует калькулятор bc + ' + miscLink +
            '. Время ожидания 2 часа'
    }

    , en : {
          command : 'bc'
        , signature : '!bc <expr>'
        , description : 'Uses bc calculator + ' + miscLink +
            '. Waiting time 2 hours'
    }
}

exports.execute = function(input, answer) {
    if(!input.body) return;
    manager
        .use(input.chat, answer)
        .send(input.chat, input.body);
};
