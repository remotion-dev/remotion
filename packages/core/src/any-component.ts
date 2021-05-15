import {ComponentType, ReactNode} from 'react';

export type AnyComponent<T> = ComponentType<T> | ((props: T) => ReactNode);
