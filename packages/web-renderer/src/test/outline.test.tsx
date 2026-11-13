import {expect, test} from 'vitest';
import {getBiggestBoundingClientRect} from '../get-biggest-bounding-client-rect';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {outline} from './fixtures/outline';
import {testImage} from './utils';

test('should render outline', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: outline,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'outline'});
});

test.for([
	{style: 'none', offset: 0, expected: 0},
	{style: 'none', offset: 9, expected: 0},
	{style: 'hidden', offset: 9, expected: 0},
	{style: 'solid', offset: 5, expected: 8},
	{style: 'solid', offset: -1, expected: 2},
	{style: 'solid', offset: -8, expected: 0},
])(
	'measures painted outline bounds for $style offset=$offset',
	({style, offset, expected}) => {
		const element = document.createElement('div');
		Object.assign(element.style, {
			position: 'fixed',
			left: '100px',
			top: '100px',
			width: '100px',
			height: '100px',
			outlineWidth: '3px',
			outlineStyle: style,
			outlineOffset: `${offset}px`,
		});
		document.body.appendChild(element);
		try {
			const border = element.getBoundingClientRect();
			const boundsOptions = {onlyOwnPlane: true, includeCapturePadding: false};
			const bounds = getBiggestBoundingClientRect(
				element,
				true,
				false,
				boundsOptions,
			);
			expect([bounds.left, bounds.top, bounds.right, bounds.bottom]).toEqual([
				border.left - expected,
				border.top - expected,
				border.right + expected,
				border.bottom + expected,
			]);
			const layout = getBiggestBoundingClientRect(element, false);
			expect(layout.toJSON()).toEqual(border.toJSON());
		} finally {
			element.remove();
		}
	},
);
