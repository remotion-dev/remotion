import React, {useCallback, useContext, useMemo, useState} from 'react';
import {FONT_FAMILY} from '../helpers/font';
import {Checkmark} from '../icons/Checkmark';
import {CheckerboardContext} from '../state/checkerboard';
import {ModalsContext} from '../state/modals';
import {PreviewSizeContext} from '../state/preview-size';
import {RichTimelineContext} from '../state/rich-timeline';
import {timelineRef} from '../state/timeline-ref';
import {Row} from './layout';
import {Menu, MenuId, MenuItem} from './Menu/MenuItem';
import {commonPreviewSizes, getPreviewSizeLabel} from './SizeSelector';
import {UpdateCheck} from './UpdateCheck';

const row: React.CSSProperties = {
	alignItems: 'center',
	flexDirection: 'row',
	display: 'flex',
	color: 'white',
	borderBottom: '1px solid black',

	fontFamily: FONT_FAMILY,
	fontSize: 13,
	paddingLeft: 6,
};

type Structure = Menu[];

const openExternal = (link: string) => {
	window.open(link, '_blank');
};

const rotate: React.CSSProperties = {
	transform: `rotate(90deg)`,
};
const ICON_SIZE = 16;

export const MenuToolbar: React.FC = () => {
	const [selected, setSelected] = useState<MenuId | null>(null);
	const {setSelectedModal} = useContext(ModalsContext);
	const {checkerboard, setCheckerboard} = useContext(CheckerboardContext);
	const {richTimeline, setRichTimeline} = useContext(RichTimelineContext);
	const {size, setSize} = useContext(PreviewSizeContext);

	const itemClicked = useCallback(
		(itemId: MenuId) => {
			setSelected(itemId);
		},
		[setSelected]
	);

	const itemHovered = useCallback(
		(itemId: MenuId) => {
			if (selected) {
				setSelected(itemId);
			}
		},
		[selected, setSelected]
	);

	const close = useCallback(() => {
		setSelected(null);
	}, []);

	const structure = useMemo((): Structure => {
		return [
			{
				id: 'remotion',
				label: (
					<Row align="center" justify="center">
						<svg
							width={ICON_SIZE}
							height={ICON_SIZE}
							viewBox="-100 -100 400 400"
							style={rotate}
						>
							<path
								fill="#fff"
								stroke="#fff"
								strokeWidth="100"
								strokeLinejoin="round"
								d="M 2 172 a 196 100 0 0 0 195 5 A 196 240 0 0 0 100 2.259 A 196 240 0 0 0 2 172 z"
							/>
						</svg>
					</Row>
				),
				leaveLeftPadding: false,
				items: [
					{
						id: 'about',
						value: 'about',
						label: 'About Remotion',
						onClick: () => {
							close();
							openExternal('https://remotion.dev');
						},
						type: 'item',
						keyHint: null,
						leftItem: null,
						subMenu: null,
					},
					{
						id: 'changelog',
						value: 'changelog',
						label: 'Changelog',
						onClick: () => {
							close();
							openExternal('https://github.com/remotion-dev/remotion/releases');
						},
						type: 'item',
						keyHint: null,
						leftItem: null,
						subMenu: null,
					},
					{
						id: 'license',
						value: 'license',
						label: 'License',
						onClick: () => {
							close();
							openExternal(
								'https://github.com/remotion-dev/remotion/blob/main/LICENSE.md'
							);
						},
						type: 'item',
						keyHint: null,
						leftItem: null,
						subMenu: null,
					},
				],
			},
			{
				id: 'file',
				label: 'File',
				leaveLeftPadding: false,

				items: [
					{
						id: 'new-sequence',
						value: 'new-sequence',
						label: 'New composition...',
						onClick: () => {
							close();
							setSelectedModal({
								compType: 'composition',
								type: 'new-comp',
							});
						},
						type: 'item',
						keyHint: 'N',
						leftItem: null,
						subMenu: null,
					},
					{
						id: 'new-still',
						value: 'new-still',
						label: 'New still...',
						onClick: () => {
							close();
							setSelectedModal({
								compType: 'still',
								type: 'new-comp',
							});
						},
						type: 'item',
						keyHint: null,
						leftItem: null,
						subMenu: null,
					},
				],
			},
			{
				id: 'view',
				label: 'View',
				leaveLeftPadding: true,
				items: [
					{
						id: 'preview-size',
						keyHint: null,
						label: 'Preview size',
						onClick: () => undefined,
						type: 'item',
						value: 'preview-size',
						leftItem: null,
						subMenu: {
							leaveLeftSpace: true,
							preselectIndex: commonPreviewSizes.findIndex(
								(s) => String(size) === String(s)
							),
							items: commonPreviewSizes.map((newSize) => ({
								id: String(newSize),
								keyHint: null,
								label: getPreviewSizeLabel(newSize),
								leftItem:
									String(newSize) === String(size) ? <Checkmark /> : null,
								onClick: () => {
									close();
									setSize(() => newSize);
								},
								subMenu: null,
								type: 'item',
								value: newSize,
							})),
						},
					},
					{
						id: 'checkerboard',
						keyHint: 'T',
						label: 'Transparency as checkerboard',
						onClick: () => {
							close();
							setCheckerboard((c) => !c);
						},
						type: 'item',
						value: 'checkerboard',
						leftItem: checkerboard ? <Checkmark /> : null,
						subMenu: null,
					},
					{
						id: 'timeline-divider',
						type: 'divider',
					},
					{
						id: 'rich-timeline',
						keyHint: null,
						label: 'Rich timeline',
						onClick: () => {
							close();
							setRichTimeline((r) => !r);
						},
						type: 'item',
						value: 'rich-timeline',
						leftItem: richTimeline ? <Checkmark /> : null,
						subMenu: null,
					},
					{
						id: 'expand-all',
						keyHint: null,
						label: 'Expand all',
						onClick: () => {
							close();
							timelineRef.current?.expandAll();
						},
						type: 'item',
						value: 'expand-all',
						leftItem: null,
						subMenu: null,
					},
					{
						id: 'collapse-all',
						keyHint: null,
						label: 'Collapse all',
						onClick: () => {
							close();
							timelineRef.current?.collapseAll();
						},
						type: 'item',
						value: 'collapse-all',
						leftItem: null,
						subMenu: null,
					},
				],
			},
			{
				id: 'help',
				label: 'Help',
				leaveLeftPadding: false,
				items: [
					{
						id: 'shortcuts',
						value: 'shortcuts',
						label: 'Shortcuts',
						onClick: () => {
							close();

							setSelectedModal({
								type: 'shortcuts',
							});
						},
						keyHint: '?',
						leftItem: null,
						subMenu: null,
						type: 'item',
					},
					{
						id: 'docs',
						value: 'docs',
						label: 'Docs',
						onClick: () => {
							close();
							openExternal('https://remotion.dev/docs');
						},
						type: 'item',
						keyHint: null,
						leftItem: null,
						subMenu: null,
					},
					{
						id: 'file-issue',
						value: 'file-issue',
						label: 'File an issue',
						onClick: () => {
							close();
							openExternal(
								'https://github.com/remotion-dev/remotion/issues/new/choose'
							);
						},
						type: 'item',
						keyHint: null,
						leftItem: null,
						subMenu: null,
					},
					{
						id: 'discord',
						value: 'discord',
						label: 'Join Discord community',
						onClick: () => {
							close();
							openExternal('https://discord.com/invite/6VzzNDwUwV');
						},
						type: 'item',
						keyHint: null,
						leftItem: null,
						subMenu: null,
					},
					{
						id: 'help-divider',
						type: 'divider',
					},
					{
						id: 'insta',
						value: 'insta',
						label: 'Instagram',
						onClick: () => {
							close();
							openExternal('https://instagram.com/remotion.dev');
						},
						type: 'item',
						keyHint: null,
						leftItem: null,
						subMenu: null,
					},
					{
						id: 'twitter',
						value: 'twitter',
						label: 'Twitter',
						onClick: () => {
							close();
							openExternal('https://twitter.com/JNYBGR');
						},
						type: 'item',
						keyHint: null,
						leftItem: null,
						subMenu: null,
					},
					{
						id: 'tiktok',
						value: 'tiktok',
						label: 'TikTok',
						onClick: () => {
							close();
							openExternal('https://www.tiktok.com/@remotion.dev');
						},
						type: 'item',
						keyHint: null,
						leftItem: null,
						subMenu: null,
					},
				],
			},
		];
	}, [
		checkerboard,
		close,
		richTimeline,
		setCheckerboard,
		setRichTimeline,
		setSelectedModal,
		setSize,
		size,
	]);

	const menus = useMemo(() => {
		return structure.map((s) => s.id);
	}, [structure]);

	const onPreviousMenu = useCallback(() => {
		setSelected((s) => {
			if (s === null) {
				return null;
			}

			return menus[(menus.indexOf(s) + 1) % menus.length];
		});
	}, [menus]);

	const onNextMenu = useCallback(() => {
		setSelected((s) => {
			if (s === null) {
				return null;
			}

			if (menus.indexOf(s) === 0) {
				return menus[menus.length - 1];
			}

			return menus[(menus.indexOf(s) - 1) % menus.length];
		});
	}, [menus]);

	const onItemQuit = useCallback(() => {
		setSelected(null);
	}, [setSelected]);

	return (
		<Row align="center" style={row}>
			{structure.map((s) => {
				return (
					<MenuItem
						key={s.id}
						selected={selected === s.id}
						onItemSelected={itemClicked}
						onItemHovered={itemHovered}
						id={s.id}
						label={s.label}
						onItemQuit={onItemQuit}
						menu={s}
						onPreviousMenu={onPreviousMenu}
						onNextMenu={onNextMenu}
						leaveLeftPadding={s.leaveLeftPadding}
					/>
				);
			})}
			<UpdateCheck />
		</Row>
	);
};
