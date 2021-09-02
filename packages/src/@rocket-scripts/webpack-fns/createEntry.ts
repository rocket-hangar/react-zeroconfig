import { ESBuildMinifyPlugin } from 'esbuild-loader';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import InterpolateHtmlPlugin from 'react-dev-utils/InterpolateHtmlPlugin';
import { Configuration, WebpackPluginInstance } from 'webpack';

interface EntryParams {
  outDir: string;
  entry: Array<{ name: string; script: string; html?: string }>;
  env?: NodeJS.ProcessEnv;
  publicPath?: string;
  chunkPath?: string;
  filename?: string;
  optimization?: 'minify-and-split-chunks' | 'minify' | false;
  splitChunks?: boolean;
}

export function createEntry({
  outDir,
  entry,
  env = {},
  publicPath = '',
  chunkPath = '',
  filename: _filename,
  optimization = false,
}: EntryParams): Configuration {
  const plugins: WebpackPluginInstance[] = entry
    .map(({ name, html }) => {
      return html
        ? new HtmlWebpackPlugin({
            template: html,
            filename: `${name}.html`,
            chunks: [name],
          })
        : null;
    })
    .filter((plugin): plugin is HtmlWebpackPlugin => !!plugin);

  const hasHtml = plugins.length > 0;

  if (hasHtml) {
    plugins.push(
      new InterpolateHtmlPlugin(
        HtmlWebpackPlugin,
        env as Record<string, string>,
      ) as WebpackPluginInstance,
    );
  }

  const filename =
    _filename ?? hasHtml
      ? `${chunkPath}[name].[fullhash].js`
      : `${chunkPath}[name].js`;

  return {
    output: {
      path: outDir,
      publicPath,
      filename,
      chunkFilename: filename,
      pathinfo: false,
    },

    entry: entry.reduce((e, { name, script }) => {
      e[name] = script;
      return e;
    }, {} as Record<string, string>),

    plugins: plugins,

    optimization: optimization.toString().startsWith('minify')
      ? {
          concatenateModules: true,
          minimize: true,
          minimizer: [
            new ESBuildMinifyPlugin({
              target: 'es2018',
              minify: true,
              css: hasHtml,
            }),
          ],

          splitChunks:
            optimization === 'minify-and-split-chunks'
              ? {
                  cacheGroups: {
                    // vendor chunk
                    vendor: {
                      test: /[\\/]node_modules[\\/]/,
                      name: 'vendor',
                      chunks: 'all',
                    },

                    // extract single css file
                    style: {
                      test: (m: object) => m.constructor.name === 'CssModule',
                      name: 'style',
                      chunks: 'all',
                      enforce: true,
                    },
                  },
                }
              : undefined,
        }
      : undefined,
  };
}
