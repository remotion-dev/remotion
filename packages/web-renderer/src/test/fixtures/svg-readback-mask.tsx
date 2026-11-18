import {useCurrentFrame} from 'remotion';
import {rasterMask} from './mask-image-url-sizing';
import {
	SvgFontFamilyLifetimeScene,
	svgFontFamilyLifetimeFamily,
} from './svg-font-family-lifetime';

export const svgReadbackMaskModes = [
	'none',
	'css',
	'important',
	'url',
	'toggle',
] as const;

export const svgReadbackMask = (
	mode: (typeof svgReadbackMaskModes)[number],
) => {
	const Component: React.FC = () => {
		const frame = useCurrentFrame();
		const effective =
			mode === 'toggle' ? (frame === 1 ? 'none' : 'important') : mode;
		const mask =
			effective === 'none'
				? 'none'
				: effective === 'url'
					? `url("${rasterMask}")`
					: 'linear-gradient(90deg, black 50%, transparent 50%)';
		const priority = effective === 'important' ? ' !important' : '';
		return (
			<div
				className={`svg-readback-mask-${mode}`}
				style={{width: 680, height: 100, backgroundColor: 'white'}}
			>
				<style>{`.svg-readback-mask-${mode} > svg { mask-image: ${mask}${priority}; -webkit-mask-image: ${mask}${priority}; mask-size: 100% 100%; mask-repeat: no-repeat; }`}</style>
				<SvgFontFamilyLifetimeScene family={svgFontFamilyLifetimeFamily} />
			</div>
		);
	};

	return {
		id: `svg-readback-mask-${mode}`,
		width: 680,
		height: 100,
		fps: 30,
		durationInFrames: 3,
		component: Component,
	};
};
