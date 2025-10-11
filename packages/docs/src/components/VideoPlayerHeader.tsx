import {useColorMode} from '@docusaurus/theme-common';
import React, {forwardRef} from 'react';
import {CancelIcon, IconLeft, IconRight} from '../icons/arrows';

export const SHOWCASE_MOBILE_HEADER_HEIGHT = 48;

const container: React.CSSProperties = {
	height: 48,
	paddingLeft: 14,
	paddingRight: 14,
	display: 'flex',
	alignItems: 'center',
	flexDirection: 'row',
	position: 'fixed',
	width: '100%',
	backgroundColor: 'var(--ifm-hero-background-color)',
	top: 0,
};

const button: React.CSSProperties = {
	padding: 10,
	cursor: 'pointer',
	display: 'inline-flex',
	justifyContent: 'center',
	alignItems: 'center',
	appearance: 'none',
	border: 'none',
	backgroundColor: 'transparent',
};

const iconStyle: React.CSSProperties = {
	height: 24,
};

const flex: React.CSSProperties = {
	flex: 1,
};

const space: React.CSSProperties = {
	width: 20,
};

const VideoPlayerHeader: React.ForwardRefRenderFunction<
	HTMLDivElement,
	{
		readonly onDismiss: () => void;
		readonly onNext: () => void;
		readonly onPrevious: () => void;
		readonly hasNext: boolean;
		readonly hasPrevious: boolean;
	}
> = ({onDismiss, onNext, onPrevious, hasNext, hasPrevious}, ref) => {
	const {colorMode} = useColorMode();

	const iconColor = colorMode === 'dark' ? '#ddd' : '#222';
	const borderBottom =
		colorMode === 'dark'
			? '1px solid rgba(255, 255, 255, 0.1)'
			: '1px solid rgba(0, 0, 0, 0.1)';
	return (
		<div ref={ref} style={{...container, borderBottom}}>
			<button onClick={onDismiss} type="button" style={button}>
				<CancelIcon color={iconColor} style={iconStyle} />
			</button>
			<div style={flex} />
			<button onClick={onPrevious} type="button" style={button}>
				<IconLeft
					style={{
						...iconStyle,
						opacity: hasPrevious ? 1 : 0.6,
						color: iconColor,
						cursor: hasPrevious ? 'pointer' : 'default',
					}}
				/>
			</button>
			<div style={space} />
			<button onClick={onNext} type="button" style={button}>
				<IconRight
					color={iconColor}
					style={{
						...iconStyle,
						opacity: hasNext ? 1 : 0.6,
						color: iconColor,
						cursor: hasNext ? 'pointer' : 'default',
					}}
				/>
			</button>
		</div>
	);
};

export const VidPlayerHeader = forwardRef(VideoPlayerHeader);
