import React, {forwardRef, useMemo} from 'react';

const AbsoluteFillRefForwarding: React.ForwardRefRenderFunction<
	HTMLDivElement,
	React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = (props, ref) => {
	const {style, ...other} = props;
	const actualStyle = useMemo((): React.CSSProperties => {
		return {
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			width: '100%',
			height: '100%',
			display: 'flex',
			flexDirection: 'column',
			...style,
		};
	}, [style]);

	return <div ref={ref} style={actualStyle} {...other} />;
};

/**
 * An absolutely positioned <div> element with 100% width, height, and a column flex style
 * @link https://www.remotion.dev/docs/absolute-fill
 */
export const AbsoluteFill = forwardRef(AbsoluteFillRefForwarding);
