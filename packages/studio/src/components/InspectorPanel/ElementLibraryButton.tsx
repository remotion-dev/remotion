import React, {useCallback, useContext, useMemo} from 'react';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {CURRENT_COLOR, LIGHT_TEXT} from '../../helpers/colors';
import {BrowseElementsIcon} from '../../icons/browse-elements';
import {CaretDown} from '../../icons/caret';
import {SetSelectedModalContext} from '../../state/modals';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from '../InspectorPanelLayout';
import type {SegmentedButtonSegment} from '../SegmentedButton';
import {SegmentedButton} from '../SegmentedButton';
import {useSettings} from '../SettingsContext';
import {InspectorQuickAction} from './common';

const noElementLibraries = [] as const;

const browseElementsIconStyle: React.CSSProperties = {
	height: 22,
	width: 22,
};

const browseElementsIconContainerStyle: React.CSSProperties = {
	height: 22,
	marginLeft: -2,
	marginRight: -2,
	width: 22,
};

const browseElementsArrowStyle: React.CSSProperties = {
	display: 'inline-block',
	height: 12,
	marginLeft: 4,
	verticalAlign: -2,
	width: 12,
};

const elementLibraryDropdownStyle: React.CSSProperties = {
	borderRadius: 4,
	height: 28,
	margin: '0 4px',
	width: 'calc(100% - 8px)',
};

const elementLibraryDropdownSegmentStyle: React.CSSProperties = {
	fontSize: 13,
	gap: 8,
	justifyContent: 'flex-start',
	padding: `0 ${INSPECTOR_PANEL_HORIZONTAL_PADDING - 4}px`,
	width: '100%',
};

const elementLibraryDropdownLabelStyle: React.CSSProperties = {
	flex: 1,
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '18px',
	minWidth: 0,
	overflow: 'hidden',
	textAlign: 'left',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const elementLibraryDropdownCaretStyle: React.CSSProperties = {
	display: 'flex',
	height: 12,
	width: 12,
};

export const ElementLibraryButton: React.FC = () => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {studioRuntimeConfig} = useSettings();
	const isBrowserStudio = getBrowserStudioOperations() !== null;
	const elementLibraries =
		studioRuntimeConfig?.elementLibraries ?? noElementLibraries;

	const openElementLibrary = useCallback(
		(name: string, url: string) => {
			if (isBrowserStudio) {
				window.open(url, '_blank', 'noopener,noreferrer');
				return;
			}

			setSelectedModal({
				type: 'element-library',
				name,
				url,
			});
		},
		[isBrowserStudio, setSelectedModal],
	);

	const openElementsLibrary = useCallback(() => {
		openElementLibrary(
			'Remotion Elements',
			'https://www.remotion.dev/elements',
		);
	}, [openElementLibrary]);

	const elementLibraryDropdownSegments = useMemo<SegmentedButtonSegment[]>(
		() => [
			{
				ariaLabel: 'Browse Elements',
				buttonId: null,
				disabled: false,
				idleColor: LIGHT_TEXT,
				leaveLeftSpace: false,
				onOpenChange: null,
				renderContent: (color) => (
					<>
						<span style={browseElementsIconContainerStyle}>
							<BrowseElementsIcon
								color={color}
								style={browseElementsIconStyle}
							/>
						</span>
						<span style={elementLibraryDropdownLabelStyle}>
							Browse Elements
						</span>
						<span style={elementLibraryDropdownCaretStyle}>
							<CaretDown color={color} />
						</span>
					</>
				),
				segmentId: 'element-library',
				selectedId: null,
				style: elementLibraryDropdownSegmentStyle,
				title: 'Choose an Element library to browse inside Studio.',
				type: 'menu',
				values: [
					{
						disabled: false,
						id: 'remotion-elements',
						keyHint: null,
						label: 'Remotion Elements',
						leftItem: null,
						onClick: openElementsLibrary,
						quickSwitcherLabel: null,
						subMenu: null,
						type: 'item',
						value: 'https://www.remotion.dev/elements',
					},
					...elementLibraries.map((library, index) => {
						const parsedUrl = new URL(library.url);
						const pathname = parsedUrl.pathname.replace(/\/$/, '');
						const label = library.displayName ?? `${parsedUrl.host}${pathname}`;

						return {
							disabled: false,
							id: `external-element-library-${index}`,
							keyHint: null,
							label,
							leftItem: null,
							onClick: () => openElementLibrary(label, library.url),
							quickSwitcherLabel: null,
							subMenu: null,
							type: 'item' as const,
							value: library.url,
						};
					}),
				],
			},
		],
		[elementLibraries, openElementLibrary, openElementsLibrary],
	);

	if (elementLibraries.length > 0 && !isBrowserStudio) {
		return (
			<SegmentedButton
				segments={elementLibraryDropdownSegments}
				style={elementLibraryDropdownStyle}
				title={null}
			/>
		);
	}

	return (
		<InspectorQuickAction
			disabled={false}
			iconContainerStyle={browseElementsIconContainerStyle}
			onClick={openElementsLibrary}
			renderIcon={(color) => (
				<BrowseElementsIcon color={color} style={browseElementsIconStyle} />
			)}
			title={
				isBrowserStudio
					? 'Open the Remotion Elements library in a new tab. Install an Element there to send it to this composition.'
					: 'Browse the Remotion Elements library inside Studio.'
			}
		>
			Browse Elements
			{isBrowserStudio ? (
				<svg
					aria-hidden="true"
					viewBox="0 0 16 16"
					style={browseElementsArrowStyle}
				>
					<path
						d="M4 12 12 4M6 4h6v6"
						fill="none"
						stroke={CURRENT_COLOR}
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="1.5"
					/>
				</svg>
			) : null}
		</InspectorQuickAction>
	);
};
