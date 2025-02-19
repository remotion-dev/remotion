import {expect, test} from 'bun:test';
import React from 'react';
import {Artifact, useCurrentFrame} from 'remotion';
import {getAssetsForMarkup} from './get-assets-for-markup';

const basicConfig = {
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 60,
	id: 'hithere',
};

test('Should be able to collect artifacts', async () => {
	const Markup: React.FC = () => {
		const frame = useCurrentFrame();

		return (
			<div>
				{frame === 1 ? (
					<Artifact filename="hi.txt" content="hi there"></Artifact>
				) : null}
			</div>
		);
	};

	const [first, second] = await getAssetsForMarkup(Markup, basicConfig);
	expect(first).toEqual([]);
	expect(second.length).toEqual(1);
	const sec = second[0];
	if (sec.type !== 'artifact') {
		throw new Error('Expected artifact');
	}

	expect(sec.filename).toEqual('hi.txt');
	expect(sec.content).toEqual('hi there');
});

test('Should throw on invalid artifact', async () => {
	const Markup: React.FC = () => {
		const frame = useCurrentFrame();

		return (
			<div>
				{frame === 1 ? (
					<Artifact
						filename="backslash\\hithere.com"
						content="hi there"
					></Artifact>
				) : null}
			</div>
		);
	};

	try {
		await getAssetsForMarkup(Markup, basicConfig);
	} catch (err) {
		expect(err).toMatch(/The "filename" must match/);
	}
});

test('Should throw on when missing content', async () => {
	const Markup: React.FC = () => {
		const frame = useCurrentFrame();

		return (
			<div>
				{frame === 1 ? (
					<Artifact
						filename="backslash\\hithere.com"
						// @ts-expect-error
						content={undefined}
					></Artifact>
				) : null}
			</div>
		);
	};

	try {
		await getAssetsForMarkup(Markup, basicConfig);
	} catch (err) {
		expect((err as Error).message).toMatch(/The "content" must be a string/);
	}
});
