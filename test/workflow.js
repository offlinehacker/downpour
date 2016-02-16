const expect = require('chai').expect;
const Runner = require('../src/runner');

const workflow = {
  name: 'test',
  tasks: {
    validate: {
      action: 'validate',
      provides: '^js "validated"',
      params: {
        a: 'b'
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
};

describe('Runner', () => {
  describe('simple', () => {
    beforeEach(() => {
      this.runner = new Runner();
      this.runner.registerWorkflow(workflow);
    });

    it('shoudl run workflow', () => {
      this.runner.registerAction('validate', (params) => {
        return params.a;
      });

      this.runner.registerAction('save', (params, context) => {
        return context.value;
      });

      return this.runner.run('test').then(result => {
        expect(result).to.be.equal('b');
      });
    });
  });
});
