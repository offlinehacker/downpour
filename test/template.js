const expect = require('chai').expect;

const Template = require('../src/template');

describe('Template', () => {
  it('should template a string', () => {
    const template = new Template('abcd');
    return template.eval({}).then(result => {
      expect(result).to.be.equal('abcd')
    });
  });

  it('should template js', () => {
    const template = new Template('^js _.toUpper(animal)');
    return template.eval({animal: 'kitten'}).then(result => {
      expect(result).to.be.equal('KITTEN');
    });
  });

  it('should template json path', () => {
    const template = new Template('$.a');
    return template.eval({a: 1}).then(result => {
      expect(result).to.be.equal(1)
    });
  });

  it('should template object', () => {
    const template = new Template({
      js: '^js _.toUpper(animal)',
      deep: {
        path: '$.animal',
        plain: 'pussy'
      }
    });

    return template.eval({animal: 'kitten'}).then(result => {
      expect(result.js).to.be.equal('KITTEN');
      expect(result.deep.path).to.be.equal('kitten');
      expect(result.deep.plain).to.be.equal('pussy');
    });
  });
});
