'use strict';

const Action = require('./action');
const _ = require('lodash');

class ActionManager {
  constructor() {
    this.actions = [];
  }

  get(name) {
    return _.find(this.actions, _.matchesProperty('name', name));
  }

  register() {
    if (!arguments[1]) {
      const action = arguments[1];
      assert(action instanceof Action, "action not instance of Action");

      this.actions.push(action);
    } else {
      const name = arguments[0];
      const method = arguments[1];

      this.actions.push(Action.fromMethod(name, method));
    }
  }
}

module.exports = ActionManager;
