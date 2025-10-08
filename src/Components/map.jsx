import { forwardRef, useImperativeHandle, useEffect, useRef, use } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const Map = forwardRef((Props, ref) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return; // initialize map only once

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      //style: "mapbox://styles/mapbox/dark-v11", // or satellite-streets-v12
      // center: [-61.2872, 13.1568], // Saint Vincent coordinates
      zoom: 0,
    });

    // Optional: Add navigation controls
    //mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // return () => {
    //   mapRef.current.remove()
    // }

  }, []);

  //Zoom to destination
  useImperativeHandle(ref, () => ({
    flyToSaintVincent() {
      if (!mapRef.current) return;
      mapRef.current.flyTo({
        center: [-61.2872, 13.1568],
        zoom: 8,
        speed: 1.2,
        curve: 1.8,
        essential: true, // this animation is considered essential with respect to prefers-reduced-motion
      });
    },
    flyToHP() {
      if (!mapRef.current) return;
      mapRef.current.flyTo({
        center: [0,0],
        zoom: 0,
        speed: 1.2,
        curve: 1.8,
        essential: true, // this animation is considered essential with respect to prefers-reduced-motion
      });
    }
  }));

  return (
    <div
      ref={mapContainerRef}
      id='map-container'
      className="map-container"
      style={{ width: "100%", height: "100vh" }}
    />
  );
});

export default Map;
