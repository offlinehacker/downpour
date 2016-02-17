'use strict';

const _ = require('lodash');
const assert = require('hoek').assert;
const Promise = require('bluebird');

const ActionManager = require('./actions');
const Action = require('./action.js');
const Workflow = require('./workflow');
const State = require('./state');
const Template = require('./template');

class Runner {
  constructor() {
    this.actions = new ActionManager();
    this.workflows = {};

    this.actions.register('workflow', this._callWorkflow, this);
  }

  register(workflow) {
    if (!(workflow instanceof Workflow)) {
      workflow = new Workflow(workflow);
    }

    this.workflows[workflow.name] = workflow;
  }

  _callWorkflow(params, context, options) {
    var workflow;

    if (params.workflow) {
      workflow = options.task._workflow || new Workflow(params.workflow);
    } else if(params.name && this.workflows[params.name]) {
      workflow = this.workflows[params.name];
    } else {
      throw new Error('workflow not specified');
    }

    if (options.task.staticParams) {
      task._workflow = workflow;
    }

    context = params.inherit ? context : params.context;
    return workflow.run(this.actions, context);
  }

  run(name, context, state) {
    const workflow = this.workflows[name];

    state = state || new State();
    context = context || {};

    assert(workflow instanceof Workflow, 'workflow not instance of Workflow');
    assert(_.isObject(context), 'context is not an object');
    assert(state instanceof State, 'state is not instanceof State');

    return workflow.run(this.actions, context, state);
  }
}

module.exports = Runner;
