import React, {useMemo} from 'react';
import {Freeze} from './freeze';
import type {SequenceProps} from './Sequence';
import {Sequence} from './Sequence';
import {useCurrentFrame} from './use-current-frame';

export const PremountedSequence: React.FC<
	{
		children: React.ReactNode;
		premountFor: number;
	} & SequenceProps
> = ({premountFor, ...props}) => {
	const frame = useCurrentFrame();

	if (props.layout === 'none') {
		throw new Error('`<Premount>` does not support layout="none"');
	}

	const {style: passedStyle, from = 0, ...otherProps} = props;
	const active = frame < premountFor + from;

	const style = useMemo(() => {
		return {
			...passedStyle,
			opacity: active ? 0 : 1,
			pointerEvents: active ? 'none' : passedStyle?.pointerEvents ?? 'auto',
		};
	}, [active, passedStyle]);

	return (
		<Freeze frame={frame >= from ? from : -1} active={active}>
			<Sequence
				name={`<Premount premountFor={${premountFor}}>`}
				from={from + (active ? 0 : premountFor)}
				style={style}
				{...otherProps}
			/>
		</Freeze>
	);
};
