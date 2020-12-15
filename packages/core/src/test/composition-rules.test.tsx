import {render} from '@testing-library/react';
import React from 'react';
import {Composition} from '..';
import {RemotionRoot} from '../RemotionRoot';
import {expectToThrow} from './expect-to-throw';

const AnyComp: React.FC = () => null;

test('It should report invalid component name', () => {
	expectToThrow(
		() =>
			render(
				<Composition
					lazyComponent={() => Promise.resolve({default: AnyComp})}
					durationInFrames={100}
					fps={30}
					height={100}
					name="invalid@name"
					width={100}
				/>
			),
		/can only contain/
	);
});

test('It should validate the component name', () => {
	expect(() =>
		render(
			<Composition
				lazyComponent={() => Promise.resolve({default: AnyComp})}
				durationInFrames={100}
				fps={30}
				height={100}
				name="valid-name"
				width={100}
			/>
		)
	).not.toThrow();
});

test('It should throw if no name is passed', () => {
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
		/No name for composition passed./
	);
});

test('It should throw if multiple components have the same name', () => {
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
						name="name"
					/>
					<Composition
						lazyComponent={() => Promise.resolve({default: AnyComp})}
						durationInFrames={100}
						fps={30}
						height={100}
						width={100}
						name="name"
					/>
				</RemotionRoot>
			),
		/Multiple composition with name name/
	);
});
