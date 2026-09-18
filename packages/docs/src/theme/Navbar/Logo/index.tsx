import Logo from '@theme/Logo';
import React, {type MouseEvent, type ReactNode, useEffect, useRef} from 'react';
import styles from './styles.module.css';

export default function NavbarLogo(): ReactNode {
	const contextMenuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const hideContextMenu = () => {
			const menu = contextMenuRef.current;
			if (menu?.matches(':popover-open')) {
				menu.hidePopover();
			}
		};

		const hideOnPointerDown = (event: PointerEvent) => {
			if (!contextMenuRef.current?.contains(event.target as Node)) {
				hideContextMenu();
			}
		};

		const hideOnEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				hideContextMenu();
			}
		};

		document.addEventListener('pointerdown', hideOnPointerDown);
		document.addEventListener('keydown', hideOnEscape);
		return () => {
			document.removeEventListener('pointerdown', hideOnPointerDown);
			document.removeEventListener('keydown', hideOnEscape);
		};
	}, []);

	const openContextMenu = (event: MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();

		const menu = contextMenuRef.current;
		if (!menu) {
			return;
		}

		const logoBounds = event.currentTarget.getBoundingClientRect();
		menu.style.left = `${event.clientX || logoBounds.left}px`;
		menu.style.top = `${event.clientY || logoBounds.bottom}px`;
		menu.showPopover();
		menu.querySelector<HTMLAnchorElement>('a')?.focus();
	};

	return (
		<>
			<Logo
				className="navbar__brand"
				imageClassName="navbar__logo"
				titleClassName="navbar__title text--truncate"
				onContextMenu={openContextMenu}
			/>
			<div
				ref={contextMenuRef}
				popover="manual"
				role="menu"
				className={styles.contextMenu}
				onClick={() => contextMenuRef.current?.hidePopover()}
			>
				<a
					className={styles.contextMenuItem}
					href="https://remotion.dev/brand"
					target="_blank"
					rel="noreferrer"
					role="menuitem"
				>
					<svg
						className={styles.contextMenuIcon}
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M12 3a9 9 0 1 0 0 18h1.5a1.5 1.5 0 0 0 0-3H12a1.5 1.5 0 0 1 0-3h2a7 7 0 0 0 0-14Z" />
						<circle cx="7.5" cy="10.5" r="0.5" fill="currentColor" />
						<circle cx="10" cy="7" r="0.5" fill="currentColor" />
						<circle cx="14" cy="6.5" r="0.5" fill="currentColor" />
					</svg>
					Brand design system
				</a>
				<a
					className={styles.contextMenuItem}
					href="https://remotion.media/remotion-brand-assets.zip"
					target="_blank"
					rel="noreferrer"
					role="menuitem"
				>
					<svg
						className={styles.contextMenuIcon}
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M6 2h8l4 4v16H6Z" />
						<path d="M14 2v5h4M10 2v2h2v2h-2v2h2v2h-2v2h2" />
					</svg>
					Download brand assets (.zip)
				</a>
			</div>
		</>
	);
}
