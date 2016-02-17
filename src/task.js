'use strict';

const _ = require('lodash');
const assert = require('hoek').assert;
const Promise = require('bluebird');

const schema = require('./schema');
const Template = require('./template');
const Cache = require('./cache');

class Task {
  constructor(task) {
    const result = schema.Task.validate(task);
    assert(!result.err, 'task not valid');

    this.task = result.value;
    this.cache = new Cache();
  }

  get action() {
    return this.task.action;
  }

  get params() {
    return this.cache('params', () => new Template(this.task.params));
  }

  get timeout() {
    return this.cache('timeout', () => new Template(this.task.timeout));
  }

  get provides() {
    return this.cache('provides', () => new Template(this.task.provides, result => {
      return _.isArray(result) ? result : [result];
    }));
  }

  get depends() {
    return this.cache('depends', () => new Template(this.task.depends, result => {
      return _.isArray(result) ? result : [result];
    }));
  }

  get skip() {
    return this.cache('skip', () => new Template(this.task.skip, result => {
      return _.isArray(result) ? result : [result];
    }));
  }

  get to() {
    return this.task.to;
  }

  eval(context) {
    return Promise.props({
      action: this.action,
      timeout: this.timeout.eval(context),
      params: this.params.eval(context),
      provides: this.provides.eval(context),
      depends: this.depends.eval(context),
      skip: this.skip.eval(context),
      to: this.to
    });
  }
}

module.exports = Task;
