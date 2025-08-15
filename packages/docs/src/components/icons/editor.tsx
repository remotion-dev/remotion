import type {SVGProps} from 'react';
import React from 'react';

export const EditorIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			viewBox="0 0 64 64"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			{/* Background */}
			<path d="M12,0 L52,0 Q64,0 64,12 L64,52 Q64,64 52,64 L12,64 Q0,64 0,52 L0,12 Q0,0 12,0 Z" fill="currentColor"/>
			
			{/* Main editor window */}
			<path d="M10,4 L54,4 Q60,4 60,10 L60,40 Q60,46 54,46 L10,46 Q4,46 4,40 L4,10 Q4,4 10,4 Z" fill="white" stroke="currentColor" strokeWidth="2"/>
			
			{/* Video preview area */}
			<path d="M12,8 L52,8 Q56,8 56,12 L56,34 Q56,38 52,38 L12,38 Q8,38 8,34 L8,12 Q8,8 12,8 Z" fill="currentColor"/>
			
			{/* Play button in center */}
			<path d="M28,20 L28,28 L36,24 Z" fill="white"/>
			
			{/* Timeline area */}
			<path d="M8,48 L56,48 Q60,48 60,52 L60,56 Q60,60 56,60 L8,60 Q4,60 4,56 L4,52 Q4,48 8,48 Z" fill="currentColor"/>
			
			{/* Timeline tracks */}
			<path d="M7,50 L57,50 Q58,50 58,51 L58,51 Q58,52 57,52 L7,52 Q6,52 6,51 L6,51 Q6,50 7,50 Z" fill="white" opacity="0.3"/>
			<path d="M7,54 L57,54 Q58,54 58,55 L58,55 Q58,56 57,56 L7,56 Q6,56 6,55 L6,55 Q6,54 7,54 Z" fill="white" opacity="0.3"/>
			<path d="M7,58 L57,58 Q58,58 58,59 L58,59 Q58,60 57,60 L7,60 Q6,60 6,59 L6,59 Q6,58 7,58 Z" fill="white" opacity="0.3"/>
			
			{/* Video clips on timeline */}
			<path d="M9,49 L19,49 Q20,49 20,50 L20,52 Q20,53 19,53 L9,53 Q8,53 8,52 L8,50 Q8,49 9,49 Z" fill="white"/>
			<path d="M23,49 L29,49 Q30,49 30,50 L30,52 Q30,53 29,53 L23,53 Q22,53 22,52 L22,50 Q22,49 23,49 Z" fill="white"/>
			<path d="M33,49 L47,49 Q48,49 48,50 L48,52 Q48,53 47,53 L33,53 Q32,53 32,52 L32,50 Q32,49 33,49 Z" fill="white"/>
			
			{/* Audio clips on timeline */}
			<path d="M9,53 L27,53 Q28,53 28,54 L28,56 Q28,57 27,57 L9,57 Q8,57 8,56 L8,54 Q8,53 9,53 Z" fill="white" opacity="0.7"/>
			<path d="M31,53 L47,53 Q48,53 48,54 L48,56 Q48,57 47,57 L31,57 Q30,57 30,56 L30,54 Q30,53 31,53 Z" fill="white" opacity="0.7"/>
			
			{/* Playhead indicator */}
			<path d="M25,48 L27,48 L27,60 L25,60 Z" fill="white"/>
			<path d="M25,47 L27,47 L26,45 Z" fill="white"/>
		</svg>
	);
};
