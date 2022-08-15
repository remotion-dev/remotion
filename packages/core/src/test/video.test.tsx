/**
 * @vitest-environment jsdom
 */
import {render} from '@testing-library/react';
import type {ComponentType} from 'react';
import React, {useContext} from 'react';
import {describe, expect, test} from 'vitest';
import {CanUseRemotionHooksProvider} from '../CanUseRemotionHooks';
import {Internals} from '../internals';
import {Video} from '../video';
import {expectToThrow} from './expect-to-throw';

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
	test('It should render Video without startFrom / endAt props', () => {
		expect(() =>
			render(
				<Wrapper>
					<Video src="test" />
				</Wrapper>
			)
		).not.toThrow();
	});
	test('It should render Video with startFrom props', () => {
		expect(() =>
			render(
				<Wrapper>
					<Video src="test" startFrom={10} />
				</Wrapper>
			)
		).not.toThrow();
	});
	test('It should render Video with endAt props', () => {
		expect(() =>
			render(
				<Wrapper>
					<Video src="test" endAt={10} />
				</Wrapper>
			)
		).not.toThrow();
	});
	test('It should render Video with startFrom and endAt props', () => {
		expect(() =>
			render(
				<Wrapper>
					<Video src="test" startFrom={10} endAt={15} />
				</Wrapper>
			)
		).not.toThrow();
	});
	test('It should throw if videoConfig/Wrapper is missing', () => {
		expectToThrow(
			() =>
				render(
					<CanUseRemotionHooksProvider>
						<Video startFrom={10} endAt={15} />
					</CanUseRemotionHooksProvider>
				),
			/No video config found/
		);
	});
});
