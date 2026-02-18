import {describe, expect, mock, test} from 'bun:test';
import React from 'react';
import {registerRoot, waitForRoot} from '../register-root';

describe('registerRoot', () => {
	test('Should allow overwriting root component in non-production environments', () => {
		const Comp1: React.FC = () => null;
		const Comp2: React.FC = () => null;

		const listener = mock(() => undefined);

		registerRoot(Comp1);

		// Subscribe
		const cleanup = waitForRoot(listener);

		// Should be called immediately with current root
		expect(listener).toHaveBeenCalledWith(Comp1);
		listener.mockClear();

		// Overwrite root (HMR simulation)
		// This should NOT throw sets NODE_ENV !== 'production' (default in Bun test)
		expect(() => registerRoot(Comp2)).not.toThrow();

		expect(listener).toHaveBeenCalledWith(Comp2);

		cleanup();
	});

	test('waitForRoot should not add duplicate listeners for the same function reference', () => {
		const Comp3: React.FC = () => null;
		registerRoot(Comp3);

		const listener = mock(() => undefined);

		// Only one subscription should be active
		const cleanup1 = waitForRoot(listener);
		const cleanup2 = waitForRoot(listener);

		listener.mockClear();

		const Comp4: React.FC = () => null;
		registerRoot(Comp4);

		// Should be called only once despite two waitForRoot calls (because same function ref)
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith(Comp4);

		cleanup1();
		cleanup2();
	});
});
