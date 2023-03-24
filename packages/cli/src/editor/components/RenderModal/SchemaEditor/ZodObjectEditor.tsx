import React from 'react';
import {z} from 'remotion';
import {label, optionRow} from '../layout';
import type {JSONPath} from './zod-types';
import {ZodSwitch} from './ZodSwitch';

const container: React.CSSProperties = {
	borderLeft: '1px solid white',
};

export const ZodObjectEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
}> = ({schema, jsonPath}) => {
	const def = schema._def;

	const typeName = def.typeName as z.ZodFirstPartyTypeKind;
	if (typeName !== z.ZodFirstPartyTypeKind.ZodObject) {
		throw new Error('expected object');
	}

	const shape = def.shape();
	const keys = Object.keys(shape);

	const isRoot = jsonPath.length === 0;

	return (
		<div style={isRoot ? undefined : optionRow}>
			<div>
				{isRoot ? null : (
					<div style={label}>{jsonPath[jsonPath.length - 1]}</div>
				)}
				<div style={isRoot ? undefined : container}>
					{keys.map((key) => {
						return (
							<ZodSwitch
								key={key}
								jsonPath={[...jsonPath, key]}
								schema={shape[key]}
							/>
						);
					})}
				</div>
			</div>
		</div>
	);
};
