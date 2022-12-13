import { Configuration } from "webpack";
// todo: use aliases (i.e: ./packages/* -> @engineers/*)
// webpack uses `ts-node` to compile webpack.config.ts
// add `tsconfig-paths` to `tsconfig['ts-node']` to add tsConfig's paths to webpack's aliases
import { resolve } from "node:path";
// import BasePlugin from './packages/webpack/plugins';
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

// class FilterErrors extends BasePlugin {
//   hooks = [
//     {
//       lifecycle: 'afterCompile',
//       name: 'filterErrors',
//       hook: (compilation: any) => {
//         let pattern =
//           /export '.+?'( \(reexported as '.+?'\))?? was not found in/i;
//         compilation.errors = compilation.errors.filter(
//           (element: any) => !pattern.test(element.message)
//         );
//       },
//     },
//   ];
// }

export interface WebpackOptions extends Configuration {
  // see jest.config
  _module?: "es" | "commonjs";
  _projectRoot?: string;
  _tsConfigPath?: string;
}

export function webpackConfig(options: WebpackOptions = {}) {
  let opts = { ...options, mode: "none" };

  opts._tsConfigPath =
    opts._tsConfigPath ||
    resolve(opts._projectRoot || __dirname, "./tsconfig.json");

  if (!opts._module) {
    opts._module = "es";
  }

  let defaultConfig: Configuration = {
    mode: process.env.NODE_ENV as any,
    target: "node",
    entry: { server: resolve(__dirname, "src/index.ts") },
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js"],
      symlinks: false,
      /* use TsconfigPathsPlugin
      alias: {
        // add '~' for each project as the project's root
        '~~': resolve(__dirname, './'),
        '@engineers': resolve(__dirname, './packages/'),
      },*/
      // add tsconfig paths to webpack alias
      // @ts-ignore
      plugins: [new TsconfigPathsPlugin()],
    },

    output: {
      path: resolve(opts._projectRoot || __dirname, "./dist"),
      filename: `[name].${opts._module === "es" ? "mjs" : "js"}`,
      library: {
        // replaces output.libraryTarget
        type: "commonjs2",
      },
      // todo: esm
      // chunkFormat: 'module',
      // module: true,
      clean: true,
    },
    module: {
      // see @engineers/webpack/native-require.js
      noParse: /[\/\\]native-require.js$/,
      // todo: enable disabling any rule ex: opts._rules['ts-loader]=false
      rules: [
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          options: {
            // todo: extends: '../tsconfig.json',
            compilerOptions: {
              sourceMap: false,
            },
            // only compile files bundled by webpack, instead of the provided in tsconfig.json
            // by include, exclude, files
            // same as files:[webpack.entry]
            // https://www.npmjs.com/package/ts-loader#onlycompilebundledfiles
            onlyCompileBundledFiles: true,
            configFile: opts._tsConfigPath,
          },
        },
        {
          // load .node files
          // example: ./node_modules/sharp/build/Release/sharp.node
          // https://github.com/lovell/sharp/issues/794#issuecomment-307188099
          test: /\.node$/,
          loader: "node-loader",
          options: { name: "[name]-[contenthash].[ext]" },
        },
        /*
        // causes the error: Unknown word
        // https://github.com/webpack-contrib/css-loader/issues/295#issuecomment-265724126
         {
          test: /\.css$/,
          // loader: 'css-loader',
          use: ['style-loader', 'css-loader'],
          // use: [{loader: 'css-loader', options:options: opts.loaders.css}]
        },*/
      ],
    },
    externals: [
      //   add node_modules to externals in target:node
      //   except:
      //   - @engineers/* -> not compiled or published, imported from source
      //   -*.scss files
      //   - ~* (i.e: ~config|browser|server/*) -> to prevent it from transforming to `commnjs2 ~config/*`
      //     so it can be properly transformed to 'commonjs ../config/*'
      //   - @babel/runtime -> temporary to solve the error `SyntaxError: Unexpected token 'export'`
      //     when using as async/await function (todo: why it should excluded from webpack.externals)
      //  todo: fix: some packages (like @angular/*, @ngx-formly/*) couldn't be handled as commonjs
      //  as a temporary workaround remove node() from externals[]
      //  and manually add 'sharp'
      // node(undefined, [/@engineers\/.+/, /\.s?css$/, /^~/, /@babel\/runtime/]),
      // function () {
      //   todo: this needs to run `npm i` inside `dist`
      //    and add all the used @engineers/* dependencies to package.json
      //    externals(arguments, [/^@engineers\/(.*)/], 'commonjs2 {{request}}');
      // },
    ],
    // plugins: [new FilterErrors()],
  };

  if (opts._module === "es") {
    defaultConfig.output!.libraryTarget = "module";
    defaultConfig.output!.chunkFormat = "module";
    // @ts-ignore
    defaultConfig.output!.library!.type = "module";
    defaultConfig.output!.module = true;

    defaultConfig.experiments = defaultConfig.experiments || {};
    defaultConfig.experiments.outputModule = true;
    defaultConfig.experiments.topLevelAwait = true;

    defaultConfig.node = defaultConfig.node || {};
    if (!("__dirname" in defaultConfig.node))
      defaultConfig.node.__dirname = true;
    if (!("__filename" in defaultConfig.node))
      defaultConfig.node.__filename = true;
  }

  for (let key in opts) {
    if (key.startsWith("_")) delete opts[key as keyof typeof opts];
  }

  let config = { ...defaultConfig, ...opts };

  return config;
}

export default webpackConfig();
