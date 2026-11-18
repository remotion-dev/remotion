import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';

export const createSvgDataMimeFixture = (
	svg: string,
	mediaType: string,
	cover: boolean,
) => {
	const Component = () => {
		const current = useCurrentFrame();
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<div
					style={{
						position: 'absolute',
						left: 8 + current,
						top: 8 + current,
						width: 80,
						height: 80,
						transform: 'scale(1.5)',
						transformOrigin: '0 0',
					}}
				>
					<AbsoluteFill
						style={{
							backgroundColor: 'white',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Img
							src={`data:${mediaType},${encodeURIComponent(svg)}`}
							style={
								cover
									? {
											width: 50,
											height: 30,
											objectFit: 'cover',
											filter: 'blur(4px)',
										}
									: {width: 65, height: 78}
							}
						/>
					</AbsoluteFill>
				</div>
			</AbsoluteFill>
		);
	};

	return {
		component: Component,
		id: 'svg-data-mime-case',
		width: 160,
		height: 160,
		fps: 25,
		durationInFrames: 2,
	};
};

const source =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 100 200 240"><path fill="#0B84F3" d="M100 100L300 220L100 340Z"/></svg>\n';

export const svgDataMimeLowercase = {
	...createSvgDataMimeFixture(source, 'image/svg+xml;charset=utf-8', false),
	id: 'svg-data-mime-lowercase',
};
export const svgDataMimeUppercase = {
	...createSvgDataMimeFixture(source, 'IMAGE/SVG+XML;charset=utf-8', false),
	id: 'svg-data-mime-uppercase',
};
export const svgDataMimeCoverLowercase = {
	...createSvgDataMimeFixture(source, 'image/svg+xml;charset=utf-8', true),
	id: 'svg-data-mime-cover-lowercase',
};
export const svgDataMimeCoverUppercase = {
	...createSvgDataMimeFixture(source, 'IMAGE/SVG+XML;charset=utf-8', true),
	id: 'svg-data-mime-cover-uppercase',
};

export const svgDataMimeWhitespace = {
	...createSvgDataMimeFixture(source, 'image/svg+xml ', false),
	id: 'svg-data-mime-whitespace',
};
export const svgDataMimeCoverWhitespace = {
	...createSvgDataMimeFixture(source, 'image/svg+xml ', true),
	id: 'svg-data-mime-cover-whitespace',
};
