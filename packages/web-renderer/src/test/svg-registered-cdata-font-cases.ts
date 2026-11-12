import {renderStillOnWeb} from '../render-still-on-web';
import {
	registeredCdataWrappers,
	svgRegisteredCdataFont,
} from './fixtures/svg-registered-cdata-font';
import {captureNativeReference, countNativePixels} from './native-reference';

export const registeredCdataCases = registeredCdataWrappers.flatMap((wrapper) =>
	[0, 1].map((frame) => ({wrapper, frame})),
);
export const measureRegisteredCdata = async ({
	wrapper,
	frame,
}: (typeof registeredCdataCases)[number]) => {
	const fixture = (
		nodes: 'text' | 'cdata' | 'mixed',
		mode: 'registered' | 'literal' | 'fallback',
	) => svgRegisteredCdataFont(wrapper, nodes, mode);
	const images: Record<string, Blob> = {};
	for (const [key, nodes, mode] of [
		['native-text', 'text', 'registered'],
		['native-cdata', 'cdata', 'registered'],
		['native-literal', 'text', 'literal'],
		['native-repeat', 'cdata', 'registered'],
	] as const)
		images[key] = await captureNativeReference(fixture(nodes, mode), frame, {
			omitBackground: false,
		});
	for (const [key, nodes, mode] of [
		['actual-text', 'text', 'registered'],
		['actual-cdata', 'cdata', 'registered'],
		['actual-mixed', 'mixed', 'registered'],
		['actual-literal', 'text', 'literal'],
		['actual-fallback', 'text', 'fallback'],
		['actual-repeat', 'cdata', 'registered'],
	] as const)
		images[key] = await (
			await renderStillOnWeb({
				composition: fixture(nodes, mode),
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
	const comparisons = {
		nativeNodes: await countNativePixels(
			images['native-text'],
			images['native-cdata'],
		),
		nativeLiteral: await countNativePixels(
			images['native-text'],
			images['native-literal'],
		),
		nativeRepeat: await countNativePixels(
			images['native-cdata'],
			images['native-repeat'],
		),
		actualNodes: await countNativePixels(
			images['actual-text'],
			images['actual-cdata'],
		),
		actualMixed: await countNativePixels(
			images['actual-text'],
			images['actual-mixed'],
		),
		actualLiteral: await countNativePixels(
			images['actual-text'],
			images['actual-literal'],
		),
		actualRepeat: await countNativePixels(
			images['actual-cdata'],
			images['actual-repeat'],
		),
		fallbackDifference: await countNativePixels(
			images['actual-cdata'],
			images['actual-fallback'],
		),
		strictNative: await countNativePixels(
			images['native-cdata'],
			images['actual-cdata'],
		),
		strictTextNative: await countNativePixels(
			images['native-text'],
			images['actual-text'],
		),
	};
	return {images, comparisons};
};
