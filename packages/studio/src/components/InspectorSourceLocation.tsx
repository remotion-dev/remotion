import React, {useCallback, useMemo, useState} from 'react';
import type {OriginalPosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {BACKGROUND, LIGHT_COLOR, LIGHT_TEXT} from '../helpers/colors';
import {formatFileLocation} from '../helpers/format-file-location';
import {getOriginalSourceAttribution} from './Timeline/TimelineStack/source-attribution';

const sourceLocationStyle: React.CSSProperties = {
	alignSelf: 'flex-start',
	appearance: 'none',
	backgroundColor: BACKGROUND,
	border: 'none',
	boxSizing: 'border-box',
	display: 'flex',
	alignItems: 'center',
	gap: 4,
	fontFamily: 'sans-serif',
	fontSize: 12,
	height: 18,
	lineHeight: '18px',
	margin: 0,
	maxWidth: '100%',
	overflow: 'hidden',
	padding: 0,
	textAlign: 'left',
	textDecoration: 'none',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	width: 'fit-content',
};

const sourceLocationLabelStyle: React.CSSProperties = {
	color: 'inherit',
	display: 'block',
	fontFamily: 'sans-serif',
	fontSize: 12,
	lineHeight: '18px',
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

export const InspectorSourceLocation: React.FC<{
	readonly location: OriginalPosition | null;
	readonly canOpen: boolean;
	readonly onOpen: () => void;
	readonly renderIcon?: (color: string) => React.ReactNode;
}> = ({location, canOpen, onOpen, renderIcon}) => {
	const [hovered, setHovered] = useState(false);

	const validLocation = useMemo((): OriginalPosition | null => {
		if (!location?.source || location.line === null) {
			return null;
		}

		return location;
	}, [location]);

	const fileLocation = useMemo(() => {
		if (!validLocation) {
			return null;
		}

		return formatFileLocation({
			location: validLocation,
			root: window.remotion_cwd,
		});
	}, [validLocation]);

	const label = useMemo(() => {
		if (!validLocation) {
			return null;
		}

		return getOriginalSourceAttribution(validLocation);
	}, [validLocation]);

	const style = useMemo((): React.CSSProperties => {
		return {
			...sourceLocationStyle,
			color: hovered ? LIGHT_COLOR : LIGHT_TEXT,
			cursor: canOpen ? 'pointer' : 'default',
		};
	}, [canOpen, hovered]);
	const color = hovered ? LIGHT_COLOR : LIGHT_TEXT;

	const onClick = useCallback(() => {
		if (!canOpen) {
			return;
		}

		onOpen();
	}, [canOpen, onOpen]);

	if (!label) {
		return null;
	}

	return (
		<button
			type="button"
			style={style}
			title={fileLocation ?? undefined}
			onClick={onClick}
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => setHovered(false)}
		>
			{renderIcon ? renderIcon(color) : null}
			<span style={sourceLocationLabelStyle}>{label}</span>
		</button>
	);
};
