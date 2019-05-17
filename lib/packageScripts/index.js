"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cfonts_1 = require("cfonts");
const fs_extra_1 = __importDefault(require("fs-extra"));
const mini_css_extract_plugin_1 = __importDefault(require("mini-css-extract-plugin"));
const path_1 = __importDefault(require("path"));
const webpack_merge_1 = __importDefault(require("webpack-merge"));
const webpack_node_externals_1 = __importDefault(require("webpack-node-externals"));
const getInternalPackageEntry_1 = require("../internalPackage/getInternalPackageEntry");
const buildTypescriptDeclarations_1 = require("../runners/buildTypescriptDeclarations");
const fsCopySourceFilter_1 = require("../runners/fsCopySourceFilter");
const runWebpack_1 = require("../runners/runWebpack");
const getBabelConfig_1 = require("../transpile/getBabelConfig");
const getTSConfigCompilerOptions_1 = require("../transpile/getTSConfigCompilerOptions");
const rimraf_promise_1 = require("../utils/rimraf-promise");
const sayTitle_1 = require("../utils/sayTitle");
const createBaseWebpackConfig_1 = require("../webpackConfigs/createBaseWebpackConfig");
const getWebpackBasicLoaders_1 = require("../webpackConfigs/getWebpackBasicLoaders");
const getWebpackStyleLoaders_1 = require("../webpackConfigs/getWebpackStyleLoaders");
const createPackageBuildOptions_1 = require("./createPackageBuildOptions");
const createPackagePublishOptions_1 = require("./createPackagePublishOptions");
const help_1 = __importDefault(require("./help"));
const parsePackageArgv_1 = require("./parsePackageArgv");
const publishPackage_1 = require("./publishPackage");
const selectPublishOptions_1 = require("./selectPublishOptions");
const zeroconfigPath = path_1.default.join(__dirname, '../..');
async function packageScripts(nodeArgv, { cwd = process.cwd() } = {}) {
    if (nodeArgv.indexOf('--help') > -1) {
        console.log(help_1.default);
        return;
    }
    const { command } = parsePackageArgv_1.parsePackageArgv(nodeArgv);
    cfonts_1.say('ZEROCONFIG', { font: 'block' });
    sayTitle_1.sayTitle('EXECUTED COMMAND');
    console.log('zeroconfig-package-scripts ' + nodeArgv.join(' '));
    if (command === 'build') {
        process.env.BROWSERSLIST_ENV = 'package';
        await build({ cwd });
    }
    else if (command === 'publish') {
        await publish({ cwd });
    }
    else {
        console.error('Unknown command :', command);
    }
}
exports.packageScripts = packageScripts;
async function publish({ cwd }) {
    try {
        const entry = await getInternalPackageEntry_1.getInternalPackageEntry({ packageDir: path_1.default.join(cwd, 'src/_packages') });
        const publishOptions = await createPackagePublishOptions_1.createPackagePublishOptions({ entry, cwd, version: 'latest' });
        sayTitle_1.sayTitle('SELECT PACKAGES TO PUBLISH');
        const selectedPublishOptions = await selectPublishOptions_1.selectPublishOptions({ publishOptions });
        for await (const publishOption of selectedPublishOptions) {
            sayTitle_1.sayTitle('PUBLISH PACKAGE - ' + publishOption.name);
            await publishPackage_1.publishPackage({ publishOption, cwd });
        }
    }
    catch (error) {
        sayTitle_1.sayTitle('⚠️ PUBLISH PACKAGES ERROR');
        console.error(error);
    }
}
async function build({ cwd }) {
    try {
        await rimraf_promise_1.rimraf(path_1.default.join(cwd, 'dist/packages'));
        const extractCss = true;
        const entry = await getInternalPackageEntry_1.getInternalPackageEntry({ packageDir: path_1.default.join(cwd, 'src/_packages') });
        const buildOptions = await createPackageBuildOptions_1.createPackageBuildOptions({ entry, cwd });
        const compilerOptions = getTSConfigCompilerOptions_1.getTSConfigCompilerOptions({ cwd });
        for await (const { name, file, externals, buildTypescriptDeclaration } of buildOptions) {
            //await fs.mkdirp(path.join(cwd, 'dist/packages', name));
            if (buildTypescriptDeclaration) {
                sayTitle_1.sayTitle('BUILD TYPESCRIPT DECLARATIONS - ' + name);
                await buildTypescriptDeclarations_1.buildTypescriptDeclarations({
                    cwd,
                    file,
                    name,
                    compilerOptions,
                    typeRoots: [path_1.default.join(cwd, 'dist/packages')],
                    declarationDir: path_1.default.join(cwd, 'dist/packages', name),
                });
            }
            sayTitle_1.sayTitle('COPY PACKAGE FILES - ' + name);
            await fs_extra_1.default.copy(path_1.default.join(cwd, 'src/_packages', name), path_1.default.join(cwd, 'dist/packages', name), {
                filter: fsCopySourceFilter_1.fsCopySourceFilter,
            });
            const webpackConfig = webpack_merge_1.default(createBaseWebpackConfig_1.createBaseWebpackConfig({ zeroconfigPath }), {
                mode: 'production',
                entry: () => file,
                externals: [webpack_node_externals_1.default(), ...externals],
                output: {
                    path: path_1.default.join(cwd, 'dist/packages', name),
                    filename: 'index.js',
                    libraryTarget: 'commonjs',
                },
                optimization: {
                    concatenateModules: true,
                    minimize: false,
                },
                module: {
                    rules: [
                        {
                            oneOf: [
                                // ts, tsx, js, jsx - script
                                // html, ejs, txt, md - plain text
                                ...getWebpackBasicLoaders_1.getWebpackBasicLoaders({
                                    include: path_1.default.join(cwd, 'src/_packages', name),
                                    babelConfig: getBabelConfig_1.getBabelConfig({
                                        cwd,
                                        modules: false,
                                    }),
                                }),
                                // css, scss, sass, less - style
                                // module.* - css module
                                ...getWebpackStyleLoaders_1.getWebpackStyleLoaders({
                                    cssRegex: /\.css$/,
                                    cssModuleRegex: /\.module.css$/,
                                    extractCss,
                                }),
                                ...getWebpackStyleLoaders_1.getWebpackStyleLoaders({
                                    cssRegex: /\.(scss|sass)$/,
                                    cssModuleRegex: /\.module.(scss|sass)$/,
                                    extractCss,
                                    preProcessor: 'sass-loader',
                                }),
                                ...getWebpackStyleLoaders_1.getWebpackStyleLoaders({
                                    cssRegex: /\.less$/,
                                    cssModuleRegex: /\.module.less$/,
                                    extractCss,
                                    preProcessor: 'less-loader',
                                }),
                            ],
                        },
                    ],
                },
                plugins: [
                    new mini_css_extract_plugin_1.default({
                        filename: 'index.css',
                    }),
                ],
            });
            sayTitle_1.sayTitle('BUILD PACKAGE - ' + name);
            console.log(await runWebpack_1.runWebpack(webpackConfig));
        }
    }
    catch (error) {
        sayTitle_1.sayTitle('⚠️ BUILD PACKAGES ERROR');
        console.error(error);
    }
}
//# sourceMappingURL=index.js.map