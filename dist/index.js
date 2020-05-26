'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
// @ts-ignore
const webpack_1 = require('webpack');
const webpack_sources_1 = require('webpack-sources');
const esbuild_1 = require('esbuild');
class ESBuildPlugin {
  constructor(options) {
    this.options = {};
    this.options = options;
  }
  static async ensureService(enforce) {
    if (!this.service || enforce) {
      this.service = await esbuild_1.startService();
    }
  }
  async transformCode({ source, file, devtool }) {
    let result;
    await ESBuildPlugin.ensureService();
    const transform = async () =>
      await ESBuildPlugin.service.transform(source, {
        ...this.options,
        sourcemap: !!devtool,
        sourcefile: file,
      });
    try {
      result = await transform();
    } catch (e) {
      if (e.message === 'The service is no longer running') {
        await ESBuildPlugin.ensureService(true);
        result = await transform();
      } else {
        throw e;
      }
    }
    return result;
  }
  apply(compiler) {
    const matchObject = webpack_1.ModuleFilenameHelpers.matchObject.bind(
      undefined,
      {},
    );
    const { devtool } = compiler.options;
    const plugin = 'ESBuild Plugin';
    compiler.hooks.compilation.tap(plugin, (compilation) => {
      compilation.hooks.optimizeChunkAssets.tapPromise(
        plugin,
        async (chunks) => {
          for (const chunk of chunks) {
            for (const file of chunk.files) {
              if (!matchObject(file)) {
                continue;
              }
              if (!/\.m?js(\?.*)?$/i.test(file)) {
                continue;
              }
              const assetSource = compilation.assets[file];
              const { source, map } = assetSource.sourceAndMap();
              const result = await this.transformCode({
                source,
                file,
                devtool,
              });
              // @ts-ignore
              compilation.updateAsset(file, (old) => {
                if (devtool) {
                  return new webpack_sources_1.SourceMapSource(
                    result.js,
                    file,
                    result.jsSourceMap,
                    source,
                    map,
                    true,
                  );
                } else {
                  return new webpack_sources_1.RawSource(result.js || '');
                }
              });
            }
          }
        },
      );
    });
    compiler.hooks.done.tapPromise(plugin, async () => {
      if (ESBuildPlugin.service) {
        await ESBuildPlugin.service.stop();
      }
    });
  }
}
exports.default = ESBuildPlugin;
