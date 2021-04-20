import {render} from '@testing-library/react';
import React, {useContext} from 'react';
import {Audio} from '../audio';
import {Internals} from '../internals';

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
