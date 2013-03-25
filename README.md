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
 * @param {Function} fire(err, message)
 */
exports.execute = function(input, fire) {
    // Your code here ...
    // You can use `fire` many times
};
```