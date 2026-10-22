import {ESLintUtils} from '@typescript-eslint/utils';
import {RuleTester as RuleTester9} from 'eslint-v9';
import {RuleTester as RuleTester10} from 'eslint-v10';
import tseslint from 'typescript-eslint';

export const createRuleTester = (
	options: ConstructorParameters<typeof ESLintUtils.RuleTester>[0],
) => {
	const legacy = new ESLintUtils.RuleTester(options);
	const config = {
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: options?.parserOptions ?? {},
		},
	};
	const eslint9 = new RuleTester9(config);
	const eslint10 = new RuleTester10(config);

	const run: typeof legacy.run = (name, rule, cases) => {
		legacy.run(`${name} (ESLint 8)`, rule, cases);
		eslint9.run(
			`${name} (ESLint 9)`,
			rule as unknown as Parameters<typeof eslint9.run>[1],
			cases as unknown as Parameters<typeof eslint9.run>[2],
		);
		eslint10.run(
			`${name} (ESLint 10)`,
			rule as unknown as Parameters<typeof eslint10.run>[1],
			cases as unknown as Parameters<typeof eslint10.run>[2],
		);
	};

	return {run};
};
