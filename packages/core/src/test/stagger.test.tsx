/* eslint-disable react/jsx-no-constructed-context-values */
import {render} from '@testing-library/react';
import React from 'react';
import {Stagger, StaggerChild} from '../stagger';
import {TimelineContext} from '../timeline-position-state';
import {useCurrentFrame} from '../use-frame';
import {expectToThrow} from './expect-to-throw';

const First = () => {
	const frame = useCurrentFrame();
	return <div>{'first ' + frame}</div>;
};

const Second = () => {
	const frame = useCurrentFrame();
	return <div>{'second ' + frame}</div>;
};

const Third = () => {
	const frame = useCurrentFrame();
	return <div>{'third ' + frame}</div>;
};

const renderForFrame = (frame: number, markup: React.ReactNode) => {
	return render(
		<TimelineContext.Provider
			value={{
				rootId: '',
				frame,
				playing: false,
			}}
		>
			{markup}
		</TimelineContext.Provider>
	);
};

test('Basic stagger test', () => {
	const {queryByText} = renderForFrame(
		10,
		<Stagger>
			<StaggerChild durationInFrames={5}>
				<First />
			</StaggerChild>
			<StaggerChild durationInFrames={5}>
				<Second />
			</StaggerChild>
			<StaggerChild durationInFrames={5}>
				<Third />
			</StaggerChild>
		</Stagger>
	);

	expect(queryByText(/^third\s0$/g)).not.toBe(null);
});
test('Should not allow foreign elements', () => {
	expectToThrow(() => {
		render(
			<Stagger>
				<First />
			</Stagger>
		);
	}, /only accepts a/);
});
test('Should allow layout prop', () => {
	const {container} = renderForFrame(
		0,
		<Stagger>
			<StaggerChild durationInFrames={1}>
				<First />
			</StaggerChild>
		</Stagger>
	);
	expect(container.outerHTML).toBe(
		'<div><div style="position: absolute; display: flex; width: 100%; height: 100%; top: 0px; bottom: 0px; left: 0px; right: 0px;"><div>first 0</div></div></div>'
	);

	const {container: withoutLayoutContainer} = renderForFrame(
		0,
		<Stagger>
			<StaggerChild durationInFrames={1} layout="none">
				<First />
			</StaggerChild>
		</Stagger>
	);
	expect(withoutLayoutContainer.outerHTML).toBe(
		'<div><div>first 0</div></div>'
	);
});
test('Should render nothing after the end', () => {
	const {container} = renderForFrame(
		10,
		<Stagger>
			<StaggerChild durationInFrames={1}>
				<First />
			</StaggerChild>
		</Stagger>
	);
	expect(container.outerHTML).toBe('<div></div>');
});
test('Should throw if invalid or no duration provided', () => {
	expectToThrow(() => {
		renderForFrame(
			10,
			<Stagger>
				<StaggerChild durationInFrames={NaN}>
					<First />
				</StaggerChild>
			</Stagger>
		);
	}, /The "durationInFrames" prop of a <StaggerChild \/> component must be an integer, but got NaN./);
	expectToThrow(() => {
		renderForFrame(
			10,
			<Stagger>
				{/**
				 * @ts-expect-error */}
				<StaggerChild>
					<First />
				</StaggerChild>
			</Stagger>
		);
	}, /The "durationInFrames" prop of a <StaggerChild \/> component must be a number, but you passed a value of type undefined/);
});
test('Should allow whitespace', () => {
	const {queryByText} = renderForFrame(
		11,
		<Stagger>
			<StaggerChild durationInFrames={10}>
				<First />
			</StaggerChild>{' '}
			<StaggerChild durationInFrames={10}>
				<Second />
			</StaggerChild>
		</Stagger>
	);
	expect(queryByText(/^second\s1$/g)).not.toBe(null);
});
test('Handle empty StaggerChild', () => {
	expectToThrow(
		() =>
			renderForFrame(
				11,
				<Stagger>
					<StaggerChild durationInFrames={10}>
						<First />
					</StaggerChild>
					<StaggerChild durationInFrames={10} />
				</Stagger>
			),
		/A <StaggerChild \/> component \(index = 1, duration = 10\) doesn't have any children\./
	);
});

test('Should allow negative overlap prop', () => {
	const {container} = renderForFrame(
		4,
		<Stagger>
			<StaggerChild durationInFrames={5} layout="none">
				<First />
			</StaggerChild>
			<StaggerChild offset={-1} layout="none" durationInFrames={5}>
				<Second />
			</StaggerChild>
		</Stagger>
	);
	expect(container.outerHTML).toBe(
		'<div><div>first 4</div><div>second 0</div></div>'
	);
});

test('Should allow positive overlap prop', () => {
	const {container} = renderForFrame(
		5,
		<Stagger>
			<StaggerChild durationInFrames={5} layout="none">
				<First />
			</StaggerChild>
			<StaggerChild offset={1} layout="none" durationInFrames={5}>
				<Second />
			</StaggerChild>
		</Stagger>
	);
	expect(container.outerHTML).toBe('<div></div>');
});

test('Should disallow NaN as offset prop', () => {
	expectToThrow(() => {
		renderForFrame(
			9,
			<Stagger>
				<StaggerChild offset={NaN} layout="none" durationInFrames={5}>
					<Second />
				</StaggerChild>
			</Stagger>
		);
	}, /The "offset" property of a <StaggerChild \/> must not be NaN, but got NaN \(index = 0, duration = 5\)\./);
});

test('Should disallow Infinity as offset prop', () => {
	expectToThrow(() => {
		renderForFrame(
			9,
			<Stagger>
				<StaggerChild offset={Infinity} layout="none" durationInFrames={5}>
					<Second />
				</StaggerChild>
			</Stagger>
		);
	}, /The "offset" property of a <StaggerChild \/> must be finite, but got Infinity \(index = 0, duration = 5\)\./);
});

test('Should disallow non-integer numbers as offset prop', () => {
	expectToThrow(() => {
		renderForFrame(
			9,
			<Stagger>
				<StaggerChild offset={Math.PI} layout="none" durationInFrames={5}>
					<Second />
				</StaggerChild>
			</Stagger>
		);
	}, /The "offset" property of a <StaggerChild \/> must be finite, but got 3.141592653589793 \(index = 0, duration = 5\)\./);
});

test('Should cascade negative offset props', () => {
	const {container} = renderForFrame(
		9,
		<Stagger>
			<StaggerChild durationInFrames={5} layout="none">
				<First />
			</StaggerChild>
			<StaggerChild offset={-1} layout="none" durationInFrames={5}>
				<Second />
			</StaggerChild>
			<StaggerChild layout="none" durationInFrames={5}>
				<Third />
			</StaggerChild>
		</Stagger>
	);
	expect(container.outerHTML).toBe('<div><div>third 0</div></div>');
});

test('Should cascade positive offset props', () => {
	const {container} = renderForFrame(
		11,
		<Stagger>
			<StaggerChild durationInFrames={5} layout="none">
				<First />
			</StaggerChild>
			<StaggerChild offset={1} layout="none" durationInFrames={5}>
				<Second />
			</StaggerChild>
			<StaggerChild layout="none" durationInFrames={5}>
				<Third />
			</StaggerChild>
		</Stagger>
	);
	expect(container.outerHTML).toBe('<div><div>third 0</div></div>');
});
