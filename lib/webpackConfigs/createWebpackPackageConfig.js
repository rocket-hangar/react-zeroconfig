"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getWebpackRawLoaders_1 = require("./getWebpackRawLoaders");
const getWebpackScriptLoaders_1 = require("./getWebpackScriptLoaders");
const getWebpackStyleLoaders_1 = require("./getWebpackStyleLoaders");
function createWebpackPackageConfig({ cwd }) {
    const extractCss = true;
    return {
        module: {
            strictExportPresence: true,
            rules: [
                {
                    oneOf: [
                        // ts, tsx, js, jsx - script
                        ...getWebpackScriptLoaders_1.getWebpackScriptLoaders({
                            cwd,
                            useWebWorker: false,
                        }),
                        // html, ejs, txt, md - plain text
                        ...getWebpackRawLoaders_1.getWebpackRawLoaders(),
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
    };
}
exports.createWebpackPackageConfig = createWebpackPackageConfig;
//# sourceMappingURL=createWebpackPackageConfig.js.map