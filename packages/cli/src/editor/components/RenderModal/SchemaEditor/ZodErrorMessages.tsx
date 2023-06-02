import React from 'react';
import type {z} from 'zod';
import {FAIL_COLOR} from '../../../helpers/colors';
import {Spacing} from '../../layout';
import {WarningTriangle} from '../../NewComposition/ValidationMessage';

const label: React.CSSProperties = {
	fontSize: 13,
	color: 'white',
	fontFamily: 'sans-serif',
	display: 'flex',
	alignItems: 'center',
};

const triangleStyle: React.CSSProperties = {
	width: 12,
	height: 12,
	flexShrink: 0,
	fill: FAIL_COLOR,
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
						<WarningTriangle style={triangleStyle} />
						<Spacing x={1} />
						{error.path.length === 0 ? 'Root' : error.path.join('.')}:{' '}
						{error.message}
					</div>
				);
			})}
		</div>
	);
};
