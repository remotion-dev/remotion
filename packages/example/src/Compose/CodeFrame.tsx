import React from 'react';
import {staticFile} from 'remotion';

const Tab: React.FC = () => {
	return <span style={{width: 18, display: 'inline-block'}}></span>;
};
export const CodeFrame = () => {
	staticFile('video.mp4');
	return (
		<div
			style={{whiteSpace: 'pre', fontFamily: 'Fira Code'}}
			className="text-white p-8 text-2xl"
		>
			<span style={{color: '#F87683'}}>const</span>{' '}
			<span style={{color: '#B392F0'}}>MyVideo</span>{' '}
			<span style={{color: '#F87683'}}>=</span> (){' '}
			<span style={{color: '#F87683'}}>{'=> '}</span>
			{'{ '}
			<br />
			<span style={{color: '#F87683'}}>
				<Tab />
				{'return '}
			</span>
			{'( \n'}
			<span>
				<Tab />
				<Tab />
				<span>{'<'}</span>
				<span style={{color: '#79B8FF'}}>{'AbsoluteFill'}</span>
			</span>
			{'>\n'}
			<Tab />
			<Tab />
			<Tab />
			{'<'}
			<span style={{color: '#79B8FF'}}>{'Video\n'}</span>
			<Tab />
			<Tab />
			<Tab />
			<Tab />
			<span style={{color: '#B392F0'}}>{'src='}</span>
			{'{'}
			<span style={{color: '#B392F0'}}>{'staticFile'}</span>
			{'('}
			<span style={{color: '#9ECBFF'}}>{"'video.mp4'"}</span>
			{')}\n'}
			<Tab />
			<Tab /> {'/>\n'}
			<Tab />
			<Tab /> {'<'}
			<span style={{color: '#79B8FF'}}>{'Sequence'}</span>
			<span style={{color: '#B392F0'}}>{' from'}</span>
			{'={'}
			<span style={{color: '#79B8FF'}}>{'60'}</span>
			{'}>'}
			<br />
			<Tab />
			<Tab />
			<Tab />
			<Tab />
			{'<'}
			<span style={{color: '#79B8FF'}}>{'BRoll'}</span>
			{' />\n'}
			<Tab />
			<Tab />
			<Tab />
			{'</'}
			<span style={{color: '#79B8FF'}}>{'Sequence'}</span>
			{'>\n'}
			<Tab />
			<Tab />
			<Tab />
			{'<'}
			<span style={{color: '#79B8FF'}}>{'AbsoluteFill'}</span>
			{'>\n'}
			<Tab />
			<Tab />
			<Tab />
			<Tab />
			{'<'}
			<span style={{color: '#79B8FF'}}>{'Captions'}</span>
			{' />\n'}
			<Tab />
			<Tab />
			<Tab />
			{'</'}
			<span style={{color: '#79B8FF'}}>{'AbsoluteFill'}</span>
			{'>\n'}
			<Tab />
			<Tab />
			{'</'}
			<span style={{color: '#79B8FF'}}>{'AbsoluteFill'}</span>
			{'>\n'}
			<Tab />
			{');\n'}
			{'};'}
		</div>
	);
};
