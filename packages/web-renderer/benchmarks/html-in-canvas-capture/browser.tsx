import {Video, Audio} from '@remotion/media';
import {renderMediaOnWeb} from '@remotion/web-renderer';
import {
	Input,
	BlobSource,
	ALL_FORMATS,
	VideoSampleSink,
	AudioSampleSink,
} from 'mediabunny';
import React from 'react';
import {AbsoluteFill, Artifact, useCurrentFrame} from 'remotion';

const W = 1920,
	H = 1080,
	FPS = 30;
const Mark = ({frame, top}: {frame: number; top: number}) => (
	<>
		{Array.from({length: 8}, (_, bit) => (
			<div
				key={bit}
				style={{
					position: 'absolute',
					left: bit * 32,
					top,
					width: 32,
					height: 32,
					backgroundColor: (frame >> bit) & 1 ? '#fff' : '#000',
				}}
			/>
		))}
	</>
);
const Composition = ({
	scene,
	rate,
	trim,
	sourceName,
	secondName,
	withAudio,
	renderArtifact,
}: {
	scene: string;
	rate: number;
	trim: number;
	sourceName: string;
	secondName: string;
	withAudio: boolean;
	renderArtifact: boolean;
}) => {
	const f = useCurrentFrame();
	const graphics = scene === 'graphics' || scene === 'alpha';
	return (
		<AbsoluteFill
			style={{backgroundColor: scene === 'alpha' ? undefined : '#17202f'}}
		>
			{!graphics && (
				<Video
					src={`/fixtures/${sourceName}`}
					muted
					playbackRate={rate}
					trimBefore={trim}
					style={{width: W, height: H}}
					disallowFallbackToOffthreadVideo
				/>
			)}
			{scene === 'dual' && (
				<Video
					src={`/fixtures/${secondName}`}
					muted
					style={{
						position: 'absolute',
						left: 960,
						top: 0,
						width: 960,
						height: 540,
					}}
					disallowFallbackToOffthreadVideo
				/>
			)}
			{graphics &&
				Array.from({length: 40}, (_, i) => (
					<div
						key={i}
						style={{
							position: 'absolute',
							width: 100,
							height: 80,
							top: 100 + (i % 8) * 100,
							left: (i * 157 + f * 13) % 1800,
							backgroundColor: `rgb(${(i * 17) % 256},120,190)`,
							opacity: scene === 'alpha' ? 0.6 : 1,
							borderRadius: 8,
							transform: `rotate(${f + i}deg)`,
						}}
					/>
				))}
			{withAudio && (
				<Audio src="/fixtures/audio.wav" volume={f < 60 ? 1 : 0.25} />
			)}
			{renderArtifact && (
				<Artifact filename={`frame-${f}.txt`} content={String(f)} />
			)}
			<Mark frame={f} top={64} />
		</AbsoluteFill>
	);
};

const readMarker = (
	ctx: OffscreenCanvasRenderingContext2D,
	top: number,
	left = 0,
	scale = 1,
) => {
	let f = 0;
	for (let bit = 0; bit < 8; bit++)
		if (
			ctx.getImageData(
				left + Math.round((bit * 32 + 16) * scale),
				Math.round((top + 16) * scale),
				1,
				1,
			).data[0] > 128
		)
			f |= 1 << bit;
	return f;
};
const run = async ({
	scene,
	withAudio = false,
	abortAt = null,
	workerErrorAt = null,
	artifactCallback = false,
	frameCallback = false,
	opaqueSnapshot = false,
	desynchronizedSnapshot = false,
	asyncSnapshot = false,
	sourceName = 'source.mp4',
	secondName = 'second.mp4',
	frames = 120,
	rate = 1,
	trim = 0,
	codec = 'h264',
	proresProfile = 'hq',
	responsiveness = 'medium',
	copyPixels = false,
	htmlCanvas = false,
	hardwareAcceleration = 'no-preference',
	frameStart = 0,
	compositionDuration = frames + frameStart,
}: any) => {
	(globalThis as any).__renderProbe = {
		updates: [],
		waits: [],
		captures: [],
		adds: [],
		wakeLag: [],
		paintWaits: [],
		offscreenCopies: [],
		frameSnapshots: [],
		nativeDrawTimes: [],
		bitmapSnapshots: [],
		elementSnapshots: [],
		snapshotWorker: {
			workerConstruction: [],
			workerDraw: [],
			nativeDraws: 0,
			maxPending: 0,
		},
	};
	let nativeDraws = 0;
	const NativeWorker = Worker;
	const pixelCopies: Promise<void>[] = [];
	let submittedRequests = 0;
	let workerFrames = 0,
		captureWorkers = 0,
		terminatedCaptureWorkers = 0,
		pendingRequests = 0,
		maxRequests = 0;
	const controller = new AbortController();
	(globalThis as any).Worker = new Proxy(NativeWorker, {
		construct(Target, args) {
			const worker = Reflect.construct(Target, args) as Worker;
			let capture = false;
			const post = worker.postMessage.bind(worker);
			worker.postMessage = function (data: any, ...rest: any[]) {
				if (data.canvas) {
					capture = true;
					captureWorkers++;
				}
				if (data.image) {
					submittedRequests++;
					if (workerErrorAt === submittedRequests) data.timestamp = NaN;
					pendingRequests++;
					maxRequests = Math.max(maxRequests, pendingRequests);
				}
				return (post as any)(data, ...rest);
			};
			const terminate = worker.terminate.bind(worker);
			worker.terminate = () => {
				if (capture) terminatedCaptureWorkers++;
				terminate();
			};
			worker.addEventListener('message', ({data}) => {
				if (data.frame) {
					workerFrames++;
					pendingRequests--;
					if (copyPixels) {
						const clone = data.frame.clone();
						pixelCopies.push(
							(async () => {
								try {
									const bytes = new Uint8Array(
										clone.allocationSize({format: 'RGBA'}),
									);
									await clone.copyTo(bytes, {format: 'RGBA'});
									captureHashes.push(
										[
											...new Uint8Array(
												await crypto.subtle.digest('SHA-256', bytes),
											),
										]
											.map((x) => x.toString(16).padStart(2, '0'))
											.join(''),
									);
								} finally {
									clone.close();
								}
							})(),
						);
					}
					if (abortAt && workerFrames === abortAt) controller.abort();
				}
			});
			return worker;
		},
	});
	const offscreenDraw = (OffscreenCanvasRenderingContext2D.prototype as any)
		.drawElementImage;
	if (offscreenDraw)
		(OffscreenCanvasRenderingContext2D.prototype as any).drawElementImage =
			function (...args: any[]) {
				nativeDraws++;
				return offscreenDraw.apply(this, args);
			};
	const nativeDraw = (CanvasRenderingContext2D.prototype as any)
		.drawElementImage;
	if (nativeDraw)
		(CanvasRenderingContext2D.prototype as any).drawElementImage = function (
			...args: any[]
		) {
			nativeDraws++;
			const start = performance.now();
			const result = nativeDraw.apply(this, args);
			(globalThis as any).__renderProbe.nativeDrawTimes.push(
				performance.now() - start,
			);
			return result;
		};
	const decoder = {
		created: 0,
		configured: 0,
		packets: 0,
		outputs: 0,
		flushes: 0,
		closes: 0,
	};
	const Original = VideoDecoder;
	(globalThis as any).VideoDecoder = new Proxy(Original, {
		construct(Target, [init]) {
			decoder.created++;
			const out = init.output;
			return new Target({
				...init,
				output: (f: VideoFrame) => {
					decoder.outputs++;
					out(f);
				},
			});
		},
	});
	const replacements: [string, any][] = [];
	const encoderConfigs: any[] = [];
	const encoderConfigure = VideoEncoder.prototype.configure;
	VideoEncoder.prototype.configure = function (config) {
		encoderConfigs.push(config);
		return encoderConfigure.call(this, config);
	};
	for (const [method, key] of [
		['configure', 'configured'],
		['decode', 'packets'],
		['flush', 'flushes'],
		['close', 'closes'],
	] as const) {
		const original = (Original.prototype as any)[method];
		replacements.push([method, original]);
		(Original.prototype as any)[method] = function (...a: any[]) {
			decoder[key]++;
			return original.apply(this, a);
		};
	}
	const longTasks: number[] = [];
	const observer = new PerformanceObserver((list) => {
		for (const e of list.getEntries()) longTasks.push(e.duration);
	});
	observer.observe({type: 'longtask'});
	const start = performance.now();
	const renderStartedAt = performance.timeOrigin + start;
	let result: any;
	const captureHashes: string[] = [];
	const renderArtifact = artifactCallback;
	const artifactFrames: number[] = [];
	let frameCallbacks = 0;
	try {
		result = await renderMediaOnWeb({
			signal: controller.signal,
			outputTarget: 'arraybuffer',
			composition: {
				component: Composition,
				id: 'Throughput',
				width: W,
				height: H,
				fps: FPS,
				durationInFrames: compositionDuration,
				defaultProps: {
					scene,
					rate,
					trim,
					sourceName,
					secondName,
					withAudio,
					renderArtifact,
				},
			},
			frameRange: [frameStart, frameStart + frames - 1],
			inputProps: {
				scene,
				rate,
				trim,
				sourceName,
				secondName,
				withAudio,
				renderArtifact,
			},
			container: codec === 'prores' ? 'mov' : 'mp4',
			videoCodec: codec,
			proresProfile,
			transparent:
				codec === 'prores' &&
				(proresProfile === '4444' || proresProfile === '4444xq'),
			videoBitrate: 'very-high',
			muted: !withAudio,
			audioCodec: 'aac',
			hardwareAcceleration,
			allowHtmlInCanvas: htmlCanvas,
			pageResponsiveness: responsiveness,
			licenseKey: 'free-license',
			isProduction: false,
			delayRenderTimeoutInMilliseconds: 30000,
			onArtifact: artifactCallback
				? async ({frame}: any) => {
						artifactFrames.push(frame);
					}
				: undefined,
			onFrame:
				(copyPixels && !UPSTREAM_WORKER) || frameCallback
					? async (frame: VideoFrame) => {
							frameCallbacks++;
							const data = new Uint8Array(
								frame.allocationSize({format: 'RGBA'}),
							);
							await frame.copyTo(data, {format: 'RGBA'});
							captureHashes.push(
								[...new Uint8Array(await crypto.subtle.digest('SHA-256', data))]
									.map((x) => x.toString(16).padStart(2, '0'))
									.join(''),
							);
							return frame;
						}
					: undefined,
		});
	} finally {
		(window as any).__upstreamLifecycle = {
			captureWorkers,
			terminatedCaptureWorkers,
			workerFrames,
			maxRequests,
		};
		(globalThis as any).Worker = NativeWorker;
		(globalThis as any).VideoDecoder = Original;
		for (const [method, original] of replacements)
			(Original.prototype as any)[method] = original;
		VideoEncoder.prototype.configure = encoderConfigure;
		if (nativeDraw)
			(CanvasRenderingContext2D.prototype as any).drawElementImage = nativeDraw;
		if (offscreenDraw)
			(OffscreenCanvasRenderingContext2D.prototype as any).drawElementImage =
				offscreenDraw;
		observer.disconnect();
	}
	const total = performance.now() - start;
	const metrics = (globalThis as any).__renderProbe;
	const mainNativeDraws = nativeDraws;
	metrics.snapshotWorker.nativeDraws = workerFrames;
	metrics.snapshotWorker.maxPending = maxRequests;
	nativeDraws += metrics.snapshotWorker.nativeDraws;
	if (htmlCanvas && nativeDraws !== frames)
		throw new Error(
			`Native capture did not run for every frame: ${nativeDraws}/${frames}`,
		);
	const s = result.internalState;
	const phases = {
		wait: s.getWaitForReadyTime(),
		capture: s.getCreateFrameTime(),
		add: s.getAddSampleTime(),
		audio: s.getAudioMixingTime(),
	};
	await Promise.all(pixelCopies);
	const blob = await result.getBlob();
	(window as any).__lastRenderBlob = blob;
	const input = new Input({source: new BlobSource(blob), formats: ALL_FORMATS});
	const track = await input.getPrimaryVideoTrack();
	if (!track) throw new Error('No output video');
	const sink = new VideoSampleSink(track);
	const canvas = new OffscreenCanvas(W, H),
		ctx = canvas.getContext('2d', {willReadFrequently: true})!;
	const errors: any[] = [];
	let count = 0;
	for await (const sample of sink.samples()) {
		sample.draw(ctx, 0, 0, W, H);
		const id = readMarker(ctx, 64);
		if (id !== ((count + frameStart) & 255))
			errors.push({frame: count + frameStart, marker: id});
		if (Math.abs(sample.timestamp - count / FPS) > 0.0001)
			errors.push({frame: count, timestamp: sample.timestamp});
		if (scene !== 'graphics' && scene !== 'alpha') {
			const media = readMarker(ctx, 0);
			const expected = Math.floor((count + frameStart) * rate + trim + 0.00001);
			if (media !== (expected & 255))
				errors.push({frame: count, media, expected});
		}
		if (scene === 'dual') {
			const media = readMarker(ctx, 0, 960, 0.5);
			if (media !== ((count + frameStart) & 255))
				errors.push({frame: count, secondMedia: media});
		}
		count++;
		sample.close();
	}
	let audio = null;
	if (withAudio) {
		const audioTrack = await input.getPrimaryAudioTrack();
		if (!audioTrack) throw new Error('Output audio track missing');
		const audioSink = new AudioSampleSink(audioTrack);
		const pcm: Float32Array[] = [];
		let samples = 0,
			sampleRate = 0;
		for await (const sample of audioSink.samples()) {
			const buffer = sample.toAudioBuffer();
			pcm.push(new Float32Array(buffer.getChannelData(0)));
			samples += buffer.length;
			sampleRate = buffer.sampleRate;
			sample.close();
		}
		const merged = new Float32Array(samples);
		let offset = 0;
		for (const p of pcm) {
			merged.set(p, offset);
			offset += p.length;
		}
		const hash = [
			...new Uint8Array(await crypto.subtle.digest('SHA-256', merged)),
		]
			.map((x) => x.toString(16).padStart(2, '0'))
			.join('');
		audio = {samples, sampleRate, duration: samples / sampleRate, hash};
		if (Math.abs(audio.duration - frames / FPS) > 0.1)
			errors.push({audioDuration: audio.duration, expected: frames / FPS});
	}
	input.dispose();
	if (count !== frames) errors.push({expectedCount: frames, count});
	return {
		audio,
		artifactFrames,
		frameCallbacks,
		captureWorkers,
		terminatedCaptureWorkers,
		workerFrames,
		maxRequests,
		opaqueSnapshot,
		desynchronizedSnapshot,
		asyncSnapshot,
		sourceName,
		secondName,
		total,
		renderStartedAt,
		phases,
		metrics,
		decoder,
		nativeDraws,
		mainNativeDraws,
		encoderConfigs,
		captureHashes,
		longTasks,
		bytes: blob.size,
		count,
		errors,
		scene,
		frames,
		frameStart,
		rate,
		trim,
		codec,
		proresProfile,
		responsiveness,
		hardwareAcceleration,
	};
};
(window as any).renderProbe = {
	run,
	environment: () => {
		const gl = document.createElement('canvas').getContext('webgl')!;
		const info = gl.getExtension('WEBGL_debug_renderer_info');
		return {
			cores: navigator.hardwareConcurrency,
			userAgent: navigator.userAgent,
			renderer: info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : null,
			htmlInCanvas: 'drawElementImage' in CanvasRenderingContext2D.prototype,
			width: W,
			height: H,
			fps: FPS,
			crossOriginIsolated,
		};
	},
};
