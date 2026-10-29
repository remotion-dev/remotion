import Link from '@docusaurus/Link';
import {isActiveSidebarItem} from '@docusaurus/plugin-content-docs/client';
import {isSamePath} from '@docusaurus/theme-common/internal';
import DocSidebarItemCategory from '@theme-original/DocSidebarItem/Category';
import type {Props} from '@theme/DocSidebarItem/Category';
import clsx from 'clsx';
import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from 'react';

const ActiveElementCategoryContext = createContext<string | null>(null);

const ElementsSidebarRoot: React.FC<Props> = (props) => {
	const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
	const isCatalog = isSamePath(props.item.href, props.activePath);

	useEffect(() => {
		if (!isCatalog) {
			return;
		}

		const catalogContent = document.querySelector('.theme-doc-markdown');
		if (!catalogContent) {
			return;
		}

		let animationFrame: number | null = null;

		const updateActiveCategory = () => {
			animationFrame = null;
			const scrollOffset =
				Number.parseFloat(
					getComputedStyle(document.documentElement).scrollPaddingTop,
				) || 0;
			// Highlight approaching sections before their titles reach the sticky navbar.
			const activationOffset =
				scrollOffset + Math.min(120, window.innerHeight * 0.2);
			let activeId: string | null = null;
			for (const heading of catalogContent.querySelectorAll<HTMLElement>(
				'h2[id^="element-category-"]',
			)) {
				if (heading.getBoundingClientRect().top <= activationOffset + 1) {
					activeId = heading.id;
				}
			}

			setActiveHeadingId(activeId);
		};

		const scheduleUpdate = () => {
			if (animationFrame === null) {
				animationFrame = requestAnimationFrame(updateActiveCategory);
			}
		};

		// Search replaces category sections without necessarily causing a scroll event.
		const observer = new MutationObserver(scheduleUpdate);
		observer.observe(catalogContent, {childList: true, subtree: true});

		updateActiveCategory();
		window.addEventListener('scroll', scheduleUpdate, {passive: true});
		window.addEventListener('resize', scheduleUpdate);
		return () => {
			observer.disconnect();
			window.removeEventListener('scroll', scheduleUpdate);
			window.removeEventListener('resize', scheduleUpdate);
			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame);
			}
		};
	}, [isCatalog]);

	return (
		<ActiveElementCategoryContext.Provider value={activeHeadingId}>
			<DocSidebarItemCategory {...props} />
		</ActiveElementCategoryContext.Provider>
	);
};

export default function DocSidebarItemCategoryWrapper(props: Props): ReactNode {
	const {item, activePath, onItemClick} = props;
	const activeHeadingId = useContext(ActiveElementCategoryContext);
	const catalogHref = item.customProps?.catalogHref;

	if (item.className?.split(' ').includes('elements-sidebar-root')) {
		return <ElementsSidebarRoot {...props} />;
	}

	if (
		item.className !== 'elements-sidebar-category' ||
		typeof catalogHref !== 'string'
	) {
		return <DocSidebarItemCategory {...props} />;
	}

	const [catalogPath, headingId] = catalogHref.split('#');
	const isCatalog = isSamePath(catalogPath, activePath);
	const isActive = isCatalog
		? activeHeadingId === headingId
		: isActiveSidebarItem(item, activePath);

	return (
		<li className={clsx('menu__list-item', item.className)}>
			<Link
				to={catalogHref}
				className={clsx('menu__link', {
					'menu__link--active': isActive,
				})}
				aria-current={isCatalog && isActive ? 'location' : undefined}
				tabIndex={props.tabIndex}
				onClick={() => onItemClick?.(item)}
			>
				{item.label}
			</Link>
		</li>
	);
}
