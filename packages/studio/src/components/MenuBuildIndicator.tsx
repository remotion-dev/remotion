import type {GitSource} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	getGitSourceBranchUrl,
	getGitSourceName,
} from '../helpers/get-git-menu-item';
import {openInEditor} from '../helpers/open-in-editor';
import {Spacing} from './layout';
import {MenuCompositionName} from './MenuCompositionName';
import {showNotification} from './Notifications/NotificationCenter';
import {Spinner} from './Spinner';

const cwd: React.CSSProperties = {
	fontSize: 13,
	opacity: 0.8,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	userSelect: 'none',
};

const spinnerSize = 14;

const spinner: React.CSSProperties = {
	position: 'relative',
	width: spinnerSize,
};

const noSpinner: React.CSSProperties = {
	position: 'relative',
	width: spinnerSize,
};

const projectNameLinkBase: React.CSSProperties = {
	color: 'inherit',
	textDecoration: 'none',
	cursor: 'pointer',
	fontSize: 'inherit',
	textUnderlineOffset: 2,
};

const projectNameLink: React.CSSProperties = {
	...projectNameLinkBase,
};

const projectNameLinkHovered: React.CSSProperties = {
	...projectNameLinkBase,
	textDecoration: 'underline',
};

export const MenuBuildIndicator: React.FC = () => {
	const [isBuilding, setIsBuilding] = useState(false);
	const [projectNameHovered, setProjectNameHovered] = useState(false);
	const ctx = useContext(StudioServerConnectionCtx).previewServerState;

	const showEditorLink = window.remotion_editorName && ctx.type === 'connected';
	const showGitLink = !showEditorLink && Boolean(window.remotion_gitSource);

	const handleProjectNameClick = useCallback(async () => {
		if (showEditorLink) {
			await openInEditor({
				originalFileName: `${window.remotion_cwd}`,
				originalLineNumber: 1,
				originalColumnNumber: 1,
				originalFunctionName: null,
				originalScriptCode: null,
			})
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
		} else if (showGitLink) {
			window.open(
				getGitSourceBranchUrl(window.remotion_gitSource as GitSource),
				'_blank',
			);
		}
	}, [showEditorLink, showGitLink]);

	const projectNameTitle = useMemo(() => {
		if (showEditorLink) {
			return `Open in ${window.remotion_editorName}`;
		}

		if (showGitLink) {
			return `Open ${getGitSourceName(window.remotion_gitSource as GitSource)} Repo`;
		}

		return undefined;
	}, [showEditorLink, showGitLink]);

	const isClickable = showEditorLink || showGitLink;

	useEffect(() => {
		window.remotion_isBuilding = () => {
			setIsBuilding(true);
		};

		window.remotion_finishedBuilding = () => {
			setIsBuilding(false);
		};

		return () => {
			window.remotion_isBuilding = undefined;
			window.remotion_finishedBuilding = undefined;
		};
	}, []);

	return (
		<div style={cwd} title={window.remotion_cwd}>
			{isClickable ? <Spacing x={2} /> : null}
			{isBuilding ? (
				<div style={spinner}>
					<Spinner duration={0.5} size={spinnerSize} />
				</div>
			) : (
				<div style={noSpinner} />
			)}
			<Spacing x={0.5} />
			{isClickable ? (
				<a
					style={projectNameHovered ? projectNameLinkHovered : projectNameLink}
					title={projectNameTitle}
					onClick={handleProjectNameClick}
					onPointerEnter={() => setProjectNameHovered(true)}
					onPointerLeave={() => setProjectNameHovered(false)}
				>
					{window.remotion_projectName}
				</a>
			) : (
				window.remotion_projectName
			)}
			<MenuCompositionName />
		</div>
	);
};
