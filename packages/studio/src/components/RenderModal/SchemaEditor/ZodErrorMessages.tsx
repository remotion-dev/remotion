import React, {useMemo} from 'react';
import {FAIL_COLOR, LIGHT_TEXT, WHITE} from '../../../helpers/colors';
import {Spacing} from '../../layout';
import {WarningTriangle} from '../../NewComposition/ValidationMessage';
import type {ZodSafeParseResult} from './zod-schema-type';

const schemaLabel: React.CSSProperties = {
	fontSize: 14,
	color: LIGHT_TEXT,
};

const compactSchemaLabel: React.CSSProperties = {
	...schemaLabel,
	fontSize: 12,
};

const jsonLabel: React.CSSProperties = {
	color: WHITE,
	fontSize: 13,
	fontFamily: 'sans-serif',
	display: 'flex',
	alignItems: 'center',
};

const compactJsonLabel: React.CSSProperties = {
	...jsonLabel,
	fontSize: 12,
};

const triangleStyle: React.CSSProperties = {
	width: 12,
	height: 12,
	flexShrink: 0,
	fill: FAIL_COLOR,
};

const compactTriangleStyle: React.CSSProperties = {
	...triangleStyle,
	width: 10,
	height: 10,
};

export const ZodErrorMessages: React.FC<{
	readonly zodValidationResult: ZodSafeParseResult;
	readonly viewTab: 'schema' | 'json';
	readonly size?: 'default' | 'compact';
}> = ({zodValidationResult, viewTab, size = 'default'}) => {
	if (zodValidationResult.success) {
		throw new Error('Expected error');
	}

	const style: React.CSSProperties = useMemo(() => {
		if (viewTab === 'json') {
			return size === 'compact' ? compactJsonLabel : jsonLabel;
		}

		return size === 'compact' ? compactSchemaLabel : schemaLabel;
	}, [size, viewTab]);

	const code: React.CSSProperties = useMemo(() => {
		return {
			...(size === 'compact' ? compactSchemaLabel : schemaLabel),
			fontFamily: 'monospace',
		};
	}, [size]);
	const finalTriangleStyle =
		size === 'compact' ? compactTriangleStyle : triangleStyle;

	if (viewTab === 'json') {
		return (
			<div>
				{zodValidationResult.error.issues.map((error) => {
					return (
						<div key={error.path.join('.')} style={style}>
							<WarningTriangle style={finalTriangleStyle} />
							<Spacing x={size === 'compact' ? 0.75 : 1} />
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
			{zodValidationResult.error.issues.map((error) => {
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
