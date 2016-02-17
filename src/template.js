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

class ValueTemplate {
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

    return new ValueTemplate(template);
  }
}

class JSTemplate extends ValueTemplate {
  constructor(data) {
    super(data);

    this.script = new vm.Script(this.template);
    this.context = vm.createContext(context);
    this.context._ = _;
  }

  eval(context) {
    // Context creation is slow, so create context only once and
    // reuse it in other executions
    for (var member in this.context) {
      if (member != '_') delete this.context[member];
    }
    for (var member in context) this.context[member] = context[member];

    var result;
    try {
      result = Promise.resolve(this.script.runInContext(this.context));
    } catch(e) {
      return Promise.reject(e);
    }

    return result;
  }
}

class JSONPathTemplate extends ValueTemplate {
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
      this.template = ValueTemplate.create(data);
    } else {
      this.template = _.deepMap(data, (value, path) => {
        return ValueTemplate.create(value);
      });
    }
  }

  eval(context) {
    var result;

    if (this.template instanceof ValueTemplate) {
      result = this.template.eval(context);
    } else {
      result = Promise.deepProps(
        _.deepMap(this.template, value => value.eval(context))
      );
    }

    return this.process ? result.then(this.process) : result;
  }
}

Template.JSTemplate = JSTemplate;
Template.JSONPathTemplate = JSONPathTemplate;
Template.ValueTemplate = ValueTemplate;

module.exports = Template;
