/**
 * @vitest-environment jsdom
 */
import {render} from '@testing-library/react';
import React from 'react';
import {describe, expect, test} from 'vitest';
import {Composition} from '../Composition';
import {RemotionRoot} from '../RemotionRoot';
import {expectToThrow} from './expect-to-throw';

const AnyComp: React.FC = () => null;

describe('Render composition-rules should throw with invalid props', () => {
	test('It should report invalid component id', () => {
		expectToThrow(
			() =>
				render(
					<Composition
						lazyComponent={() => Promise.resolve({default: AnyComp})}
						durationInFrames={100}
						fps={30}
						height={100}
						id="invalid@id"
						width={100}
					/>
				),
			/can only contain/
		);
	});

	test('It should throw if no id is passed', () => {
		expectToThrow(
			() =>
				render(
					// @ts-expect-error
					<Composition
						lazyComponent={() => Promise.resolve({default: AnyComp})}
						durationInFrames={100}
						fps={30}
						height={100}
						width={100}
					/>
				),
			/No id for composition passed./
		);
	});

	test('It should throw if multiple components have the same id', () => {
		expectToThrow(
			() =>
				render(
					<RemotionRoot>
						<Composition
							lazyComponent={() => Promise.resolve({default: AnyComp})}
							durationInFrames={100}
							fps={30}
							height={100}
							width={100}
							id="id"
						/>
						<Composition
							lazyComponent={() => Promise.resolve({default: AnyComp})}
							durationInFrames={100}
							fps={30}
							height={100}
							width={100}
							id="id"
						/>
					</RemotionRoot>
				),
			/Multiple composition with id id/
		);
	});
});
describe('Render composition-rules should not with valid props', () => {
	test('It should validate the component id', () => {
		expect(() =>
			render(
				<Composition
					lazyComponent={() => Promise.resolve({default: AnyComp})}
					durationInFrames={100}
					fps={30}
					height={100}
					id="valid-id"
					width={100}
				/>
			)
		).not.toThrow();
	});
});
