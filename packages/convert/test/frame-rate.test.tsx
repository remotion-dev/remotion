import {afterEach, expect, test} from 'bun:test';
import {cleanup, render, screen} from '@testing-library/react';
import React from 'react';
import {ContainerOverview} from '../app/components/ContainerOverview';
import {useProbe} from '../app/components/use-probe';

afterEach(cleanup);

const FrameRateProbe: React.FC<{file: File}> = ({file}) => {
	const {fps, frameRate} = useProbe({
		src: {type: 'file', file},
	});

	return (
		<>
			<ContainerOverview
				dimensions={null}
				durationInSeconds={null}
				videoCodec={null}
				audioCodec={null}
				size={0}
				frameRate={frameRate}
				container={null}
				isHdr={false}
				metadata={null}
				isAudioOnly={false}
				sampleRate={null}
			/>
			<div data-testid="timeline-fps">{fps}</div>
		</>
	);
};

const loadFixture = async (path: string) => {
	const blob = Bun.file(path);
	return new File([await blob.arrayBuffer()], path.split('/').pop()!);
};

test('probes constant and variable frame rates for the player and metadata', async () => {
	const variableFile = await loadFixture(
		'../example-videos/videos/variable-fps.webm',
	);
	const variable = render(<FrameRateProbe file={variableFile} />);
	expect(await screen.findByText('Variable')).toBeTruthy();
	expect((await screen.findByTestId('timeline-fps')).textContent).toBe('60');
	variable.unmount();

	const constantFile = await loadFixture('../example/public/framer.webm');
	render(<FrameRateProbe file={constantFile} />);
	expect(await screen.findByText('30.00 FPS')).toBeTruthy();
	expect((await screen.findByTestId('timeline-fps')).textContent).toBe('30');
});

test('can unmount while probing a file', async () => {
	const variableFile = await loadFixture(
		'../example-videos/videos/variable-fps.webm',
	);
	const pendingProbe = render(<FrameRateProbe file={variableFile} />);
	pendingProbe.unmount();

	const constantFile = await loadFixture('../example/public/framer.webm');
	render(<FrameRateProbe file={constantFile} />);
	expect(await screen.findByText('30.00 FPS')).toBeTruthy();
});
