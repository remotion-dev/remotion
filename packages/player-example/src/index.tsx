import React, {ComponentType} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import CarSlideshow from './CarSlideshow';
import {VideoautoplayDemo} from './VideoAutoplay';
import {Thumbnail} from '@remotion/player';
import {ThumbnailDemo} from './ThumbnailDemo';

const rootElement = document.getElementById('root');

createRoot(rootElement as HTMLElement).render(<div style={{}}></div>);
