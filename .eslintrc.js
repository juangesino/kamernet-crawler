module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: ['airbnb-base', 'prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'no-console': 'off',
    'prettier/prettier': ['error'],
    'no-param-reassign': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'prefer-destructuring': [
      'error',
      {
        object: true,
        array: false
      }
    ]
  }
}
