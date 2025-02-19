import Head from '@docusaurus/Head';
import {useLocation} from '@docusaurus/router';
import Layout from '@theme/Layout';
import React from 'react';
import {Button} from '../../components/layout/Button';
import {Spacer} from '../../components/layout/Spacer';
import {experts} from '../data/experts';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {PALETTE} from '../../components/layout/colors';
import {BackButton} from './BackButton';
import {Seo} from './Seo';

const layout: React.CSSProperties = {
	maxWidth: 900,
	margin: 'auto',
	paddingLeft: 16,
	paddingRight: 16,
};

const header: React.CSSProperties = {
	backgroundColor: PALETTE.BRAND,
	color: 'white',
	paddingTop: 15,
};

const headerRow: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'flex-end',
	marginTop: 15,
	marginBottom: 20,
};

const flexer: React.CSSProperties = {
	flex: 1,
};

const img: React.CSSProperties = {
	height: 100,
	borderRadius: 5,
};

const title: React.CSSProperties = {
	lineHeight: 1,
	paddingLeft: 20,
	paddingBottom: 0,
	marginBottom: 16,
};

const emailButton: React.CSSProperties = {
	marginBottom: 16,
	marginRight: 16,
};

const description: React.CSSProperties = {
	fontSize: 20,
};

const socialIcon: React.CSSProperties = {
	color: PALETTE.BRAND,
	height: 24,
};

const socialIconContainer: React.CSSProperties = {
	width: 36,
	display: 'flex',
	alignItems: 'center',
};

const socialLink: React.CSSProperties = {
	display: 'block',
	maxWidth: 'fit-content',
};

const socialRow: React.CSSProperties = {
	flexDirection: 'row',
	display: 'flex',
	alignItems: 'center',
	marginBottom: 10,
};

const card: React.CSSProperties = {
	backgroundColor: 'var(--footer-background)',
	padding: 20,
	flex: 1,
	flexDirection: 'row',
	display: 'flex',
	fontSize: 13,
	alignItems: 'center',
};

const cardIcon: React.CSSProperties = {
	width: 30,
	marginRight: 20,
	color: 'var(--text-color)',
};

export default () => {
	const location = useLocation();
	const context = useDocusaurusContext();

	const expertSlug = location.pathname.match(/experts\/([a-zA-Z-]+)/);

	if (!expertSlug) {
		throw new Error('no expert slug found');
	}

	const expert = experts.find((e) => e.slug === expertSlug[1]);
	if (!expert) {
		throw new Error('no expert found');
	}

	const imgSrc = `/generated/experts-${expert.slug}.png`;

	return (
		<Layout>
			<Head>
				{Seo.renderTitle(`${expert.name} | Remotion Experts`)}
				{Seo.renderDescription(
					`Hire ${expert.name} and other Remotion experts, vetted by Remotion.`,
				)}
				{Seo.renderImage(imgSrc, context.siteConfig.url)}
			</Head>
			<div style={header}>
				<div style={layout}>
					<BackButton link="/experts" color="white" text="Back to Experts" />
					<div style={headerRow}>
						<img style={img} src={expert.image} />
						<h2 className="big-title-on-desktop" style={title}>
							{expert.name}
						</h2>
						<div style={flexer} />
						<a
							className="only-desktop"
							href={`mailto:${expert.email}`}
							style={{
								textDecoration: 'none',
							}}
						>
							<Button
								background="white"
								hoverColor="white"
								color={'black'}
								fullWidth={false}
								loading={false}
								size="sm"
								style={emailButton}
							>
								Contact
							</Button>
						</a>
					</div>
				</div>
			</div>
			<div style={layout}>
				<h3>About me</h3>
				<p style={description}>{expert.description}</p>
				<h3>Socials</h3>
				{expert.github ? (
					<a
						style={socialLink}
						href={`https://github.com/${expert.github}`}
						target={'_blank'}
					>
						<div style={socialRow}>
							<div style={socialIconContainer}>
								<svg
									style={socialIcon}
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 496 512"
								>
									<path
										fill="currentcolor"
										d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
									/>
								</svg>
							</div>
							@{expert.github}
						</div>
					</a>
				) : null}
				{expert.x ? (
					<a
						style={socialLink}
						href={`https://x.com/${expert.x}`}
						target={'_blank'}
					>
						<div style={socialRow}>
							<div style={socialIconContainer}>
								<svg
									style={socialIcon}
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 512 512"
								>
									<path
										fill="currentcolor"
										d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"
									/>
								</svg>
							</div>
							@{expert.x}
						</div>
					</a>
				) : null}
				{expert.linkedin ? (
					<a
						style={socialLink}
						href={`https://linkedin.com/${expert.linkedin}`}
						target={'_blank'}
					>
						<div style={socialRow}>
							<div style={socialIconContainer}>
								<svg
									fill="currentcolor"
									style={socialIcon}
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 448 512"
								>
									<path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />
								</svg>
							</div>
							{expert.name}
						</div>
					</a>
				) : null}
				<br />
				<h3> Contact me </h3>
				<a style={socialLink} href={`mailto:${expert.email}`} target={'_blank'}>
					<div style={socialRow}>
						<div style={socialIconContainer}>
							<svg
								style={socialIcon}
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 512 512"
							>
								<path
									fill="currentcolor"
									d="M0 128C0 92.65 28.65 64 64 64H448C483.3 64 512 92.65 512 128V384C512 419.3 483.3 448 448 448H64C28.65 448 0 419.3 0 384V128zM48 128V150.1L220.5 291.7C241.1 308.7 270.9 308.7 291.5 291.7L464 150.1V127.1C464 119.2 456.8 111.1 448 111.1H64C55.16 111.1 48 119.2 48 127.1L48 128zM48 212.2V384C48 392.8 55.16 400 64 400H448C456.8 400 464 392.8 464 384V212.2L322 328.8C283.6 360.3 228.4 360.3 189.1 328.8L48 212.2z"
								/>
							</svg>{' '}
						</div>
						{expert.email}
					</div>
				</a>
				{expert.videocall ? (
					<a
						style={socialLink}
						href={`https://cal.com/${expert.videocall}`}
						target={'_blank'}
					>
						<div style={socialRow}>
							<div style={socialIconContainer}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 1339 1339"
									fill="none"
									style={{
										width: 30,
										marginRight: 10,
									}}
								>
									<g filter="url(#filter0_d_1118_90)">
										<path
											d="M229 483.994C229 450.86 255.86 424 288.994 424H708.949C792.654 424 860.511 491.857 860.511 575.563V855.006C860.511 888.14 833.651 915 800.518 915H380.563C296.857 915 229 847.143 229 763.437V483.994Z"
											fill="#0B84F3"
										/>
										<path
											d="M288.994 431.105H708.949C788.731 431.105 853.407 495.781 853.407 575.563V855.006C853.407 884.216 829.727 907.896 800.518 907.896H380.563C300.781 907.896 236.105 843.219 236.105 763.437V483.994C236.105 454.784 259.784 431.105 288.994 431.105Z"
											stroke="#505050"
											strokeWidth="14.209"
										/>
									</g>
									<g filter="url(#filter1_d_1118_90)">
										<path
											d="M898.402 597.835C898.402 577.414 907.19 557.98 922.522 544.492L1042.84 438.648C1068.34 416.217 1108.38 434.323 1108.38 468.283V871.921C1108.38 905.562 1068.99 923.782 1043.35 902L932.908 808.163C911.019 789.565 898.402 762.29 898.402 733.567V597.835Z"
											fill="#0B84F3"
										/>
										<path
											d="M927.215 549.827L1047.53 443.982C1068.44 425.589 1101.28 440.436 1101.28 468.283V871.921C1101.28 899.506 1068.98 914.447 1047.95 896.586L937.508 802.748C917.207 785.5 905.507 760.206 905.507 733.567V597.835C905.507 579.456 913.415 561.966 927.215 549.827Z"
											stroke="#505050"
											strokeWidth="14.209"
										/>
									</g>
								</svg>
							</div>
							@{expert.name}
						</div>
					</a>
				) : null}
				<br />
				<h3>Expert since</h3>
				<div>
					{' '}
					{new Intl.DateTimeFormat('en-US', {
						month: 'long',
						year: 'numeric',
					}).format(expert.since)}{' '}
				</div>
			</div>
			<br />
			<div style={layout}>
				<div className="row-on-desktop">
					<div style={card}>
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
							Remotion Experts are independent freelancers that have proven
							their Remotion expertise.
						</div>
					</div>
					<Spacer />
					<Spacer />
					<div style={card}>
						<svg
							style={{...cardIcon, height: 32}}
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 512 512"
						>
							<path
								fill="currentColor"
								d="M64 64C64 28.7 92.7 0 128 0H354.7c17 0 33.3 6.7 45.3 18.7L429.3 48c12 12 18.7 28.3 18.7 45.3V192h32c17.7 0 32 14.3 32 32v32c0 17.7-14.3 32-32 32V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V288c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32H64V64zm320 64H352c-17.7 0-32-14.3-32-32V64H128V192h18.7c8.5 0 16.6 3.4 22.6 9.4l13.3 13.3c6 6 14.1 9.4 22.6 9.4H306.7c8.5 0 16.6-3.4 22.6-9.4l13.3-13.3c6-6 14.1-9.4 22.6-9.4H384V128zM160 288c-8.8 0-16 7.2-16 16s7.2 16 16 16s16-7.2 16-16s-7.2-16-16-16zm64 0c-8.8 0-16 7.2-16 16s7.2 16 16 16s16-7.2 16-16s-7.2-16-16-16zm64 0c-8.8 0-16 7.2-16 16s7.2 16 16 16s16-7.2 16-16s-7.2-16-16-16zm64 0c-8.8 0-16 7.2-16 16s7.2 16 16 16s16-7.2 16-16s-7.2-16-16-16zm64 0c-8.8 0-16 7.2-16 16s7.2 16 16 16s16-7.2 16-16s-7.2-16-16-16zM96 288c-8.8 0-16 7.2-16 16s7.2 16 16 16s16-7.2 16-16s-7.2-16-16-16zm64 128c-8.8 0-16 7.2-16 16s7.2 16 16 16H352c8.8 0 16-7.2 16-16s-7.2-16-16-16H160zm-32-32c8.8 0 16-7.2 16-16s-7.2-16-16-16s-16 7.2-16 16s7.2 16 16 16zm64 0c8.8 0 16-7.2 16-16s-7.2-16-16-16s-16 7.2-16 16s7.2 16 16 16zm80-16c0-8.8-7.2-16-16-16s-16 7.2-16 16s7.2 16 16 16s16-7.2 16-16zm48 16c8.8 0 16-7.2 16-16s-7.2-16-16-16s-16 7.2-16 16s7.2 16 16 16zm80-16c0-8.8-7.2-16-16-16s-16 7.2-16 16s7.2 16 16 16s16-7.2 16-16z"
							/>
						</svg>
						<div style={{flex: 1}}>
							To apply as a Remotion Expert, write to hi@remotion.dev.
						</div>
					</div>
				</div>
			</div>
			<br />
		</Layout>
	);
};
