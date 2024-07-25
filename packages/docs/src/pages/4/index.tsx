/* eslint-disable no-alert */
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import React, {useCallback, useMemo, useState} from 'react';
import {CoolInput} from '../../../components/TextInput';
import {PlainButton} from '../../../components/layout/Button';
import {Spacer} from '../../../components/layout/Spacer';
import {DoMoreHero} from '../../components/DoMoreHero/DoMoreHero';
import {Seo} from '../../components/Seo';
import styles from './v4.module.css';

const spacer: React.CSSProperties = {
	height: '10px',
};

const errorStyle: React.CSSProperties = {
	color: '#FF3232',
	textAlign: 'center',
};

export const EventComp: React.FC<{
	date: string;
	title: string;
	description: string;
	youtubeId?: string;
}> = ({date, title, description, youtubeId}) => {
	return (
		<div
			style={{
				border: '2px solid var(--ifm-font-color-base)',
				borderBottomWidth: 4,
				borderRadius: 8,
				padding: 10,
			}}
		>
			<p className={styles.date}>{date}</p>
			<p className={styles.eventtitle}>{title}</p>
			<p>{description}</p>
			{youtubeId ? (
				<iframe
					style={{
						width: '100%',
						aspectRatio: '16 / 9',
					}}
					src={`https://www.youtube.com/embed/${youtubeId}`}
					title="YouTube video player"
					frameBorder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
				/>
			) : (
				<div
					style={{
						width: '100%',
						aspectRatio: '16 / 9',
						backgroundColor: 'var(--ifm-out-of-focus)',
						borderRadius: 5,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<div
						style={{
							color: 'var(--ifm-subtitle)',
							justifyContent: 'center',
							alignItems: 'center',
							fontWeight: 'bold',
						}}
					>
						Check back {date}
					</div>
				</div>
			)}
		</div>
	);
};

const V4: React.FC = () => {
	const context = useDocusaurusContext();

	const [email, setEmail] = useState<string>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [subscribed, setSubscribed] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const buttonLabel = useMemo(() => {
		if (subscribed) {
			return "You're signed up!";
		}

		return loading ? 'Signing up...' : 'Sign up';
	}, [loading, subscribed]);
	const isValidEmail = (inputMail: string) =>
		/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(inputMail);

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setEmail(e.target.value);
		},
		[],
	);

	const onSubmit: React.FormEventHandler = useCallback(
		async (e) => {
			try {
				e.preventDefault();
				setSubscribed(false);
				setError(null);

				if (isValidEmail(email)) {
					setLoading(true);
					const res = await fetch('https://www.remotion.pro/api/newsletter', {
						method: 'POST',
						body: JSON.stringify({email}),
						headers: {'content-type': 'application/json'},
					});
					const json = await res.json();
					if (json.success) {
						setSubscribed(true);
					} else {
						setLoading(false);
						alert('Something went wrong. Please try again later.');
					}
				} else {
					setError('Invalid email provided');
				}
			} catch (err) {
				setLoading(false);
				alert('Something went wrong. Please try again later');
				console.error(err);
			}
		},
		[email],
	);

	return (
		<Layout>
			<Head>
				{Seo.renderTitle('Do more with React | Remotion 4.0')}
				{Seo.renderImage('/img/remotion4.png', context.siteConfig.url)}
			</Head>
			<DoMoreHero />

			<div className={styles.container}>
				<div className={styles.wrapper}>
					<h1 className={styles.pagetitle}>Do more with React</h1>
					<div style={{display: 'flex', justifyContent: 'center'}}>
						<p className={styles.title}>
							Discover the new capabilities of Remotion 4.0 from July 3 – July 7
						</p>
					</div>
					<br />
					<div
						style={{
							textAlign: 'center',
							display: 'flex',
							justifyContent: 'center',
						}}
					>
						<a
							style={{
								textDecoration: 'none',
							}}
							className={styles.a}
							href="/blog/4-0"
						>
							<PlainButton size="sm" loading={false} fullWidth={false}>
								View announcement blog post
							</PlainButton>
						</a>
					</div>

					<br />
					<div className={styles.grid}>
						<EventComp
							description="Celebrate the launch of Remotion 4.0 and experience the new possibilities of media creation with React."
							date="July 3rd"
							title="Keynote"
							youtubeId="S3C9wlPNhkQ"
						/>
						<EventComp
							date="July 4th"
							title="Visual editing"
							description="Expose parameters to the user interface, edit them, see the result in real-time and save them back to code."
							youtubeId="NX9YTOsLGpQ"
						/>
						<EventComp
							date="July 5th"
							title="Render button"
							description="Configure, queue and track renders with the newest way to render using Remotion."
							youtubeId="ywRZvG94SPI"
						/>
						<EventComp
							description="Leverage the new system for data fetching and dynamically calculating the duration and dimensions of your video."
							date="July 6th"
							title="Data-driven videos"
							youtubeId="JrxL3mYY22c"
						/>
						<EventComp
							description="A rundown of the remaining improvements coming with Remotion 4.0."
							date="July 7th"
							title="Last but not least"
							youtubeId="UCJn8uiWNxQ"
						/>
						<div className={styles.panel}>
							<div style={{marginBottom: 10}}>
								Sign up for our newsletter to stay up to date:
							</div>
							<form style={{width: '100%'}} onSubmit={onSubmit}>
								<CoolInput
									type="email"
									autoComplete="none"
									onChange={onChange}
									placeholder="Your email adress"
									style={{width: '100%', fontFamily: 'GTPlanar'}}
								/>
								<Spacer />
								<div>
									<button
										type="submit"
										className={styles.submitbutton}
										disabled={loading || subscribed}
									>
										{buttonLabel}
									</button>
								</div>
							</form>
							<Spacer />
							<div style={errorStyle}>{error}</div>
						</div>
					</div>
					<div style={spacer} />
					<div style={spacer} />
				</div>
			</div>
		</Layout>
	);
};

export default V4;
