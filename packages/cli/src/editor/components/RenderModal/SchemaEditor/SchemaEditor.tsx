import React from 'react';
import {z} from 'remotion';
import {LIGHT_TEXT} from '../../../helpers/colors';
import {Spacing} from '../../layout';
import {ZodErrorMessages} from './ZodErrorMessages';
import {ZodObjectEditor} from './ZodObjectEditor';

const errorExplanation: React.CSSProperties = {
	fontSize: 14,
	color: LIGHT_TEXT,
};

const codeSnippet: React.CSSProperties = {
	fontSize: 14,
	color: LIGHT_TEXT,
	fontFamily: 'monospace',
};

export const SchemaEditor: React.FC<{
	schema: z.ZodTypeAny;
	value: unknown;
	setValue: (value: unknown) => void;
	zodValidationResult: z.SafeParseReturnType<unknown, unknown>;
}> = ({schema, value, setValue, zodValidationResult}) => {
	const def: z.ZodTypeDef = schema._def;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typeName = (def as any).typeName as z.ZodFirstPartyTypeKind;

	if (typeName === z.ZodFirstPartyTypeKind.ZodAny) {
		return (
			<div style={errorExplanation}>
				The schema an <code style={codeSnippet}>any</code> type.
				<br /> Tweak the schema by adding a{' '}
				<code style={codeSnippet}>schema</code> prop to the{' '}
				<code style={codeSnippet}>{'<Composition>'}</code> component.
			</div>
		);
	}

	if (!zodValidationResult.success) {
		// TODO: Distinguish between default props not valid and JSON input not valid
		return (
			<div>
				<div style={errorExplanation}>
					The data does not satisfy the schema:
				</div>
				<Spacing y={1} block />
				<ZodErrorMessages zodValidationResult={zodValidationResult} />
				<Spacing y={1} block />
				<div style={errorExplanation}>
					Fix the schema using the JSON editor.
				</div>
			</div>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodObject) {
		return (
			<ZodObjectEditor
				value={value}
				setValue={setValue}
				jsonPath={[]}
				schema={schema}
			/>
		);
	}

	return null;
};
