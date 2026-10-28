'use client';

import {BufferSource, Input, MP4, VideoSampleSink} from 'mediabunny';
import type {VideoSample} from 'mediabunny';
import React, {useEffect, useRef, useState} from 'react';

// A single cover decoder at a time avoids opening a decoder for every tile at once.
let coverDecodeQueue = Promise.resolve();

export const ExploreVideo: React.FC<{
	readonly src: string;
	readonly active: boolean;
}> = ({src, active}) => {
	const coverRef = useRef<HTMLCanvasElement>(null);
	const playbackRef = useRef<HTMLCanvasElement>(null);
	const [bytes, setBytes] = useState<ArrayBuffer | null>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		let cancelled = false;
		let input: Input | null = null;

		const load = async () => {
			const response = await fetch(src, {
				signal: controller.signal,
				cache: 'force-cache',
			});
			if (!response.ok) {
				throw new Error(`Unable to load preview: ${response.status}`);
			}

			const buffer = await response.arrayBuffer();
			const decodeCover = async () => {
				if (cancelled) return;
				input = new Input({formats: [MP4], source: new BufferSource(buffer)});
				try {
					const track = await input.getPrimaryVideoTrack();
					if (!track) throw new Error('Preview has no video track');
					const sink = new VideoSampleSink(track);
					const sample = await sink.getSample(await track.getFirstTimestamp());
					if (!sample) throw new Error('Preview has no cover frame');
					try {
						const canvas = coverRef.current;
						if (cancelled || !canvas) return;
						const size = Math.min(
							540,
							Math.max(sample.displayWidth, sample.displayHeight),
						);
						canvas.width = size;
						canvas.height = size;
						const context = canvas.getContext('2d');
						if (!context) throw new Error('Unable to draw preview');
						sample.drawWithFit(context, {fit: 'cover'});
					} finally {
						sample.close();
					}
				} finally {
					input.dispose();
					input = null;
				}
			};

			const cover = coverDecodeQueue.then(decodeCover);
			coverDecodeQueue = cover.catch(() => {});
			await cover;
			if (!cancelled) setBytes(buffer);
		};

		load().catch((error) => {
			if (cancelled) return;
			setFailed(true);
			// eslint-disable-next-line no-console
			console.warn('Unable to load Explore preview', src, error);
		});

		return () => {
			cancelled = true;
			controller.abort();
			input?.dispose();
		};
	}, [src]);

	useEffect(() => {
		const canvas = playbackRef.current;
		const cover = coverRef.current;
		if (!active || !bytes || !canvas || !cover) return;
		const context = canvas.getContext('2d');
		if (!context) return;

		canvas.width = cover.width;
		canvas.height = cover.height;
		const input = new Input({formats: [MP4], source: new BufferSource(bytes)});
		let cancelled = false;
		let iterator: AsyncGenerator<VideoSample, void, unknown> | null = null;
		let sampleInUse: VideoSample | null = null;
		let cancelWait: (() => void) | null = null;

		const waitForPresentation = (timestamp: number) => {
			if (cancelled || performance.now() >= timestamp) return Promise.resolve();

			return new Promise<void>((resolve) => {
				let animationFrame = 0;
				const tick = (now: number) => {
					if (cancelled || now >= timestamp) {
						cancelWait = null;
						resolve();
					} else {
						animationFrame = requestAnimationFrame(tick);
					}
				};

				cancelWait = () => {
					cancelAnimationFrame(animationFrame);
					cancelWait = null;
					resolve();
				};

				animationFrame = requestAnimationFrame(tick);
			});
		};

		const play = async () => {
			const track = await input.getPrimaryVideoTrack();
			if (!track) throw new Error('Preview has no video track');
			const start = await track.getFirstTimestamp();
			const end =
				(await track.getDurationFromMetadata()) ??
				(await track.computeDuration());
			const sink = new VideoSampleSink(track);

			while (true) {
				if (cancelled) return;
				let startedAt: number | null = null;
				iterator = sink.samples(start);
				try {
					for await (const sample of iterator) {
						sampleInUse = sample;
						try {
							startedAt ??= performance.now();
							const presentationTime =
								startedAt + (sample.timestamp - start) * 1000;
							await waitForPresentation(presentationTime);
							if (cancelled) return;
							if (
								performance.now() >
								presentationTime + sample.duration * 1000
							) {
								continue;
							}

							context.clearRect(0, 0, canvas.width, canvas.height);
							sample.drawWithFit(context, {fit: 'cover'});
						} finally {
							sample.close();
							sampleInUse = null;
						}
					}
				} finally {
					await iterator.return();
					iterator = null;
				}

				if (startedAt === null) throw new Error('Preview contains no frames');
				await waitForPresentation(startedAt + (end - start) * 1000);
			}
		};

		play()
			.catch((error) => {
				if (cancelled) return;
				canvas.width = 0;
				canvas.height = 0;
				// eslint-disable-next-line no-console
				console.warn('Unable to play Explore preview', src, error);
			})
			.finally(() => input.dispose());

		return () => {
			cancelled = true;
			cancelWait?.();
			sampleInUse?.close();
			iterator?.return().catch(() => {});
			input.dispose();
			// Keep only the cover canvas allocated while the tile is idle.
			canvas.width = 0;
			canvas.height = 0;
		};
	}, [active, bytes, src]);

	return (
		<div
			className={`pointer-events-none absolute inset-0 transition-[filter] duration-150 ease-out motion-reduce:transition-none ${active ? 'grayscale-0' : 'grayscale'}`}
		>
			<canvas
				ref={coverRef}
				width={0}
				height={0}
				aria-hidden="true"
				className="absolute inset-0 h-full w-full"
			/>
			<canvas
				ref={playbackRef}
				width={0}
				height={0}
				aria-hidden="true"
				className={`absolute inset-0 h-full w-full ${active ? '' : 'hidden'}`}
			/>
			{failed ? (
				<span className="absolute inset-0 flex items-center justify-center text-sm text-muted">
					Preview unavailable
				</span>
			) : null}
		</div>
	);
};
