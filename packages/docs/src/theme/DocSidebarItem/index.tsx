import Link from '@docusaurus/Link';
import {isActiveSidebarItem} from '@docusaurus/plugin-content-docs/client';
import {isSamePath} from '@docusaurus/theme-common/internal';
import {StudioInternals} from '@remotion/studio';
import DocSidebarItem from '@theme-original/DocSidebarItem';
import type {Props} from '@theme/DocSidebarItem';
import DocSidebarItems from '@theme/DocSidebarItems';
import clsx from 'clsx';
import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from 'react';

const ActiveCatalogCategoryContext = createContext<string | null>(null);

const CatalogSidebarRoot: React.FC<
	Props & {
		readonly item: Exclude<Props['item'], {type: 'html'}>;
		readonly catalogPath: '/elements/' | '/effects/';
	}
> = ({item, catalogPath, activePath, onItemClick, level, tabIndex}) => {
	const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
	const isCatalog = isSamePath(catalogPath, activePath);

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
				'h2[data-catalog-category]',
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

	const Icon =
		catalogPath === '/elements/'
			? StudioInternals.BrowseElementsIcon
			: StudioInternals.EffectsIcon;

	return (
		<li className={clsx('menu__list-item', item.className)}>
			<Link
				to={catalogPath}
				className={clsx('menu__link', {
					'menu__link--active': isActiveSidebarItem(item, activePath),
				})}
				aria-current={isCatalog ? 'page' : undefined}
				tabIndex={tabIndex}
				onClick={() => onItemClick?.(item)}
			>
				<Icon
					aria-hidden="true"
					focusable="false"
					color="currentColor"
					width={22}
					height={22}
				/>
				{item.label}
			</Link>
			{item.type === 'category' ? (
				<ActiveCatalogCategoryContext.Provider value={activeHeadingId}>
					<ul className="menu__list">
						<DocSidebarItems
							items={item.items}
							level={level + 1}
							activePath={activePath}
							onItemClick={onItemClick}
							tabIndex={tabIndex}
						/>
					</ul>
				</ActiveCatalogCategoryContext.Provider>
			) : null}
		</li>
	);
};

export default function DocSidebarItemWrapper(props: Props): ReactNode {
	const {item, activePath, onItemClick} = props;
	const activeHeadingId = useContext(ActiveCatalogCategoryContext);
	const catalogHref = item.customProps?.catalogHref;

	if (
		item.type !== 'html' &&
		item.className?.split(' ').includes('catalog-sidebar-root') &&
		(item.href === '/elements/' || item.href === '/effects/')
	) {
		return (
			<CatalogSidebarRoot {...props} item={item} catalogPath={item.href} />
		);
	}

	if (item.type !== 'category' || typeof catalogHref !== 'string') {
		return <DocSidebarItem {...props} />;
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
