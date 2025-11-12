import {Button, CheckIcon, Input, PlanePaperIcon} from '@remotion/design';
import React, {useCallback, useState} from 'react';
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
							<div className="flex flex-col md:flex-row gap-2 justify-center">
								<Input
									className="w-full dark:bg-[#121212] md:max-w-[400px] rounded-lg border-effect border-black outline-none h-14 px-3 fontbrand text-lg box-border"
									disabled={submitting}
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									type={'email'}
									required
									placeholder="animator@gmail.com"
								/>
								<div>
									<Button
										type="submit"
										className="w-14 rounded-full h-14 bg-brand text-white font-bold disabled:text-white/50 disabled:border-black px-0 py-0"
										disabled={submitting || subscribed}
									>
										{subscribed ? (
											<CheckIcon className=" size-5 mt-[1px]" />
										) : (
											<PlanePaperIcon className=" size-6 ml-[2px]" />
										)}
									</Button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};
