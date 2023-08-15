import React, {useMemo} from 'react';
import type {z} from 'zod';
import {FAIL_COLOR, LIGHT_TEXT} from '../../../helpers/colors';
import {Spacing} from '../../layout';
import {WarningTriangle} from '../../NewComposition/ValidationMessage';

const schemaLabel: React.CSSProperties = {
	fontSize: 14,
	color: LIGHT_TEXT,
};

const jsonLabel: React.CSSProperties = {
	color: 'white',
	fontSize: 13,
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
	viewTab: 'schema' | 'json';
}> = ({zodValidationResult, viewTab}) => {
	if (zodValidationResult.success) {
		throw new Error('Expected error');
	}

	const style: React.CSSProperties = useMemo(() => {
		return viewTab === 'json' ? jsonLabel : schemaLabel;
	}, [viewTab]);

	const code: React.CSSProperties = useMemo(() => {
		return {
			...schemaLabel,
			fontFamily: 'monospace',
		};
	}, []);

	if (viewTab === 'json') {
		return (
			<div>
				{zodValidationResult.error.errors.map((error) => {
					return (
						<div key={error.path.join('.')} style={style}>
							<WarningTriangle style={triangleStyle} />
							<Spacing x={1} />
							{error.path.length === 0 ? 'Root' : error.path.join('.')}:{' '}
							{error.message}
						</div>
					);
				})}
			</div>
		);
	}

	return (
		<div>
			{zodValidationResult.error.errors.map((error) => {
				return (
					<div key={error.path.join('.')} style={style}>
						-{' '}
						<code style={code}>
							{error.path.length === 0 ? 'Root' : error.path.join('.')}
						</code>
						: {error.message}
					</div>
				);
			})}
		</div>
	);
};
