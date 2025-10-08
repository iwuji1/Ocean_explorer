
import { useEffect, useRef, useState } from 'react'
import './App.css'

import Map from "./Components/map.jsx";
import HomeUI from "./Components/HomeUI.jsx";

function App() {
  const mapRef = useRef(null);
  const [zoomedIn, setZoomedIn] = useState(false);

  const zoomToSaintVincent = () => {
    mapRef.current.flyToSaintVincent();
    setZoomedIn(true); // update UI state
  };

  const goHome = () => {
    mapRef.current.flyToHP(); // you can implement a flyToHome in Map
    setZoomedIn(false);
  };

  return (
    <>

      <Map ref={mapRef}/>
      <HomeUI 
        zoomedIn={zoomedIn} 
        zoomToSaintVincent={zoomToSaintVincent} 
        goHome={goHome}
      />
    </>
  );
}

export default App
