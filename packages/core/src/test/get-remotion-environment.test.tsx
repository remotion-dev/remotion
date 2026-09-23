import {afterEach, beforeEach, expect, test} from 'bun:test';
import {renderToString} from 'react-dom/server';
import {getRemotionEnvironment} from '../get-remotion-environment.js';
import type {RemotionEnvironment} from '../remotion-environment-context.js';
import {useRemotionEnvironment} from '../use-remotion-environment.js';

const flags = [
	'remotion_isPlayer',
	'remotion_isStudio',
	'remotion_isReadOnlyStudio',
] as const;

const originalValues = flags.map((flag) => [flag, window[flag]] as const);

const unsetFlags = () => {
	for (const flag of flags) {
		delete (window as Partial<Window>)[flag];
	}
};

beforeEach(() => {
	unsetFlags();
});

afterEach(() => {
	unsetFlags();
	for (const [flag, value] of originalValues) {
		if (value !== undefined) {
			window[flag] = value;
		}
	}
});

test('Environment flags are false when the window globals are unset', () => {
	expect(window.remotion_isStudio).toBeUndefined();
	expect(window.remotion_isPlayer).toBeUndefined();
	expect(window.remotion_isReadOnlyStudio).toBeUndefined();

	const hookEnvironments: RemotionEnvironment[] = [];
	const Comp = () => {
		const env = useRemotionEnvironment();
		hookEnvironments.push(env);
		return (
			<div>
				{`isStudio=${env.isStudio} isPlayer=${env.isPlayer} isReadOnlyStudio=${env.isReadOnlyStudio}`}
			</div>
		);
	};

	expect(renderToString(<Comp />)).toContain(
		'isStudio=false isPlayer=false isReadOnlyStudio=false',
	);

	for (const environment of [getRemotionEnvironment(), ...hookEnvironments]) {
		expect(environment.isStudio).toBe(false);
		expect(environment.isPlayer).toBe(false);
		expect(environment.isReadOnlyStudio).toBe(false);
		expect(environment.isClientSideRendering).toBe(false);
		expect(typeof environment.isRendering).toBe('boolean');
	}
});

test('Environment flags reflect the window globals when set', () => {
	window.remotion_isStudio = true;
	window.remotion_isReadOnlyStudio = true;
	window.remotion_isPlayer = false;

	expect(getRemotionEnvironment()).toMatchObject({
		isStudio: true,
		isReadOnlyStudio: true,
		isPlayer: false,
	});

	window.remotion_isStudio = false;
	window.remotion_isReadOnlyStudio = false;
	window.remotion_isPlayer = true;

	expect(getRemotionEnvironment()).toMatchObject({
		isStudio: false,
		isReadOnlyStudio: false,
		isPlayer: true,
	});
});
