import {expect, test} from 'bun:test';
import {
	type ArtifactRegistrationResult,
	makeArtifactRegistry,
} from '../artifact-registry';

test('classifies new artifacts, retry replays, and filename conflicts', () => {
	const cases: Array<{
		name: string;
		artifacts: Array<{
			chunk: number;
			frame: number;
			attempt: number;
			filename: string;
		}>;
		expected: Array<ArtifactRegistrationResult['type']>;
	}> = [
		{
			name: 'new artifact',
			artifacts: [{chunk: 0, frame: 10, attempt: 1, filename: 'file.txt'}],
			expected: ['accepted'],
		},
		{
			name: 'retry replay',
			artifacts: [
				{chunk: 0, frame: 10, attempt: 1, filename: 'file.txt'},
				{chunk: 0, frame: 10, attempt: 2, filename: 'file.txt'},
			],
			expected: ['accepted', 'retry-replay'],
		},
		{
			name: 'duplicate in the first attempt',
			artifacts: [
				{chunk: 0, frame: 10, attempt: 1, filename: 'file.txt'},
				{chunk: 0, frame: 10, attempt: 1, filename: 'file.txt'},
			],
			expected: ['accepted', 'conflict'],
		},
		{
			name: 'duplicate in a retry attempt',
			artifacts: [
				{chunk: 0, frame: 10, attempt: 1, filename: 'file.txt'},
				{chunk: 0, frame: 10, attempt: 2, filename: 'file.txt'},
				{chunk: 0, frame: 10, attempt: 2, filename: 'file.txt'},
			],
			expected: ['accepted', 'retry-replay', 'conflict'],
		},
		{
			name: 'same filename on another frame',
			artifacts: [
				{chunk: 0, frame: 10, attempt: 1, filename: 'file.txt'},
				{chunk: 0, frame: 11, attempt: 2, filename: 'file.txt'},
			],
			expected: ['accepted', 'conflict'],
		},
		{
			name: 'same filename in another chunk',
			artifacts: [
				{chunk: 0, frame: 10, attempt: 1, filename: 'file.txt'},
				{chunk: 1, frame: 10, attempt: 2, filename: 'file.txt'},
			],
			expected: ['accepted', 'conflict'],
		},
	];

	for (const testCase of cases) {
		const registry = makeArtifactRegistry();
		const results = testCase.artifacts.map(
			(artifact) => registry.registerArtifact(artifact).type,
		);
		expect(results, testCase.name).toEqual(testCase.expected);
	}
});
