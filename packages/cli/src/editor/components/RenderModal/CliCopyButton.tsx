import {useCallback, useEffect, useMemo, useState} from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';
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

	const clipboardIcon = (
		<svg
			aria-hidden="true"
			focusable="false"
			data-prefix="far"
			data-icon="clipboard"
			className="svg-inline--fa fa-clipboard fa-w-12"
			role="img"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 384 512"
			style={svgStyle}
		>
			<path
				fill={fillColor}
				d="M336 64h-80c0-35.3-28.7-64-64-64s-64 28.7-64 64H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM192 40c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24zm144 418c0 3.3-2.7 6-6 6H54c-3.3 0-6-2.7-6-6V118c0-3.3 2.7-6 6-6h42v36c0 6.6 5.4 12 12 12h168c6.6 0 12-5.4 12-12v-36h42c3.3 0 6 2.7 6 6z"
			/>
		</svg>
	);

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
