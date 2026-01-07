import React, {useMemo} from 'react';
import {random} from 'remotion';
import {
	EmailLogo,
	GitHubLogo,
	LinkedInLogo,
	TwitterLogo,
} from '../team/TeamCards';
import type {Expert} from './experts-data';
import {experts} from './experts-data';
import {PersonalWebsite} from './experts-icons';

const arrowIcon: React.CSSProperties = {
	height: 16,
	marginLeft: 10,
};

const dateString = (date: Date) =>
	date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();

const todayHash = dateString(new Date());

const infoCard: React.CSSProperties = {
	backgroundColor: 'var(--footer-background)',
	padding: 20,
	flex: 1,
	flexDirection: 'row',
	display: 'flex',
	fontSize: 13,
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
	paddingBottom: 100,
};

type ExpertCardProps = {
	readonly expert: Expert;
	readonly Link: React.ComponentType<{
		style?: React.CSSProperties;
		className?: string;
		href: string;
		children: React.ReactNode;
	}>;
};

const ExpertCard: React.FC<ExpertCardProps> = ({expert, Link}) => {
	return (
		<div className="flex-1 rounded-[15px] flex flex-col md:flex-row gap-2 md:gap-4">
			<Link
				href={`/experts/${expert.slug}`}
				className="no-underline text-inherit"
			>
				<img
					src={expert.image}
					className="w-[250px] h-[250px] rounded-xl border-effect object-cover"
				/>
			</Link>
			<div className="flex flex-col border-effect px-4 py-3 bg-pane flex-1">
				<Link
					href={`/experts/${expert.slug}`}
					className="no-underline text-inherit"
				>
					<h2 className="text-[1.6em] mb-1 mt-3 text-[var(--ifm-color-primary)] font-brand">
						{expert.name}
					</h2>
				</Link>
				<div className="mt-2 mb-3 leading-normal font-brand">
					{expert.description}
				</div>
				<div className="leading-6 mb-4">
					<Link
						className="no-underline text-brand font-brand font-bold inline-flex flex-row items-center"
						href={`/experts/${expert.slug}`}
					>
						View profile{' '}
						<svg
							style={arrowIcon}
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 448 512"
						>
							<path
								fill="currentColor"
								d="M438.6 278.6l-160 160C272.4 444.9 264.2 448 256 448s-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L338.8 288H32C14.33 288 .0016 273.7 .0016 256S14.33 224 32 224h306.8l-105.4-105.4c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l160 160C451.1 245.9 451.1 266.1 438.6 278.6z"
							/>
						</svg>
					</Link>
					{expert.videocall ? (
						<>
							<br />
							<a
								className="no-underline text-brand font-brand font-bold inline-flex flex-row items-center"
								target="_blank"
								href={expert.videocall}
							>
								Book a call{' '}
								<svg
									style={arrowIcon}
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 448 512"
								>
									<path
										fill="currentColor"
										d="M438.6 278.6l-160 160C272.4 444.9 264.2 448 256 448s-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L338.8 288H32C14.33 288 .0016 273.7 .0016 256S14.33 224 32 224h306.8l-105.4-105.4c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l160 160C451.1 245.9 451.1 266.1 438.6 278.6z"
									/>
								</svg>
							</a>
						</>
					) : null}
				</div>
				<div className="flex-1" />
				<div className="gap-3 flex flex-row flex-wrap">
					{expert.website ? (
						<a
							className="no-underline text-inherit"
							target="_blank"
							href={expert.website}
						>
							<PersonalWebsite />
						</a>
					) : null}
					{expert.x ? (
						<a
							className="no-underline text-inherit"
							target="_blank"
							href={`https://x.com/${expert.x}`}
						>
							<TwitterLogo />
						</a>
					) : null}
					{expert.github ? (
						<a
							className="no-underline text-inherit"
							target="_blank"
							href={`https://github.com/${expert.github}`}
						>
							<GitHubLogo />
						</a>
					) : null}
					{expert.linkedin ? (
						<a
							className="no-underline text-inherit"
							target="_blank"
							href={`https://www.linkedin.com/${expert.linkedin}`}
						>
							<LinkedInLogo />
						</a>
					) : null}
					{expert.email ? (
						<a
							className="no-underline text-inherit"
							target="_blank"
							href={`mailto:${expert.email}`}
						>
							<EmailLogo />
						</a>
					) : null}
				</div>
			</div>
		</div>
	);
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
						expertise and portfolios. However,{' '}
						<strong> perform due diligence </strong> before hiring. <br />{' '}
						Remotion does not arbitrate disputes between experts and clients.
					</div>
				</div>
				<br />
				<div className="flex flex-col gap-12 md:gap-4">
					{expertsInRandomOrder.map((e) => {
						return <ExpertCard key={e.name} expert={e} Link={Link} />;
					})}
				</div>
			</div>
		</div>
	);
};
