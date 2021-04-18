import {render} from '@testing-library/react';
import React, {useContext} from 'react';
import {Audio} from '../audio';
import {AudioForRendering} from '../audio/AudioForRendering';
import {CompositionManagerContext} from '../CompositionManager';
import {Internals} from '../internals';
import {expectToThrow} from './expect-to-throw';

const Wrapper: React.FC = ({children}) => {
	const compositions = useContext(Internals.CompositionManager);
	return (
		<Internals.RemotionRoot>
			<Internals.CompositionManager.Provider
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
									default: (() => null) as React.ComponentType<unknown>,
								})
							),
						},
					],
					currentComposition: 'markup',
				}}
			>
				{children}
			</Internals.CompositionManager.Provider>
		</Internals.RemotionRoot>
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

interface MockCompositionManagerContext {
	MockProvider: Function;
	registerAsset: Function;
	unregisterAsset: Function;
}
let mockContext: MockCompositionManagerContext;

describe('Register and unregister asset', () => {
	function createMockContext(): MockCompositionManagerContext {
		const registerAsset = jest.fn();
		const unregisterAsset = jest.fn();
		const MockProvider: React.FC = ({children}) => {
			return (
				<Internals.CompositionManager.Provider
					value={
						({
							registerAsset,
							unregisterAsset,
						} as unknown) as CompositionManagerContext
					}
				>
					{children}
				</Internals.CompositionManager.Provider>
			);
		};
		return {
			MockProvider,
			registerAsset,
			unregisterAsset,
		};
	}
	beforeEach(() => {
		mockContext = createMockContext();
	});

	test('register and unregister asset', () => {
		const props = {
			src: 'test',
			muted: false,
			volume: 50,
		};
		const {unmount} = render(
			<mockContext.MockProvider>
				<AudioForRendering {...props} />
			</mockContext.MockProvider>
		);

		expect(mockContext.registerAsset).toHaveBeenCalled();
		unmount();
		expect(mockContext.unregisterAsset).toHaveBeenCalled();
	});

	test('no src passed', () => {
		const props = {
			src: undefined,
			muted: false,
			volume: 50,
		};
		expectToThrow(() => {
			render(
				<mockContext.MockProvider>
					<AudioForRendering {...props} />
				</mockContext.MockProvider>
			);
		}, /No src passed/);
		expect(mockContext.registerAsset).not.toHaveBeenCalled();
		expect(mockContext.unregisterAsset).not.toHaveBeenCalled();
	});
});

let mockUseEffect: Function;
describe('useEffect tests', () => {
	const useEffectSpy = jest.spyOn(React, 'useEffect');
	mockUseEffect = jest.fn();
	beforeAll(() => {
		useEffectSpy.mockImplementation(() => {
			mockUseEffect();
		});
	});
	afterAll(() => {
		useEffectSpy.mockRestore();
	});
	test('has registered', () => {
		const props = {
			src: 'test',
			muted: false,
			volume: 50,
		};
		render(<AudioForRendering {...props} />);
		expect(mockUseEffect).toHaveBeenCalled();
	});
});
