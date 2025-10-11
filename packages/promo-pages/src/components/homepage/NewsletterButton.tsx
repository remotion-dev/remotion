import React, {useCallback, useState} from 'react';
import {BlueButton} from './layout/Button';
import {Spacer} from './Spacer';
import {SectionTitle} from './VideoAppsTitle';

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
			<div className="flex flex-col">
				<div className={'w-full'}>
					<div className={'flex flex-col flex-1'}>
						<SectionTitle>Newsletter</SectionTitle>
						<form
							onSubmit={handleSubmit}
							style={{
								width: '100%',
							}}
						>
							<div className={'fontbrand text-center mb-10 -mt-4'}>
								Read about new features and noteworthy updates we have made on
								Remotion once in a while.{' '}
							</div>

							<input
								className="w-full dark:bg-[#121212] rounded-lg border-effect border-black outline-none px-3 py-3 fontbrand text-lg box-border focus:border-brand"
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
