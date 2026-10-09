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
						viewBox="0 0 640 640"
						fill="currentColor"
						aria-hidden="true"
					>
						{/* Font Awesome Pro 7.3.1 by @fontawesome — https://fontawesome.com/license (Commercial License), Copyright 2026 Fonticons, Inc. */}
						<path d="M441.4 109.3L374.7 176L464.1 265.4L530.8 198.7C543.3 186.2 543.3 165.9 530.8 153.4L486.7 109.3C474.2 96.8 453.9 96.8 441.4 109.3zM343.7 161.7L418.8 86.6C443.8 61.6 484.3 61.6 509.3 86.6L553.4 130.7C578.4 155.7 578.4 196.2 553.4 221.2L478.4 296.3L440.8 434C433.5 460.6 413.1 481.6 386.6 489.6L111.5 572.1C99.2 575.8 85.8 572.4 76.8 563.3C67.8 554.2 64.3 540.9 68 528.6L150.5 253.4C158.4 227 179.4 206.5 206.1 199.2L343.7 161.7zM347.3 193.9L214.5 230.1C198.5 234.5 185.9 246.7 181.2 262.6L106.8 510.7L216.9 400.5C211.3 391 208 379.9 208 368C208 332.7 236.7 304 272 304C307.3 304 336 332.7 336 368C336 403.3 307.3 432 272 432C260.1 432 249 428.8 239.5 423.1L129.4 533.3L377.4 458.9C393.3 454.1 405.6 441.5 409.9 425.6L446.1 292.8L347.2 193.9zM272 336C254.3 336 240 350.3 240 368C240 385.7 254.3 400 272 400C289.7 400 304 385.7 304 368C304 350.3 289.7 336 272 336z" />
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
						viewBox="0 0 640 640"
						fill="currentColor"
						aria-hidden="true"
					>
						{/* Font Awesome Pro 7.3.1 by @fontawesome — https://fontawesome.com/license (Commercial License), Copyright 2026 Fonticons, Inc. */}
						<path d="M240 112L128 112C119.2 112 112 119.2 112 128L112 512C112 520.8 119.2 528 128 528L272 528L272 576L128 576C92.7 576 64 547.3 64 512L64 128C64 92.7 92.7 64 128 64L261.5 64C278.5 64 294.8 70.7 306.8 82.7L429.3 205.3C441.3 217.3 448 233.6 448 250.6L448 400.1L400 400.1L400 272.1L312 272.1C272.2 272.1 240 239.9 240 200.1L240 112.1zM380.1 224L288 131.9L288 200C288 213.3 298.7 224 312 224L380.1 224zM336 444L400 444C406.9 444 413.4 447.6 417 453.5C420.6 459.4 421 466.8 417.9 473L368.4 572L400 572C411 572 420 581 420 592C420 603 411 612 400 612L336 612C329.1 612 322.6 608.4 319 602.5C315.4 596.6 315 589.2 318.1 583L367.6 483.9L336 483.9C325 483.9 316 474.9 316 463.9C316 452.9 325 443.9 336 443.9zM484 464L484 592C484 603 475 612 464 612C453 612 444 603 444 592L444 464C444 453 453 444 464 444C475 444 484 453 484 464zM508 464C508 453 517 444 528 444L560 444C593.1 444 620 470.9 620 504C620 537.1 593.1 564 560 564L548 564L548 592C548 603 539 612 528 612C517 612 508 603 508 592L508 464zM548 524L560 524C571 524 580 515 580 504C580 493 571 484 560 484L548 484L548 524z" />
					</svg>
					Download brand assets (.zip)
				</a>
			</div>
		</>
	);
}
