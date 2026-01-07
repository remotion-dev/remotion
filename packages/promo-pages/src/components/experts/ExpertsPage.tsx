import {Card} from '@remotion/design';
import React, {useMemo} from 'react';
import {random} from 'remotion';
import {BlueButton} from '../homepage/layout/Button';
import {Spacer} from '../homepage/Spacer';
import {experts} from './experts-data';
import {
	EmailLogo,
	GitHubLogo,
	LinkedInLogo,
	PersonalWebsite,
	TwitterLogo,
	VideoCallLogo,
} from './experts-icons';

const dateString = (date: Date) =>
	date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();

const todayHash = dateString(new Date());

const docsButtonStyle: React.CSSProperties = {
	textDecoration: 'none',
};

const flex: React.CSSProperties = {
	flex: 1,
};

const linkStyle: React.CSSProperties = {
	textDecoration: 'none',
	color: 'inherit',
	width: '100%',
	display: 'flex',
	flexDirection: 'row',
	paddingTop: 8,
};

const infoCard: React.CSSProperties = {
	backgroundColor: 'var(--footer-background)',
	padding: 20,
	flex: 1,
	flexDirection: 'row',
	display: 'flex',
	fontSize: 13,
	alignItems: 'center',
	maxWidth: 700,
	margin: '20px auto',
	border: '1px solid var(--ifm-color-emphasis-300)',
	borderRadius: 8,
};

const cardIcon: React.CSSProperties = {
	width: 30,
	marginRight: 20,
	color: 'var(--text-color)',
};

const wrapperStyle: React.CSSProperties = {
	maxWidth: 1000,
	margin: 'auto',
	paddingTop: 60,
	paddingLeft: 20,
	paddingRight: 20,
};

const cardStyle: React.CSSProperties = {
	padding: 16,
	borderRadius: 6,
	marginBottom: 16,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
};

const profileStyle: React.CSSProperties = {
	height: 200,
	borderRadius: 100,
};

const spacerStyle: React.CSSProperties = {
	height: 20,
	width: 20,
};

const titleStyle: React.CSSProperties = {
	fontSize: '1.2rem',
	marginBottom: 0,
	fontWeight: 'bold',
};

const rightStyle: React.CSSProperties = {
	width: '100%',
};

type ExpertsPageProps = {
	readonly Link: React.ComponentType<{
		style?: React.CSSProperties;
		className?: string;
		href: string;
		children: React.ReactNode;
	}>;
};

export const ExpertsPageContent: React.FC<ExpertsPageProps> = ({Link}) => {
	const expertsInRandomOrder = useMemo(() => {
		if (typeof window === 'undefined') {
			return [];
		}

		// Have a different order every day.
		return experts.sort(
			(a, b) => random(a.name + todayHash) - random(b.name + todayHash),
		);
	}, []);

	return (
		<div className="relative bg-[var(--background)]">
			<div style={wrapperStyle}>
				<h1 className="experts-pagetitle">Find a Remotion Expert</h1>
				<p className="experts-tagline">
					Get help by booking a call or hiring these freelancers to work on your
					Remotion project.
					<br />
					They appear in random order.{' '}
				</p>
				<p className="experts-tagline">
					<a href="mailto:hi@remotion.dev?subject=Remotion+Experts+directory">
						<strong>Are you available for hire? Let us know!</strong>
					</a>
				</p>

				<div style={infoCard}>
					<svg
						viewBox="0 0 661 512"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						style={cardIcon}
					>
						<g clipPath="url(#clip0_1_2)">
							<path
								d="M511.5 213C532.991 213 551.678 225.088 561.08 242.842C580.293 236.943 602.018 241.615 617.201 256.799C632.385 271.982 637.057 293.765 631.158 312.92C648.912 322.322 661 341.009 661 362.5C661 383.991 648.912 402.678 631.158 412.08C637.057 431.293 632.385 453.018 617.201 468.201C602.018 483.385 580.235 488.057 561.08 482.158C551.678 499.912 532.991 512 511.5 512C490.009 512 471.322 499.912 461.92 482.158C442.707 488.057 420.982 483.385 405.799 468.201C390.615 453.018 385.943 431.235 391.842 412.08C374.088 402.678 362 383.991 362 362.5C362 341.009 374.088 322.322 391.842 312.92C385.943 293.707 390.615 271.982 405.799 256.799C420.982 241.615 442.765 236.943 461.92 242.842C471.322 225.088 490.009 213 511.5 213ZM568.146 344.396L578.074 334.469L558.219 314.672L548.291 324.599L492.812 380.078L470.037 357.303L460.109 347.375L440.312 367.172L450.24 377.1L482.943 409.803L492.871 419.73L502.799 409.803L568.146 344.396Z"
								fill="currentcolor"
							/>
							<path
								d="M184 48H328C332.4 48 336 51.6 336 56V96H176V56C176 51.6 179.6 48 184 48ZM128 56V96H64C28.7 96 0 124.7 0 160V256H192H352H360.2C392.5 216.9 441.3 192 496 192C501.4 192 506.7 192.2 512 192.7V160C512 124.7 483.3 96 448 96H384V56C384 25.1 358.9 0 328 0H184C153.1 0 128 25.1 128 56ZM320 352H224C206.3 352 192 337.7 192 320V288H0V416C0 451.3 28.7 480 64 480H360.2C335.1 449.6 320 410.5 320 368C320 362.6 320.2 357.3 320.7 352H320Z"
								fill="currentcolor"
							/>
						</g>
						<defs>
							<clipPath id="clip0_1_2">
								<rect width="661" height="512" fill="white" />
							</clipPath>
						</defs>
					</svg>
					<div style={{flex: 1}}>
						Remotion Experts are independent freelancers with proven Remotion
						expertise and portfolios. However, due diligence is recommended
						before hiring.
					</div>
				</div>

				<br />
				<br />
				{expertsInRandomOrder.map((e) => {
					return (
						<Card key={e.name} style={cardStyle}>
							<Link
								style={linkStyle}
								className="experts-card-content"
								href={`/experts/${e.slug}`}
							>
								<img
									className="experts-profile"
									style={profileStyle}
									src={e.image}
								/>
								<div style={spacerStyle} />
								<div style={rightStyle}>
									<div style={titleStyle}>{e.name}</div>
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
								className="experts-buttons-in-column"
							>
								{e.website ? (
									<div style={flex} className="experts-docs-button">
										<a
											style={docsButtonStyle}
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

										<div style={flex} className="experts-docs-button">
											<a
												style={docsButtonStyle}
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

										<div style={flex} className="experts-docs-button">
											<a
												style={docsButtonStyle}
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
								className="experts-buttons-in-column"
							>
								{e.linkedin ? (
									<div style={flex} className="experts-docs-button">
										<a
											style={docsButtonStyle}
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
										<div style={flex} className="experts-docs-button">
											<a
												style={docsButtonStyle}
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
										<div style={flex} className="experts-docs-button">
											<a
												style={docsButtonStyle}
												target={'_blank'}
												href={e.videocall}
											>
												<BlueButton loading={false} fullWidth size="sm">
													<VideoCallLogo /> Call
												</BlueButton>
											</a>
										</div>
									</>
								) : null}
							</div>
						</Card>
					);
				})}
			</div>
		</div>
	);
};
