import React, {forwardRef, useMemo} from 'react';

const hasTailwindClassName = (
	className: string | undefined,
	classPrefix: string[],
) => {
	if (!className) {
		return false;
	}

	return classPrefix.some((prefix) => {
		return (
			className.startsWith(prefix) ||
			className.includes(` ${prefix}`) ||
			className.includes(`:${prefix}`)
		);
	});
};

const AbsoluteFillRefForwarding: React.ForwardRefRenderFunction<
	HTMLDivElement,
	React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = (props, ref) => {
	const {style, ...other} = props;

	const actualStyle = useMemo((): React.CSSProperties => {
		// Make TailwindCSS classes get accepted
		return {
			position: 'absolute',
			top: hasTailwindClassName(other.className, ['top-', 'inset-'])
				? undefined
				: 0,
			left: hasTailwindClassName(other.className, ['left-', 'inset-'])
				? undefined
				: 0,
			right: hasTailwindClassName(other.className, ['right-', 'inset-'])
				? undefined
				: 0,
			bottom: hasTailwindClassName(other.className, ['bottom-', 'inset-'])
				? undefined
				: 0,
			width: hasTailwindClassName(other.className, ['w-']) ? undefined : '100%',
			height: hasTailwindClassName(other.className, ['h-'])
				? undefined
				: '100%',
			display: hasTailwindClassName(other.className, [
				'block',
				'inline-block',
				'inline',
				'flex',
				'inline-flex',
				'flow-root',
				'grid',
				'inline-grid',
				'contents',
				'list-item',
				'hidden',
			])
				? undefined
				: 'flex',
			flexDirection: hasTailwindClassName(other.className, [
				'flex-row',
				'flex-col',
				'flex-row-reverse',
				'flex-col-reverse',
			])
				? undefined
				: 'column',
			...style,
		};
	}, [other.className, style]);

	return <div ref={ref} style={actualStyle} {...other} />;
};

/*
 * @description A helper component which renders an absolutely positioned <div> element with full width, height, and flex display suited for content layering.
 * @see [Documentation](https://remotion.dev/docs/absolute-fill)
 */

export const AbsoluteFill = forwardRef(AbsoluteFillRefForwarding);
