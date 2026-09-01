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

export type AbsoluteFillElementProps = React.DetailedHTMLProps<
	React.HTMLAttributes<HTMLDivElement>,
	HTMLDivElement
>;

const AbsoluteFillElementRefForwarding: React.ForwardRefRenderFunction<
	HTMLDivElement,
	AbsoluteFillElementProps
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

export const AbsoluteFillElement = forwardRef(AbsoluteFillElementRefForwarding);
