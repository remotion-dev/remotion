import {expect, test} from 'bun:test';
import {parseElementDragData} from '../element-drag-data';
import {
	createElementPayload,
	staticFileRef,
	StudioProtocolInternals,
} from '../index';

const input = {
	displayName: 'Logo',
	slug: 'logo',
	sourceCode:
		'export const Logo = ({src}: {src: string}) => <img src={src} />;',
	dependencies: [],
	dimensions: null,
	durationInFrames: 30,
	assets: [{path: 'logo/image.png', type: 'base64' as const, data: 'AAEC'}],
};

test.each(['wrapped', 'component-owned-sequence'] as const)(
	'round-trips nested asset props in %s payloads',
	(installationMode) => {
		const initialProps = {
			src: staticFileRef('logo/image.png'),
			media: [{src: staticFileRef('logo/image.png')}],
		};
		const payload = createElementPayload({
			...input,
			installationMode,
			initialProps,
		});
		const serialized = JSON.stringify(payload);
		expect(payload.version).toBe(2);
		expect(
			StudioProtocolInternals.parseStudioElementPayload(JSON.parse(serialized)),
		).toEqual(payload);
		expect(parseElementDragData(serialized)?.element.initialProps).toEqual(
			initialProps,
		);
		expect(payload.element.sourceCode).toBe(input.sourceCode);
	},
);

test('rejects invalid or undeclared asset references, including tampered transport data', () => {
	for (const path of ['', '../logo.png', '/logo.png']) {
		expect(() => staticFileRef(path)).toThrow();
	}

	for (const ref of [
		staticFileRef('missing.png'),
		{__remotion_element_asset: '../logo.png'},
		{__remotion_element_asset: 123},
		{__remotion_element_asset: 'logo/image.png', extra: true},
	]) {
		const initialProps = {media: [{src: ref}]};
		expect(() => createElementPayload({...input, initialProps})).toThrow();
		const payload = createElementPayload(input);
		const tampered = {...payload, element: {...payload.element, initialProps}};
		expect(
			StudioProtocolInternals.parseStudioElementPayload(tampered),
		).toBeNull();
		expect(parseElementDragData(JSON.stringify(tampered))).toBeNull();
	}
});
