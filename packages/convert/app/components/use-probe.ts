import type {MediaParserKeyframe} from '@remotion/media-parser';
import type {
	InputAudioTrack,
	InputFormat,
	InputTrack,
	InputVideoTrack,
	MetadataTags,
} from 'mediabunny';
import {ALL_FORMATS, BlobSource, Input, UrlSource} from 'mediabunny';
import {useCallback, useEffect, useMemo, useState} from 'react';
import type {Dimensions} from '~/lib/calculate-new-dimensions-from-dimensions';
import type {Source} from '~/lib/convert-state';

export type ProbeResult = ReturnType<typeof useProbe>;

export const useProbe = ({src}: {src: Source}) => {
	const [audioCodec, setAudioCodec] = useState<
		InputAudioTrack['codec'] | null | undefined
	>(undefined);
	const [fps, setFps] = useState<number | null | undefined>(undefined);
	const [isHdr, setHdr] = useState<boolean | undefined>(undefined);
	const [durationInSeconds, setDurationInSeconds] = useState<
		number | null | undefined
	>(undefined);
	const [dimensions, setDimensions] = useState<Dimensions | undefined | null>(
		undefined,
	);
	const [unrotatedDimensions, setUnrotatedDimensions] =
		useState<Dimensions | null>(null);
	const name = useMemo(
		() => (src.type === 'url' ? src.url.split('/').pop()! : src.file.name),
		[src],
	);
	const [videoCodec, setVideoCodec] = useState<
		InputVideoTrack['codec'] | undefined | null
	>(undefined);
	const [rotation, setRotation] = useState<number | null>(null);
	const [size, setSize] = useState<number | null>(null);
	const [metadata, setMetadata] = useState<MetadataTags | null>(null);
	const [tracks, setTracks] = useState<InputTrack[] | null>(null);
	const [container, setContainer] = useState<InputFormat | null>(null);
	const [keyframes, setKeyframes] = useState<MediaParserKeyframe[] | null>(
		null,
	);
	const [sampleRate, setSampleRate] = useState<number | null>(null);
	const [done, setDone] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const getStart = useCallback(() => {
		// TODO: Name
		// TODO: Keyframes
		// TODO: Smart parallelization

		const input = new Input({
			formats: ALL_FORMATS,
			source:
				src.type === 'file' ? new BlobSource(src.file) : new UrlSource(src.url),
		});

		const run = async () => {
			const format = await input.getFormat();
			setContainer(format);

			const s = await input.source.getSize();
			setSize(s);

			const duration = await input.computeDuration();
			setDurationInSeconds(duration);

			const metadataTags = await input.getMetadataTags();
			setMetadata(metadataTags);

			const trx = await input.getTracks();
			setTracks(trx);
			for (const track of trx) {
				if (track.isVideoTrack()) {
					const {codec} = track;
					setVideoCodec(codec);
					const packetStats = await track.computePacketStats(50);
					setFps(packetStats.averagePacketRate);
					setDimensions({
						width: track.displayWidth,
						height: track.displayHeight,
					});
					setRotation(track.rotation);
					setUnrotatedDimensions({
						width: track.codedWidth,
						height: track.codedHeight,
					});
					setHdr(await track.hasHighDynamicRange());
				} else if (track.isAudioTrack()) {
					const {codec} = track;
					setAudioCodec(codec);
					setSampleRate(track.sampleRate);
				}
			}
		};

		run()
			.then(() => {
				setDone(true);
			})
			.catch((e) => {
				setError(e);
			});

		return () => {
			input.dispose();
		};
	}, [src]);

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
			keyframes,
			unrotatedDimensions,
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
		keyframes,
		unrotatedDimensions,
		sampleRate,
	]);
};
