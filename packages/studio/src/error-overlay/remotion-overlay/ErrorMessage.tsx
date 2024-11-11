import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
	INPUT_BACKGROUND,
	INPUT_BORDER_COLOR_HOVERED,
	INPUT_BORDER_COLOR_UNHOVERED,
} from '../../helpers/colors';
import {CaretDown} from './carets';

const fontSize = 24;
const lineHeight = 1.5;
const maxLines = 2;

const buttonSize = 32;

const maskImage = 'linear-gradient(to bottom, white 60%, transparent)';

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
	border: `1px solid ${INPUT_BORDER_COLOR_HOVERED}`,
	height: 0,
	marginTop: 4,
};

const moreButton: React.CSSProperties = {
	height: buttonSize,
	width: buttonSize,
	borderRadius: buttonSize / 2,
	backgroundColor: INPUT_BACKGROUND,
	border: `1px solid ${INPUT_BORDER_COLOR_UNHOVERED}`,
	marginTop: -buttonSize / 2,
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	cursor: 'pointer',
	color: 'white',
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
