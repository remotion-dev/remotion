/**
 * @vitest-environment jsdom
 */
import {render} from '@testing-library/react';
import type {ComponentType} from 'react';
import React, {useContext} from 'react';
import {describe, expect, test} from 'vitest';
import {Audio} from '../audio';
import {CanUseRemotionHooksProvider} from '../CanUseRemotionHooks';
import {Internals} from '../internals';

const Wrapper: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const compositions = useContext(Internals.CompositionManager);
	return (
		<CanUseRemotionHooksProvider>
			<Internals.RemotionRoot>
				<Internals.CompositionManager.Provider
					// eslint-disable-next-line react/jsx-no-constructed-context-values
					value={{
						...compositions,
						compositions: [
							{
								height: 1080,
								width: 1080,
								fps: 30,
								durationInFrames: 30,
								id: 'markup',
								nonce: 0,
								component: React.lazy(() =>
									Promise.resolve({
										default: (() => null) as ComponentType<unknown>,
									})
								),
								defaultProps: undefined,
								folderName: null,
								parentFolderName: null,
							},
						],
						currentComposition: 'markup',
					}}
				>
					{children}
				</Internals.CompositionManager.Provider>
			</Internals.RemotionRoot>
		</CanUseRemotionHooksProvider>
	);
};

describe('Render correctly with props', () => {
	test('It should render Audio without startFrom / endAt props', () => {
		expect(() =>
			render(
				<Wrapper>
					<Audio src="test" volume={1} />
				</Wrapper>
			)
		).not.toThrow();
	});

	test('It should render Audio with startAt  props', () => {
		expect(() =>
			render(
				<Wrapper>
					<Audio src="test" volume={1} startFrom={10} />
				</Wrapper>
			)
		).not.toThrow();
	});

	test('It should render Audio with endAt props', () => {
		expect(() =>
			render(
				<Wrapper>
					<Audio src="test" volume={1} endAt={10} />
				</Wrapper>
			)
		).not.toThrow();
	});

	test('It should render Audio with startFrom and endAt props', () => {
		expect(() =>
			render(
				<Wrapper>
					<Audio src="test" volume={1} startFrom={10} endAt={20} />
				</Wrapper>
			)
		).not.toThrow();
	});
});
