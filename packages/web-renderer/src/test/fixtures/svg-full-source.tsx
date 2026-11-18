import {useEffect, useState} from 'react';
import {
	AbsoluteFill,
	Img,
	staticFile,
	useCurrentFrame,
	useDelayRender,
} from 'remotion';

// Same bytes as nonzero-viewbox.svg, exposed through an unclassified blob URL.
const svg =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 100 200 240"><path fill="#0B84F3" d="M100 100L300 220L100 340Z"/></svg>\n';

export const createSvgFullSourceFixture = (
	source: 'url' | 'blob',
	objectFit: 'fill' | 'contain',
	boxWidth?: number,
) => {
	const Component = () => {
		const frame = useCurrentFrame();
		const {delayRender, continueRender} = useDelayRender();
		const [handle] = useState(() => delayRender('Create SVG source URL'));
		const [src, setSrc] = useState<string | null>(null);
		useEffect(() => {
			const url =
				source === 'blob'
					? URL.createObjectURL(new Blob([svg], {type: 'image/svg+xml'}))
					: staticFile('nonzero-viewbox.svg');
			setSrc(url);
			return () => {
				if (source === 'blob') URL.revokeObjectURL(url);
			};
		}, []);
		useEffect(() => {
			if (src !== null) continueRender(handle);
		}, [continueRender, handle, src]);
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<div
					style={{
						position: 'absolute',
						left: 8 + frame,
						top: 8,
						width: 80,
						height: 80,
						transform: 'scale(1.5)',
						transformOrigin: '0 0',
					}}
				>
					<AbsoluteFill
						style={{alignItems: 'center', justifyContent: 'center'}}
					>
						{src === null ? null : (
							<Img
								src={src}
								style={{
									width: boxWidth ?? (objectFit === 'contain' ? 78 : 65),
									height: 78,
									objectFit,
								}}
							/>
						)}
					</AbsoluteFill>
				</div>
			</AbsoluteFill>
		);
	};

	return {
		id: `svg-full-source-${source}-${objectFit}${boxWidth === undefined ? '' : `-${String(boxWidth).replace('.', '-')}`}`,
		width: 160,
		height: 160,
		fps: 25,
		durationInFrames: 2,
		component: Component,
	};
};

export const svgFullSourceUrlFill = createSvgFullSourceFixture('url', 'fill');
export const svgFullSourceBlobFill = createSvgFullSourceFixture('blob', 'fill');
export const svgFullSourceUrlContain = createSvgFullSourceFixture(
	'url',
	'contain',
);
export const svgFullSourceBlobContain = createSvgFullSourceFixture(
	'blob',
	'contain',
);

export const svgFullSourceUrlContain64 = createSvgFullSourceFixture(
	'url',
	'contain',
	64,
);
export const svgFullSourceBlobContain64 = createSvgFullSourceFixture(
	'blob',
	'contain',
	64,
);
export const svgFullSourceUrlContain61 = createSvgFullSourceFixture(
	'url',
	'contain',
	61,
);
export const svgFullSourceBlobContain61 = createSvgFullSourceFixture(
	'blob',
	'contain',
	61,
);

export const svgFullSourceUrlContainFractional = createSvgFullSourceFixture(
	'url',
	'contain',
	31.359375,
);
export const svgFullSourceBlobContainFractional = createSvgFullSourceFixture(
	'blob',
	'contain',
	31.359375,
);
