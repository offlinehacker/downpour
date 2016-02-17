const _ = require('lodash');

const Cache = function() {
  var cache = {};
  return (name, value) => {
    if (cache[name]) return cache[name];
    if (_.isFunction(value)) {
      return cache[name] = value();
    }
    return cache[name] = value;
  }
}

module.exports = Cache;
