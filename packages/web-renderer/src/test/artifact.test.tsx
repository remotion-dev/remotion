import {Artifact} from 'remotion';
import {expect, test} from 'vitest';
import type {EmittedArtifact} from '../artifact';
import {renderMediaOnWeb} from '../render-media-on-web';
import {renderStillOnWeb} from '../render-still-on-web';

test('should be able to render an artifact for still', async () => {
	const Component: React.FC = () => {
		return <Artifact filename="test.txt" content="Hello World!" />;
	};

	const artifacts: EmittedArtifact[] = [];

	await renderStillOnWeb({
		composition: {
			component: Component,
			id: 'artifact-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 1,
			calculateMetadata: null,
		},
		frame: 0,
		imageFormat: 'png',
		onArtifact: (artifact) => {
			artifacts.push(artifact);
		},
	});

	expect(artifacts).toEqual([
		{
			filename: 'test.txt',
			content: 'Hello World!',
			frame: 0,
			downloadBehavior: null,
		},
	]);
});

test('should fail to render multiple artifacts with the same filename', async () => {
	const Component: React.FC = () => {
		return <Artifact filename="test.txt" content="Hello World!" />;
	};

	const artifacts: EmittedArtifact[] = [];

	await renderMediaOnWeb({
		composition: {
			component: Component,
			id: 'artifact-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 3,
			calculateMetadata: null,
		},
		onArtifact: (artifact) => {
			artifacts.push(artifact);
		},
	});

	// TODO: This should fail because too many artifacts are emitted
	expect(artifacts).toEqual([
		{
			filename: 'test.txt',
			content: 'Hello World!',
			frame: 0,
			downloadBehavior: null,
		},
	]);
});

test.todo('should be able to emit a thumbnail');
test.todo(
	'should succeed to render multiple artifacts with renderMediaOnWeb()',
);
