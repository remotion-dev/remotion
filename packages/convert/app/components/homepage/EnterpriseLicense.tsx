import React from 'react';
import {PricingBulletPoint} from './PricingBulletPoint';
import styles from './pricing.module.css';

const textUnitWrapper: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
};

export const EnterpriseLicense: React.FC = () => {
	return (
		<div className={styles.pricingcontainer}>
			<div className={styles.audience}>For advanced needs</div>
			<h2 className={styles.pricingtitle}>Enterprise License</h2>
			<PricingBulletPoint text="Everything in Company License" checked />
			<PricingBulletPoint text="Custom terms, billing and pricing" checked />
			<PricingBulletPoint text="Compliance forms" checked />
			<PricingBulletPoint text="Prioritized feature requests" checked />
			<PricingBulletPoint text="Private support channel" checked />
			<PricingBulletPoint text="Monthly consulting session" checked />
			<div style={{height: 30}} />
			<div className={styles.rowcontainer} style={{justifyContent: 'flex-end'}}>
				<div
					style={{
						...textUnitWrapper,
						alignItems: 'flex-end',
					}}
				>
					<div
						className={styles.pricetag}
						style={{
							justifyContent: 'flex-end',
							fontSize: 30,
							lineHeight: 1.4,
						}}
					>
						<a
							className={styles.contactuslink}
							target={'_blank'}
							href="https://www.remotion.pro/contact"
						>
							Contact us
						</a>
					</div>
					<div className={styles.descriptionsmall}>
						Starting at $500 per month
					</div>
				</div>
			</div>
		</div>
	);
};
