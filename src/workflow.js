'use strict';

const _ = require('lodash');
const assert = require('hoek').assert;
const Promise = require('bluebird');

const schema = require('./schema');
const Task = require('./task');
const Action = require('./action');
const ActionManager = require('./actions');
const State = require('./state');
const Cache = require('./cache');

class Workflow {
  constructor(workflow) {
    const result = schema.Workflow.validate(workflow);
    assert(!result.err, 'task not valid');

    this.workflow = result.value;
    this.cache = new Cache();
  }

  get name() {
    return this.workflow.name
  }

  get timeout() {
    return this.workflow.timeout;
  }

  get tasks() {
    return this.cache('tasks', _.mapValues(this.workflow.tasks, task => {
      return new Task(task);
    }));
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

  _process(actions, context, state) {
    return Promise.all(
      _.map(this.tasks, task => task.eval(context))
    ).then(tasks => {
      const tasksToRun = _.filter(tasks, task => {
        return this._shouldRun(task, state);
      });

      return Promise.all(_.map(tasksToRun, task => {
        const action = actions.get(task.action);
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

        return this._process(actions, context, state);
      });
    });
  }

  run(actions, context, state) {
    state = state || new State();
    context = context || {};

    assert(actions instanceof ActionManager, 'actions not instance of ActionManager');
    assert(_.isObject(context), 'context is not an object');
    assert(state instanceof State, 'state is not instanceof State');

    var workflow = this._process(actions, context, state);

    if (this.timeout) {
      workflow = workflow.timeout(this.timeout);
    }

    return workflow;
  }
}

module.exports = Workflow;
