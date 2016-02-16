'use strict';

const _ = require('lodash');
const assert = require('hoek').assert;
const Promise = require('bluebird');

const schema = require('./schema');
const Template = require('./template');

class Task {
  constructor(task) {
    const result = schema.Task.validate(task);
    assert(!result.err, 'task not valid');

    this.task = result.value;
  }

  get action() {
    return this.task.action;
  }

  get params() {
    return new Template(this.task.params);
  }

  get timeout() {
    return new Template(this.task.timeout);
  }

  get provides() {
    return new Template(this.task.provides, result => {
      return _.isArray(result) ? result : [result];
    });
  }

  get depends() {
    return new Template(this.task.depends, result => {
      return _.isArray(result) ? result : [result];
    });
  }

  get skip() {
    return new Template(this.task.skip, result => {
      return _.isArray(result) ? result : [result];
    });
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
