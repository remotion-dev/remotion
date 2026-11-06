import {AbsoluteFill, Img, staticFile} from 'remotion';

// An SVG loaded from a URL (not a data URI) with a non-zero-origin viewBox and
// no width/height attributes. Reproduces #12953.
const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: 'white',
				justifyContent: 'center',
			}}
		>
			<Img
				src={staticFile('nonzero-viewbox.svg')}
				style={{width: 65, height: 78}}
			/>
		</AbsoluteFill>
	);
};

export const svgUrlNonzeroViewbox = {
	component: Component,
	id: 'svg-url-nonzero-viewbox',
	width: 80,
	height: 80,
	fps: 25,
	durationInFrames: 1,
} as const;
