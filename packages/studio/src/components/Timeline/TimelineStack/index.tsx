import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {SourceMapConsumer} from 'source-map';
import type {OriginalPosition} from '../../../error-overlay/react-overlay/utils/get-source-map';
import {SOURCE_MAP_ENDPOINT} from '../../../error-overlay/react-overlay/utils/source-map-endpoint';
import {
	LIGHT_COLOR,
	LIGHT_TEXT,
	VERY_LIGHT_TEXT,
} from '../../../helpers/colors';
import {openInEditor} from '../../../helpers/open-in-editor';
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
	stack: string | null;
	isCompact: boolean;
	displayName: string;
}> = ({stack, isCompact, displayName}) => {
	const [originalLocation, setOriginalLocation] =
		useState<OriginalPosition | null>(null);

	const [stackHovered, setStackHovered] = useState(false);
	const [titleHovered, setTitleHovered] = useState(false);
	const [opening, setOpening] = useState(false);

	const onClick = useCallback(async () => {
		if (!originalLocation) {
			return;
		}

		setOpening(true);
		try {
			await openInEditor({
				originalColumnNumber: originalLocation.column,
				originalFileName: originalLocation.source,
				originalFunctionName: null,
				originalLineNumber: originalLocation.line,
				originalScriptCode: null,
			});
		} catch (err) {
			sendErrorNotification((err as Error).message);
		} finally {
			setOpening(false);
		}
	}, [originalLocation]);

	useEffect(() => {
		if (!stack) {
			return;
		}

		getOriginalLocationFromStack(stack)
			.then((frame) => {
				setOriginalLocation(frame);
			})
			.catch((err) => {
				// eslint-disable-next-line no-console
				console.error('Could not get original location of Sequence', err);
			});
	}, [stack]);

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

	const textStyle: React.CSSProperties = useMemo(() => {
		return {
			fontSize: 12,
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
			overflow: 'hidden',
			lineHeight: 1,
			color: opening && isCompact ? VERY_LIGHT_TEXT : LIGHT_COLOR,
			userSelect: 'none',
			borderBottom:
				originalLocation && titleHovered && isCompact
					? '1px solid #fff'
					: 'none',
			cursor: originalLocation && isCompact ? 'pointer' : undefined,
		};
	}, [isCompact, opening, originalLocation, titleHovered]);

	const text =
		displayName.length > 1000
			? displayName.slice(0, 1000) + '...'
			: displayName;

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
				onClick={onClick}
			>
				{text || '<Sequence>'}
			</div>
			{isCompact || !originalLocation ? null : (
				<div
					onPointerEnter={onStackPointerEnter}
					onPointerLeave={onStackPointerLeave}
					onClick={onClick}
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
