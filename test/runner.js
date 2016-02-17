'use strict';

const expect = require('chai').expect;

const Runner = require('../src/runner');

const workflow = {
  name: 'test',
  timeout: 20,
  tasks: {
    validate: {
      action: 'validate',
      provides: ['^js if(a == "b") {_.toLower("validated")}'],
      timeout: '^js 20',
      params: {
        a: '^js a'
      },
      to: 'value'
    },
    save: {
      action: 'workflow',
      depends: 'validated',
      params: {
        inherit: true,
        workflow: {
          tasks: {
            save: {
              action: 'save',
              provides: '^js "finished"',
              to: 'result'
            }
          }
        }
      },
      provides: '^js "finished"',
      to: 'result'
    }
  }
};

describe('runner', () => {
  it('should run sub workflow', () => {
    const runner = new Runner();

    runner.register(workflow);

    runner.actions.register('validate', (params) => {
      return params.a;
    });

    runner.actions.register('save', (params, context) => {
      return context.value;
    });

    return runner.run('test', {a: 'b'}).then(result => {
      expect(result).to.be.equal('b');
    });
  });
});
