'use strict';

const _ = require('lodash');
const assert = require('hoek').assert;

const schema = require('./schema');

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
    return this.task.params;
  }

  get timeout() {
    return this.task.timeout;
  }

  get provides() {
    return _.isArray(this.task.provides) ? this.task.provides : [this.task.provides];
  }

  get depends() {
    return _.isArray(this.task.depends) ? this.task.depends : [this.task.depends];
  }

  get skip() {
    return _.isArray(this.task.skip) ? this.task.skip : [this.task.skip];
  }

  get to() {
    return this.task.to;
  }

  shouldRun(state) {
    if (!_.isEmpty(_.intersection(this.provides, state.steps))) {
      return false;
    }

    if (!_.isEmpty(_.intersection(this.skip, state.steps))) {
      return false;
    }

    if(
      _.intersection(this.depends, state.steps).length ==
      this.depends.length
    ) {
      return true;
    }

    return false;
  }
}

module.exports = Task;
