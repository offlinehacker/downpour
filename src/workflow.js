'use strict';

const _ = require('lodash');
const assert = require('hoek').assert;

const schema = require('./schema');
const Task = require('./task');

class Workflow {
  constructor(workflow) {
    const result = schema.Workflow.validate(workflow);
    assert(!result.err, 'task not valid');

    this.workflow = result.value;
  }

  get name() {
    return this.workflow.name
  }

  get tasks() {
    return _.mapValues(this.workflow.tasks, task => {
      return new Task(task);
    });
  }
}

module.exports = Workflow;
