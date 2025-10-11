import type {queries, RenderOptions} from '@testing-library/react';
import {render} from '@testing-library/react';
import type {FC, ReactElement} from 'react';

const HelloWorld: FC = () => {
	return <div>Hello World</div>;
};

const AllTheProviders: FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	// overwriting console.error console does not gets poluted with all the errors

	window.console.error = () => {};
	return <div>{children}</div>;
};

const customRender = (
	ui: ReactElement,
	options?: Omit<RenderOptions, 'queries'>,
) => render<typeof queries>(ui, {wrapper: AllTheProviders, ...options});

export * from '@testing-library/react';
export {HelloWorld, customRender as render};
