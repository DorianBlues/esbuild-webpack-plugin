import { Compiler } from 'webpack';
import { Service } from 'esbuild';
export default class ESBuildPlugin {
  options: {};
  static service: Service;
  constructor(options: { minify: boolean });
  static ensureService(enforce?: boolean): Promise<void>;
  transformCode({
    source,
    file,
    devtool,
  }: {
    source: string;
    file: string;
    devtool: string | boolean | undefined;
  }): Promise<any>;
  apply(compiler: Compiler): void;
}
