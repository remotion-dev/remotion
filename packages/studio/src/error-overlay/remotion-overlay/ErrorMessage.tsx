import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
	ERROR_MESSAGE_MASK_IMAGE,
	INPUT_BACKGROUND,
	WHITE_ALPHA_05,
	BLACK_ALPHA_60,
	WHITE,
} from '../../helpers/colors';
import {CaretDown} from './carets';

const fontSize = 24;
const lineHeight = 1.5;
const maxLines = 2;

const buttonSize = 32;

const maskImage = ERROR_MESSAGE_MASK_IMAGE;

const container: React.CSSProperties = {
	position: 'relative',
	marginBottom: 15,
};

const messageContainer: React.CSSProperties = {
	overflow: 'hidden',
};

const textContainer: React.CSSProperties = {
	fontSize,
	lineHeight,
};

const moreLine: React.CSSProperties = {
	width: '100%',
	display: 'flex',
	justifyContent: 'center',
	position: 'absolute',
	border: `1px solid ${WHITE_ALPHA_05}`,
	height: 0,
	marginTop: 4,
};

const moreButton: React.CSSProperties = {
	height: buttonSize,
	width: buttonSize,
	borderRadius: buttonSize / 2,
	backgroundColor: INPUT_BACKGROUND,
	border: `1px solid ${BLACK_ALPHA_60}`,
	marginTop: -buttonSize / 2,
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	cursor: 'pointer',
	color: WHITE,
};

export const ErrorMessage: React.FC<{
	readonly message: string;
}> = ({message}) => {
	const [expanded, setExpanded] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const size = PlayerInternals.useElementSize(ref, {
		shouldApplyCssTransforms: false,
		triggerOnWindowResize: true,
	});

	const errorLines = size ? size.height / (lineHeight * fontSize) : null;

	const style = useMemo((): React.CSSProperties => {
		const isExpanded =
			expanded || (errorLines !== null && errorLines <= maxLines);
		return {
			...messageContainer,
			maxHeight: isExpanded ? undefined : fontSize * lineHeight * maxLines,
			maskImage: isExpanded ? undefined : maskImage,
			WebkitMaskImage: isExpanded ? undefined : maskImage,
		};
	}, [errorLines, expanded]);

	const toggle = useCallback(() => {
		setExpanded((e) => !e);
	}, []);

	return (
		<div style={container}>
			<div style={style}>
				<div ref={ref} style={textContainer}>
					{message}
				</div>
			</div>
			{errorLines !== null && errorLines > maxLines ? (
				<div style={moreLine}>
					<button type="button" onClick={toggle} style={moreButton}>
						<CaretDown invert={expanded} />
					</button>
				</div>
			) : null}
		</div>
	);
};
