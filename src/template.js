'use strict';

var jsonPathTransform = require('jsonpath-object-transform');
var JSONPath = require('jsonpath');

class Template {
  constructor(data) {
    this.data = data;
  }

  get type() {
    if (_.isString(this.data)) {
      if (data.startsWith('$')) {
        return 'jsonpath';
      } else {
        return 'nun'
      }
    } else {

    }
  }

  eval(context) {
    if (_.isSTring(this.data)) {
      const data = this.data.trim();
      if (data.startsWith('$')) {
        return new Promise((res, rej) => {
          JSONPath({json: context, path: data, value => {
            return res(value);
          }})
        });
      }
    }
  }
}
