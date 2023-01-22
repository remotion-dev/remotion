import { ESLintUtils } from "@typescript-eslint/utils";
import rule from "../rules/no-background-image";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
});

ruleTester.run("no-background-image", rule, {
  valid: [`const hi = {"background-image": 0}`],
  invalid: [
    {
      code: `const hi = {backgroundImage: 0}`,
      errors: [
        {
          messageId: "BackgroundImage",
        },
      ],
    },
  ],
});
