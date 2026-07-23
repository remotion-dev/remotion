import {cube} from '@remotion-dev/cube-presentation';
import {clockWipe} from '@remotion/transitions/clock-wipe';
import {fade} from '@remotion/transitions/fade';
import {flip} from '@remotion/transitions/flip';
import {iris} from '@remotion/transitions/iris';
import {none} from '@remotion/transitions/none';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import React from 'react';
import {BookFlipTocPreview} from '../../transitions/book-flip-toc-preview';
import {CrossZoomTocPreview} from '../../transitions/cross-zoom-toc-preview';
import {CrosswarpTocPreview} from '../../transitions/crosswarp-toc-preview';
import {DissolveTocPreview} from '../../transitions/dissolve-toc-preview';
import {DreamyZoomTocPreview} from '../../transitions/dreamy-zoom-toc-preview';
import {FilmBurnTocPreview} from '../../transitions/film-burn-toc-preview';
import {LinearBlurTocPreview} from '../../transitions/linear-blur-toc-preview';
import {PresentationPreview} from '../../transitions/previews';
import {RippleTocPreview} from '../../transitions/ripple-toc-preview';
import {SwapTocPreview} from '../../transitions/swap-toc-preview';
import {ZoomBlurTocPreview} from '../../transitions/zoom-blur-toc-preview';
import {ZoomInOutTocPreview} from '../../transitions/zoom-in-out-toc-preview';
import {Grid} from '../Grid';
import {HtmlInCanvasLabel} from '../html-in-canvas-label';
import {ProLabel} from '../pro-label';
import {TOCItem} from '../TOCItem';

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-between',
};

export const presentationCompositionWidth = 540;
export const presentationCompositionHeight = 280;

export const Presentations: React.FC<{
	readonly apisOnly: boolean;
}> = ({apisOnly}) => {
	return (
		<Grid>
			{apisOnly ? null : (
				<TOCItem link="/docs/transitions/presentations">
					<strong>{'Overview'}</strong>
					<div>List of available presentations</div>
				</TOCItem>
			)}
			{apisOnly ? null : (
				<TOCItem link="/docs/transitions/presentations/custom">
					<strong>Custom presentations</strong>
					<div>Implement your own effect</div>
				</TOCItem>
			)}
			<TOCItem link="/docs/transitions/presentations/fade">
				<div style={row}>
					<PresentationPreview durationRestThreshold={0.001} effect={fade()} />
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'fade()'}</code>
						</strong>
						<div>Animate the opacity of the scenes</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/slide">
				<div style={row}>
					<PresentationPreview durationRestThreshold={0.001} effect={slide()} />
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'slide()'}</code>
						</strong>
						<div>Slide in and push out the previous scene</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/wipe">
				<div style={row}>
					<PresentationPreview durationRestThreshold={0.001} effect={wipe()} />
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'wipe()'}</code>
						</strong>
						<div>Slide over the previous scene</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/flip">
				<div style={row}>
					<PresentationPreview durationRestThreshold={0.001} effect={flip()} />
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'flip()'}</code>
						</strong>
						<div>Rotate the previous scene</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/clock-wipe">
				<div style={row}>
					<PresentationPreview
						durationRestThreshold={0.001}
						effect={clockWipe({
							width: presentationCompositionWidth,
							height: presentationCompositionHeight,
						})}
					/>
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'clockWipe()'}</code>
						</strong>
						<div>Reveal the new scene in a circular movement</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/iris">
				<div style={row}>
					<PresentationPreview
						durationRestThreshold={0.001}
						effect={iris({
							width: presentationCompositionWidth,
							height: presentationCompositionHeight,
						})}
					/>
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'iris()'}</code>
						</strong>
						<div>Reveal the scene through a circular mask from center</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/zoom-blur">
				<div style={row}>
					<ZoomBlurTocPreview />
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'zoomBlur()'}</code>
						</strong>
						<HtmlInCanvasLabel />
						<div>Zoom and rotate scenes with a radial blur</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/dreamy-zoom">
				<div style={row}>
					<DreamyZoomTocPreview />
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'dreamyZoom()'}</code>
						</strong>
						<HtmlInCanvasLabel />
						<div>Zoom through a white flash with gentle rotation</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/film-burn">
				<div style={row}>
					<FilmBurnTocPreview />
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'filmBurn()'}</code>
						</strong>
						<HtmlInCanvasLabel />
						<div>Burn through scenes with procedural glow and blur</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/linear-blur">
				<div style={row}>
					<LinearBlurTocPreview />
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'linearBlur()'}</code>
						</strong>
						<HtmlInCanvasLabel />
						<div>Blend scenes with a directional multi-sample blur</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/book-flip">
				<div style={row}>
					<BookFlipTocPreview />
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'bookFlip()'}</code>
						</strong>
						<HtmlInCanvasLabel />
						<div>Turn the scenes like a shaded book page</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/zoom-in-out">
				<div style={row}>
					<ZoomInOutTocPreview />
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'zoomInOut()'}</code>
						</strong>
						<HtmlInCanvasLabel />
						<div>Zoom one scene in, crossfade, zoom the next out</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/dissolve">
				<div style={row}>
					<DissolveTocPreview />
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'dissolve()'}</code>
						</strong>
						<HtmlInCanvasLabel />
						<div>Burn through the previous scene with a glowing edge</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/ripple">
				<div style={row}>
					<RippleTocPreview />
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'ripple()'}</code>
						</strong>
						<HtmlInCanvasLabel />
						<div>Ripple the outgoing scene with a sinusoidal wave</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/crosswarp">
				<div style={row}>
					<CrosswarpTocPreview />
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'crosswarp()'}</code>
						</strong>
						<HtmlInCanvasLabel />
						<div>Warp both scenes across the x-axis and blend them</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/cross-zoom">
				<div style={row}>
					<CrossZoomTocPreview />
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'crossZoom()'}</code>
						</strong>
						<HtmlInCanvasLabel />
						<div>Zoom both scenes through a moving center and blur</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/swap">
				<div style={row}>
					<SwapTocPreview />
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'swap()'}</code>
						</strong>
						<HtmlInCanvasLabel />
						<div>Swap scenes with perspective and reflections</div>
					</div>
				</div>
			</TOCItem>

			<TOCItem link="/docs/transitions/presentations/cube">
				<div style={row}>
					<PresentationPreview
						durationRestThreshold={0.001}
						effect={cube({
							direction: 'from-left',
						})}
					/>
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'cube()'}</code>
						</strong>
						<ProLabel />
						<div>Rotate both scenes with 3D perspective</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/none">
				<div style={row}>
					<PresentationPreview
						durationRestThreshold={0.001}
						effect={none({})}
					/>
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'none()'}</code>
						</strong>
						<div>Have no visual effect.</div>
					</div>
				</div>
			</TOCItem>
			{apisOnly ? null : (
				<TOCItem link="/docs/transitions/audio-transitions">
					<div style={row}>
						<div style={{flex: 1}}>
							<strong>Audio transitions</strong>
							<div>Add a sound effect to a transition</div>
						</div>
					</div>
				</TOCItem>
			)}
		</Grid>
	);
};
