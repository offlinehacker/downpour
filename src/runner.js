'use strict';

const _ = require('lodash');
const assert = require('hoek').assert;

const Workflow = require('./workflow');
const Action = require('./action');
const State = require('./state');

class Runner {
  constructor() {
    this.workflows = {};
    this.actions = {};
  }

  registerWorkflow(workflow) {
    if (!(workflow instanceof Workflow)) {
      workflow = new Workflow(workflow);
    }

    assert(!this.workflows[workflow.name], 'Workflow with this name already exists');

    this.workflows[workflow.name] = workflow;
  }

  registerAction(name, task) {
    if (!arguments[1]) {
      const action = arguments[1];
      assert(action instanceof Action, "Task not instance of Task");

      this.actions[action.name] = action;
    } else {
      const name = arguments[0];
      const method = arguments[1];

      this.actions[name] = Action.fromMethod(name, method);
    }
  }

  _process(workflow, context, state) {
    const tasksToRun = _.filter(workflow.tasks, task => {
      return task.shouldRun(state);
    });

    return Promise.all(_.map(tasksToRun, task => {
      const action = this.actions[task.action];
      const details = { task: task, state: state, runner: this };
      return Promise.resolve(action.run(task.params, context, details))
        .then(value => {
          return state
            .addSteps(task.provides)
            .return({ task: task, value: value });
        })
        .catch(err => {
          if (task.error) {
            return state
              .addSteps(task.error)
              .return({ task: task, error: err });
          } else {
            throw err;
          }
        });
    })).then(results => {
      _.forEach(results, result => {
        if (result.task.to) {
          context[result.task.to] = result.value;
        }
      });

      if (state.finished) {
        return context.result;
      }

      return this._process(workflow, context, state);
    });
  }

  run(name, context, state) {
    const workflow = this.workflows[name];
    state = state || new State();
    context = context || {};

    assert(workflow, 'Workflow not found');
    assert(_.isObject(context), 'context is not an object');
    assert(state instanceof State, 'state is not instanceof State');

    return this._process(workflow, context, state);
  }
}

module.exports = Runner;
