import {Artifact, useCurrentFrame} from 'remotion';
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

test('should fail to render multiple artifacts with the same filename', async (t) => {
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
		outputTarget:
			t.task.file.projectName === 'webkit' ? 'arraybuffer' : 'web-fs',
	});
	await expect(prom).rejects.toThrow(
		'An artifact with output "test.txt" was already registered at frame 0, but now registered again at frame 1. Artifacts must have unique names. https://remotion.dev/docs/artifacts',
	);
});

test('should be able to emit a thumbnail', async () => {
	const Component: React.FC = () => {
		return <Artifact filename="thumbnail.png" content={Artifact.Thumbnail} />;
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

	expect(artifacts).toHaveLength(1);
	expect(artifacts[0].filename).toBe('thumbnail.png');
	expect(artifacts[0].frame).toBe(0);
	expect(artifacts[0].content).toBeInstanceOf(Uint8Array);
	expect(artifacts[0].downloadBehavior).toBe(null);
	// Verify it's actually PNG data by checking PNG signature
	const pngSignature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
	const content = artifacts[0].content as Uint8Array;
	expect(content.slice(0, 8)).toEqual(pngSignature);
});

test('should succeed to render multiple artifacts with renderMediaOnWeb()', async (t) => {
	const Component: React.FC = () => {
		const frame = useCurrentFrame();
		return (
			<>
				{frame === 0 && (
					<Artifact filename="frame-0.txt" content="Content for frame 0" />
				)}
				{frame === 1 && (
					<Artifact filename="frame-1.txt" content="Content for frame 1" />
				)}
				{frame === 2 && (
					<Artifact filename="frame-2.txt" content="Content for frame 2" />
				)}
			</>
		);
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
		outputTarget:
			t.task.file.projectName === 'webkit' ? 'arraybuffer' : 'web-fs',
	});

	expect(artifacts).toEqual([
		{
			filename: 'frame-0.txt',
			content: 'Content for frame 0',
			frame: 0,
			downloadBehavior: null,
		},
		{
			filename: 'frame-1.txt',
			content: 'Content for frame 1',
			frame: 1,
			downloadBehavior: null,
		},
		{
			filename: 'frame-2.txt',
			content: 'Content for frame 2',
			frame: 2,
			downloadBehavior: null,
		},
	]);
});
