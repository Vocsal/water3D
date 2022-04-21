module.exports = {
    resolve: {
        extensions: [".glsl"],
    },
    module: {
        rules: [
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /(node_modules|bower_components)/,
                use: ["raw-loader", "glslify-loader"],
            }
        ]
    }
}