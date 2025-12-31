import type {
	WebRendererAudioCodec,
	WebRendererContainer,
	WebRendererQuality,
} from '@remotion/web-renderer';
import {getSupportedAudioCodecsForContainer} from '@remotion/web-renderer';
import {getEncodableAudioCodecs} from 'mediabunny';
import React, {useEffect, useMemo, useState} from 'react';
import {Checkmark} from '../../icons/Checkmark';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {Spacing} from '../layout';
import {MutedSetting} from './MutedSetting';
import {RenderModalHr} from './RenderModalHr';
import {label, optionRow, rightRow} from './layout';
import {getQualityOptions} from './quality-options';

const container: React.CSSProperties = {
	flex: 1,
	overflowY: 'auto',
};

const humanReadableWebAudioCodec = (
	audioCodec: WebRendererAudioCodec,
): string => {
	switch (audioCodec) {
		case 'aac':
			return 'AAC';
		case 'opus':
			return 'Opus';
		default:
			return audioCodec;
	}
};

export const WebRenderModalAudio: React.FC<{
	readonly muted: boolean;
	readonly setMuted: React.Dispatch<React.SetStateAction<boolean>>;
	readonly audioCodec: WebRendererAudioCodec;
	readonly setAudioCodec: React.Dispatch<
		React.SetStateAction<WebRendererAudioCodec>
	>;
	readonly audioBitrate: WebRendererQuality;
	readonly setAudioBitrate: React.Dispatch<
		React.SetStateAction<WebRendererQuality>
	>;
	readonly container: WebRendererContainer;
}> = ({
	muted,
	setMuted,
	audioCodec,
	setAudioCodec,
	audioBitrate,
	setAudioBitrate,
	container: videoContainer,
}) => {
	const [encodableCodecs, setEncodableCodecs] = useState<
		WebRendererAudioCodec[]
	>(() => getSupportedAudioCodecsForContainer(videoContainer));

	useEffect(() => {
		const supported = getSupportedAudioCodecsForContainer(videoContainer);
		getEncodableAudioCodecs(supported, {}).then((encodable) => {
			const filtered = supported.filter((c) => encodable.includes(c));
			setEncodableCodecs(filtered);
		});
	}, [videoContainer]);

	useEffect(() => {
		if (!encodableCodecs.includes(audioCodec) && encodableCodecs.length > 0) {
			setAudioCodec(encodableCodecs[0]);
		}
	}, [encodableCodecs, audioCodec, setAudioCodec]);

	const containerSupported = useMemo(
		() => getSupportedAudioCodecsForContainer(videoContainer),
		[videoContainer],
	);

	const audioCodecOptions = useMemo((): ComboboxValue[] => {
		return containerSupported.map((codec) => {
			const isEncodable = encodableCodecs.includes(codec);
			return {
				label: isEncodable
					? humanReadableWebAudioCodec(codec)
					: `${humanReadableWebAudioCodec(codec)} (not available)`,
				onClick: () => setAudioCodec(codec),
				leftItem: audioCodec === codec ? <Checkmark /> : null,
				id: codec,
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: codec,
				disabled: !isEncodable,
			};
		});
	}, [containerSupported, encodableCodecs, audioCodec, setAudioCodec]);

	const audioBitrateOptions = useMemo(
		(): ComboboxValue[] => getQualityOptions(audioBitrate, setAudioBitrate),
		[audioBitrate, setAudioBitrate],
	);

	const showAudioCodecSelector = !muted && containerSupported.length >= 2;

	return (
		<div style={container} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<MutedSetting
				enforceAudioTrack={false}
				muted={muted}
				setMuted={setMuted}
			/>
			{!muted ? (
				<>
					<RenderModalHr />
					<div style={optionRow}>
						<div style={label}>
							Audio Quality
							<Spacing x={0.5} />
						</div>
						<div style={rightRow}>
							<Combobox
								values={audioBitrateOptions}
								selectedId={audioBitrate}
								title="Audio Quality"
							/>
						</div>
					</div>
				</>
			) : null}
			{showAudioCodecSelector ? (
				<div style={optionRow}>
					<div style={label}>
						Audio Codec
						<Spacing x={0.5} />
					</div>
					<div style={rightRow}>
						<Combobox
							values={audioCodecOptions}
							selectedId={audioCodec}
							title="AudioCodec"
						/>
					</div>
				</div>
			) : null}
		</div>
	);
};
