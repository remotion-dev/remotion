import type {
	WebRendererAudioCodec,
	WebRendererContainer,
	WebRendererQuality,
} from '@remotion/web-renderer';
import {getSupportedAudioCodecsForContainer} from '@remotion/web-renderer';
import React, {useMemo} from 'react';
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

const fallbackNoticeStyle: React.CSSProperties = {
	backgroundColor: 'rgba(59, 130, 246, 0.15)',
	border: '1px solid rgba(59, 130, 246, 0.4)',
	borderRadius: 4,
	padding: '8px 12px',
	marginLeft: 16,
	marginRight: 16,
	marginTop: 8,
	fontSize: 13,
	lineHeight: 1.4,
	color: '#60a5fa',
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
	readonly encodableCodecs: WebRendererAudioCodec[];
	readonly effectiveAudioCodec: WebRendererAudioCodec;
}> = ({
	muted,
	setMuted,
	audioCodec,
	setAudioCodec,
	audioBitrate,
	setAudioBitrate,
	container: videoContainer,
	encodableCodecs,
	effectiveAudioCodec,
}) => {
	const containerSupported = useMemo(
		() => getSupportedAudioCodecsForContainer(videoContainer),
		[videoContainer],
	);

	const audioCodecOptions = useMemo((): ComboboxValue[] => {
		return containerSupported.map((codec) => {
			const isEncodable = encodableCodecs.includes(codec);
			return {
				label: humanReadableWebAudioCodec(codec),
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
					<div style={optionRow}>
						<div style={label}>
							Audio Codec
							<Spacing x={0.5} />
						</div>
						<div style={rightRow}>
							<Combobox
								values={audioCodecOptions}
								selectedId={audioCodec}
								title="Audio Codec"
							/>
						</div>
					</div>
					{effectiveAudioCodec !== audioCodec ? (
						<div style={fallbackNoticeStyle}>
							{humanReadableWebAudioCodec(audioCodec)} is not available in this
							browser. Using {humanReadableWebAudioCodec(effectiveAudioCodec)}{' '}
							instead.
						</div>
					) : null}
				</>
			) : null}
		</div>
	);
};
