import React, {type ReactNode} from 'react';
import styles from './CatalogHero.module.css';

export const CatalogHero: React.FC<{
	readonly title: string;
	readonly children: ReactNode;
}> = ({title, children}) => {
	return (
		<header className={`catalog-hero ${styles.hero}`}>
			<h1 className={styles.title}>{title}</h1>
			<div className={styles.description}>{children}</div>
		</header>
	);
};
