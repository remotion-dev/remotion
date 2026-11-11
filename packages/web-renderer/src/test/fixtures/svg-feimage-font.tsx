import {useCurrentFrame} from 'remotion';

export const svgFeImageFontModes = ['href', 'xlink', 'nested'] as const;
export const svgFeImageFont = (
	mode: (typeof svgFeImageFontModes)[number],
	literal: boolean,
	fallback: boolean,
) => {
	const Component = () => {
		const frame = useCurrentFrame();
		const font = {
			fontFamily: fallback ? 'serif' : 'monospace',
			fontSize: fallback ? 16 : 32 + frame * 2,
			fontWeight: 700,
		};
		return (
			<svg width="280" height="80" style={{background: 'white'}}>
				<defs>
					<text
						id="feimage-label"
						x="4"
						y="48"
						style={literal ? font : undefined}
					>
						Font glyphs
					</text>
					<g id="feimage-art">
						<use href="#feimage-label" style={font} />
					</g>
					<g id="feimage-outer">
						<use href="#feimage-art" />
					</g>
					<filter
						id="feimage-paint"
						x="0"
						y="0"
						width="280"
						height="80"
						filterUnits="userSpaceOnUse"
						primitiveUnits="userSpaceOnUse"
					>
						<feImage
							{...(mode === 'xlink'
								? {xlinkHref: '#feimage-art'}
								: {
										href: mode === 'nested' ? '#feimage-outer' : '#feimage-art',
									})}
							x="0"
							y="0"
							width="280"
							height="80"
							preserveAspectRatio="xMinYMin meet"
						/>
					</filter>
				</defs>
				<rect width="280" height="80" filter="url(#feimage-paint)" />
			</svg>
		);
	};

	return {
		id: `svg-feimage-font-${mode}-${literal}-${fallback}`,
		width: 280,
		height: 80,
		fps: 30,
		durationInFrames: 2,
		component: Component,
	} as const;
};

export const svgFeImageReferenceModes = [
	'symbol',
	'svg',
	'href',
	'xlink',
	'nested',
	'cycle',
	'missing',
	'external',
	'unused',
	'hidden',
	'target-defs',
	'target-pattern',
	'target-mask',
	'target-clipPath',
	'target-marker',
	'target-filter',
	'target-linearGradient',
	'target-radialGradient',
] as const;

export const svgFeImageReferenceMarkup = (
	mode: (typeof svgFeImageReferenceModes)[number],
	family: string,
) => {
	const blocked = mode.startsWith('target-')
		? mode.slice('target-'.length)
		: null;
	const reference = blocked
		? '#blocked-target'
		: mode === 'symbol' || mode === 'svg'
			? '#viewport-target'
			: mode === 'missing'
				? '#absent'
				: mode === 'external'
					? 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E#art'
					: mode === 'nested'
						? '#outer'
						: '#art';
	return `<defs>
  ${mode === 'symbol' || mode === 'svg' ? `<${mode} id="viewport-target" viewBox="0 0 20 20"><use href="#label" style="font-family:${family}"/></${mode}>` : ''}
  ${blocked ? `<${blocked} id="blocked-target"><use href="#label" style="font-family:${family}"/></${blocked}>` : ''}
  <text id="label">Glyphs</text>
  <g id="art"><use href="#label" style="font-family:${family}"/>${mode === 'cycle' ? '<use href="#art"/>' : ''}</g>
  <g id="outer"><use href="#art"/></g>
  <filter id="paint"><feImage ${mode === 'xlink' ? 'xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href' : 'href'}="${reference}" ${mode === 'hidden' ? 'style="display:none"' : ''}/></filter>
 </defs><rect width="20" height="20" ${mode === 'unused' ? '' : 'filter="url(#paint)"'}/>`;
};
