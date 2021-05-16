import {ComponentType, ReactFragment, ReactNode} from 'react';

export type AnyComponent<T> = ComponentType<T> | ((props: T) => ReactNode);

// Some people use the following syntax:
// const Comp = (): React.ReactNode => null

// This is not a React component that fits ComponentType<T>
// but we want to allow it. Therefore we do type assertion that it's a LooseAnyComponent
// make the types happy.

export type LooseAnyComponent<T> =
	| ComponentType<T>
	| ((props: T) => Exclude<ReactNode, ReactFragment | undefined>);
