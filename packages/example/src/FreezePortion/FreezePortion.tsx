import React, {useMemo} from 'react';
import {Interactive, useCurrentFrame, useVideoConfig} from 'remotion';

const CounterInner: React.FC<{style?: React.CSSProperties}> = ({style}) => {
	return (
		<div
			style={{
				alignItems: 'center',
				color: 'white',
				display: 'flex',
				fontSize: 60,
				height: '100%',
				justifyContent: 'center',
				...style,
			}}
		>
			{useCurrentFrame()}
		</div>
	);
};

export const Counter = Interactive.withSchema({
	Component: CounterInner,
	componentName: '<Counter>',
	schema: {},
	wrapInSequence: true,
});

const FREEZES = [
	{
		frame: 0,
		durationInFrames: 25,
	},
	{
		frame: 30,
		durationInFrames: 50,
	},
];

const getFreezes = () => {
	let summedUpFreezes = 0;
	const freezeFrames = [];
	for (const freeze of FREEZES) {
		freezeFrames.push({
			start: summedUpFreezes + freeze.frame,
			durationInFrames: freeze.durationInFrames,
			from: summedUpFreezes,
			frame: freeze.frame,
		});
		summedUpFreezes += freeze.durationInFrames;
	}
	return freezeFrames;
};

export const FreezePortion: React.FC = () => {
	const {fps} = useVideoConfig();
	const freezes = useMemo(() => {
		return getFreezes();
	}, []);
	const frame = useCurrentFrame();

	const nextFreeze = freezes.find(
		(freeze) => frame < freeze.start + freeze.durationInFrames,
	);
	const activeFreeze = freezes.find(
		(freeze) =>
			frame >= freeze.start && frame < freeze.start + freeze.durationInFrames,
	);

	const from = useMemo(() => {
		if (activeFreeze) {
			return activeFreeze.from;
		}

		if (nextFreeze) {
			return nextFreeze.from;
		}

		return (
			freezes[freezes.length - 1].from +
			freezes[freezes.length - 1].durationInFrames
		);
	}, [activeFreeze, freezes, nextFreeze]);

	return (
		<Counter
			from={from}
			freeze={activeFreeze ? activeFreeze.frame : null}
			premountFor={fps}
		/>
	);
};
