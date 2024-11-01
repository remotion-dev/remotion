import {FlatCompat} from '@eslint/eslintrc';
import {Linter} from 'eslint';
import {base} from './base';

const compat = new FlatCompat({});

export const reactV9Config: Linter.Config = compat.config(base(true));
