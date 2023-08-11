const config = {
  '**/*.(ts|js|cjs|mjs)': (filenames) => [
    'yarn tsc',
    `yarn lint --fix ${filenames.join(' ')}`,
    `yarn prettier --write ${filenames.join(' ')}`,
  ],

  '**/*.(md|json)': (filenames) =>
    `yarn prettier --write ${filenames.join(' ')}`,
};

module.exports = config;
