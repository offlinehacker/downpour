const expect = require('chai').expect;
const Workflow = require('../src/workflow');
const ActionManager = require('../src/actions');

const workflow = new Workflow({
  name: 'test',
  tasks: {
    validate: {
      action: 'validate',
      provides: ['^js if(a == "b") "validated"'],
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
    it('should run workflow', () => {
      const actions = new ActionManager();

      actions.register('validate', (params) => {
        return params.a;
      });

      actions.register('save', (params, context) => {
        return context.value;
      });

      return workflow.run(actions, {a: 'b'}).then(result => {
        expect(result).to.be.equal('b');
      });
    });
  });
});
