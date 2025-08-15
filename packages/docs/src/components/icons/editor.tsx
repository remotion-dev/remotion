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
			<rect width="64" height="64" rx="12" fill="currentColor"/>
			
			{/* Main editor window */}
			<rect x="4" y="4" width="56" height="42" rx="6" fill="white" stroke="currentColor" strokeWidth="2"/>
			
			{/* Video preview area */}
			<rect x="8" y="8" width="48" height="30" rx="4" fill="currentColor"/>
			
			{/* Play button in center */}
			<polygon points="28,20 28,28 36,24" fill="white"/>
			
			{/* Timeline area */}
			<rect x="4" y="48" width="56" height="12" rx="4" fill="currentColor"/>
			
			{/* Timeline tracks */}
			<rect x="6" y="50" width="52" height="2" rx="1" fill="white" opacity="0.3"/>
			<rect x="6" y="54" width="52" height="2" rx="1" fill="white" opacity="0.3"/>
			<rect x="6" y="58" width="52" height="2" rx="1" fill="white" opacity="0.3"/>
			
			{/* Video clips on timeline */}
			<rect x="8" y="49" width="12" height="4" rx="1" fill="white"/>
			<rect x="22" y="49" width="8" height="4" rx="1" fill="white"/>
			<rect x="32" y="49" width="16" height="4" rx="1" fill="white"/>
			
			{/* Audio clips on timeline */}
			<rect x="8" y="53" width="20" height="4" rx="1" fill="white" opacity="0.7"/>
			<rect x="30" y="53" width="18" height="4" rx="1" fill="white" opacity="0.7"/>
			
			{/* Playhead indicator */}
			<rect x="25" y="48" width="2" height="12" fill="white"/>
			<polygon points="25,47 27,47 26,45" fill="white"/>
		</svg>
	);
};
