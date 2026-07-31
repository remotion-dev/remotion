import {expect, test} from 'bun:test';
import {getOriginalLocationFromStack} from '../components/Timeline/TimelineStack/get-stack';

test('resolves compiler-provided Studio source locations', async () => {
	const location = await getOriginalLocationFromStack(
		'Error\n    at remotionOriginalSource (studio-original://%2Fproject%2Fsrc%2FVideo.tsx:12:4)',
		'sequence',
	);

	expect(location).toEqual({
		column: 4,
		line: 12,
		source: '/project/src/Video.tsx',
	});
});
