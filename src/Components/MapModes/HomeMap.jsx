import {useEffect, useRef, useState, act } from "react";
import mapboxgl from "mapbox-gl";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext";
import HomeUI from "../UI/HomeUI";

import { gsap } from "gsap";

import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function HomeMap() {
    const { session } = UserAuth();
    const navigate = useNavigate();
    const [map, setMap] = useState(null);

    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);

      useEffect(() => {
    if (mapRef.current) return; // initialize map only once

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/obiwuji/cmgqlgnco001501s8aut0245o", // or satellite-streets-v12
      // center: [-61.2872, 13.1568], // Saint Vincent coordinates
      zoom: 2,
      
    });

    mapRef.current.on("load", () => {

      mapRef.current.scrollZoom.disable();
      mapRef.current.doubleClickZoom.disable();
      mapRef.current.boxZoom.disable();
      mapRef.current.dragRotate.disable();
      mapRef.current.dragPan.disable();
      mapRef.current.keyboard.disable();
      mapRef.current.touchZoomRotate.disable();

      setMap(mapRef.current);
    });

  }, []);

  const handleLoginClick = () => {
    if (session) navigate("/dashboard");
    else navigate("/signin");
  };

  return (
    <div
      ref={mapContainerRef}
      id='map-container'
      className="map-container"
      style={{ width: "100%", height: "100vh" }}
    >
        <HomeUI map={map} handleLogin={handleLoginClick}/>
    </div>
  )
}