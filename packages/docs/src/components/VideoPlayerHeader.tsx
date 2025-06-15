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
	return (
		<div 
			ref={ref} 
			style={container}
			className="video-player-header"
		>
			<button onClick={onDismiss} type="button" style={button}>
				<CancelIcon style={iconStyle} className="video-player-icon" />
			</button>
			<div style={flex} />
			<button onClick={onPrevious} type="button" style={button}>
				<IconLeft
					style={{
						...iconStyle,
						opacity: hasPrevious ? 1 : 0.6,
						cursor: hasPrevious ? 'pointer' : 'default',
					}}
					className="video-player-icon"
				/>
			</button>
			<div style={space} />
			<button onClick={onNext} type="button" style={button}>
				<IconRight
					style={{
						...iconStyle,
						opacity: hasNext ? 1 : 0.6,
						cursor: hasNext ? 'pointer' : 'default',
					}}
					className="video-player-icon"
				/>
			</button>
		</div>
	);
};

export const VidPlayerHeader = forwardRef(VideoPlayerHeader);
