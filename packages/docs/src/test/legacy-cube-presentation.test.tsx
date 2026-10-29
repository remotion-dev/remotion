import {expect, test} from 'bun:test';
import {cube} from '@remotion-dev/cube-presentation';
import {Thumbnail} from '@remotion/player';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const LegacyCube: React.FC = () => {
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={40}>
				<div>Legacy cube scene</div>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={cube({direction: 'from-left'})}
				timing={linearTiming({durationInFrames: 20})}
			/>
			<TransitionSeries.Sequence durationInFrames={40}>
				<div>Next scene</div>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};

test('the legacy Cube Transition package still works with TransitionSeries', () => {
	const html = renderToStaticMarkup(
		<Thumbnail
			component={LegacyCube}
			compositionWidth={640}
			compositionHeight={360}
			durationInFrames={60}
			fps={30}
			frameToDisplay={30}
			noSuspense
		/>,
	);

	expect(html).toContain('Legacy cube scene');
	expect(html).toContain('perspective:1000px');
	expect(html).toContain('Next scene');
	expect(html).toContain('rotateY(45deg)');
	expect(html).toContain('rotateY(-45deg)');
});
