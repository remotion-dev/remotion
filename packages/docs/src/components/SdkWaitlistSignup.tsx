import React, {useCallback, useId, useState} from 'react';
import styles from './SdkWaitlistSignup.module.css';

export const SdkWaitlistSignup: React.FC = () => {
	const emailId = useId();
	const [email, setEmail] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [subscribed, setSubscribed] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			if (submitting || subscribed) {
				return;
			}

			setSubmitting(true);
			setError(null);

			try {
				const response = await fetch(
					'https://www.remotion.pro/api/sdk-waitlist',
					{
						method: 'POST',
						body: JSON.stringify({email: email.trim()}),
						headers: {'content-type': 'application/json'},
					},
				);
				const json = await response.json();
				if (!response.ok || !json.success) {
					throw new Error('SDK waitlist signup failed');
				}

				setSubscribed(true);
			} catch {
				setError('Something went wrong. Please try again later.');
			} finally {
				setSubmitting(false);
			}
		},
		[email, submitting, subscribed],
	);

	return (
		<div className={styles.signup}>
			{subscribed ? (
				<p role="status" className={styles.success}>
					You&apos;re on the Remotion SDK waitlist. We&apos;ll email you when
					it&apos;s ready to try.
				</p>
			) : (
				<form onSubmit={handleSubmit} aria-busy={submitting}>
					<label htmlFor={emailId} className={styles.label}>
						Email address
					</label>
					<div className={styles.fields}>
						<input
							id={emailId}
							name="email"
							type="email"
							autoComplete="email"
							required
							placeholder="you@example.com"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							disabled={submitting}
							className={styles.input}
						/>
						<button
							type="submit"
							disabled={submitting}
							className={styles.button}
						>
							{submitting ? 'Signing up…' : 'Join the waitlist'}
						</button>
					</div>
					{error ? (
						<p role="alert" className={styles.error}>
							{error}
						</p>
					) : null}
				</form>
			)}
		</div>
	);
};
