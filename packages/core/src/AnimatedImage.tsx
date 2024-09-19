import React, { useEffect, useRef, useState } from 'react';
import { useCurrentFrame } from 'remotion';

type AnimatedImageProps = {
  src: string;
};

declare const ImageDecoder: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (options: { data: any, type: string }): any;
};

export const AnimatedImage: React.FC<AnimatedImageProps> = ({ src }) => {
  const [imageDecoder, setImageDecoder] = useState<InstanceType<typeof ImageDecoder> | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFrame = useCurrentFrame();
  const [frameCount, setFrameCount] = useState<number>(1);

  useEffect(() => {
    const decodeImage = async () => {
      if (typeof ImageDecoder === 'undefined') {
        // eslint-disable-next-line no-console
        console.error('ImageDecoder API is not supported in this browser');
        return;
      }

      try {
        const response = await fetch(src);
        const contentType = response.headers.get('Content-Type');
        
        if (!contentType || !['image/gif', 'image/webp', 'image/avif'].includes(contentType)) {
          // eslint-disable-next-line no-console
          console.error('Unsupported image format:', contentType);
          return;
        }

        const decoder = new ImageDecoder({
          data: await response.blob(),
          type: contentType,
        });

        const track = decoder.tracks.selectedTrack;
        setFrameCount(track.frameCount);
        setImageDecoder(decoder);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to decode image:', error);
      }
    };

    decodeImage();
  }, [src]);

  useEffect(() => {
    const renderFrame = async () => {
      if (!imageDecoder || !canvasRef.current) return;

      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const frameIndex = currentFrame % frameCount;
        const { image } = await imageDecoder.decode({ frameIndex });

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error rendering frame:', error);
      }
    };

    renderFrame();
  }, [imageDecoder, currentFrame, frameCount]);

  return <canvas ref={canvasRef} width={320} height={270} />;
};