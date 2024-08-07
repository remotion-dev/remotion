import type {GitSource} from '@remotion/studio-shared';
import {useCallback, useMemo, useState} from 'react';
import {LIGHT_TEXT} from '../helpers/colors';
import {
	getGitSourceBranchUrl,
	getGitSourceName,
} from '../helpers/get-git-menu-item';
import {openInEditor} from '../helpers/open-in-editor';
import {showNotification} from './Notifications/NotificationCenter';

const svgStyle: React.CSSProperties = {
	width: 11,
	height: 11,
};

const buttonStyle: React.CSSProperties = {
	border: 'none',
	height: '20px',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
};

export const OpenEditorButton: React.FC<{
	type: 'git' | 'editor';
}> = ({type}) => {
	const [hovered, setHovered] = useState<boolean>(false);

	const svgFillColor = useMemo(() => {
		return hovered ? 'white' : LIGHT_TEXT;
	}, [hovered]);

	const handleClick = useCallback(async () => {
		if (type === 'editor') {
			await openInEditor({
				originalFileName: `${window.remotion_cwd}`,
				originalLineNumber: 1,
				originalColumnNumber: 1,
				originalFunctionName: null,
				originalScriptCode: null,
			})
				.then((res) => res.json())
				.then(({success}) => {
					if (!success) {
						showNotification(
							`Could not open ${window.remotion_editorName}`,
							2000,
						);
					}
				})
				.catch((err) => {
					// eslint-disable-next-line no-console
					console.error(err);
					showNotification(
						`Could not open ${window.remotion_editorName}`,
						2000,
					);
				});
		}

		if (type === 'git') {
			if (!window.remotion_gitSource) {
				throw new Error('No git source');
			}

			window.open(getGitSourceBranchUrl(window.remotion_gitSource), '_blank');
		}
	}, [type]);

	const buttonTooltip =
		type === 'git'
			? `Open ${getGitSourceName(window.remotion_gitSource as GitSource)} Repo`
			: `Open in ${window.remotion_editorName}`;
	const openInEditorSvg = (
		<svg viewBox="0 0 512 512" style={svgStyle}>
			<path
				fill={svgFillColor}
				d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"
			/>
		</svg>
	);

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	return (
		<button
			title={buttonTooltip}
			type="button"
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			style={buttonStyle}
			onClick={handleClick}
		>
			{openInEditorSvg}
		</button>
	);
};
