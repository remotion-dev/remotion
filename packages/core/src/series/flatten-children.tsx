import type {PropsWithChildren} from 'react';
import React from 'react';

type ReactChildArray = ReturnType<typeof React.Children.toArray>;

export const flattenChildren = (children: React.ReactNode): ReactChildArray => {
	const childrenArray = React.Children.toArray(children);
	return childrenArray.reduce((flatChildren: ReactChildArray, child) => {
		if ((child as React.ReactElement<unknown>).type === React.Fragment) {
			return flatChildren.concat(
				flattenChildren(
					(child as React.ReactElement<PropsWithChildren<unknown>>).props
						.children,
				),
			);
		}

		flatChildren.push(child);
		return flatChildren;
	}, []);
};
