import {expect, test} from 'vitest';
import {getSvgMaskForDrawable} from '../drawing/mask-image';

// URL/resource ownership checks only; native rendering is covered by the
// existing root-mask cases in svg-font-definition-review.test.tsx.
const namespace = 'http://www.w3.org/2000/svg';
const documentUrl = 'https://example.test/render?composition=one';
const resource = {namespaceURI: namespace, localName: 'mask'};
const svg = {
	namespaceURI: namespace,
	localName: 'svg',
	baseURI: documentUrl,
	ownerDocument: {
		URL: documentUrl,
		getElementById: (id: string) => (id === 'mask' ? resource : null),
	},
	contains: (node: unknown) => node === resource,
} as unknown as SVGSVGElement;

test.for(['url(#mask)', 'url("#mask")', `url("${documentUrl}#mask")`])(
	'keeps an owned SVG mask local to its serialized image: %s',
	(value) => {
		expect(getSvgMaskForDrawable(svg, value)).toBe('url("#mask")');
	},
);

test.for([
	'url(#missing)',
	'url(#%broken)',
	'url()',
	'url(#mask), url(#mask)',
	'linear-gradient(white, black)',
	'url(https://example.test/another#mask)',
	'url(https://example.test/render?composition=two#mask)',
	'url(https://another.test/render?composition=one#mask)',
])(
	'keeps nonlocal or invalid mask images on their original route: %s',
	(value) => {
		expect(getSvgMaskForDrawable(svg, value)).toBeNull();
	},
);

test('a base URL does not turn another document reference into an owned resource', () => {
	expect(
		getSvgMaskForDrawable(
			{...svg, baseURI: 'https://example.test/other/'} as SVGSVGElement,
			'url(#mask)',
		),
	).toBeNull();
});

test('an empty URL does not inherit the page fragment as a mask reference', () => {
	expect(
		getSvgMaskForDrawable(
			{...svg, baseURI: `${documentUrl}#mask`} as SVGSVGElement,
			'url()',
		),
	).toBeNull();
});

test('a document fragment outside this SVG stays outside its drawable', () => {
	expect(
		getSvgMaskForDrawable(
			{...svg, contains: () => false} as unknown as SVGSVGElement,
			'url(#mask)',
		),
	).toBeNull();
});

test.for([
	{namespaceURI: 'http://www.w3.org/1999/xhtml', localName: 'mask'},
	{namespaceURI: namespace, localName: 'pattern'},
])('does not interpret another resource kind as an SVG mask', (other) => {
	expect(
		getSvgMaskForDrawable(
			{
				...svg,
				ownerDocument: {...svg.ownerDocument, getElementById: () => other},
			} as unknown as SVGSVGElement,
			'url(#mask)',
		),
	).toBeNull();
});

test.for([
	{namespaceURI: 'http://www.w3.org/1999/xhtml', localName: 'svg'},
	{namespaceURI: namespace, localName: 'g'},
])('keeps masks on other element kinds on their original route', (kind) => {
	expect(
		getSvgMaskForDrawable({...svg, ...kind} as SVGSVGElement, 'url(#mask)'),
	).toBeNull();
});
