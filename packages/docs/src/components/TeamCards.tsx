import React from 'react';
import {BlueButton} from '../../components/layout/Button';
import {Spacer} from '../../components/layout/Spacer';
import TeamCardsCSS from './TeamCardsCSS.module.css';
import {EmailLogo, GitHubLogo, LinkedInLogo, TwitterLogo} from './icons';

const ButtonMailto = ({mailto, label}) => {
	return <a href={mailto}>{label}</a>;
};

export default ButtonMailto;

const panel: React.CSSProperties = {
	backgroundColor: 'var(--ifm-background-color)',
	boxShadow: 'var(--box-shadow)',
	padding: 10,
	borderRadius: 15,
	flex: 1,
	paddingTop: 30,
	paddingBottom: 10,
	minHeight: 600,
	display: 'flex',
	flexDirection: 'column',
};

const center: React.CSSProperties = {
	textAlign: 'center',
};

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
};

const flex: React.CSSProperties = {
	flex: 1,
};

const step: React.CSSProperties = {
	flex: 1,
	...panel,
};

const list: React.CSSProperties = {
	listStyleType: 'none',
	textAlign: 'center',
	paddingLeft: 0,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	fontWeight: 500,
};

const stepTitle: React.CSSProperties = {
	textAlign: 'center',
	fontSize: '1.6em',
	marginBottom: 0,
	color: 'var(--ifm-color-primary)',
};

const docsButton: React.CSSProperties = {
	textDecoration: 'none',
};

export const TeamCardsLayout: React.FC<{}> = () => {
	return (
		<div className={TeamCardsCSS.row}>
			<div style={step}>
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<img
						src={'/img/team/jonny.png'}
						style={{
							width: 250,
							height: 250,
							boxShadow: 'var(--box-shadow)',
							borderRadius: 1500,
						}}
					/>
				</div>
				<Spacer />
				<Spacer />
				<Spacer />
				<Spacer />
				<Spacer />
				<h2 style={stepTitle}>Jonny</h2>
				<strong style={center}>Chief Hacker</strong>

				<ul style={{...list, flex: 1}}>
					<li>
						{
							"I'm interested in engineering, art and business - Remotion is my dream job because I get to combine the three of them!"
						}{' '}
					</li>
				</ul>

				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
					}}
				>
					{
						<>
							<div style={flex}>
								<a
									style={docsButton}
									target="_blank"
									href="https://twitter.com/JNYBGR"
								>
									<BlueButton loading={false} fullWidth size="sm">
										<TwitterLogo /> Twitter
									</BlueButton>
								</a>
							</div>
							<Spacer />
							<Spacer />
						</>
					}
					<div style={flex}>
						<a
							style={docsButton}
							target="_blank"
							href="https://ch.linkedin.com/in/jonny-burger-4115109b"
						>
							<BlueButton loading={false} fullWidth size="sm">
								<LinkedInLogo /> LinkedIn
							</BlueButton>
						</a>
					</div>
				</div>
				<div style={{height: 10}} />

				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
					}}
				>
					<div style={flex}>
						<a
							style={docsButton}
							target="_blank"
							href="https://github.com/JonnyBurger"
						>
							<BlueButton loading={false} fullWidth size="sm">
								<GitHubLogo /> GitHub
							</BlueButton>
						</a>
					</div>
					<Spacer />
					<Spacer />
					<div style={flex}>
						<a
							style={docsButton}
							target="_blank"
							href="mailto:jonny@remotion.dev"
						>
							<BlueButton loading={false} fullWidth size="sm">
								<EmailLogo /> E-Mail
							</BlueButton>
						</a>
					</div>
				</div>
			</div>
			<Spacer />
			<Spacer />
			<Spacer />
			<div style={step}>
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<img
						src={'/img/team/mehmet.png'}
						style={{
							width: 250,
							height: 250,
							boxShadow: 'var(--box-shadow)',
							borderRadius: 1500,
						}}
					/>
				</div>
				<Spacer />
				<Spacer />
				<Spacer />
				<Spacer />
				<Spacer />

				<h2 style={stepTitle}>Mehmet</h2>
				<strong style={center}>Business Manager</strong>

				<ul style={{...list, flex: 1}}>
					<li>
						{
							'Transitioning from traditional business, Remotion allowed me to merge my passion for technology and business in a distinctive way.'
						}
					</li>
				</ul>
				<div style={row}>
					{
						<>
							<div style={flex}>
								<a
									style={docsButton}
									target="_blank"
									href="https://twitter.com/mehmetademi"
								>
									<BlueButton loading={false} fullWidth size="sm">
										<TwitterLogo /> Twitter
									</BlueButton>
								</a>
							</div>
							<Spacer />
							<Spacer />
						</>
					}
					<div style={flex}>
						<a
							style={docsButton}
							target="_blank"
							href="https://www.linkedin.com/in/mehmetademi"
						>
							<BlueButton loading={false} fullWidth size="sm">
								<LinkedInLogo /> LinkedIn
							</BlueButton>
						</a>
					</div>
				</div>
				<div style={{height: 10}} />
				<div style={row}>
					{
						<>
							<div style={flex}>
								<a
									style={docsButton}
									target="_blank"
									href="https://github.com/MehmetAdemi"
								>
									<BlueButton loading={false} fullWidth size="sm">
										<GitHubLogo /> GitHub
									</BlueButton>
								</a>
							</div>
							<Spacer />
							<Spacer />
							<div style={flex}>
								<a
									style={docsButton}
									target="_blank"
									href="mailto:mehmet@remotion.dev"
								>
									<BlueButton loading={false} fullWidth size="sm">
										<EmailLogo /> E-Mail
									</BlueButton>
								</a>
							</div>
						</>
					}
				</div>
			</div>
			<Spacer />
			<Spacer />
			<Spacer />
		</div>
	);
};
