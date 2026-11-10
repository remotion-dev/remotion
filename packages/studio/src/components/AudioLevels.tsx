import React, {useContext, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {
	BACKGROUND,
	FAIL_COLOR,
	LIGHT_TEXT,
	WARNING_COLOR,
	WHITE,
} from '../helpers/colors';
import {AudioLevelsContext} from '../state/audio-levels';

const MIN_DB = -60;
// Web Audio mixes in floating point, so the preview can exceed 0 dBFS.
// Rendered audio is 16-bit and hard clips everything above 0 dBFS.
const MAX_DB = 6;
const WARNING_DB = -6;
const SCALE_LABELS = [6, 0, -6, -12, -24, -36, -48, -60];

const toPercent = (db: number) => ((db - MIN_DB) / (MAX_DB - MIN_DB)) * 100;

const gradient = `linear-gradient(to top, #36c26b ${toPercent(WARNING_DB)}%, ${WARNING_COLOR} ${toPercent(WARNING_DB)}%, ${WARNING_COLOR} ${toPercent(0)}%, ${FAIL_COLOR} ${toPercent(0)}%)`;
const textStyle: React.CSSProperties = {
	fontSize: 10,
	lineHeight: '14px',
	color: LIGHT_TEXT,
	fontVariantNumeric: 'tabular-nums',
	textAlign: 'center',
};

const peakButtonStyle: React.CSSProperties = {
	...textStyle,
	height: 14,
	padding: 0,
	border: 'none',
	background: 'none',
	cursor: 'default',
	whiteSpace: 'nowrap',
};

const formatDb = (db: number) => {
	const rounded = Math.round(db * 10) / 10;
	return rounded > 0 ? `+${rounded.toFixed(1)}` : rounded.toFixed(1);
};

const AudioLevelsInner: React.FC = () => {
	const {audioContext, gainNode} =
		useContext(Internals.SharedAudioContext) ?? {};
	const {isPlaying, subscribePlaying} = useContext(
		Internals.SetTimelineContext,
	);
	const {levels} = useContext(AudioLevelsContext);
	const meterRefs = useRef<(HTMLDivElement | null)[]>([]);
	const fillRefs = useRef<(HTMLDivElement | null)[]>([]);
	const peakRefs = useRef<(HTMLDivElement | null)[]>([]);
	const maxPeakRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const resetMaxPeaks = useRef<(() => void) | null>(null);

	useEffect(() => {
		if (!audioContext || !gainNode) {
			return;
		}

		const input = audioContext.createGain();
		input.channelCount = 2;
		input.channelCountMode = 'explicit';
		const splitter = audioContext.createChannelSplitter(2);
		gainNode.connect(input);
		input.connect(splitter);
		const channels = [0, 1].map((channel) => {
			const analyser = audioContext.createAnalyser();
			analyser.fftSize = 2048;
			splitter.connect(analyser, channel);
			return {
				analyser,
				samples: new Float32Array(analyser.fftSize),
				level: MIN_DB,
				peak: MIN_DB,
				peakTime: 0,
				clipUntil: 0,
				maxPeak: MIN_DB,
				maxPeakText: '',
			};
		});
		let animationFrame = 0;
		let lastTime = performance.now();
		const currentLevels = {left: MIN_DB, right: MIN_DB};
		levels.current = currentLevels;

		const updateMaxPeak = (channel: number) => {
			const data = channels[channel];
			const button = maxPeakRefs.current[channel];
			const text = data.maxPeak <= MIN_DB ? '-inf' : formatDb(data.maxPeak);
			if (!button || text === data.maxPeakText) {
				return;
			}

			data.maxPeakText = text;
			button.textContent = text;
			button.style.color =
				data.maxPeak > MIN_DB && Math.round(data.maxPeak * 10) >= 0
					? FAIL_COLOR
					: LIGHT_TEXT;
		};

		resetMaxPeaks.current = () => {
			for (let channel = 0; channel < channels.length; channel++) {
				channels[channel].maxPeak = MIN_DB;
				updateMaxPeak(channel);
			}
		};

		const draw = (time: number) => {
			const elapsed = (time - lastTime) / 1000;
			lastTime = time;
			const playing = isPlaying();
			for (let channel = 0; channel < channels.length; channel++) {
				const data = channels[channel];
				let amplitude = 0;
				if (playing && audioContext.state === 'running') {
					data.analyser.getFloatTimeDomainData(data.samples);
					for (const sample of data.samples) {
						amplitude = Math.max(amplitude, Math.abs(sample));
					}
				}

				const db = Math.max(MIN_DB, 20 * Math.log10(amplitude));
				data.level = Math.min(MAX_DB, Math.max(db, data.level - elapsed * 40));
				if (db >= data.peak) {
					data.peak = Math.min(MAX_DB, db);
					data.peakTime = time;
				} else if (time - data.peakTime > 1000) {
					data.peak = Math.max(data.level, data.peak - elapsed * 18);
				}

				if (db >= 0) {
					data.clipUntil = time + 1000;
				}

				data.maxPeak = Math.max(data.maxPeak, db);
				updateMaxPeak(channel);

				currentLevels[channel === 0 ? 'left' : 'right'] = db;
				const fill = fillRefs.current[channel];
				const peak = peakRefs.current[channel];
				const meter = meterRefs.current[channel];
				if (fill && peak && meter) {
					fill.style.clipPath = `inset(${100 - toPercent(data.level)}% 0 0)`;
					peak.style.bottom = `${toPercent(data.peak)}%`;
					peak.style.opacity = data.peak <= MIN_DB ? '0' : '1';
					peak.style.backgroundColor =
						time < data.clipUntil ? FAIL_COLOR : WHITE;
					meter.setAttribute('aria-valuenow', data.level.toFixed(1));
					meter.setAttribute(
						'aria-valuetext',
						data.level <= MIN_DB ? 'Silent' : `${formatDb(data.level)} dBFS`,
					);
				}
			}

			animationFrame = 0;
			if (
				playing ||
				channels.some(({level, peak}) => level > MIN_DB || peak > MIN_DB)
			) {
				animationFrame = requestAnimationFrame(draw);
			}
		};

		const start = () => {
			if (animationFrame === 0) {
				lastTime = performance.now();
				animationFrame = requestAnimationFrame(draw);
			}
		};

		const unsubscribe = subscribePlaying(start);
		start();

		return () => {
			unsubscribe();
			cancelAnimationFrame(animationFrame);
			gainNode.disconnect(input);
			input.disconnect();
			splitter.disconnect();
			for (const {analyser} of channels) {
				analyser.disconnect();
			}

			resetMaxPeaks.current = null;
			levels.current = null;
		};
	}, [audioContext, gainNode, isPlaying, levels, subscribePlaying]);

	return (
		<div
			role="region"
			aria-label="Audio levels"
			className="css-reset"
			style={{
				width: 104,
				flexShrink: 0,
				backgroundColor: BACKGROUND,
				display: 'flex',
				flexDirection: 'column',
				padding: '8px 10px',
				gap: 8,
				overflow: 'hidden',
			}}
		>
			<div style={{display: 'flex', flex: 1, minHeight: 0, gap: 6}}>
				<div
					style={{
						position: 'relative',
						width: 20,
						marginTop: 14,
						marginBottom: 14,
					}}
				>
					{SCALE_LABELS.map((db) => (
						<div
							key={db}
							style={{
								...textStyle,
								position: 'absolute',
								right: 0,
								bottom: `${toPercent(db)}%`,
								transform: 'translateY(50%)',
								color: db > 0 ? FAIL_COLOR : LIGHT_TEXT,
							}}
						>
							{db > 0 ? `+${db}` : db}
						</div>
					))}
				</div>
				{['Left', 'Right'].map((label, channel) => (
					<div
						key={label}
						style={{
							display: 'flex',
							flexDirection: 'column',
							flex: 1,
							minWidth: 0,
						}}
					>
						<button
							ref={(node) => {
								maxPeakRefs.current[channel] = node;
							}}
							type="button"
							title="Highest peak. Above 0 dBFS clips when rendered. Click to reset."
							aria-label={`${label} highest peak, click to reset`}
							style={peakButtonStyle}
							onClick={() => resetMaxPeaks.current?.()}
						>
							-inf
						</button>
						<div
							ref={(node) => {
								meterRefs.current[channel] = node;
							}}
							role="meter"
							aria-label={`${label} audio level`}
							aria-valuemin={MIN_DB}
							aria-valuemax={MAX_DB}
							aria-valuenow={MIN_DB}
							aria-valuetext="Silent"
							style={{position: 'relative', flex: 1, overflow: 'hidden'}}
						>
							<div
								style={{
									position: 'absolute',
									inset: 0,
									background: gradient,
									opacity: 0.15,
								}}
							/>
							<div
								ref={(node) => {
									fillRefs.current[channel] = node;
								}}
								style={{
									position: 'absolute',
									inset: 0,
									background: gradient,
									clipPath: 'inset(100% 0 0)',
								}}
							/>
							<div
								style={{
									position: 'absolute',
									inset: 0,
									background: `repeating-linear-gradient(to top, transparent 0, transparent 4px, ${BACKGROUND} 4px, ${BACKGROUND} 6px)`,
								}}
							/>
							<div
								ref={(node) => {
									peakRefs.current[channel] = node;
								}}
								style={{
									position: 'absolute',
									left: 0,
									right: 0,
									height: 2,
									transform: 'translateY(100%)',
									bottom: 0,
									opacity: 0,
									backgroundColor: WHITE,
								}}
							/>
						</div>
						<div style={textStyle}>{label[0]}</div>
					</div>
				))}
			</div>
		</div>
	);
};

export const AudioLevels = React.memo(AudioLevelsInner);
