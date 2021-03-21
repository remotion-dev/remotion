import {render} from '@testing-library/react';
import React, {useContext} from 'react';
import {Audio} from '../audio';
import {Internals} from '../internals';
import {Video} from '../video';
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

test('It should not allow a video to have a negative volume', () => {
	expectToThrow(
		() =>
			render(
				<Wrapper>
					<Video src="hi" volume={-1} />
				</Wrapper>
			),
		/You have passed a volume below 0 to your <Video \/> component./
	);
});

test('It should not allow an audio element to have a negative volume', () => {
	expectToThrow(
		() =>
			render(
				<Wrapper>
					<Audio src="hi" volume={-1} />
				</Wrapper>
			),
		/You have passed a volume below 0 to your <Audio \/> component./
	);
});

test('It should not allow an audio element to have a wrong type', () => {
	expectToThrow(
		() =>
			render(
				<Wrapper>
					{/**
           *
           // @ts-expect-error */}
					<Audio src="hi" volume="wrong" />
				</Wrapper>
			),
		/You have passed a volume of type string to your <Audio \/> component. Volume must be a number or undefined./
	);
});

test('It should not allow an video element to have a wrong type', () => {
	expectToThrow(
		() =>
			render(
				<Wrapper>
					{/**
           *
           // @ts-expect-error */}
					<Video src="hi" volume="wrong" />
				</Wrapper>
			),
		/You have passed a volume of type string to your <Video \/> component. Volume must be a number or undefined./
	);
});

test('It should allow a valid volume', () => {
	expect(() =>
		render(
			<Wrapper>
				<Video src="hi" volume={1} />
			</Wrapper>
		)
	).not.toThrow();
});
