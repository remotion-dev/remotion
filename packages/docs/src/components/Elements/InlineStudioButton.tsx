import React, {type ButtonHTMLAttributes, type ReactNode} from 'react';
import styles from './InlineStudioButton.module.css';

export const InlineStudioButton: React.FC<
	ButtonHTMLAttributes<HTMLButtonElement> & {
		readonly icon: ReactNode | null;
		readonly loading: boolean;
	}
> = ({children, disabled, icon, loading, ...props}) => {
	return (
		<button
			{...props}
			aria-busy={loading}
			className={styles.button}
			disabled={disabled || loading}
			type="button"
		>
			{loading ? (
				'…'
			) : (
				<>
					{icon === null ? null : (
						<span aria-hidden="true" className={styles.icon}>
							{icon}
						</span>
					)}
					{children}
				</>
			)}
			<span aria-hidden="true" className={styles.touchTarget} />
		</button>
	);
};
