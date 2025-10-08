
import { useEffect, useRef } from 'react'
import './App.css'

import Map from "./Components/map.jsx";

function App() {
  const mapRef = useRef(null);
  return (
    <>

      <Map ref={mapRef}/>
      <button className='flytoSaintVincentbtn' onClick={() => mapRef.current.flyToSaintVincent()}>
        Explore
        </button>

      <button className='flytoHPbtn' onClick={() => mapRef.current.flyToHP()}>
        Home
        </button>
    </>
  );
}

export default App
