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

	const prom = renderMediaOnWeb({
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
	await expect(prom).rejects.toThrow(
		'An artifact with output "test.txt" was already registered at frame 0, but now registered again at frame 1. Artifacts must have unique names. https://remotion.dev/docs/artifacts',
	);
});

test.todo('should be able to emit a thumbnail');
test.todo(
	'should succeed to render multiple artifacts with renderMediaOnWeb()',
);
