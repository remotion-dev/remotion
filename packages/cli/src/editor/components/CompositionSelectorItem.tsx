import React, {
	FC,
	LazyExoticComponent,
	MouseEventHandler,
	useCallback,
	useMemo,
	useState,
} from 'react';
import {LooseAnyComponent, TComposition} from 'remotion';
import {CLEAR_HOVER, LIGHT_TEXT, SELECTED_BACKGROUND} from '../helpers/colors';
import {isCompositionStill} from '../helpers/is-composition-still';
import {FilmIcon} from '../icons/film';
import {CollapsedFolderIcon, ExpandedFolderIcon} from '../icons/folder';
import {StillIcon} from '../icons/still';
import {Spacing} from './layout';

const item: React.CSSProperties = {
	paddingLeft: 8,
	paddingRight: 8,
	paddingTop: 6,
	paddingBottom: 6,
	fontSize: 13,
	display: 'flex',
	textDecoration: 'none',
	cursor: 'default',
	alignItems: 'center',
	marginBottom: 1,
};

const iconStyle: React.CSSProperties = {
	width: 18,
	height: 18,
};

export const CompositionSelectorItem: React.FC<{
	composition: TComposition<unknown>;
	currentComposition: string | null;
	tabIndex: number;
	selectComposition: (c: TComposition) => void;
}> = ({composition, currentComposition, tabIndex, selectComposition}) => {
	const selected = currentComposition === composition.id;
	const [hovered, setHovered] = useState(false);
	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const style: React.CSSProperties = useMemo(() => {
		return {
			...item,
			backgroundColor: hovered
				? selected
					? SELECTED_BACKGROUND
					: CLEAR_HOVER
				: selected
				? SELECTED_BACKGROUND
				: 'transparent',
			color: selected || hovered ? 'white' : LIGHT_TEXT,
		};
	}, [hovered, selected]);

	const onClick: MouseEventHandler = useCallback(
		(evt) => {
			evt.preventDefault();
			selectComposition(composition);
		},
		[composition, selectComposition]
	);

	const isInFolder = (comp: TComposition) => {
		return comp.folderName !== null;
	};

	if (isInFolder(composition)) {
		/*	TODO
     if folder does not exist
     if (!folders.find((f) => f.id === composition.folderName) {
     createNewFolder(composition.folderName ?? 'Unnamed Folder');
     }
     add composition to folder
     addToFolder(composition, composition.folderName);
     OR
     addToFolder(composition);
     */
	}

	const CompositionRow = () => (
		<a
			style={style}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			href={composition.id}
			tabIndex={tabIndex}
			onClick={onClick}
		>
			<FilmIcon style={iconStyle} />
			<Spacing x={1} />
			{composition.id}
		</a>
	);

	const StillRow = () => (
		<a
			style={style}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			href={composition.id}
			tabIndex={tabIndex}
			onClick={onClick}
		>
			<StillIcon style={iconStyle} />
			<Spacing x={1} />
			{composition.id}
		</a>
	);

	const FolderRow = () => {
		const folderStyle: React.CSSProperties = useMemo(() => {
			return {
				...item,
				display: 'block',
				backgroundColor: hovered
					? selected
						? SELECTED_BACKGROUND
						: CLEAR_HOVER
					: selected
					? SELECTED_BACKGROUND
					: 'transparent',
				color: selected || hovered ? 'white' : LIGHT_TEXT,
			};
		}, [hovered, selected]);

		const [isFolderOpen, setIsFolderOpen] = useState<boolean>(() => false);

		// const onFolderClick:
		const onFolderClick: MouseEventHandler = useCallback(
			(evt) => {
				evt.preventDefault();
				setIsFolderOpen((prev) => !prev);
			},
			[isFolderOpen, setIsFolderOpen]
		);
		return (
			<div
				style={folderStyle}
				onPointerEnter={onPointerEnter}
				onPointerLeave={onPointerLeave}
				tabIndex={tabIndex}
				onClick={onFolderClick}
			>
				{/* TODO: replace string with an icon*/}
				{/*{isFolderOpen ? <CollapsedFolderIcon style={iconStyle} />
         : <ExpandedFolderIcon style={iconStyle} />}*/}

				{isFolderOpen ? <em>-</em> : <em>+</em>}
				<Spacing x={1} />
				{composition.folderName}

				{isFolderOpen && (
					<a
						style={folderStyle}
						onPointerEnter={onPointerEnter}
						onPointerLeave={onPointerLeave}
						href={composition.id}
						tabIndex={tabIndex}
						onClick={onClick}
					>
						<Spacing x={2} />
						{isCompositionStill(composition) ? (
							<StillIcon style={iconStyle} />
						) : (
							<FilmIcon style={iconStyle} />
						)}
						<Spacing x={1} />
						{composition.id}
					</a>
				)}
			</div>
		);
	};

	if (isInFolder(composition)) {
		return <FolderRow />;
	} else if (isCompositionStill(composition)) {
		return <StillRow />;
	} else {
		return <CompositionRow />;
	}
};
