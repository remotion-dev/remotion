import React, {forwardRef, useMemo} from 'react';

const hasTailwindClassName = ({
	className,
	classPrefix,
	type,
}: {
	className: string | undefined;
	classPrefix: string[];
	type: 'prefix' | 'exact';
}) => {
	if (!className) {
		return false;
	}

	if (type === 'exact') {
		const split = className.split(' ');
		return classPrefix.some((token) => {
			return split.some((part) => {
				return (
					part.trim() === token ||
					part.trim().endsWith(`:${token}`) ||
					part.trim().endsWith(`!${token}`)
				);
			});
		});
	}

	return classPrefix.some((prefix) => {
		return (
			className.startsWith(prefix) ||
			className.includes(` ${prefix}`) ||
			className.includes(`!${prefix}`) ||
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
			top: hasTailwindClassName({
				className: other.className,
				classPrefix: ['top-', 'inset-'],
				type: 'prefix',
			})
				? undefined
				: 0,
			left: hasTailwindClassName({
				className: other.className,
				classPrefix: ['left-', 'inset-'],
				type: 'prefix',
			})
				? undefined
				: 0,
			right: hasTailwindClassName({
				className: other.className,
				classPrefix: ['right-', 'inset-'],
				type: 'prefix',
			})
				? undefined
				: 0,
			bottom: hasTailwindClassName({
				className: other.className,
				classPrefix: ['bottom-', 'inset-'],
				type: 'prefix',
			})
				? undefined
				: 0,
			width: hasTailwindClassName({
				className: other.className,
				classPrefix: ['w-'],
				type: 'prefix',
			})
				? undefined
				: '100%',
			height: hasTailwindClassName({
				className: other.className,
				classPrefix: ['h-'],
				type: 'prefix',
			})
				? undefined
				: '100%',
			display: hasTailwindClassName({
				className: other.className,
				classPrefix: [
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
				],
				type: 'exact',
			})
				? undefined
				: 'flex',
			flexDirection: hasTailwindClassName({
				className: other.className,
				classPrefix: [
					'flex-row',
					'flex-col',
					'flex-row-reverse',
					'flex-col-reverse',
				],
				type: 'exact',
			})
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
