import {Button, Input, Textarea} from '@remotion/design';
import '@remotion/promo-pages/dist/tailwind.css';
import React, {useId, useState} from 'react';

export const W8BenERequestForm: React.FC = () => {
	const emailId = useId();
	const notesId = useId();
	const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
		'idle',
	);
	const sending = status === 'sending';
	const sent = status === 'sent';

	const submit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (sending || sent) return;

		const form = event.currentTarget;
		const data = new FormData(form);
		setStatus('sending');

		try {
			const response = await fetch('/api/w8ben-e-request', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					email: data.get('email'),
					notes: data.get('notes'),
				}),
			});
			const result = await response.json();
			if (!response.ok || result.success !== true) {
				setStatus('error');
				return;
			}

			form.reset();
			setStatus('sent');
		} catch {
			setStatus('error');
		}
	};

	return (
		<form
			method="post"
			onSubmit={submit}
			aria-busy={sending}
			className="grid max-w-md gap-4"
		>
			<div>
				<label htmlFor={emailId} className="block font-bold text-lg mb-1">
					Company email
				</label>
				<Input
					id={emailId}
					name="email"
					type="email"
					autoComplete="email"
					placeholder="name@company.com"
					maxLength={254}
					required
					disabled={sending || sent}
				/>
			</div>
			<div>
				<label htmlFor={notesId} className="block font-bold text-lg mb-1">
					Notes (optional)
				</label>
				<Textarea
					id={notesId}
					name="notes"
					placeholder="Add any vendor onboarding details"
					rows={3}
					maxLength={2000}
					disabled={sending || sent}
				/>
			</div>
			<div>
				<Button
					type="submit"
					className="bg-brand text-white"
					aria-label="Request W-8BEN-E"
					aria-busy={sending}
					disabled={sent}
					loading={sending}
				>
					Request W-8BEN-E
				</Button>
			</div>
			{sent ? (
				<p role="status">Request sent. We’ll reply to your company email.</p>
			) : null}
			{status === 'error' ? (
				<p role="alert">
					Couldn’t send the request. Try again or email{' '}
					<a href="mailto:hi@remotion.dev?subject=W-8BEN-E%20request">
						hi@remotion.dev
					</a>
					.
				</p>
			) : null}
		</form>
	);
};
