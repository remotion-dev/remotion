import type {
	WebRendererAudioCodec,
	WebRendererContainer,
	WebRendererQuality,
} from '@remotion/web-renderer';
import {getSupportedAudioCodecsForContainer} from '@remotion/web-renderer';
import {getEncodableAudioCodecs} from 'mediabunny';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
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

const warningStyle: React.CSSProperties = {
	backgroundColor: 'rgba(255, 193, 7, 0.15)',
	border: '1px solid rgba(255, 193, 7, 0.4)',
	borderRadius: 4,
	padding: '8px 12px',
	marginLeft: 16,
	marginRight: 16,
	marginTop: 8,
	fontSize: 13,
	lineHeight: 1.4,
	color: '#ffc107',
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
		const containerSupported =
			getSupportedAudioCodecsForContainer(videoContainer);
		getEncodableAudioCodecs(containerSupported, {}).then((encodable) => {
			const filtered = containerSupported.filter((c) => encodable.includes(c));
			setEncodableCodecs(filtered);
		});
	}, [videoContainer]);

	useEffect(() => {
		if (!encodableCodecs.includes(audioCodec) && encodableCodecs.length > 0) {
			setAudioCodec(encodableCodecs[0]);
		}
	}, [encodableCodecs, audioCodec, setAudioCodec]);

	const audioCodecOptions = useCallback((): ComboboxValue[] => {
		return encodableCodecs.map((codec) => {
			return {
				label: humanReadableWebAudioCodec(codec),
				onClick: () => setAudioCodec(codec),
				key: codec,
				leftItem: audioCodec === codec ? <Checkmark /> : null,
				id: codec,
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: codec,
			};
		});
	}, [encodableCodecs, audioCodec, setAudioCodec]);

	const audioBitrateOptions = useMemo(
		(): ComboboxValue[] => getQualityOptions(audioBitrate, setAudioBitrate),
		[audioBitrate, setAudioBitrate],
	);

	const showAudioCodecSelector = !muted && encodableCodecs.length >= 2;

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
				<>
					<div style={optionRow}>
						<div style={label}>
							Audio Codec
							<Spacing x={0.5} />
						</div>
						<div style={rightRow}>
							<Combobox
								values={audioCodecOptions()}
								selectedId={audioCodec}
								title="AudioCodec"
							/>
						</div>
					</div>
					{audioCodec === 'aac' ? (
						<div style={warningStyle}>
							AAC encoding is not supported in Firefox. If rendering in Firefox,
							the render will fail. Consider using Opus for cross-browser
							compatibility.
						</div>
					) : null}
				</>
			) : null}
		</div>
	);
};
