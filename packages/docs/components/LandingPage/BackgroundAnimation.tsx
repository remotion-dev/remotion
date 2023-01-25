import React, { useEffect } from "react";
import {getLength} from '@remotion/paths'
import styles from './bg-anim.module.css'

const rx = 0.2;
const ry = 0.45


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

const strokeWidth = 0.035

export const BackgroundAnimation: React.FC = () => {
  const d = ellipseToPath(0.5, 0.5)
  const length = getLength(d)

  const css = `
    @keyframes bganimation {
      from {
        stroke-dashoffset: 0
      }
    
      to {
        stroke-dashoffset: ${length};
      }
    }  
  `;

  useEffect(() => {
    const _style = document.createElement('style');
    _style.innerHTML = css;
    document.head.appendChild(_style);
  }, [css])

  return (
    <div  className={styles.bganimcontainer}>
      <svg className={styles.svg} viewBox="0 0 1 1" style={{
        width: '100%',
        zIndex: -1,
        position: 'absolute',
      }}>
			<path
				d={d}
				fill="none"
				stroke="var(--ifm-color-primary)"
				strokeLinecap="round"
        className={styles.p}
        style={{
          transformOrigin: 'center center',  
          transform: `rotate(120deg)`,
          animation: `bganimation 20s linear infinite`,
          strokeDasharray: `${length * 0.2} ${length * 0.8}`,
        }}
        />
			<path
				d={d}
				fill="none"
				stroke="var(--ifm-color-primary)"
				strokeLinecap="round"
				strokeWidth={strokeWidth}        
        className={styles.p}
        style={{
          transformOrigin: 'center center',  
          transform: `rotate(0deg)`,
          animation: `bganimation 20s linear infinite`,
          strokeDasharray: `${length * 0.2} ${length * 0.8}`,

        }}
        />
			<path
				d={d}
				fill="none"
				stroke="var(--ifm-color-primary)"
				strokeLinecap="round"
				strokeWidth={strokeWidth}
        className={styles.p}
        style={{
          transformOrigin: 'center center',  
          transform: `rotate(240deg)`,
          animation: `bganimation 20s linear infinite`,
          strokeDasharray: `${length * 0.2} ${length * 0.8}`,
        }}
        />
        </svg>
    </div>
  )
}
