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

// Same SVG with `object-fit: cover` and a blur: the blur must extend past the
// image box while the cover crop stays inside it.
const BlurredCover: React.FC = () => {
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
				style={{width: 50, height: 30, objectFit: 'cover', filter: 'blur(4px)'}}
			/>
		</AbsoluteFill>
	);
};

export const svgUrlBlurredCover = {
	component: BlurredCover,
	id: 'svg-url-blurred-cover',
	width: 80,
	height: 80,
	fps: 25,
	durationInFrames: 1,
} as const;
