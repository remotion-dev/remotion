import {useCallback, useEffect, useMemo, useState} from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';
import {ClipboardIcon} from '../../icons/clipboard';
const svgStyle: React.CSSProperties = {
	width: 16,
	height: 16,
	verticalAlign: 'sub',
};

const copiedStyle: React.CSSProperties = {
	fontSize: '14px',
	minHeight: '30px',
	minWidth: '30px',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
};

const buttonStyle: React.CSSProperties = {
	width: '30px',
	height: '30px',
	border: 'none',
	cursor: 'pointer',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
};

export const CliCopyButton: React.FC<{valueToCopy: string}> = ({
	valueToCopy,
}) => {
	const [copied, setCopied] = useState<boolean>(false);
	const [hovered, setHovered] = useState<boolean>(false);

	const fillColor = useMemo(() => {
		return hovered ? 'white' : LIGHT_TEXT;
	}, [hovered]);

	const clipboardIcon = <ClipboardIcon color={fillColor} style={svgStyle} />;

	const checkSvg = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 448 512"
			style={svgStyle}
		>
			<path
				fill={fillColor}
				d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
			/>
		</svg>
	);

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	useEffect(() => {
		if (!copied) {
			return;
		}

		const handleClear = () => {
			setCopied(false);
			setHovered(false);
		};

		const to = setTimeout(() => handleClear(), 2000);
		return () => clearTimeout(to);
	}, [copied]);

	return copied ? (
		<span style={copiedStyle}>{checkSvg}</span>
	) : (
		<button
			type="button"
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			style={buttonStyle}
			onClick={() => {
				navigator.clipboard.writeText(valueToCopy);
				setCopied(true);
			}}
		>
			{clipboardIcon}
		</button>
	);
};
