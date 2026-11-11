import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';
import {svgExternalFontReady} from './svg-external-font-selection';
export const svgExternalCarrierModes = [
	'empty',
	'disabled-empty',
	'malformed-comment',
	'malformed-final-comment',
	'titled',
	'titled-empty',
	'cache',
	'media-empty',
	'media-all',
	'media-whitespace-all',
] as const;

export const svgExternalEmptyCarrier = ({
	mode,
	literal,
}: {
	mode: (typeof svgExternalCarrierModes)[number];
	literal: boolean;
}) => {
	const media =
		mode === 'media-empty'
			? ''
			: mode === 'media-all'
				? 'all'
				: mode === 'media-whitespace-all'
					? ' all '
					: undefined;
	const hasMediaOwner = media !== undefined;
	const titled = mode === 'titled' || mode === 'titled-empty';
	const Carrier = () => {
		const frame = useCurrentFrame();
		const first = useRef<HTMLStyleElement>(null);
		const last = useRef<HTMLStyleElement>(null);
		const markup = useRef<string | null>(null);
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() =>
			delayRender('Loading external SVG carrier font'),
		);
		useLayoutEffect(() => {
			const sheet = last.current?.sheet;
			if (!sheet) return;
			if (mode === 'disabled-empty') sheet.disabled = true;
			if (mode === 'cache') {
				const style = first.current!;
				style.closest('svg')!.setAttribute('style', '');
				style.textContent = Array.from(
					style.sheet!.cssRules,
					(rule) => rule.cssText,
				).join('');
				if (frame === 1)
					sheet.insertRule('@media not all {.unused-carrier {fill:red}}');
				const serialized = new XMLSerializer().serializeToString(
					style.closest('svg')!,
				);
				if (markup.current !== null && markup.current !== serialized) {
					throw new Error(
						'Only CSSOM state may change between carrier cache frames',
					);
				}

				markup.current = serialized;
			}

			return () => {
				while (sheet.cssRules.length) sheet.deleteRule(0);
				sheet.disabled = false;
			};
		}, [frame]);
		useEffect(() => {
			let active = true;
			svgExternalFontReady
				.then(() => {
					if (active) continueRender(handle);
				})
				.catch((error) => {
					if (active) cancelRender(error);
				});
			return () => {
				active = false;
				continueRender(handle);
			};
		}, [handle, continueRender, cancelRender]);
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<svg width={300} height={100}>
					<style
						ref={first}
						media={media}
						title={titled && !literal ? 'a' : undefined}
					>
						{hasMediaOwner
							? 'rect{fill:red} style:empty + .empty-marker{fill:#1373ab} style[media] ~ .media-marker{fill:#1373ab}'
							: `${mode === 'titled' && !literal ? 'style[title="b"] + rect' : literal || mode === 'malformed-final-comment' || mode === 'titled' ? 'rect' : 'style:empty + rect'}{fill:#1373ab}${mode === 'malformed-comment' || mode === 'malformed-final-comment' ? (literal ? '/**/' : '/*') : ''}`}
					</style>
					{mode === 'malformed-final-comment' ? null : (
						<style
							ref={last}
							title={titled && !literal ? 'b' : undefined}
							media={titled && literal ? 'not all' : undefined}
						>
							{mode === 'titled' ? 'rect{fill:red}' : null}
						</style>
					)}
					<rect
						className={hasMediaOwner ? 'empty-marker' : undefined}
						width={20}
						height={20}
						style={hasMediaOwner && literal ? {fill: '#1373ab'} : undefined}
					/>
					{hasMediaOwner ? (
						<rect
							className="media-marker"
							x={40}
							width={20}
							height={20}
							style={literal ? {fill: '#1373ab'} : undefined}
						/>
					) : null}
					<text
						x={12}
						y={72}
						style={{fontFamily: '"External SVG, class font"', fontSize: 32}}
					>
						Carried font
					</text>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Carrier,
		id: `svg-external-carrier-${mode}${literal ? '-literal' : ''}`,
		width: 300,
		height: 100,
		fps: 30,
		durationInFrames: 3,
	} as const;
};
