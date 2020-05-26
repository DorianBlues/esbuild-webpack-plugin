'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = (api) => {
  api.modifyBundleConfig((memo) => {
    if (memo.optimization) {
      memo.optimization.minimizer = [new (require('./index').default)()];
    }
    return memo;
  });
};
