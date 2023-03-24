import {z} from 'remotion';
import type {JSONPath} from './zod-types';
import {ZodSwitch} from './ZodSwitch';

export const ZodEffectEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: unknown;
	setValue: (value: unknown) => void;
}> = ({schema, jsonPath, value, setValue}) => {
	const def = schema._def;
	const typeName = def.typeName as z.ZodFirstPartyTypeKind;
	if (typeName !== z.ZodFirstPartyTypeKind.ZodEffects) {
		throw new Error('expected effect');
	}

	return (
		<ZodSwitch
			value={value}
			setValue={setValue}
			jsonPath={jsonPath}
			schema={def.schema}
		/>
	);
};
