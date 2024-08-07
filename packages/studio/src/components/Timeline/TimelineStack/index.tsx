import type {GitSource} from '@remotion/studio-shared';
import {SOURCE_MAP_ENDPOINT} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import type {TSequence} from 'remotion';
import {SourceMapConsumer} from 'source-map';
import type {OriginalPosition} from '../../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../../helpers/client-id';
import {
	LIGHT_COLOR,
	LIGHT_TEXT,
	VERY_LIGHT_TEXT,
} from '../../../helpers/colors';
import {getGitRefUrl} from '../../../helpers/get-git-menu-item';
import {openInEditor} from '../../../helpers/open-in-editor';
import {pushUrl} from '../../../helpers/url-state';
import {useSelectAsset} from '../../InitialCompositionLoader';
import {showNotification} from '../../Notifications/NotificationCenter';
import {Spinner} from '../../Spinner';
import {Spacing} from '../../layout';
import {getOriginalLocationFromStack} from './get-stack';
import {getOriginalSourceAttribution} from './source-attribution';

// @ts-expect-error
SourceMapConsumer.initialize({
	'lib/mappings.wasm':
		(window.remotion_publicPath === '/' ? '' : window.remotion_publicPath) +
		SOURCE_MAP_ENDPOINT,
});

export const TimelineStack: React.FC<{
	readonly isCompact: boolean;
	readonly sequence: TSequence;
}> = ({isCompact, sequence}) => {
	const [originalLocation, setOriginalLocation] =
		useState<OriginalPosition | null>(null);

	const [stackHovered, setStackHovered] = useState(false);
	const [titleHovered, setTitleHovered] = useState(false);
	const [opening, setOpening] = useState(false);
	const selectAsset = useSelectAsset();

	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;

	const assetPath = useMemo(() => {
		if (sequence.type !== 'video' && sequence.type !== 'audio') {
			return null;
		}

		const isStatic = sequence.src.startsWith(window.remotion_staticBase);
		if (!isStatic) {
			return null;
		}

		const relativePath = sequence.src.replace(
			window.remotion_staticBase + '/',
			'',
		);
		return relativePath;
	}, [sequence]);

	const navigateToAsset = useCallback(
		(asset: string) => {
			selectAsset(asset);
			pushUrl(`/assets/${asset}`);
		},
		[selectAsset],
	);

	const openEditor = useCallback(async (location: OriginalPosition) => {
		if (!window.remotion_editorName) {
			return;
		}

		setOpening(true);
		try {
			await openInEditor({
				originalColumnNumber: location.column,
				originalFileName: location.source,
				originalFunctionName: null,
				originalLineNumber: location.line,
				originalScriptCode: null,
			});
		} catch (err) {
			showNotification((err as Error).message, 2000);
		} finally {
			setOpening(false);
		}
	}, []);

	const canOpenInEditor =
		window.remotion_editorName &&
		connectionStatus === 'connected' &&
		originalLocation;

	const canOpenInGitHub = window.remotion_gitSource && originalLocation;

	const titleHoverable =
		(isCompact && (canOpenInEditor || canOpenInGitHub)) || assetPath;
	const stackHoverable = !isCompact && (canOpenInEditor || canOpenInGitHub);

	const onClickTitle = useCallback(() => {
		if (!titleHoverable) {
			return null;
		}

		if (assetPath) {
			navigateToAsset(assetPath);
			return;
		}

		if (!originalLocation) {
			return;
		}

		if (canOpenInEditor) {
			openEditor(originalLocation);
			return;
		}

		if (canOpenInGitHub) {
			window.open(
				getGitRefUrl(window.remotion_gitSource as GitSource, originalLocation),
				'_blank',
			);
		}
	}, [
		assetPath,
		canOpenInEditor,
		canOpenInGitHub,
		navigateToAsset,
		openEditor,
		originalLocation,
		titleHoverable,
	]);

	const onClickStack = useCallback(() => {
		if (!originalLocation) {
			return;
		}

		if (canOpenInEditor) {
			openEditor(originalLocation);
			return;
		}

		if (canOpenInGitHub) {
			window.open(
				getGitRefUrl(window.remotion_gitSource as GitSource, originalLocation),
				'_blank',
			);
		}
	}, [canOpenInEditor, canOpenInGitHub, openEditor, originalLocation]);

	useEffect(() => {
		if (!sequence.stack) {
			return;
		}

		getOriginalLocationFromStack(sequence.stack)
			.then((frame) => {
				setOriginalLocation(frame);
			})
			.catch((err) => {
				// eslint-disable-next-line no-console
				console.error('Could not get original location of Sequence', err);
			});
	}, [sequence.stack]);

	const onStackPointerEnter = useCallback(() => {
		setStackHovered(true);
	}, []);

	const onStackPointerLeave = useCallback(() => {
		setStackHovered(false);
	}, []);

	const onTitlePointerEnter = useCallback(() => {
		setTitleHovered(true);
	}, []);

	const onTitlePointerLeave = useCallback(() => {
		setTitleHovered(false);
	}, []);

	const style = useMemo((): React.CSSProperties => {
		return {
			fontSize: 12,
			color: opening
				? VERY_LIGHT_TEXT
				: stackHovered && stackHoverable
					? LIGHT_TEXT
					: VERY_LIGHT_TEXT,
			marginLeft: 10,
			cursor: stackHoverable ? 'pointer' : undefined,
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
			overflow: 'hidden',
			flexShrink: 100000,
		};
	}, [opening, stackHovered, stackHoverable]);

	const titleStyle: React.CSSProperties = useMemo(() => {
		const hoverEffect = titleHovered && titleHoverable;
		return {
			fontSize: 12,
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
			overflow: 'hidden',
			lineHeight: 1,
			color: opening && isCompact ? VERY_LIGHT_TEXT : LIGHT_COLOR,
			userSelect: 'none',
			WebkitUserSelect: 'none',
			borderBottom: hoverEffect ? '1px solid #fff' : 'none',
			cursor: hoverEffect ? 'pointer' : undefined,
		};
	}, [titleHoverable, isCompact, opening, titleHovered]);

	const text =
		sequence.displayName.length > 1000
			? sequence.displayName.slice(0, 1000) + '...'
			: sequence.displayName;

	return (
		<>
			<div
				onPointerEnter={onTitlePointerEnter}
				onPointerLeave={onTitlePointerLeave}
				title={
					originalLocation
						? getOriginalSourceAttribution(originalLocation)
						: text || '<Sequence>'
				}
				style={titleStyle}
				onClick={onClickTitle}
			>
				{text || '<Sequence>'}
			</div>
			{isCompact || !originalLocation ? null : (
				<div
					onPointerEnter={onStackPointerEnter}
					onPointerLeave={onStackPointerLeave}
					onClick={onClickStack}
					style={style}
				>
					{getOriginalSourceAttribution(originalLocation)}
				</div>
			)}
			{opening ? (
				<>
					<Spacing x={0.5} />
					<Spinner duration={0.5} size={12} />
				</>
			) : null}
		</>
	);
};
