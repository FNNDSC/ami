export default class ShadersBase {
  constructor() {
    this._name = 'shadersBase';
    this._base = {
      _functions: {},
      _uniforms: {},
    };
    this._definition = '';
  }

  get name() {
    return this._name;
  }

  set name(name) {
    this._name = name;
  }
}
