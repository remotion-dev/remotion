import React, {useCallback, useState} from 'react';
import {cn} from '../../cn';
import {BlueButton} from './layout/Button';
import styles from './newsletter.module.css';
import {Spacer} from './Spacer';

export const NewsletterButton: React.FC<{}> = () => {
	const [email, setEmail] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [subscribed, setSubscribed] = useState(false);

	const handleSubmit = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			try {
				setSubmitting(true);
				e.preventDefault();

				const response = await fetch(
					'https://www.remotion.pro/api/newsletter',
					{
						method: 'POST',
						body: JSON.stringify({email}),
						headers: {
							'content-type': 'application/json',
						},
					},
				);
				const json = await response.json();
				if (json.success) {
					setSubscribed(true);
				} else {
					// eslint-disable-next-line no-alert
					alert('Something went wrong. Please try again later.');
				}

				setSubmitting(false);
			} catch {
				// eslint-disable-next-line no-alert
				alert('Something went wrong. Please try again later.');
			}
		},
		[email],
	);

	return (
		<div>
			<div className={styles.newslettergrow}>
				<div className={styles.portion}>
					<div className={cn(styles.panel, 'border-brand')}>
						<div className={[styles.tablenewsletter].join(' ')}>Newsletter</div>
						<form
							onSubmit={handleSubmit}
							style={{
								width: '100%',
							}}
						>
							<p>
								Read about new features and noteworthy updates we have made on
								Remotion once in a while.
							</p>

							<input
								className="w-full rounded-lg px-3 py-3 font-brand text-lg box-border"
								disabled={submitting}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								type={'email'}
								required
								placeholder="animator@gmail.com"
							/>
							<Spacer />
							<Spacer />
							<div>
								<BlueButton
									type="submit"
									className="w-full"
									loading={submitting}
									disabled={submitting || subscribed}
									size="sm"
								>
									{subscribed ? 'Subscribed!' : 'Subscribe'}
								</BlueButton>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};
