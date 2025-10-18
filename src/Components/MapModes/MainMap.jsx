import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { gsap } from "gsap";


import BigHexLayer from "../MapLayers/BigHexLayer";
import H3_7HexLayer from "../MapLayers/H3_7HexLayer";
import H3_5HexLayer from "../MapLayers/H3_5HexLayer";
import H3_6HexLayer from "../MapLayers/H3_6HexLayer";
import ShipWrecksPoints from "../MapLayers/ShipWrecksPoints";

import { UserAuth } from "../../context/AuthContext";

import SideMenu from "../UI/SideMenu";
import MapMenu from "../UI/MapMenu";

import "mapbox-gl/dist/mapbox-gl.css";
import HomeUI from "../UI/HomeUI";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MainMap() {
  const { session, signOut } = UserAuth();
  const user = session?.user || null;

  const [map, setMap] = useState(null);
  const [activeLayer, setActiveLayer] = useState("BigHexLayer");
  const [selectedFeature, setSelectedFeature] = useState(null);
  const MapMenuRef = useRef(null);

  const [zoomedIn, setZoomedIn] = useState(false);

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

      // Set visibility for both fill and outline layers
      if (map.getLayer(ids.fillLayerId)) map.setLayoutProperty(ids.fillLayerId, "visibility", visibility);
      if (map.getLayer(ids.outlineLayerId)) map.setLayoutProperty(ids.outlineLayerId, "visibility", visibility);
    });
  }, [map, activeLayer]);

  useEffect(() => {
    if (zoomedIn) {
      gsap.to(MapMenuRef.current, {
        opacity: 1,
        duration: 0.8,
        delay: 1.4,
        pointerEvents: "auto",
      });
    } else {
      gsap.to(MapMenuRef.current, {
        opacity: 0,
        duration: 0.5,
        pointerEvents: "none",
      });
    }
  }, [zoomedIn]);

  //Zoom to destination
    const flyToSaintVincent = () => {
      if (!mapRef.current) return;
      mapRef.current.flyTo({
        center: [-61.2872, 13.1568],
        zoom: 10,
        speed: 0.8,
        curve: 1.5,
        essential: true, // this animation is considered essential with respect to prefers-reduced-motion
      });

      setZoomedIn(true);
    };

    const flyToHP = () => {
      if (!mapRef.current) return;
      mapRef.current.flyTo({
        center: [0,0],
        zoom: 1,
        speed: 0.8,
        curve: 1.2,
        essential: true, // this animation is considered essential with respect to prefers-reduced-motion
      });

      setZoomedIn(false);
    };

    const handleSignOut = async (e) => {
      e.preventDefault()
        try {
            await signOut()
            navigate("/")
        } catch (err) {
            console.error(err);
        }
    }

  return (
    <div
      ref={mapContainerRef}
      id='map-container'
      className="map-container"
      style={{ width: "100%", height: "100vh" }}
    >

      <HomeUI
        zoomedIn={zoomedIn}
        zoomToSaintVincent={flyToSaintVincent}
        user={user}
        handleLogout={handleSignOut}
      />

    <MapMenu
      ref={MapMenuRef}
      activeLayer={activeLayer}
      setActiveLayer={setActiveLayer}
      layers={layers}
      goHome={flyToHP}
      handleLogout={handleSignOut}
      />

    <SideMenu
      feature={selectedFeature}
      onClose={() => setSelectedFeature(null)}
    />
      
    </div>
  );
};
