import type {HTMLAttributes} from 'react';
import React, {useMemo} from 'react';

export const SPACING_UNIT = 8;

export const Spacing: React.FC<{
	readonly x?: number;
	readonly y?: number;
	readonly block?: boolean;
}> = ({x = 0, y = 0, block = false}) => {
	const style = useMemo((): React.CSSProperties => {
		return {
			display: block ? 'block' : 'inline-block',
			width: x * SPACING_UNIT,
			height: y * SPACING_UNIT,
			flexShrink: 0,
		};
	}, [block, x, y]);

	return <div style={style} />;
};

const flexCss: React.CSSProperties = {flex: 1};

export const Flex: React.FC<{
	readonly children?: React.ReactNode;
}> = ({children}) => <div style={flexCss}>{children}</div>;

export const Row: React.FC<
	{
		readonly justify?: 'center' | 'flex-start' | 'flex-end';
		readonly align?: 'center';
		readonly style?: React.CSSProperties;
		readonly flex?: number;
		readonly className?: string;
		readonly children: React.ReactNode;
	} & HTMLAttributes<HTMLDivElement>
> = ({children, justify, className, align, flex, style = {}, ...other}) => {
	const finalStyle: React.CSSProperties = useMemo(() => {
		return {
			...style,
			display: 'flex',
			flexDirection: 'row',
			justifyContent: justify ?? 'flex-start',
			alignItems: align ?? 'flex-start',
			flex: flex ?? undefined,
		};
	}, [align, flex, justify, style]);

	return (
		<div className={className} style={finalStyle} {...other}>
			{children}
		</div>
	);
};

export const Column: React.FC<{
	readonly justify?: 'center';
	readonly align?: 'center';
	readonly style?: React.CSSProperties;
	readonly className?: string;
	readonly children: React.ReactNode;
}> = ({children, justify, className, align, style = {}}) => {
	const finalStyle: React.CSSProperties = useMemo(() => {
		return {
			...style,
			display: 'flex',
			flexDirection: 'column',
			justifyContent: justify ?? 'flex-start',
			alignItems: align ?? 'flex-start',
		};
	}, [align, justify, style]);
	return (
		<div className={className} style={finalStyle}>
			{children}
		</div>
	);
};
