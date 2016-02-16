'use strict';

const JSONPath = require('jsonpath-plus');
const vm = require('vm');
const _ = require('lodash');
const Promise = require('bluebird');
Promise.deepProps = require('bluebird-deep-props');

function deepMap (obj, iterator, context) {
  return _.transform(obj, (result, val, key) => {
    result[key] = (_.isPlainObject(val) || _.isArray(val)) ?
      deepMap(val, iterator, context) :
      iterator.call(context, val, key, obj);
  });
};

_.mixin({
  deepMap: deepMap
});

class StringTemplate {
  constructor(template) {
    this.template = template;
  }

  eval(context) {
    return Promise.resolve(this.template)
  }

  static create(template) {
    if (_.isString(template)) {
      if (template.trim().startsWith('^js')) {
        return new JSTemplate(template.trim().slice(3));
      } else if(template.trim().startsWith('$')) {
        return new JSONPathTemplate(template);
      }
    }

    return new StringTemplate(template);
  }
}

class JSTemplate extends StringTemplate {
  constructor(data) {
    super(data);

    this.script = new vm.Script(this.template);
  }
  eval(context) {
    if(!this.context || this.context != context) {
      this.context = new vm.createContext(_.extend({_: _}, context));
    }

    try {
      return Promise.resolve(this.script.runInContext(this.context));
    } catch(e) {
      return Promise.reject(e);
    }
  }
}

class JSONPathTemplate extends StringTemplate {
  eval(context) {
    const result = JSONPath({ path: this.template, json: context });
    return Promise.resolve(_.first(result));
  }
}

class Template {
  constructor(data, process) {
    this.data = data;
    this.process = process;

    if (!_.isObject(data)) {
      this.template = StringTemplate.create(data);
    } else {
      this.template = _.deepMap(data, (value, path) => {
        return StringTemplate.create(value);
      });
    }
  }

  eval(context) {
    var result;

    if (this.template instanceof StringTemplate) {
      result = this.template.eval(context);
    } else {
      result = Promise.deepProps(
        _.deepMap(this.template, value => value.eval(context))
      );
    }

    return this.process ? result.then(this.process) : result;
  }
}

module.exports = Template;
