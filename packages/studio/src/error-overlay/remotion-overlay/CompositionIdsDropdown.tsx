import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Button} from '../../components/Button';
import {
	INPUT_BACKGROUND,
	INPUT_BORDER_COLOR_UNHOVERED,
	TEXT_COLOR,
} from '../../helpers/colors';
import {CompositionIdListItem} from './CompositionIdListItem';
import {CaretDown} from './carets';

const containerStyle: React.CSSProperties = {
	display: 'inline-block',
	position: 'relative',
};

// Button styling provided by shared Button component

const dropdownStyle: React.CSSProperties = {
	position: 'absolute',
	top: '110%',
	left: 0,
	width: 320,
	maxHeight: 300,
	overflowY: 'auto',
	backgroundColor: INPUT_BACKGROUND,
	border: `1px solid ${INPUT_BORDER_COLOR_UNHOVERED}`,
	borderRadius: 8,
	padding: 8,
	boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
	zIndex: 1000,
	fontFamily: 'inherit',
	fontSize: 14,
};

const searchStyle: React.CSSProperties = {
	width: '100%',
	padding: '6px 8px',
	borderRadius: 6,
	border: `1px solid ${INPUT_BORDER_COLOR_UNHOVERED}`,
	background: INPUT_BACKGROUND,
	color: TEXT_COLOR,
	marginBottom: 8,
	outline: 'none',
	fontFamily: 'inherit',
	fontSize: 14,
};

export const CompositionIdsDropdown: React.FC<{
	readonly compositionIds: readonly string[];
	readonly currentId?: string | null;
}> = ({compositionIds, currentId}) => {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const containerRef = useRef<HTMLDivElement | null>(null);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) {
			return compositionIds;
		}

		return compositionIds.filter((id) => id.toLowerCase().includes(q));
	}, [compositionIds, query]);

	const onSelect = (id: string) => {
		const isQuery = (
			window as Window &
				typeof globalThis & {remotion_isReadOnlyStudio?: boolean}
		).remotion_isReadOnlyStudio;
		if (isQuery) {
			window.location.href = `${window.location.pathname}?/${id}`;
		} else {
			window.location.href = `/${id}`;
		}
	};

	useEffect(() => {
		if (!open) {
			return;
		}

		const onClickAway = (e: MouseEvent | TouchEvent) => {
			if (!containerRef.current) {
				return;
			}

			if (!containerRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};

		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setOpen(false);
			}
		};

		document.addEventListener('mousedown', onClickAway);
		document.addEventListener('touchstart', onClickAway, {passive: true});
		document.addEventListener('keydown', onKey);

		return () => {
			document.removeEventListener('mousedown', onClickAway);
			document.removeEventListener('touchstart', onClickAway);
			document.removeEventListener('keydown', onKey);
		};
	}, [open, containerRef]);

	return (
		<div ref={containerRef} style={containerStyle}>
			<Button
				onClick={() => setOpen((p) => !p)}
				buttonContainerStyle={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 8,
					minWidth: 180,
				}}
			>
				<span
					style={{
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
						fontSize: '14px',
						lineHeight: '24px',
					}}
				>
					{currentId ?? 'Select composition'}
				</span>
				<CaretDown size={20} invert={open} />
			</Button>
			{open ? (
				<div style={dropdownStyle}>
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search compositions..."
						style={searchStyle}
						aria-label="Search compositions"
					/>
					<div>
						{filtered.length === 0 ? (
							<div style={{opacity: 0.7, padding: 8, justifyItems: 'center'}}>
								No compositions found
							</div>
						) : (
							filtered.map((id) => (
								<CompositionIdListItem
									key={id}
									id={id}
									isActive={id === currentId}
									onSelect={onSelect}
								/>
							))
						)}
					</div>
				</div>
			) : null}
		</div>
	);
};
