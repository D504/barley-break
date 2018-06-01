/* Configure HTMLWebpack plugin */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack');

const HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
    template: path.join(__dirname, '..', 'src', 'index.html'),
    filename: 'index.html',
    inject: 'body'
})

module.exports = {
    entry: [
        './src/index.ts'
    ],
    output: {
        path: path.join(__dirname, '..', 'dist'),
        filename: 'index.js',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'awesome-typescript-loader'
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            'three/OrbitControls': path.join(__dirname, '..', 'node_modules/three/examples/js/controls/OrbitControls.js')
        }
    },
    plugins: [
        HTMLWebpackPluginConfig,
        new webpack.ProvidePlugin({
            'THREE': 'three'
        })
    ]
}
