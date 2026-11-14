import {useEffect, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';
import {svgExternalFontReady} from './svg-external-font-selection';

export const svgEmptyPredicates = [
	':empty',
	':EMPTY',
	':EmPtY',
	':\\65mpty',
	':\\000065 mpty',
	':e\\6d pty',
	':\\65\\6d\\70\\74\\79',
	':not(:not(:EMPTY))',
	':is(:\\65mpty)',
] as const;

export const svgEmptyPredicate = ({
	index,
	literal,
}: {
	index: number;
	literal: boolean;
}) => {
	const Component = () => {
		const frame = useCurrentFrame();
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() =>
			delayRender('Loading empty-predicate font'),
		);
		useEffect(() => {
			svgExternalFontReady
				.then(() => continueRender(handle))
				.catch(cancelRender);
			return () => continueRender(handle);
		}, [handle, continueRender, cancelRender]);
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<svg width={120} height={60}>
					<style media="screen">
						{literal
							? '/* Literal paint control. */'
							: `style#carrier${svgEmptyPredicates[index]} + rect{fill:red}`}
					</style>
					<text style={{fontFamily: '"External SVG, class font"', fontSize: 0}}>
						Registered font
					</text>
					<style id="carrier" />
					<rect
						x={10 + frame}
						y={10}
						width={80}
						height={40}
						fill={literal ? 'red' : 'blue'}
					/>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		id: `svg-empty-predicate-${index}${literal ? '-literal' : ''}`,
		width: 120,
		height: 60,
		fps: 30,
		durationInFrames: 2,
		component: Component,
	} as const;
};
