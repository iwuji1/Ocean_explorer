import { forwardRef, useImperativeHandle, useEffect, useRef, useState, act } from "react";
import mapboxgl from "mapbox-gl";

import BigHexLayer from "./MapLayers/BigHexLayer";
import H3_7HexLayer from "./MapLayers/H3_7HexLayer";
import H3_5HexLayer from "./MapLayers/H3_5HexLayer";
import H3_6HexLayer from "./MapLayers/H3_6HexLayer";
import ShipWrecksPoints from "./MapLayers/ShipWrecksPoints";

import SideMenu from "./UI/SideMenu";
import MapMenu from "./UI/MapMenu";

import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const Map = forwardRef((Props, ref) => {

  const [map, setMap] = useState(null);
  const [activeLayer, setActiveLayer] = useState("BigHexLayer");
  const [selectedFeature, setSelectedFeature] = useState(null);



  // Store layer IDs for toggling
  const layerIdsRef = useRef({});

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const layers = ["H3_6HexLayer","H3_5HexLayer","H3_7HexLayer","BigHexLayer"];

  useEffect(() => {
    if (mapRef.current) return; // initialize map only once

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/obiwuji/cmgqlgnco001501s8aut0245o", // or satellite-streets-v12
      // center: [-61.2872, 13.1568], // Saint Vincent coordinates
      zoom: 2,
      
    });

    mapRef.current.on("load", () => {

      console.log(mapRef.current.getStyle().layers.map(l => l.id));

      // mapRef.current.setPaintProperty('water', 'fill-color', '#09282E');
      // mapRef.current.setPaintProperty('land', 'fill-color', '#FFDC4E');

      mapRef.current.scrollZoom.disable();
      mapRef.current.doubleClickZoom.disable();
      mapRef.current.boxZoom.disable();
      mapRef.current.dragRotate.disable();
      mapRef.current.dragPan.disable();
      mapRef.current.keyboard.disable();
      mapRef.current.touchZoomRotate.disable();

      mapRef.current.__setSelectedFeature = (feature) => setSelectedFeature(feature);


      // Add layers here
      //ShipWrecksPoints(mapRef.current);
      layerIdsRef.current["H3_6HexLayer"] = H3_6HexLayer(mapRef.current, "h3_6", activeLayer === "H3_6HexLayer");
      layerIdsRef.current["H3_5HexLayer"] = H3_5HexLayer(mapRef.current, "h3_5", activeLayer === "H3_5HexLayer");
      layerIdsRef.current["H3_7HexLayer"] = H3_7HexLayer(mapRef.current, "h3_7", activeLayer === "H3_7HexLayer");
      layerIdsRef.current["BigHexLayer"] = BigHexLayer(mapRef.current, "big", activeLayer === "BigHexLayer");

      setMap(mapRef.current);
    });

  }, []);

  // Toggle layers when activeLayer changes
  useEffect(() => {
    if (!map) return;

    Object.entries(layerIdsRef.current).forEach(([name, ids]) => {
      const visibility = name === activeLayer ? "visible" : "none";

      console.log(activeLayer);

      // Set visibility for both fill and outline layers
      if (map.getLayer(ids.fillLayerId)) map.setLayoutProperty(ids.fillLayerId, "visibility", visibility);
      if (map.getLayer(ids.outlineLayerId)) map.setLayoutProperty(ids.outlineLayerId, "visibility", visibility);
    });
  }, [map, activeLayer]);

  //Zoom to destination
  useImperativeHandle(ref, () => ({
    flyToSaintVincent() {
      if (!mapRef.current) return;
      mapRef.current.flyTo({
        center: [-61.2872, 13.1568],
        zoom: 10,
        speed: 0.8,
        curve: 1.5,
        essential: true, // this animation is considered essential with respect to prefers-reduced-motion
      });
    },
    flyToHP() {
      if (!mapRef.current) return;
      mapRef.current.flyTo({
        center: [0,0],
        zoom: 1,
        speed: 0.8,
        curve: 1.2,
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
    >
      {/* {layers.map((layer, index) => (
        <button
          key={layer}
          onClick={() => setActiveLayer(layer)}
          style={{
            position: 'absolute',
            top: 50,
            left: 500 + (index * 120),
            zIndex: 20,
            backgroundColor: activeLayer === layer ? '#1978c8' : '#fff',
            color: activeLayer === layer ? '#fff' : '#000',
            border: 'none',
            padding: '8px 12px',
            cursor: 'pointer',
            borderRadius: '4px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}
          >{layer.charAt(0).toUpperCase() + layer.slice(1)}
      </button> 
    ))} */}

    <MapMenu
      activeLayer={activeLayer}
      setActiveLayer={setActiveLayer}
      layers={layers}
      mapRef={mapRef}
      />

    <SideMenu
      feature={selectedFeature}
      onClose={() => setSelectedFeature(null)}
    />
      
    </div>
  );
});

export default Map;
