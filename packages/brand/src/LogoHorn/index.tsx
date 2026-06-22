import {chromaticAberration} from '@remotion/effects/chromatic-aberration';
import {Audio} from '@remotion/media';
import {useWindowedAudioData, visualizeAudio} from '@remotion/media-utils';
import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import React from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {
	AbsoluteFill,
	Img,
	Solid,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

import {pixelDissolve} from '@remotion/effects/pixel-dissolve';

const AUDIO_FILE = staticFile('hoorn.wav');
const LOGO_FILE = staticFile('logo/remotion/logo-on-white.svg');
const LOGO_SIZE = 200;

const getFrequencies = ({
	fps,
	frame,
	audioData,
	dataOffsetInSeconds,
}: {
	fps: number;
	frame: number;
	audioData: NonNullable<ReturnType<typeof useWindowedAudioData>['audioData']>;
	dataOffsetInSeconds: number;
}) => {
	return visualizeAudio({
		fps,
		frame,
		audioData,
		numberOfSamples: 128,
		optimizeFor: 'speed',
		dataOffsetInSeconds,
	});
};

const getAverageIntensity = (frequencies: readonly number[]) => {
	return (
		frequencies.reduce((sum, value) => sum + value, 0) / frequencies.length
	);
};

export const calculateLogoHornMetadata: CalculateMetadataFunction<
	Record<string, never>
> = async () => {
	const fps = 30;
	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(AUDIO_FILE, {
			getRetryDelay: () => null,
		}),
	});

	const durationInSeconds = await input.computeDuration();

	return {
		width: 1080,
		height: 1080,
		fps,
		durationInFrames: Math.ceil(durationInSeconds * fps),
	};
};

export const LogoHorn: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const {audioData, dataOffsetInSeconds} = useWindowedAudioData({
		src: AUDIO_FILE,
		frame,
		fps,
		windowInSeconds: 30,
	});

	const {chromaticAmount, chromaticAngle, dissolveProgress} = (() => {
		if (!audioData) {
			return {
				chromaticAmount: 0,
				chromaticAngle: 0,
				dissolveProgress: 0,
			};
		}

		const frequencies = getFrequencies({
			fps,
			frame,
			audioData,
			dataOffsetInSeconds,
		});

		const bassIntensity = getAverageIntensity(frequencies.slice(0, 32));
		const highIntensity = getAverageIntensity(frequencies.slice(96));

		return {
			chromaticAmount: bassIntensity * 400,
			chromaticAngle: highIntensity * 360 + Math.round(frame / 2) * 50,
			dissolveProgress: bassIntensity * 7,
		};
	})();

	return (
		<AbsoluteFill>
			<Solid
				width={1080}
				height={1080}
				color={'#ffffff'}
				style={{
					position: 'absolute',
				}}
			/>
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Img
					src={LOGO_FILE}
					width={LOGO_SIZE}
					height={LOGO_SIZE}
					style={{
						objectFit: 'contain',
					}}
					effects={[
						chromaticAberration({
							amount: chromaticAmount,
							angle: chromaticAngle,
						}),
						pixelDissolve({
							columns: 18,
							rows: 114,
							progress: dissolveProgress,
							seed: Math.round(frame / 4),
							feather: 0.49,
						}),
					]}
				/>
			</AbsoluteFill>
			<Audio src={AUDIO_FILE} />
		</AbsoluteFill>
	);
};
