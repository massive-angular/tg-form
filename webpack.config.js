module.exports = {
    entry: {
        tgForm: './src'
    },
    devtool: 'source-map',
    output: {
        path: './dist',
        filename: 'tg-form.js',
        sourceMapFilename: '[file].map'
    }
};
