import React, {forwardRef, useMemo} from 'react';

type ElementByTagName<T extends keyof HTMLElementTagNameMap> =
	HTMLElementTagNameMap[T];

const AbsoluteFillRefForwarding = <TagName extends keyof HTMLElementTagNameMap>(
	props: React.ComponentPropsWithoutRef<TagName> & {
		readonly as?: TagName;
	},
	ref: ElementByTagName<TagName>,
) => {
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

	const Name = props.as || 'div';

	return <Name ref={ref} style={actualStyle} {...other} />;
};

/**
 * @description An absolutely positioned <div> element with 100% width, height, and a column flex style
 * @see [Documentation](https://www.remotion.dev/docs/absolute-fill)
 */

export const AbsoluteFill = forwardRef(AbsoluteFillRefForwarding);
