import {Button, CheckIcon, Input, PlanePaperIcon} from '@remotion/design';
import '@remotion/promo-pages/dist/tailwind.css';
import React, {useCallback, useId, useState} from 'react';

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
		<form
			onSubmit={handleSubmit}
			aria-busy={submitting}
			className="w-full mb-8"
		>
			<p className="fontbrand text-lg text-center mb-10">
				Join the Remotion SDK waitlist to get an email when the SDK is ready to
				try.
			</p>
			<label htmlFor={emailId} className="sr-only">
				Email address
			</label>
			<div className="flex flex-col md:flex-row gap-2 justify-center">
				<Input
					id={emailId}
					name="email"
					type="email"
					autoComplete="email"
					required
					placeholder="animator@gmail.com"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					disabled={submitting || subscribed}
					className="md:max-w-[400px]"
				/>
				<div>
					<Button
						type="submit"
						aria-label={
							subscribed ? 'Joined the waitlist' : 'Join the waitlist'
						}
						className="w-14 rounded-full h-14 bg-brand text-white font-bold disabled:text-white/50 disabled:border-black px-0 py-0"
						disabled={submitting || subscribed}
						loading={submitting}
					>
						{subscribed ? (
							<CheckIcon aria-hidden className="size-5 mt-[1px]" />
						) : (
							<PlanePaperIcon aria-hidden className="size-6 ml-[2px]" />
						)}
					</Button>
				</div>
			</div>
			{subscribed ? (
				<p role="status" className="fontbrand text-center mt-4">
					You&apos;re on the Remotion SDK waitlist. We&apos;ll email you when
					it&apos;s ready to try.
				</p>
			) : null}
			{error ? (
				<p role="alert" className="fontbrand text-center text-warn mt-4">
					{error}
				</p>
			) : null}
		</form>
	);
};
