import { it, describe } from "vitest";
import { RuleTester } from "eslint";

// @ts-expect-error
RuleTester.it = it;
// @ts-expect-error
RuleTester.describe = describe;
