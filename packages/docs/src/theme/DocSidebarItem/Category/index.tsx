import Link from '@docusaurus/Link';
import {isActiveSidebarItem} from '@docusaurus/plugin-content-docs/client';
import {isSamePath} from '@docusaurus/theme-common/internal';
import DocSidebarItemCategory from '@theme-original/DocSidebarItem/Category';
import type {Props} from '@theme/DocSidebarItem/Category';
import clsx from 'clsx';
import React, {type ReactNode} from 'react';

export default function DocSidebarItemCategoryWrapper(props: Props): ReactNode {
	const {item, activePath, onItemClick} = props;

	if (item.className !== 'elements-sidebar-category' || !item.href) {
		return <DocSidebarItemCategory {...props} />;
	}

	return (
		<li className={clsx('menu__list-item', item.className)}>
			<Link
				to={item.href}
				className={clsx('menu__link', {
					'menu__link--active': isActiveSidebarItem(item, activePath),
				})}
				aria-current={isSamePath(item.href, activePath) ? 'page' : undefined}
				tabIndex={props.tabIndex}
				onClick={() => onItemClick?.(item)}
			>
				{item.label}
			</Link>
		</li>
	);
}
