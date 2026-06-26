import type * as React from 'react';
import type {
	ChangeEventHandler,
	FocusEventHandler,
	KeyboardEventHandler,
} from 'react';
import {useCallback, useMemo, useRef, useState} from 'react';
import type {_InternalTypes} from 'remotion';
import {CLEAR_HOVER, INPUT_BACKGROUND} from '../helpers/colors';
import {resolvedStackToSymbolicated} from '../helpers/resolved-stack-to-symbolicated';
import {useRenameComposition} from '../helpers/use-rename-composition';
import {showNotification} from './Notifications/NotificationCenter';
import {useResolvedStack} from './Timeline/use-resolved-stack';

const titleWrapper: React.CSSProperties = {
	boxSizing: 'border-box',
	color: 'white',
	fontSize: 12,
	height: 18,
	lineHeight: '18px',
	marginLeft: -4,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	width: 'calc(100% + 4px)',
};

const titleInner: React.CSSProperties = {
	borderRadius: 4,
	boxSizing: 'border-box',
	display: 'inline-grid',
	fontSize: 12,
	lineHeight: '18px',
	maxWidth: '100%',
	paddingLeft: 4,
	paddingRight: 4,
	verticalAlign: 'top',
};

const titleGridItem: React.CSSProperties = {
	fontSize: 12,
	gridArea: '1 / 1',
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const titleInput: React.CSSProperties = {
	appearance: 'none',
	backgroundColor: 'transparent',
	border: 'none',
	boxShadow: 'none',
	color: 'white',
	fontFamily: 'inherit',
	fontSize: 12,
	height: 18,
	lineHeight: '18px',
	margin: 0,
	minWidth: 0,
	outline: 'none',
	overflow: 'hidden',
	padding: 0,
	WebkitAppearance: 'none',
	width: '100%',
};

export const InlineCompositionName: React.FC<{
	readonly compositionId: string;
	readonly stack: string | null;
	readonly compositions: _InternalTypes['AnyComposition'][];
}> = ({compositionId, stack, compositions}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const canRename = !window.remotion_isReadOnlyStudio;
	const [value, setValue] = useState(compositionId);
	const inputRef = useRef<HTMLInputElement>(null);
	const cancelledRef = useRef(false);
	const resolvedLocation = useResolvedStack(stack);
	const symbolicatedStack = useMemo(
		() => resolvedStackToSymbolicated(resolvedLocation),
		[resolvedLocation],
	);
	const {getValidationMessage, renameComposition} = useRenameComposition({
		compositions,
		currentId: compositionId,
		newId: value,
	});

	const focusInput = useCallback((input: HTMLInputElement | null) => {
		inputRef.current = input;

		if (!input) {
			return;
		}

		input.focus();
		input.select();
	}, []);

	const commit = useCallback(
		(newId: string) => {
			if (cancelledRef.current) {
				return;
			}

			setIsEditing(false);

			if (newId === compositionId) {
				return;
			}

			const compNameErrMessage = getValidationMessage(newId);
			if (compNameErrMessage) {
				showNotification(compNameErrMessage, 2000);
				setValue(compositionId);

				return;
			}

			if (!stack || !symbolicatedStack) {
				showNotification(
					'Could not determine where this composition is defined',
					2000,
				);
				setValue(compositionId);

				return;
			}

			const notification = showNotification('Renaming...', null);

			renameComposition({
				newCompositionId: newId,
				signal: new AbortController().signal,
				symbolicatedStack,
			})
				.then(() => {
					notification.replaceContent(`Renamed to ${newId}`, 2000);
				})
				.catch((err) => {
					setValue(compositionId);

					notification.replaceContent(
						`Could not rename composition: ${(err as Error).message}`,
						2000,
					);
				});
		},
		[
			compositionId,
			getValidationMessage,
			renameComposition,
			stack,
			symbolicatedStack,
		],
	);

	const startEditing = useCallback(() => {
		if (!canRename) {
			return;
		}

		cancelledRef.current = false;
		setValue(compositionId);
		setIsEditing(true);
	}, [canRename, compositionId]);

	const onChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
		setValue(e.target.value);
	}, []);

	const onBlur: FocusEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			commit(e.currentTarget.value);
		},
		[commit],
	);

	const onKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				inputRef.current?.blur();
			}

			if (e.key === 'Escape') {
				e.preventDefault();
				cancelledRef.current = true;
				setValue(compositionId);
				setIsEditing(false);
			}
		},
		[compositionId],
	);

	const backgroundColor = isEditing
		? INPUT_BACKGROUND
		: isHovered && canRename
			? CLEAR_HOVER
			: 'transparent';

	return (
		<div style={titleWrapper} title={compositionId}>
			<span
				style={{
					...titleInner,
					backgroundColor,
					cursor: isEditing ? 'text' : 'default',
					userSelect: isEditing ? 'text' : 'none',
					width: isEditing ? '100%' : undefined,
				}}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onClick={isEditing || !canRename ? undefined : startEditing}
			>
				<span
					aria-hidden={isEditing}
					style={{
						...titleGridItem,
						visibility: isEditing ? 'hidden' : 'visible',
					}}
				>
					{compositionId}
				</span>
				{isEditing ? (
					<input
						ref={focusInput}
						style={{...titleGridItem, ...titleInput}}
						value={value}
						onChange={onChange}
						onBlur={onBlur}
						onKeyDown={onKeyDown}
					/>
				) : null}
			</span>
		</div>
	);
};
