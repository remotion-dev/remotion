import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import React, {useMemo} from 'react';
import {random} from 'remotion';
import {BlueButton} from '../../../components/layout/Button';
import {Spacer} from '../../../components/layout/Spacer';
import {Seo} from '../../components/Seo';
import {
	EmailLogo,
	GitHubLogo,
	LinkedInLogo,
	PersonalWebsite,
	TwitterLogo,
	VideoCallLogo,
} from '../../components/icons';
import {experts} from '../../data/experts';
import styles from './experts.module.css';

const dateString = (date: Date) =>
	date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();

const todayHash = dateString(new Date());

const docsButton: React.CSSProperties = {
	textDecoration: 'none',
};

const flex: React.CSSProperties = {
	flex: 1,
};

const link: React.CSSProperties = {
	textDecoration: 'none',
	color: 'inherit',
	width: '100%',
	display: 'flex',
	flexDirection: 'row',
	paddingTop: 8,
};

const Experts: React.FC = () => {
	const expertsInRandomOrder = useMemo(() => {
		if (typeof window === 'undefined') {
			return [];
		}

		// Have a different order every day.
		return experts.sort(
			(a, b) => random(a.name + todayHash) - random(b.name + todayHash),
		);
	}, []);

	const context = useDocusaurusContext();

	return (
		<Layout>
			<Head>
				{Seo.renderTitle('Remotion Experts | Hire Remotion freelancers')}
				{Seo.renderDescription(
					'Find Remotion freelancers and hire them to create, progress or unblock your Remotion project.',
				)}
				{Seo.renderImage(
					'/img/remotion-experts-og-image.png',
					context.siteConfig.url,
				)}
			</Head>
			<div className={styles.container}>
				<div className={styles.wrapper}>
					<h1 className={styles.pagetitle}>Find a Remotion Expert</h1>
					<p className={styles.tagline}>
						Get help by booking a call or hiring these freelancers to work on
						your Remotion project.
						<br />
						They appear in random order.{' '}
					</p>
					<p className={styles.tagline}>
						<a href="mailto:hi@remotion.dev?subject=Remotion+Experts+directory">
							<strong>Are you available for hire? Let us know!</strong>
						</a>
					</p>
					<br />
					<br />
					{expertsInRandomOrder.map((e) => {
						return (
							<div key={e.name} className={styles.card}>
								<Link
									style={link}
									className={styles.cardContent}
									href={`/experts/${e.slug}`}
								>
									<img className={styles.profile} src={e.image} />
									<div className={styles.spacer} />
									<div className={styles.right}>
										<div className={styles.title}>{e.name}</div>
										<p>{e.description}</p>
									</div>
								</Link>
								<Spacer />
								<Spacer />
								<Spacer />
								<Spacer />
								<div
									style={{
										display: 'flex',
										flexDirection: 'row',
										width: '100%',
									}}
									className={`${styles.buttonsInColumn}`}
								>
									{e.website ? (
										<div style={flex} className={styles.docsButton}>
											<a
												style={docsButton}
												target={'_blank'}
												href={`${e.website}`}
											>
												<BlueButton loading={false} fullWidth size="sm">
													<PersonalWebsite /> Website
												</BlueButton>
											</a>
										</div>
									) : null}

									{e.x ? (
										<>
											{e.website ? (
												<>
													<Spacer />
													<Spacer />
												</>
											) : null}

											<div style={flex} className={styles.docsButton}>
												<a
													style={docsButton}
													target={'_blank'}
													href={`https://x.com/${e.x}`}
												>
													<BlueButton loading={false} fullWidth size="sm">
														<TwitterLogo /> X
													</BlueButton>
												</a>
											</div>
										</>
									) : null}

									{e.github ? (
										<>
											{/* Check if the expert has a website and a GitHub profile, but not a Twitter */}
											{e.website && !e.x ? (
												<>
													<Spacer />
													<Spacer />
												</>
											) : null}

											{e.x ? (
												<>
													<Spacer />
													<Spacer />
												</>
											) : null}

											<div style={flex} className={styles.docsButton}>
												<a
													style={docsButton}
													target={'_blank'}
													href={`https://github.com/${e.github}`}
												>
													<BlueButton loading={false} fullWidth size="sm">
														<GitHubLogo /> GitHub
													</BlueButton>
												</a>
											</div>
										</>
									) : null}
								</div>
								<Spacer />
								<Spacer />
								<div
									style={{
										display: 'flex',
										flexDirection: 'row',
										width: '100%',
									}}
									className={`${styles.buttonsInColumn}`}
								>
									{e.linkedin ? (
										<div style={flex} className={styles.docsButton}>
											<a
												style={docsButton}
												target={'_blank'}
												href={`https://www.linkedin.com/${e.linkedin}`}
											>
												<BlueButton loading={false} fullWidth size="sm">
													<LinkedInLogo /> LinkedIn
												</BlueButton>
											</a>
										</div>
									) : null}

									{e.email ? (
										<>
											{e.linkedin ? (
												<>
													<Spacer />
													<Spacer />
												</>
											) : null}
											<div style={flex} className={styles.docsButton}>
												<a
													style={docsButton}
													target={'_blank'}
													href={`mailto:${e.email}`}
												>
													<BlueButton loading={false} fullWidth size="sm">
														<EmailLogo /> Email
													</BlueButton>
												</a>
											</div>
										</>
									) : null}

									{e.videocall ? (
										<>
											<Spacer />
											<Spacer />
											<div style={flex} className={styles.docsButton}>
												<a
													style={docsButton}
													target={'_blank'}
													href={`https://cal.com/${e.videocall}`}
												>
													<BlueButton loading={false} fullWidth size="sm">
														<VideoCallLogo /> Call
													</BlueButton>
												</a>
											</div>
										</>
									) : null}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</Layout>
	);
};

export default Experts;
