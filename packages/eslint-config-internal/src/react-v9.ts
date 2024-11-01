import {Linter} from 'eslint';
import {plugins, rules} from './base';

export const reactV9Config: Linter.Config = {
	rules: rules(true),
	plugins: plugins(true),
};
