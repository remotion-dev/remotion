import React from 'react';
import type {z} from 'remotion';
import {LIGHT_TEXT} from '../../../helpers/colors';

const label: React.CSSProperties = {
	fontSize: 14,
	color: LIGHT_TEXT,
};

const code: React.CSSProperties = {
	...label,
	fontFamily: 'monospace',
};

export const ZodErrorMessages: React.FC<{
	zodValidationResult: z.SafeParseReturnType<unknown, unknown>;
}> = ({zodValidationResult}) => {
	if (zodValidationResult.success) {
		throw new Error('Expected error');
	}

	return (
		<div>
			{zodValidationResult.error.errors.map((error) => {
				return (
					<div key={error.path.join('.')} style={label}>
						- <code style={code}>{error.path.join('.')}</code>: {error.message}
					</div>
				);
			})}
		</div>
	);
};
