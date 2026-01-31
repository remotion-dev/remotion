import React from 'react';
import type {SequenceProps} from 'remotion';
import {Sequence} from 'remotion';

export type LightLeakProps = Omit<SequenceProps, 'children'> & {
	children: React.ReactNode;
};

/*
 * @description Renders a light leak effect as a Sequence.
 * @see [Documentation](https://www.remotion.dev/docs/light-leaks/light-leak)
 */
export const LightLeak: React.FC<LightLeakProps> = ({children, ...props}) => {
	return <Sequence {...props}>{children}</Sequence>;
};
