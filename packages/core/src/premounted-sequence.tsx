import React, {forwardRef, useMemo} from 'react';
import {Freeze} from './freeze';
import {getRemotionEnvironment} from './get-remotion-environment';
import type {SequenceProps} from './Sequence';
import {Sequence} from './Sequence';
import {useCurrentFrame} from './use-current-frame';

export type PremountedSequenceProps = SequenceProps & {
	premountFor: number;
};

const PremountedSequenceRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLDivElement,
	{
		premountFor: number;
	} & SequenceProps
> = ({premountFor, ...props}, ref) => {
	const frame = useCurrentFrame();

	if (props.layout === 'none') {
		throw new Error('`<Premount>` does not support layout="none"');
	}

	const {style: passedStyle, from = 0, ...otherProps} = props;
	const active = frame < from && !getRemotionEnvironment().isRendering;

	const style = useMemo(() => {
		return {
			...passedStyle,
			opacity: active ? 0 : 1,
			pointerEvents: active ? 'none' : passedStyle?.pointerEvents ?? 'auto',
		};
	}, [active, passedStyle]);

	return (
		<Freeze frame={from} active={active}>
			<Sequence
				ref={ref}
				name={`<Premount premountFor={${premountFor}}>`}
				from={from + (active ? -premountFor : 0)}
				style={style}
				{...otherProps}
			/>
		</Freeze>
	);
};

export const PremountedSequence = forwardRef(
	PremountedSequenceRefForwardingFunction,
);
