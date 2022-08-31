import React from "react";
import { random, useVideoConfig } from "remotion";
import {getLength} from '@remotion/paths'
import './bganimation.css'

const style: React.CSSProperties = {
  position: 'absolute',
  width: '100%',
}


const rx = 0.25;
const ry = 0.5


function ellipseToPath(cx: number, cy: number): string {
	let output = 'M' + (cx - rx).toString() + ',' + cy.toString();
	output +=
		'a' +
		rx.toString() +
		',' +
		ry.toString() +
		' 0 1,0 ' +
		(2 * rx).toString() +
		',0';
	output +=
		'a' +
		rx.toString() +
		',' +
		ry.toString() +
		' 0 1,0 ' +
		(-2 * rx).toString() +
		',0';
	return output;
}

export const BackgroundAnimation: React.FC = () => {
  const d = ellipseToPath(0.5, 0.5)
  const length = getLength(d)
  console.log(length)

  return (
    <div style={style}>
      <svg viewBox="0 0 1 1" style={{
        width: '100%',
        position: 'absolute',
        zIndex: -1
      }}>
        <g transform="translate(0, -0.4)">
			<path
				d={d}
				fill="none"
				stroke="var(--ifm-color-primary)"
				strokeLinecap="round"
				strokeWidth={0.035}
        style={{
          transformOrigin: 'center center',  
          transform: `rotate(${random('hia') * 360}deg)`,
          animation: `bganimation 20s linear infinite`
        }}
        />
        </g>
        </svg>
    </div>
  )
}
