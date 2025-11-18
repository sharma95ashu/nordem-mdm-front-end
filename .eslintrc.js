module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["react", "@typescript-eslint"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "jest/valid-expect": 0,
    "react/prop-types": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "no-underscore-dangle": 0,
    "class-methods-use-this": 0,
    "arrow-parens": 0, // Prettier messes this one up
    "no-plusplus": 0,
    "no-use-before-define": 0,
    "global-require": 0,
    "import/no-extraneous-dependencies": 0,
    "function-paren-newline": 0,
    "react/jsx-filename-extension": 0, // Prefer .js
    "react/prefer-stateless-function": 1, // Just warn
    "jsx-a11y/accessible-emoji": 0, // Because I was lazy
    "jsx-a11y/label-has-for": 0,
    "react/destructuring-assignment": 0,
    "import/no-cycle": 0,
    "react/jsx-props-no-spreading": 0,
    "react/state-in-constructor": 0,
    "react/sort-comp": 0,
    "react/require-default-props": 0,
    "react/display-name": 0,
    "react/button-has-type": 0,
    "react/jsx-no-bind": 0,
    "no-empty": "off",
    "jsx-a11y/label-has-associated-control": 0,
    "@typescript-eslint/no-unused-vars": "off",
    "no-unused-vars": ["error", { vars: "all", args: "none" }]
  }
};
