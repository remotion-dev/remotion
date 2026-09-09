import {Audio} from '@remotion/media';
import {useState} from 'react';
import {Sequence} from 'remotion';

// A stereo tone with distinguishable channels, without codec or network variance.
export const makeToneWav = () => {
	const sampleRate = 48000;
	const data = new ArrayBuffer(44 + sampleRate * 4);
	const view = new DataView(data);
	for (const [offset, text] of [
		[0, 'RIFF'],
		[8, 'WAVE'],
		[12, 'fmt '],
		[36, 'data'],
	] as const) {
		for (let i = 0; i < text.length; i++) {
			view.setUint8(offset + i, text.charCodeAt(i));
		}
	}

	view.setUint32(4, data.byteLength - 8, true);
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 2, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * 4, true);
	view.setUint16(32, 4, true);
	view.setUint16(34, 16, true);
	view.setUint32(40, sampleRate * 4, true);
	for (let frame = 0; frame < sampleRate; frame++) {
		for (let channel = 0; channel < 2; channel++) {
			view.setInt16(
				44 + frame * 4 + channel * 2,
				Math.round(
					Math.sin(
						(frame / sampleRate) * (channel === 0 ? 440 : 660) * Math.PI * 2,
					) * 10000,
				),
				true,
			);
		}
	}

	let binary = '';
	const bytes = new Uint8Array(data);
	for (let i = 0; i < bytes.length; i += 8192) {
		binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
	}

	return `data:audio/wav;base64,${btoa(binary)}`;
};

const Component: React.FC = () => {
	const [src] = useState(makeToneWav);
	return (
		<>
			<Sequence durationInFrames={30}>
				<Audio src={src} toneFrequency={0.75} />
			</Sequence>
			<Sequence from={15} durationInFrames={30}>
				<Audio
					src={src}
					toneFrequency={1.5}
					loop
					trimBefore={3}
					playbackRate={1.25}
				/>
			</Sequence>
			<Sequence from={45} durationInFrames={9}>
				<Audio src={src} />
			</Sequence>
			<Sequence from={59} durationInFrames={1}>
				<Audio src={src} toneFrequency={0.5} />
			</Sequence>
		</>
	);
};

export const pitchShiftAudio = {
	component: Component,
	id: 'pitch-shift-audio',
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 60,
} as const;
