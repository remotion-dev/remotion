import {afterEach, expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import {CanUseRemotionHooksProvider} from '../CanUseRemotionHooks.js';
import {PixelDensityContext, usePixelDensity} from '../use-pixel-density.js';

afterEach(cleanup);

const setDevicePixelRatio = (value: number) => {
	Object.defineProperty(window, 'devicePixelRatio', {
		configurable: true,
		value,
	});
};

test('usePixelDensity() reads the browser pixel density in a Remotion context', () => {
	setDevicePixelRatio(2.5);
	let pixelDensity = Number.NaN;

	const Component = () => {
		pixelDensity = usePixelDensity();
		return null;
	};

	render(
		<CanUseRemotionHooksProvider>
			<Component />
		</CanUseRemotionHooksProvider>,
	);

	expect(pixelDensity).toBe(2.5);
});

test('usePixelDensity() prefers an explicit pixel density context', () => {
	setDevicePixelRatio(1);
	let pixelDensity = Number.NaN;

	const Component = () => {
		pixelDensity = usePixelDensity();
		return null;
	};

	render(
		<CanUseRemotionHooksProvider>
			<PixelDensityContext.Provider value={0.5}>
				<Component />
			</PixelDensityContext.Provider>
		</CanUseRemotionHooksProvider>,
	);

	expect(pixelDensity).toBe(0.5);
});

test('usePixelDensity() throws outside a Remotion context', () => {
	const Component = () => {
		usePixelDensity();
		return null;
	};

	expect(() => render(<Component />)).toThrow(
		/usePixelDensity\(\) was called outside of a Remotion context/,
	);
});

test('usePixelDensity() can be called outside Remotion with dontThrowIfOutsideOfRemotion', () => {
	setDevicePixelRatio(3);
	let pixelDensity = Number.NaN;

	const Component = () => {
		pixelDensity = usePixelDensity({dontThrowIfOutsideOfRemotion: true});
		return null;
	};

	render(<Component />);

	expect(pixelDensity).toBe(3);
});
