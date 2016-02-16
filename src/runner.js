'use strict';

const _ = require('lodash');
const assert = require('hoek').assert;
const Promise = require('bluebird');

const Workflow = require('./workflow');
const Action = require('./action');
const ActionManager = require('./actions');
const State = require('./state');

class Runner {
  constructor(actionManager) {
    this.actions = actionManager || new ActionManager();
  }

  _shouldRun(task, state) {
    if (!_.isEmpty(_.intersection(task.provides, state.steps))) {
      return false;
    }

    if (!_.isEmpty(_.intersection(task.skip, state.steps))) {
      return false;
    }

    if(
      _.intersection(task.depends, state.steps).length ==
      task.depends.length
    ) {
      return true;
    }

    return false;
  }

  _process(workflow, context, state) {
    return Promise.all(
      _.map(workflow.tasks, task => task.eval(context))
    ).then(tasks => {
      const tasksToRun = _.filter(tasks, task => {
        return this._shouldRun(task, state);
      });

      return Promise.all(_.map(tasksToRun, task => {
        const action = this.actions.get(task.action);
        const details = { task: task, state: state, runner: this };
        var running = Promise.resolve(action.run(task.params, context, details));

        if (task.timeout) {
          running = running.timeout(task.timeout)
        }

        return running.then(value => {
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
    });
  }

  run(workflow, context, state) {
    state = state || new State();
    context = context || {};

    assert(workflow instanceof Workflow, 'value not instance of Workflow');
    assert(_.isObject(context), 'context is not an object');
    assert(state instanceof State, 'state is not instanceof State');

    return this._process(workflow, context, state);
  }
}

module.exports = Runner;
