'use strict';

const _ = require('lodash');
const assert = require('hoek').assert;

class Action {
  get name() {
    throw new Error('Action name not defined');
  }

  run(params, context, options) {
    throw new Error('Action not implemented');
  }

  static fromMethod(name, method) {
    assert(_.isString(name), 'Name is not string string');
    assert(_.isFunction(method), 'Method is not function');

    return new SimpleAction(name, method);
  }
}

class SimpleAction extends Action {
  constructor(name, method) {
    super();

    this._name = name;
    this._method = method;
  }

  get name() {
    return this._name;
  }

  run(params, context, options) {
    return this._method.call(this, params, context, options);
  }
}

module.exports = Action;
