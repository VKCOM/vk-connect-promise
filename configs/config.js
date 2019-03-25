const loose = true;

const babelSetup = {
  babelrc: false,
  presets: [['@babel/preset-env', { modules: false, loose }]],
  plugins: [['@babel/plugin-proposal-class-properties', { loose }]],
  exclude: 'node_modules/**',
};

export {
  babelSetup,
};
