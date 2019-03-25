import { babelSetup } from '../configs/config';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import { uglify } from 'rollup-plugin-uglify';
import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';
import pkg from '../package.json';

const cusomIsArray = (maybeArr) => Array.isArray(maybeArr) ? maybeArr : [maybeArr];

const uglifyOutput = {
  output: {
    comments: (node, comment) => {
      const text = comment.value;
      const type = comment.type;
      if (type === 'comment2') {
        // multiline comment
        return /@preserve|@license|@cc_on/i.test(text);
      }
    },
  },
};

const createConfig = ({ output, env } = {}) => {
  const umd = output.format === 'umd';

  if (umd && typeof env === 'undefined') {
    throw new Error('You need to specify `env` when using umd format.');
  }

  const min = umd && env === 'production';

  return {
    input: 'src/index.js',
    external: ['@babel/polyfill'],
    plugins: [
      babel(babelSetup),
      resolve(),
      commonJS(),
      env && replace({
        'process.env.NODE_ENV': JSON.stringify(env),
      }),
      min && uglify(uglifyOutput),
    ].filter(Boolean),
    output: cusomIsArray(output).map((format) =>
      Object.assign(
        {},
        format,
        {
          name: 'VKUI-Connect-Promise',
        }
      )
    ),
  };
};

export default [
  createConfig({
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
  }),
];
