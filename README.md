skybotage
=========

Skybotage is a modular skype bot.

Installation
--------------

```sh
git clone git@github.com:loyd/skybotage.git
cd skybotage
npm install
./index.js
```

Task format
-------------

```javascript
exports.info = {
    en : {
          command : 'fga'
        , signature : '!fga [<tag>]'
        , description : 'Returns random advice'
    
    , ru : { /* ... */ }
};

/**
 * @param {Object} input
 * @param {String} input.body
 * @param {String} input.command
 * @param {Function} answer(message)
 */
exports.execute = function(input, answer) {
    // Your code here ...
    // You can use `answer` many times
};
```