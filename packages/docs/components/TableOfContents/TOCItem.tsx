import Link from '@docusaurus/Link';
import React from 'react';
import styles from './toc.module.css';

export const TOCItem: React.FC<{
	readonly link: string;
	readonly children: React.ReactNode;
	readonly draggable?: boolean;
	readonly onDragStart?: React.DragEventHandler<HTMLAnchorElement>;
	readonly title?: string;
}> = ({link, children, draggable, onDragStart, title}) => {
	return (
		<Link
			to={link}
			className={styles.link}
			draggable={draggable}
			onDragStart={onDragStart}
			title={title}
		>
			<div className={styles.item}>{children}</div>
		</Link>
	);
};
