import {expect, test} from 'bun:test';
import {renderToStaticMarkup} from 'react-dom/server';
import {AbsoluteFill} from '../AbsoluteFill.js';
import {Interactive} from '../Interactive.js';
import {Internals} from '../internals.js';
import {Loop} from '../loop/index.js';
import {Sequence} from '../Sequence.js';
import {Series} from '../series/index.js';
import {useCurrentFrame} from '../use-current-frame.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

const Frame = () => <span>{useCurrentFrame()}</span>;

test('sequence wrappers cascade playback rates while preserving sequence and loop boundaries', () => {
	const render = (frame: number) =>
		renderToStaticMarkup(
			<WrapSequenceContext currentFrame={frame}>
				<Sequence from={10} playbackRate={2} layout="none">
					<Series playbackRate={0.5}>
						<Series.Sequence durationInFrames={10} playbackRate={2}>
							<AbsoluteFill playbackRate={0.5}>
								<Interactive.Div playbackRate={3}>
									<Frame />
								</Interactive.Div>
							</AbsoluteFill>
						</Series.Sequence>
						<Series.Sequence durationInFrames={20} layout="none">
							<Loop
								durationInFrames={5}
								times={2}
								playbackRate={2}
								layout="none"
							>
								<Frame />
							</Loop>
						</Series.Sequence>
					</Series>
				</Sequence>
			</WrapSequenceContext>,
		);

	expect(render(12)).toContain('<span>6</span>');
	expect(render(19)).toContain('<span>3</span>');
	expect(render(20)).toBe('');
	expect(render(24)).toBe('');
	expect(render(25)).toBe('');
	expect(render(29)).toBe('');
	expect(render(30)).toBe('');
});

test('postmounting under a slow parent keeps the last fractional visible frame', () => {
	const markup = renderToStaticMarkup(
		<WrapSequenceContext currentFrame={19}>
			<Internals.RemotionEnvironmentContext
				value={{
					isRendering: false,
					isClientSideRendering: false,
					isPlayer: true,
					isStudio: false,
					isReadOnlyStudio: false,
				}}
			>
				<Sequence playbackRate={0.5}>
					<Sequence durationInFrames={10} postmountFor={4}>
						<Frame />
					</Sequence>
				</Sequence>
			</Internals.RemotionEnvironmentContext>
		</WrapSequenceContext>,
	);

	expect(markup).toContain('<span>9.5</span>');
	expect(markup).not.toContain('opacity:0');
});
