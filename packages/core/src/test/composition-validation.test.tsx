import {render} from '@testing-library/react';
import React from 'react';
import {Composition} from '..';
import {RemotionRoot} from '../RemotionRoot';
import {expectToThrow} from './expect-to-throw';

const AnyComp: React.FC = () => null;

test('It should throw if multiple components have the same id', () => {
	expectToThrow(
		() =>
			render(
				<RemotionRoot>
					{/**
           // @ts-expect-error*/}
					<Composition
						lazyComponent={() => Promise.resolve({default: AnyComp})}
						durationInFrames={100}
						fps={30}
						height={100}
						id="id"
					/>
				</RemotionRoot>
			),
		/The "width/
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
						height={-100}
						width={100}
						id="id"
					/>
				</RemotionRoot>
			),
		/The "height" of a composition must be positive, but got -100./
	);
});
