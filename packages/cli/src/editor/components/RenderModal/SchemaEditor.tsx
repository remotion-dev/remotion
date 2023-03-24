import React from 'react';
import {z} from 'remotion';
import {LIGHT_TEXT} from '../../helpers/colors';

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
}> = ({schema}) => {
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

	return null;
};
