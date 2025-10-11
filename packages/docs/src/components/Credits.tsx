import React from 'react';
import './credits.css';

const cardContainerStyle: React.CSSProperties = {
	display: 'flex',
	flexWrap: 'wrap',
	justifyContent: 'flex-start',
};

const avatarStyle: React.CSSProperties = {
	width: 70,
	height: 70,
	borderRadius: '50%',
	marginRight: '20px',
	flexShrink: 0,
};

const linkStyle: React.CSSProperties = {
	textDecoration: 'none',
	fontSize: '0.9em',
	color: '#000000',
};

interface Contributor {
	username: string;
	contribution: string;
}

interface CreditsProps {
	readonly contributors: Contributor[];
}

const ContributorComp: React.FC<{
	readonly contributor: Contributor;
}> = ({contributor}) => {
	const cardStyle: React.CSSProperties = {
		width: '300px',
		overflow: 'hidden',
		display: 'flex',
		color: 'var(--text-color)',
		alignItems: 'center',
		marginTop: 5,
		marginBottom: 5,
	};

	if (!contributor.username) {
		throw new Error('Contributor username is required');
	}

	if (!contributor.contribution) {
		throw new Error('Contributor contribution is required');
	}

	return (
		<a
			href={`https://github.com/${contributor.username}`}
			target="_blank"
			rel="noopener noreferrer"
			className="credits-contributors"
			style={{...linkStyle, color: 'var(--text-color)'}}
		>
			<div key={contributor.username} style={cardStyle}>
				<img
					src={`https://github.com/${contributor.username}.png`}
					alt={contributor.username}
					style={avatarStyle}
				/>
				<div
					style={{
						color: 'var(--text-color)',
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<strong>{contributor.username}</strong>
					<div
						style={{
							color: 'var(--text-color)',
							lineHeight: 1.4,
						}}
					>
						{contributor.contribution}
					</div>
				</div>
			</div>
		</a>
	);
};

const titleContainer: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	marginBottom: 15,
	marginTop: 15,
};

const titleLine: React.CSSProperties = {
	height: 1,
	backgroundColor: 'var(--light-text-color)',
	flex: 1,
};

const title: React.CSSProperties = {
	marginRight: 10,
	fontFamily: 'GTPlanar',
	color: 'var(--light-text-color)',
};

export const Credits: React.FC<CreditsProps> = ({contributors}) => {
	return (
		<div>
			<div style={titleContainer}>
				<div style={title}>CONTRIBUTORS</div>
				<div style={titleLine} />
			</div>
			<div style={cardContainerStyle}>
				{contributors.map((contributor) => (
					<ContributorComp
						key={contributor.username}
						contributor={contributor}
					/>
				))}
			</div>
		</div>
	);
};
