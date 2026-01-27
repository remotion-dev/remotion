import React from 'react';

const investors = [
	{img: '/img/investors/foronered.png', name: 'For One Red', role: 'Design Studio'},
	{img: '/img/investors/heiko.jpeg', name: 'Heiko Hubertz', role: 'Founder & CEO, Oxolo'},
	{img: '/img/investors/simon.jpeg', name: 'Simon Schmid', role: 'Product, iubenda'},
	{img: '/img/investors/william.jpeg', name: 'William Candillon', role: 'Can it be done in React Native?'},
	{img: '/img/investors/sebastien.jpeg', name: 'Sébastien Lorber', role: 'This Week in React, Docusaurus'},
	{img: '/img/investors/nick.jpeg', name: 'Nick Dima', role: 'Senior Engineering Manager, Musixmatch'},
	{img: '/img/investors/steven.jpeg', name: 'Stephen Sullivan', role: 'Founder, Middy.com'},
	{img: '/img/investors/dominic.jpeg', name: 'Dominic Monn', role: 'Founder, MentorCruise'},
	{img: '/img/investors/jeremy.jpeg', name: 'Jeremy Toeman', role: 'Founder, augxlabs.com'},
	{img: '/img/investors/robbie.jpeg', name: 'Robbie Zhang-Smitheran', role: 'Cameo.com'},
	{img: '/img/investors/ilya.jpeg', name: 'Ilya Lyamkin', role: 'Senior Software Engineer, Spotify'},
	{img: '/img/investors/lucas.jpeg', name: 'Lucas Pelloni', role: 'Co-Founder, Nestermind'},
	{img: '/img/investors/michiel.jpeg', name: 'Michiel Westerbeek', role: 'Co-Founder, Tella'},
	{img: '/img/investors/vjeux.jpg', name: 'Christopher Chedeau', role: 'Co-Creator of Excalidraw and React Native'},
	{img: '/img/investors/david.jpeg', name: 'David Salib', role: 'Co-Founder, Momento'},
];

const gridStyles = `
.investor-grid {
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	gap: 20px;
}

@media (max-width: 768px) {
	.investor-grid {
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}
}
`;

const image: React.CSSProperties = {
	width: '100%',
};

const title: React.CSSProperties = {
	color: 'var(--ifm-color-primary)',
	marginBottom: 0,
	fontSize: 14,
};

const subtitle: React.CSSProperties = {
	color: 'var(--light-text-color)',
	fontSize: 12,
	lineHeight: 1.25,
};

export const InvestorGrid: React.FC = () => {
	return (
		<>
			<style>{gridStyles}</style>
			<div className="investor-grid">
				{investors.map((investor) => (
					<div key={investor.name}>
						<img style={image} src={investor.img} />
						<h3 style={title}>{investor.name}</h3>
						<div style={subtitle}>{investor.role}</div>
					</div>
				))}
			</div>
		</>
	);
};
