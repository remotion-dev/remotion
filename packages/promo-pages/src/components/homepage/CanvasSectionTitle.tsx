import React, {useEffect, useRef} from 'react';
import {useColorMode} from './layout/use-color-mode';

export const CanvasSectionTitle: React.FC<{
	readonly children: string;
}> = ({children}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const {colorMode} = useColorMode();

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const draw = () => {
			const rect = canvas.getBoundingClientRect();
			const dpr = window.devicePixelRatio || 1;
			const width = Math.max(1, rect.width);
			const height = Math.max(1, rect.height);

			canvas.width = Math.floor(width * dpr);
			canvas.height = Math.floor(height * dpr);

			const ctx = canvas.getContext('2d');
			if (!ctx) {
				return;
			}

			ctx.scale(dpr, dpr);
			ctx.clearRect(0, 0, width, height);
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';

			const fontSize = Math.min(66, Math.max(48, height * 0.78));
			ctx.font = `900 ${fontSize}px GTPlanar, sans-serif`;
			const measured = ctx.measureText(children).width;
			const maxWidth = width;
			const scale = measured > maxWidth ? maxWidth / measured : 1;

			ctx.save();
			ctx.scale(scale, 1);
			ctx.font = `900 ${fontSize}px GTPlanar, sans-serif`;
			ctx.lineJoin = 'round';
			ctx.lineWidth = 1.5;
			const color = colorMode === 'dark' ? '#fff' : '#000';
			ctx.strokeStyle = color;
			ctx.fillStyle = color;
			ctx.strokeText(children, 0, height / 2);
			ctx.fillText(children, 0, height / 2);
			ctx.restore();
		};

		const resizeObserver = new ResizeObserver(draw);
		resizeObserver.observe(canvas);
		document.fonts?.load('900 60px GTPlanar').then(draw).catch(() => undefined);
		draw();

		return () => resizeObserver.disconnect();
	}, [children, colorMode]);

	return (
		<canvas
			ref={canvasRef}
			aria-label={children}
			className="block h-20 w-full"
			role="img"
		/>
	);
};
