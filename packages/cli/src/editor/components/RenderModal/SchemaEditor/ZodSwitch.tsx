import {z} from 'remotion';
import type {JSONPath} from './zod-types';
import {ZodEffectEditor} from './ZodEffectEditor';
import {ZodObjectEditor} from './ZodObjectEditor';
import {ZodStringEditor} from './ZodStringEditor';

export const ZodSwitch: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: unknown;
	setValue: (value: unknown) => void;
}> = ({schema, jsonPath, value, setValue}) => {
	const def: z.ZodTypeDef = schema._def;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typeName = (def as any).typeName as z.ZodFirstPartyTypeKind;
	if (typeName === z.ZodFirstPartyTypeKind.ZodAny) {
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
				setValue={setValue as (val: string) => void}
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
