import React from 'react';
import {z} from 'remotion';
import type {JSONPath} from './zod-types';
import {ZodArrayEditor} from './ZodArrayEditor';
import {ZodEffectEditor} from './ZodEffectEditor';
import {ZodNumberEditor} from './ZodNumberEditor';
import {ZodObjectEditor} from './ZodObjectEditor';
import {ZodStringEditor} from './ZodStringEditor';

export const ZodSwitch: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: unknown;
	setValue: React.Dispatch<React.SetStateAction<unknown>>;
}> = ({schema, jsonPath, value, setValue}) => {
	const def: z.ZodTypeDef = schema._def;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typeName = (def as any).typeName as z.ZodFirstPartyTypeKind;
	if (typeName === z.ZodFirstPartyTypeKind.ZodAny) {
		// TODO: Better UI for this
		return <div>any</div>;
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodObject) {
		return (
			<ZodObjectEditor
				setValue={setValue}
				value={value}
				jsonPath={jsonPath}
				schema={schema}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodString) {
		return (
			<ZodStringEditor
				value={value as string}
				setValue={setValue as React.Dispatch<React.SetStateAction<string>>}
				jsonPath={jsonPath}
				schema={schema}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodNumber) {
		return (
			<ZodNumberEditor
				value={value as number}
				setValue={setValue as React.Dispatch<React.SetStateAction<unknown>>}
				jsonPath={jsonPath}
				schema={schema}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodArray) {
		return (
			<ZodArrayEditor
				setValue={setValue as React.Dispatch<React.SetStateAction<unknown[]>>}
				value={value as unknown[]}
				jsonPath={jsonPath}
				schema={schema}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodEffects) {
		return (
			<ZodEffectEditor
				value={value}
				setValue={setValue}
				jsonPath={jsonPath}
				schema={schema}
			/>
		);
	}

	return <div>unknown</div>;
};
