import multiInput from 'rollup-plugin-multi-input'
import multiInputExtension from './rollup-plugin-modular-library-extension';
import nodeResolve from "@rollup/plugin-node-resolve";

export default {
    input: [ './**/*.esm.js'],
    output: [
        {
            format: 'es',
            preferConst: true,
            dir: './src',
            chunkFileNames: '[name]-core.js'
        }
    ],
    plugins: [
        multiInput( {
            transformOutputPath: ( output, input ) => {
                return output.replace( '.esm', '' );
            },
        } ),
        nodeResolve({
            preferBuiltins: true,
        } ),
        multiInputExtension(),
    ],
};
