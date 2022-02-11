import { ESLintUtils } from "@typescript-eslint/utils";
import rule from "../rules/no-mp4-import";
const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
});

ruleTester.run("no-mp4-import", rule, {
  valid: [
    'const hi = require("hi")',
    'import hi from "hi.mp3"',
    'const falsePosition = ".mp4"; require("hi"+1+".png") ',
  ],
  invalid: [
    {
      code: 'const hi = require("hi.mp4")',
      errors: [
        {
          messageId: "NoMP4Import",
        },
      ],
    },
    {
      code: 'const hi = require("hi" + 2 + ".mp4")',
      errors: [
        {
          messageId: "NoMP4Import",
        },
      ],
    },
    {
      code: 'import "hi.mp4"',
      errors: [
        {
          messageId: "NoMP4Import",
        },
      ],
    },
    {
      code: 'import hi from "hi.mp4"',
      errors: [
        {
          messageId: "NoMP4Import",
        },
      ],
    },
  ],
});
