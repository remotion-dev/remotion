import {SOURCE_MAP_ENDPOINT} from '@remotion/studio-shared';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {TSequence} from 'remotion';
import {SourceMapConsumer} from 'source-map';
import type {OriginalPosition} from '../../../error-overlay/react-overlay/utils/get-source-map';
import {
	LIGHT_COLOR,
	LIGHT_TEXT,
	VERY_LIGHT_TEXT,
} from '../../../helpers/colors';
import {openInEditor} from '../../../helpers/open-in-editor';
import {useSelectAsset} from '../../InitialCompositionLoader';
import {Spacing} from '../../layout';
import {sendErrorNotification} from '../../Notifications/NotificationCenter';
import {Spinner} from '../../Spinner';
import {getOriginalLocationFromStack} from './get-stack';
import {getOriginalSourceAttribution} from './source-attribution';

// @ts-expect-error
SourceMapConsumer.initialize({
	'lib/mappings.wasm': SOURCE_MAP_ENDPOINT,
});

export const TimelineStack: React.FC<{
	isCompact: boolean;
	sequence: TSequence;
}> = ({isCompact, sequence}) => {
	const [originalLocation, setOriginalLocation] =
		useState<OriginalPosition | null>(null);

	const [stackHovered, setStackHovered] = useState(false);
	const [titleHovered, setTitleHovered] = useState(false);
	const [opening, setOpening] = useState(false);
	const selectAsset = useSelectAsset();

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
			window.history.pushState({}, 'Studio', `/assets/${asset}`);
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
			sendErrorNotification((err as Error).message);
		} finally {
			setOpening(false);
		}
	}, []);

	const onClickTitle = useCallback(() => {
		if (assetPath) {
			navigateToAsset(assetPath);
			return;
		}

		if (!originalLocation) {
			return;
		}

		openEditor(originalLocation);
	}, [assetPath, navigateToAsset, openEditor, originalLocation]);

	const onClickStack = useCallback(() => {
		if (!originalLocation) {
			return;
		}

		openEditor(originalLocation);
	}, [openEditor, originalLocation]);

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
				: stackHovered
					? LIGHT_TEXT
					: VERY_LIGHT_TEXT,
			marginLeft: 10,
			cursor: 'pointer',
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
			overflow: 'hidden',
			flexShrink: 100000,
		};
	}, [stackHovered, opening]);

	const hoverable =
		(originalLocation && isCompact) ||
		(assetPath && window.remotion_editorName);

	const textStyle: React.CSSProperties = useMemo(() => {
		const hoverEffect = titleHovered && hoverable;
		return {
			fontSize: 12,
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
			overflow: 'hidden',
			lineHeight: 1,
			color: opening && isCompact ? VERY_LIGHT_TEXT : LIGHT_COLOR,
			userSelect: 'none',
			borderBottom: hoverEffect ? '1px solid #fff' : 'none',
			cursor: hoverEffect ? 'pointer' : undefined,
		};
	}, [hoverable, isCompact, opening, titleHovered]);

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
				style={textStyle}
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
