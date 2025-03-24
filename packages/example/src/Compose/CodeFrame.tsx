import React from 'react';
import {useCurrentFrame} from 'remotion';

const Tab: React.FC = () => {
	return <span style={{width: 18, display: 'inline-block'}}></span>;
};

const Token: React.FC<{
	children: React.ReactNode;
	delay: number;
}> = ({children, delay}) => {
	const frame = useCurrentFrame();
	return <span style={{opacity: frame < delay ? 0 : 1}}>{children}</span>;
};

export const CodeFrame = () => {
	const globalDelay = 0;
	return (
		<div
			style={{whiteSpace: 'pre', fontFamily: 'Fira Code'}}
			className="text-white p-8 text-2xl"
		>
			<Token delay={2 + globalDelay}>
				<span style={{color: '#F87683'}}>const</span>{' '}
			</Token>
			<Token delay={4 + globalDelay}>
				<span style={{color: '#B392F0'}}>MyVideo</span>{' '}
			</Token>
			<Token delay={6 + globalDelay}>
				<span style={{color: '#F87683'}}>=</span> (){' '}
			</Token>
			<Token delay={8 + globalDelay}>
				<span style={{color: '#F87683'}}>{'=>'}</span>
				<span>{' {'}</span>
			</Token>
			<br />
			<Token delay={10 + globalDelay}>
				<span style={{color: '#F87683'}}>
					<Tab />
					{'return '}
				</span>
			</Token>
			<Token delay={12 + globalDelay}>{'( \n'}</Token>
			<Token delay={14 + globalDelay}>
				<Tab />
				<Tab />
				<span>{'<'}</span>
				<span style={{color: '#79B8FF'}}>{'AbsoluteFill'}</span>
				{'>\n'}
			</Token>
			<Token delay={16 + globalDelay}>
				<Tab />
				<Tab />
				<Tab />
				{'<'}
				<span style={{color: '#79B8FF'}}>{'Video\n'}</span>
			</Token>
			<Tab />
			<Tab />
			<Tab />
			<Tab />
			<Token delay={18 + globalDelay}>
				<span style={{color: '#B392F0'}}>{'src='}</span>
				{'{'}
			</Token>
			<Token delay={20 + globalDelay}>
				<span style={{color: '#B392F0'}}>{'staticFile'}</span>
				{'('}
			</Token>
			<Token delay={22 + globalDelay}>
				<span style={{color: '#9ECBFF'}}>{"'video.mp4'"}</span>
				{')}\n'}
			</Token>
			<Token delay={24 + globalDelay}>
				<Tab />
				<Tab /> {'/>\n'}
			</Token>
			<Tab />
			<Token delay={26 + globalDelay}>
				<Tab /> {'<'}
				<span style={{color: '#79B8FF'}}>{'Sequence'}</span>
			</Token>
			<Token delay={28 + globalDelay}>
				<span style={{color: '#B392F0'}}>{' from'}</span>
				{'={'}
			</Token>
			<Token delay={30 + globalDelay}>
				<span style={{color: '#79B8FF'}}>{'60'}</span>
				{'}>'}
			</Token>
			<br />
			<Tab />
			<Tab />
			<Tab />
			<Tab />
			<Token delay={32 + globalDelay}>
				{'<'}
				<span style={{color: '#79B8FF'}}>{'BRoll'}</span>
				{' />\n'}
			</Token>
			<Tab />
			<Tab />
			<Tab />
			<Token delay={34 + globalDelay}>
				{'</'}
				<span style={{color: '#79B8FF'}}>{'Sequence'}</span>
				{'>\n'}
			</Token>
			<Tab />
			<Tab />
			<Tab />
			<Token delay={36 + globalDelay}>
				{'<'}
				<span style={{color: '#79B8FF'}}>{'AbsoluteFill'}</span>
				{'>\n'}
			</Token>
			<Tab />
			<Tab />
			<Tab />
			<Tab />
			<Token delay={38 + globalDelay}>
				{'<'}

				<span style={{color: '#79B8FF'}}>{'Captions'}</span>
				{' />\n'}
			</Token>
			<Tab />
			<Tab />
			<Tab />
			<Token delay={38 + globalDelay}>
				{'</'}
				<span style={{color: '#79B8FF'}}>{'AbsoluteFill'}</span>
				{'>\n'}
			</Token>
			<Tab />
			<Tab />
			<Token delay={40 + globalDelay}>
				{'</'}
				<span style={{color: '#79B8FF'}}>{'AbsoluteFill'}</span>
				{'>\n'}
			</Token>
			<Token delay={42}>
				<Tab />
				{');\n'}
			</Token>
			<Token delay={44}>{'};'}</Token>
		</div>
	);
};
