const expect = require('chai').expect;
const Runner = require('../src/runner');
const Workflow = require('../src/workflow');

const workflow = new Workflow({
  name: 'test',
  tasks: {
    validate: {
      action: 'validate',
      provides: ['^js "validated"'],
      timeout:20,
      params: {
        a: '$.a'
      },
      to: 'value'
    },
    save: {
      action: 'save',
      depends: 'validated'  ,
      provides: 'finished',
      to: 'result'
    }
  }
});

describe('Runner', () => {
  describe('simple', () => {
    beforeEach(() => {
      this.runner = new Runner();
    });

    it('should run workflow', () => {
      this.runner.actions.register('validate', (params) => {
        return params.a;
      });

      this.runner.actions.register('save', (params, context) => {
        return context.value;
      });

      return this.runner.run(workflow, {a: 'b'}).then(result => {
        expect(result).to.be.equal('b');
      });
    });
  });
});
