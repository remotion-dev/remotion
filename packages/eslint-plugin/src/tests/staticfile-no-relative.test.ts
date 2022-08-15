import { ESLintUtils } from "@typescript-eslint/utils";
import rule from "../rules/staticfile-no-relative";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run("staticfile-no-relative", rule, {
  valid: [
    `
import {Img, staticFile} from 'remotion';

export const Re = () => {
  return (
    <Img src={staticFile("image.png")} />
  );
}
          `,
  ],
  invalid: [
    {
      code: `
import {staticFile} from 'remotion';

staticFile("./relative.png")
      `,
      errors: [
        {
          messageId: "RelativePathStaticFile",
        },
      ],
    },
  ],
});
