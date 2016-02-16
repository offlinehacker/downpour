'use strict';

const _ = require('lodash');
const assert = require('hoek').assert;
const Promise = require('bluebird');

class State {
  constructor(options) {
    options = _.defaults(options, { steps: [] });

    this.steps = options.steps;
  }

  addSteps(step) {
    assert(_.isString(step) || _.isArray(step), 'Step is not array or string');

    if (_.isArray(step)) {
      this.steps = this.steps.concat(step);
    } else if (_.isString(step)) {
      this.steps.push(step);
    }

    return Promise.resolve(this.steps);
  }

  get finished() {
    return !!~this.steps.indexOf('finished');
  }
}

module.exports = State;
