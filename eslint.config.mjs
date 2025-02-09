import globals from "globals";
import js from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  {
   files: [ "**/*.ts", "**/*.cts", "**.*.mts" ],
   languageOptions: {
     globals:
      [...globals.browser, ...globals.node]
   }
  }
];
