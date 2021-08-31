const strColor = '#9ECBFF';
const consColor = '#79B8FF';
const propColor = '#B392F0';
const keywordColor = '#F97583';

const makeProperty = (
	key: string,
	val: number | string,
	type: 'const' | 'string'
) => {
	return [
		`  `,
		<span key={key + 'key'} style={{color: propColor}}>
			{key}
		</span>,
		<span key={key + 'equal'} style={{color: keywordColor}}>
			{'='}
		</span>,
		type === 'string'
			? [
					<span key={key + 'value'} style={{color: strColor}}>
						{'"'}
						{val}
						{'"'}
					</span>,
			  ]
			: [
					'{',
					<span
						key={key + 'value'}
						style={{color: typeof val === 'number' ? consColor : strColor}}
					>
						{val}
					</span>,
					'}',
			  ],
		<br key={key + 'br'} />,
	];
};

export const getNewCompositionCode = ({
	type,
	height,
	width,
	fps,
	durationInFrames,
	name,
}: {
	type: 'still' | 'composition';
	height: number;
	width: number;
	fps: number;
	durationInFrames: number;
	name: string;
}) => {
	return [
		`<`,
		<span key="compname" style={{color: '#79B8FF'}}>
			{type === 'still' ? 'Still' : 'Composition'}
		</span>,
		<br key="linebr1" />,
		...makeProperty('id', name, 'string'),
		...makeProperty('component', name, 'const'),
		...(type === 'composition'
			? makeProperty('durationInFrames', durationInFrames, 'const')
			: []),
		...makeProperty('height', height, 'const'),
		...makeProperty('width', width, 'const'),
		...(type === 'composition' ? makeProperty('fps', fps, 'const') : []),
		'/>',
	];
};
