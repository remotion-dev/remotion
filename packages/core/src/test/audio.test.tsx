/**
 * @vitest-environment jsdom
 */
import {render} from '@testing-library/react';
import type {ComponentType} from 'react';
import React, {useContext} from 'react';
import {describe, expect, test} from 'vitest';
import {z} from 'zod';
import {Audio} from '../audio/index.js';
import {CanUseRemotionHooksProvider} from '../CanUseRemotionHooks.js';
import {CompositionManager} from '../CompositionManagerContext.js';
import {RemotionRoot} from '../RemotionRoot.js';
import {ResolveCompositionConfig} from '../ResolveCompositionConfig.js';

const Wrapper: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const compositions = useContext(CompositionManager);
	return (
		<CanUseRemotionHooksProvider>
			<RemotionRoot numberOfAudioTags={0}>
				<CompositionManager.Provider
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
								calculateMetadata: null,
								schema: z.object({}),
							},
						],
						currentComposition: 'markup',
					}}
				>
					<ResolveCompositionConfig>{children}</ResolveCompositionConfig>
				</CompositionManager.Provider>
			</RemotionRoot>
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
