const expect = require('chai').expect;
const Runner = require('../src/runner');

const workflow = {
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
};

describe('Runner', () => {
  describe('simple', () => {
    beforeEach(() => {
      this.runner = new Runner();
      this.runner.registerWorkflow(workflow);
    });

    it('should run workflow', () => {
      this.runner.registerAction('validate', (params) => {
        return params.a;
      });

      this.runner.registerAction('save', (params, context) => {
        return context.value;
      });

      return this.runner.run('test', {a: 'b'}).then(result => {
        expect(result).to.be.equal('b');
      });
    });
  });
});
