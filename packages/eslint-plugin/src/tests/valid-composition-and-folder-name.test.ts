import {ESLintUtils} from '@typescript-eslint/utils';
import rule from '../rules/valid-composition-and-folder-name';

const ruleTester = new ESLintUtils.RuleTester({
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
	},
});

ruleTester.run('valid-composition-and-folder-name', rule, {
	valid: [
		`
import {Composition} from 'remotion';

export const Re = () => {
  return (
    <Composition id="valid-id-123" />
  );
}
          `,
		`
import {Still} from 'remotion';

export const Re = () => {
  return (
    <Still id={"valid-id"} />
  );
}
          `,
		`
import {Composition} from 'remotion';

export const Re = () => {
  return (
    <Composition id={\`valid-id\`} />
  );
}
          `,
		`
import {Folder} from 'remotion';

export const Re = () => {
  return (
    <Folder name="valid-folder">
      <Composition id="valid-id" />
    </Folder>
  );
}
          `,
		`
import {Composition, Folder} from 'remotion';

export const Re = () => {
  const id = "dynamic id";
  const name = "dynamic folder";
  return (
    <Folder name={name}>
      <Composition id={id} />
    </Folder>
  );
}
          `,
		`
import {Composition, Folder} from 'remotion';

export const Re = () => {
  return (
    <Folder name="中文">
      <Composition id="中文" />
    </Folder>
  );
}
          `,
	],
	invalid: [
		{
			code: `
import {Composition} from 'remotion';

export const Re = () => {
  return (
    <Composition id="invalid id" />
  );
}
      `,
			errors: [
				{
					messageId: 'InvalidCompositionId',
				},
			],
		},
		{
			code: `
import {Composition} from 'remotion';

export const Re = () => {
  return (
    <Composition id={"invalid/id"} />
  );
}
      `,
			errors: [
				{
					messageId: 'InvalidCompositionId',
				},
			],
		},
		{
			code: `
import {Still} from 'remotion';

export const Re = () => {
  return (
    <Still id="invalid_id" />
  );
}
      `,
			errors: [
				{
					messageId: 'InvalidCompositionId',
				},
			],
		},
		{
			code: `
import {Composition} from 'remotion';

export const Re = () => {
  return (
    <Composition id={\`invalid id\`} />
  );
}
      `,
			errors: [
				{
					messageId: 'InvalidCompositionId',
				},
			],
		},
		{
			code: `
import {Folder} from 'remotion';

export const Re = () => {
  return (
    <Folder name="invalid folder" />
  );
}
      `,
			errors: [
				{
					messageId: 'InvalidFolderName',
				},
			],
		},
		{
			code: `
import {Folder} from 'remotion';

export const Re = () => {
  return (
    <Folder name={"invalid/folder"} />
  );
}
      `,
			errors: [
				{
					messageId: 'InvalidFolderName',
				},
			],
		},
	],
});
