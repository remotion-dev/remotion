import {expect, test} from 'bun:test';
import {AbsoluteFill} from 'remotion';
import {TransitionSeries} from '../TransitionSeries.js';
import {fade} from '../presentations/fade.js';
import {linearTiming} from '../timings/linear-timing.js';
import {renderForFrame} from './render-for-frame.js';

const Letter: React.FC<{
	children: React.ReactNode;
	color: string;
}> = ({children, color}) => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: color,
				justifyContent: 'center',
				alignItems: 'center',
				fontSize: 200,
				color: 'white',
			}}
		>
			{children}
		</AbsoluteFill>
	);
};

test('Basic overlay renders without error', () => {
	const result = renderForFrame(
		50,
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="green">A</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={20}>
				<Letter color="red">Overlay</Letter>
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="blue">B</Letter>
			</TransitionSeries.Sequence>
		</TransitionSeries>,
	);
	expect(result).toContain('Overlay');
});

test('Overlay is centered on the cut point', () => {
	// Seq A = 60 frames (0-59), Seq B = 60 frames (60-119)
	// Cut point = 60, overlay duration = 20, so overlay from 50 to 70
	// At frame 49, overlay should NOT be visible
	const before = renderForFrame(
		49,
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="green">A</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={20}>
				<Letter color="red">OVL</Letter>
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="blue">B</Letter>
			</TransitionSeries.Sequence>
		</TransitionSeries>,
	);
	expect(before).not.toContain('OVL');

	// At frame 50, overlay should be visible
	const during = renderForFrame(
		50,
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="green">A</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={20}>
				<Letter color="red">OVL</Letter>
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="blue">B</Letter>
			</TransitionSeries.Sequence>
		</TransitionSeries>,
	);
	expect(during).toContain('OVL');

	// At frame 69, overlay should still be visible
	const lastFrame = renderForFrame(
		69,
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="green">A</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={20}>
				<Letter color="red">OVL</Letter>
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="blue">B</Letter>
			</TransitionSeries.Sequence>
		</TransitionSeries>,
	);
	expect(lastFrame).toContain('OVL');

	// At frame 70, overlay should NOT be visible
	const after = renderForFrame(
		70,
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="green">A</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={20}>
				<Letter color="red">OVL</Letter>
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="blue">B</Letter>
			</TransitionSeries.Sequence>
		</TransitionSeries>,
	);
	expect(after).not.toContain('OVL');
});

test('Overlay with positive offset shifts right', () => {
	// Cut point = 60, duration = 20, offset = 5
	// Overlay from: 60 - 10 + 5 = 55 to 75
	const at54 = renderForFrame(
		54,
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="green">A</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={20} offset={5}>
				<Letter color="red">OVL</Letter>
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="blue">B</Letter>
			</TransitionSeries.Sequence>
		</TransitionSeries>,
	);
	expect(at54).not.toContain('OVL');

	const at55 = renderForFrame(
		55,
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="green">A</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={20} offset={5}>
				<Letter color="red">OVL</Letter>
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="blue">B</Letter>
			</TransitionSeries.Sequence>
		</TransitionSeries>,
	);
	expect(at55).toContain('OVL');
});

test('Overlay with negative offset shifts left', () => {
	// Cut point = 60, duration = 20, offset = -5
	// Overlay from: 60 - 10 - 5 = 45 to 65
	const at44 = renderForFrame(
		44,
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="green">A</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={20} offset={-5}>
				<Letter color="red">OVL</Letter>
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="blue">B</Letter>
			</TransitionSeries.Sequence>
		</TransitionSeries>,
	);
	expect(at44).not.toContain('OVL');

	const at45 = renderForFrame(
		45,
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="green">A</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={20} offset={-5}>
				<Letter color="red">OVL</Letter>
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="blue">B</Letter>
			</TransitionSeries.Sequence>
		</TransitionSeries>,
	);
	expect(at45).toContain('OVL');
});

test('Error: two overlays in a row', () => {
	expect(() => {
		renderForFrame(
			10,
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={60}>
					<Letter color="green">A</Letter>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={20}>
					<Letter color="red">O1</Letter>
				</TransitionSeries.Overlay>
				<TransitionSeries.Overlay durationInFrames={20}>
					<Letter color="red">O2</Letter>
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence durationInFrames={60}>
					<Letter color="blue">B</Letter>
				</TransitionSeries.Sequence>
			</TransitionSeries>,
		);
	}).toThrow(
		'A <TransitionSeries.Overlay /> component must not be followed by another <TransitionSeries.Overlay />',
	);
});

test('Error: overlay followed by transition', () => {
	expect(() => {
		renderForFrame(
			10,
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={60}>
					<Letter color="green">A</Letter>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={20}>
					<Letter color="red">O1</Letter>
				</TransitionSeries.Overlay>
				<TransitionSeries.Transition
					presentation={fade({})}
					timing={linearTiming({durationInFrames: 10})}
				/>
				<TransitionSeries.Sequence durationInFrames={60}>
					<Letter color="blue">B</Letter>
				</TransitionSeries.Sequence>
			</TransitionSeries>,
		);
	}).toThrow(
		'<TransitionSeries.Overlay /> component must not be followed by a <TransitionSeries.Transition />',
	);
});

test('Error: transition followed by overlay', () => {
	expect(() => {
		renderForFrame(
			10,
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={60}>
					<Letter color="green">A</Letter>
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={fade({})}
					timing={linearTiming({durationInFrames: 10})}
				/>
				<TransitionSeries.Overlay durationInFrames={20}>
					<Letter color="red">O1</Letter>
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence durationInFrames={60}>
					<Letter color="blue">B</Letter>
				</TransitionSeries.Sequence>
			</TransitionSeries>,
		);
	}).toThrow(
		'<TransitionSeries.Transition /> component must not be followed by a <TransitionSeries.Overlay />',
	);
});

test('Error: overlay extending before frame 0', () => {
	expect(() => {
		renderForFrame(
			0,
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={5}>
					<Letter color="green">A</Letter>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={20}>
					<Letter color="red">O1</Letter>
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence durationInFrames={60}>
					<Letter color="blue">B</Letter>
				</TransitionSeries.Sequence>
			</TransitionSeries>,
		);
	}).toThrow('extends before frame 0');
});

test('Error: overlay exceeding previous sequence duration', () => {
	// First seq = 60 frames, second seq = 10 frames. Cut point = 70.
	// Overlay duration = 30, offset = 10 (shift right).
	// halfDuration = 15, overlayFrom = 70 - 15 + 10 = 65 (>= 0, OK).
	// overlayStartInPrev = 15 - 10 = 5. prevSeqDuration = 10. 5 <= 10, OK.
	// Actually we need halfDuration - offset > prevSeqDuration for prev check.
	// Use: first seq = 60, second seq = 5, overlay duration = 20, offset = -8
	// Cut = 65, halfDuration = 10, overlayFrom = 65 - 10 - 8 = 47 (>= 0 OK)
	// overlayStartInPrev = 10 - (-8) = 18 > 5 → triggers!
	expect(() => {
		renderForFrame(
			0,
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={60}>
					<Letter color="green">A</Letter>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence durationInFrames={5}>
					<Letter color="yellow">B</Letter>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={20} offset={-8}>
					<Letter color="red">O1</Letter>
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence durationInFrames={60}>
					<Letter color="blue">C</Letter>
				</TransitionSeries.Sequence>
			</TransitionSeries>,
		);
	}).toThrow('extends beyond the previous sequence');
});

test('Error: overlay exceeding next sequence duration', () => {
	expect(() => {
		renderForFrame(
			0,
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={60}>
					<Letter color="green">A</Letter>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={30}>
					<Letter color="red">O1</Letter>
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence durationInFrames={10}>
					<Letter color="blue">B</Letter>
				</TransitionSeries.Sequence>
			</TransitionSeries>,
		);
	}).toThrow('extends beyond the next sequence');
});

test('Error: invalid offset (NaN)', () => {
	expect(() => {
		renderForFrame(
			0,
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={60}>
					<Letter color="green">A</Letter>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={20} offset={NaN}>
					<Letter color="red">O1</Letter>
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence durationInFrames={60}>
					<Letter color="blue">B</Letter>
				</TransitionSeries.Sequence>
			</TransitionSeries>,
		);
	}).toThrow('must not be NaN');
});

test('Error: invalid offset (Infinity)', () => {
	expect(() => {
		renderForFrame(
			0,
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={60}>
					<Letter color="green">A</Letter>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={20} offset={Infinity}>
					<Letter color="red">O1</Letter>
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence durationInFrames={60}>
					<Letter color="blue">B</Letter>
				</TransitionSeries.Sequence>
			</TransitionSeries>,
		);
	}).toThrow('must be finite');
});

test('Error: invalid offset (non-integer)', () => {
	expect(() => {
		renderForFrame(
			0,
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={60}>
					<Letter color="green">A</Letter>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={20} offset={1.5}>
					<Letter color="red">O1</Letter>
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence durationInFrames={60}>
					<Letter color="blue">B</Letter>
				</TransitionSeries.Sequence>
			</TransitionSeries>,
		);
	}).toThrow('must be an integer');
});

test('Timeline length is NOT shortened by overlay', () => {
	// Two sequences of 60 frames = 120 total
	// At frame 119, second sequence should still be visible
	const result = renderForFrame(
		119,
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="green">A</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={20}>
				<Letter color="red">OVL</Letter>
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="blue">B</Letter>
			</TransitionSeries.Sequence>
		</TransitionSeries>,
	);
	expect(result).toContain('B');
	expect(result).not.toContain('OVL');
});
