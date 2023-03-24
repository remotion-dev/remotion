import React from 'react';
import {z} from 'remotion';
import {
	INPUT_BORDER_COLOR_UNHOVERED,
	LIGHT_TEXT,
} from '../../../helpers/colors';
import {optionRow} from '../layout';
import type {JSONPath} from './zod-types';
import {ZodSwitch} from './ZodSwitch';

const container: React.CSSProperties = {
	width: '100%',
};

const fullWidth: React.CSSProperties = {
	width: '100%',
};

const fieldset: React.CSSProperties = {
	borderRadius: 4,
	borderColor: INPUT_BORDER_COLOR_UNHOVERED,
};

const fieldsetLabel: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 14,
	paddingLeft: 10,
	paddingRight: 10,
};

export const ZodArrayEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: unknown[];
	setValue: (value: unknown[]) => void;
}> = ({schema, jsonPath, setValue, value}) => {
	const def = schema._def;

	const typeName = def.typeName as z.ZodFirstPartyTypeKind;
	if (typeName !== z.ZodFirstPartyTypeKind.ZodArray) {
		throw new Error('expected object');
	}

	console.log(def);

	const isRoot = jsonPath.length === 0;
	const Element = isRoot ? 'div' : 'fieldset';

	const {paddingLeft, paddingTop} = optionRow;

	return (
		<div style={isRoot ? undefined : {paddingLeft, paddingTop}}>
			<div style={fullWidth}>
				<Element style={fieldset}>
					{isRoot ? null : (
						<legend style={fieldsetLabel}>
							{jsonPath[jsonPath.length - 1]}
						</legend>
					)}
					<div style={isRoot ? undefined : container}>
						{value.map((child, i) => {
							return (
								<ZodSwitch
									// eslint-disable-next-line react/no-array-index-key
									key={i}
									jsonPath={[...jsonPath, i]}
									schema={def.type}
									value={child}
									setValue={(val) => {
										setValue([
											...value.slice(0, i),
											val,
											...value.slice(i + 1),
										]);
									}}
								/>
							);
						})}
					</div>
				</Element>
			</div>
		</div>
	);
};
