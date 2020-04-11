module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
        mocha: true
    },
    extends: 'airbnb-base',
    globals: {
        assert: true,
        expect: true,
        fixture: true,
        flush: true,
        sinon: true
    },
    plugins: [ 'html' ],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    rules: {
        'comma-dangle': [ 'error', 'never' ],
        'no-underscore-dangle': [ 'error', { 'allowAfterThis': true }],
        'class-methods-use-this': 'off',
        'max-len': 'off'
    }
};
