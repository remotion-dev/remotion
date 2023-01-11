import execa from 'execa';
import path from 'path';
import type {ComponentType} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import type {
	CompositionManagerContext,
	TCompMetadata,
	TComposition,
	TimelineContextValue,
} from 'remotion';
import {Internals} from 'remotion';
import {makeDownloadMap} from './assets/download-map';
import {compose} from './compositor/compose';
import {
	releaseCompositorWithId,
	waitForCompositorWithIdToQuit,
} from './compositor/compositor';
import {getFrameOutputFileName} from './get-frame-padded-index';
import {makeCompManagerContext} from './make-comp-manager-context';
import {Pool} from './pool';

export const renderOnServer = async (
	Comp: ComponentType,
	composition: TCompMetadata
) => {
	console.time('total');
	console.time('frames');
	process.env.REMOTION_SERVER_RENDERING = 'true';

	// eslint-disable-next-line react/jsx-no-constructed-context-values
	const memo: CompositionManagerContext = makeCompManagerContext(
		composition as unknown as TComposition<unknown>
	);

	const pool = new Pool(new Array(4).fill(true).map((_, i) => i));

	const downloadMap = makeDownloadMap();

	const renderId = 'abc';

	await Promise.all(
		new Array(composition.durationInFrames).fill(true).map(async (_, i) => {
			const frame = await pool.acquire();
			// eslint-disable-next-line react/jsx-no-constructed-context-values
			const value: TimelineContextValue = {
				audioAndVideoTags: {current: []},
				rootId: composition.id,
				playing: false,
				playbackRate: 1,
				imperativePlaying: {
					current: false,
				},
				frame: i,
				setPlaybackRate: () => {
					throw new Error('Not implemented');
				},
			};

			const svg = renderToStaticMarkup(
				<Internals.SelectCompositionMode layer={0} id={composition.id}>
					<Internals.Timeline.TimelineContext.Provider value={value}>
						<Internals.CompositionManager.Provider value={memo}>
							<Comp />
						</Internals.CompositionManager.Provider>
					</Internals.Timeline.TimelineContext.Provider>
				</Internals.SelectCompositionMode>
			);

			const out = path.join(
				downloadMap.compositingDir,
				getFrameOutputFileName({
					frame: i,
					imageFormat: 'tiff',
					index: i,
					countType: 'from-zero',
					lastFrame: composition.durationInFrames - 1,
					totalFrames: composition.durationInFrames,
				})
			);

			await compose({
				height: composition.height,
				width: composition.width,
				downloadMap,
				imageFormat: 'AddToH264',
				layers: [
					{
						type: 'SvgImage',
						params: {
							height: composition.height,
							width: composition.width,
							markup: svg,
							x: 0,
							y: 0,
						},
					},
				],
				output: out,
				renderId,
				willH264Encode: true,
			});

			pool.release(frame);
		})
	);
	releaseCompositorWithId(renderId);
	console.timeEnd('frames');
	await waitForCompositorWithIdToQuit(renderId);

	console.time('convert');
	await execa('ffmpeg', ['-i', 'fade.h264', '-c', 'copy', 'fade.mp4', '-y']);
	console.timeEnd('convert');

	console.timeEnd('total');
};
