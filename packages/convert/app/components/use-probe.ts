import type {
	MediaParserAudioCodec,
	MediaParserContainer,
	MediaParserController,
	MediaParserDimensions,
	MediaParserEmbeddedImage,
	MediaParserKeyframe,
	MediaParserLocation,
	MediaParserLogLevel,
	MediaParserMetadataEntry,
	MediaParserTrack,
	ParseMediaOnProgress,
} from '@remotion/media-parser';
import {mediaParserController} from '@remotion/media-parser';
import {parseMediaOnWebWorker} from '@remotion/media-parser/worker';
import type {InputVideoTrack} from 'mediabunny';
import {ALL_FORMATS, BlobSource, Input, UrlSource} from 'mediabunny';
import {useCallback, useEffect, useMemo, useState} from 'react';
import type {Source} from '~/lib/convert-state';

export type ProbeResult = ReturnType<typeof useProbe>;

export const useProbe = ({
	src,
	logLevel,
	onProgress,
}: {
	src: Source;
	logLevel: MediaParserLogLevel;
	onProgress: ParseMediaOnProgress;
}) => {
	const [audioCodec, setAudioCodec] = useState<
		MediaParserAudioCodec | null | undefined
	>(undefined);
	const [fps, setFps] = useState<number | null | undefined>(undefined);
	const [isHdr, setHdr] = useState<boolean | undefined>(undefined);
	const [durationInSeconds, setDurationInSeconds] = useState<
		number | null | undefined
	>(undefined);
	const [dimensions, setDimensions] = useState<
		MediaParserDimensions | undefined | null
	>(undefined);
	const [unrotatedDimensions, setUnrotatedDimensions] =
		useState<MediaParserDimensions | null>(null);
	const [name, setName] = useState<string | null>(null);
	const [videoCodec, setVideoCodec] = useState<
		InputVideoTrack['codec'] | undefined | null
	>(undefined);
	const [rotation, setRotation] = useState<number | null>(null);
	const [size, setSize] = useState<number | null>(null);
	const [metadata, setMetadata] = useState<MediaParserMetadataEntry[] | null>(
		null,
	);
	const [location, setLocation] = useState<MediaParserLocation | null>(null);
	const [tracks, setTracks] = useState<MediaParserTrack[] | null>(null);
	const [container, setContainer] = useState<MediaParserContainer | null>(null);
	const [keyframes, setKeyframes] = useState<MediaParserKeyframe[] | null>(
		null,
	);
	const [sampleRate, setSampleRate] = useState<number | null>(null);
	const [images, setImages] = useState<MediaParserEmbeddedImage[] | null>(null);
	const [done, setDone] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const [controller] = useState<MediaParserController>(() =>
		mediaParserController(),
	);

	const getStart = useCallback(() => {
		const input = new Input({
			formats: ALL_FORMATS,
			source:
				src.type === 'file' ? new BlobSource(src.file) : new UrlSource(src.url),
		});

		const run = async () => {
			const duration = await input.computeDuration();
			setDurationInSeconds(duration);

			const videoTrack = await input.getPrimaryVideoTrack();
			if (videoTrack) {
				const {codec} = videoTrack;
				setVideoCodec(codec);
				const packetStats = await videoTrack.computePacketStats(50);
				setFps(packetStats.averagePacketRate);
			}
		};

		run();

		parseMediaOnWebWorker({
			logLevel,
			src: src.type === 'file' ? src.file : src.url,
			onParseProgress: onProgress,
			controller,
			onMetadata: (newMetadata) => {
				setMetadata(newMetadata);
			},
			onContainer(c) {
				setContainer(c);
			},
			onAudioCodec: (codec) => {
				setAudioCodec(codec);
			},
			onIsHdr: (hdr) => {
				setHdr(hdr);
			},
			onRotation(newRotation) {
				setRotation(newRotation);
			},
			onName: (n) => {
				setName(n);
			},
			onDimensions(dim) {
				setDimensions(dim);
			},
			onUnrotatedDimensions(dim) {
				setUnrotatedDimensions(dim);
			},
			onTracks: (trx) => {
				setTracks(trx);
			},
			onLocation: (l) => {
				setLocation(l);
			},
			onSize: (s) => {
				setSize(s);
			},
			onKeyframes: (k) => {
				setKeyframes(k);
			},
			onSampleRate(s) {
				setSampleRate(s);
			},
			onImages: (i) => {
				setImages(i);
			},
			acknowledgeRemotionLicense: true,
		})
			.then(() => {})
			.catch((err) => {
				if ((err as Error).stack?.includes('Cancelled')) {
					return;
				}

				if ((err as Error).stack?.toLowerCase()?.includes('aborted')) {
					return;
				}

				// firefox
				if ((err as Error).message?.toLowerCase()?.includes('aborted')) {
					return;
				}

				setError(err as Error);
				// eslint-disable-next-line no-console
				console.log(err);
			})
			.finally(() => {
				setDone(true);
			});

		return () => {
			input.dispose();
		};
	}, [src, logLevel, onProgress, controller]);

	useEffect(() => {
		const cleanup = getStart();
		return () => {
			cleanup();
		};
	}, [getStart]);

	return useMemo(() => {
		return {
			tracks,
			audioCodec,
			fps,
			name,
			container,
			dimensions,
			videoCodec,
			size,
			durationInSeconds,
			isHdr,
			done,
			error,
			rotation,
			metadata,
			location,
			keyframes,
			unrotatedDimensions,
			images,
			controller,
			sampleRate,
		};
	}, [
		tracks,
		audioCodec,
		fps,
		name,
		container,
		dimensions,
		videoCodec,
		size,
		durationInSeconds,
		isHdr,
		done,
		error,
		rotation,
		metadata,
		location,
		keyframes,
		unrotatedDimensions,
		images,
		controller,
		sampleRate,
	]);
};
