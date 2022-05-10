import React from 'react';

const strColor = '#9ECBFF';
const consColor = '#79B8FF';
const propColor = '#B392F0';
const keywordColor = '#F97583';

const cssReset: React.CSSProperties = {
	fontFamily: 'monospace',
};

const makeProperty = (
	key: string,
	val: number | string,
	type: 'const' | 'string',
	raw: boolean
) => {
	if (raw) {
		return makePropertyRaw(key, val, type);
	}

	return [
		`  `,
		<span key={key + 'key'} style={{...cssReset, color: propColor}}>
			{key}
		</span>,
		<span key={key + 'equal'} style={{...cssReset, color: keywordColor}}>
			{'='}
		</span>,
		type === 'string'
			? [
					<span key={key + 'value'} style={{...cssReset, color: strColor}}>
						{'"'}
						{val}
						{'"'}
					</span>,
			  ]
			: [
					'{',
					<span
						key={key + 'value'}
						style={{
							...cssReset,
							color: typeof val === 'number' ? consColor : strColor,
						}}
					>
						{val}
					</span>,
					'}',
			  ],
		<br key={key + 'br'} />,
	];
};

const makePropertyRaw = (
	key: string,
	val: number | string,
	type: 'const' | 'string'
) => {
	return [
		`  `,
		key,
		'=',
		type === 'string' ? ['"' + val + '"'].join('') : ['{', val, '}'].join(''),
		'\n',
	].join('');
};

export const getNewCompositionCode = ({
	type,
	height,
	width,
	fps,
	durationInFrames,
	name,
	raw,
}: {
	type: 'still' | 'composition';
	height: number;
	width: number;
	fps: number;
	durationInFrames: number;
	name: string;
	raw: boolean;
}) => {
	const compName = type === 'still' ? 'Still' : 'Composition';

	const props = [
		...makeProperty('id', name, 'string', raw),
		...makeProperty('component', name, 'const', raw),
		...(type === 'composition'
			? makeProperty('durationInFrames', durationInFrames, 'const', raw)
			: []),
		...makeProperty('height', height, 'const', raw),
		...makeProperty('width', width, 'const', raw),
		...(type === 'composition' ? makeProperty('fps', fps, 'const', raw) : []),
	];

	if (raw) {
		return ['<', compName, '\n', ...props, '/>'].join('');
	}

	return [
		`<`,
		<span key="compname" style={{...cssReset, color: '#79B8FF'}}>
			{compName}
		</span>,
		<br key="linebr1" />,
		...props,
		'/>',
	];
};
