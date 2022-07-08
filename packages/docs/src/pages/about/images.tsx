import React from 'react';
import logo from './Remotion logo.png'; // Tell webpack this JS file uses this image
import Jonny from './Jonny Burger.jpg'; 
import Mehmet from './Mehmet Ademi.jpg'; 
import Patric from './Patric Salvisberg.jpg'; 

console.log(logo); // /logo.84287d09.png

 export function Header() {
  // Import result is the URL of your image
  return <img src={logo} alt="Logo" style={{width: 300, height: 300}} />;
}

export default Header;



console.log(Jonny); // /logo.84287d09.png

 export function Header1() {
  // Import result is the URL of your image
  return <img src={Jonny} alt="Logo" style={{width: 300, height: 300}}/>;
}

export default Header1;



console.log(Mehmet); // /logo.84287d09.png

 export function Header2() {
  // Import result is the URL of your image
  return <img src={Mehmet} alt="Logo" style={{width: 300, height: 300}}/>;
}

export default Header2;



console.log(Patric); // /logo.84287d09.png

 export function Header3() {
  // Import result is the URL of your image
  return <img src={Patric} alt="Logo" style={{width: 300, height: 300}}/>;
}

export default Header3;