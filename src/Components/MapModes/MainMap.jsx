import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { gsap } from "gsap";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

import BigHexLayer from "../MapLayers/BigHexLayer";
import H3_5FamilyLayer from "../MapLayers/H3_5_Family";
import H3_6FamilyLayer from "../MapLayers/H3_6_Family";
import H3_7FamilyLayer from "../MapLayers/H3_7_Family";

import ShipWrecksPoints from "../MapLayers/ShipWrecksPoints";
import MPA from "../MapLayers/MarineProtectedAreas";
import InterestPoints from "../MapLayers/RandomPoints";

import { UserAuth } from "../../context/AuthContext";

import SideMenu from "../UI/SideMenu";
import MapMenu from "../UI/MapMenu";
import LeftMenu from "../UI/LeftMenu";
import TopToggleBar from "../UI/TopToggleBar";
import HomeUI from "../UI/HomeUI";

import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MainMap() {
  const { session, signOut } = UserAuth();
  const user = session?.user || null;

  const [map, setMap] = useState(null);
  const [activeLayer, setActiveLayer] = useState("BigHexLayer");
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [hexFundingData, setHexFundingData] = useState({ hexData: {}, ownershipData: [] });
  const [menuOpen, setMenuOpen] = useState(false);
  
  const MapMenuRef = useRef(null);
  const LeftMenuRef = useRef(null);
  const layerIdsRef = useRef({});
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  const [zoomedIn, setZoomedIn] = useState(false);
  const navigate = useNavigate();

  // Store layer IDs for toggling

  const layers = ["BigHexLayer", "H3_5FamilyLayer", "H3_6FamilyLayer", "H3_7FamilyLayer"];

  useEffect(() => {
    if (mapRef.current) return; // initialize map only once
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/obiwuji/cmgqlgnco001501s8aut0245o", // or satellite-streets-v12
      // center: [-61.2872, 13.1568], // Saint Vincent coordinates
      zoom: 2,
      maxZoom: 15,
      minZoom: 2
      
    });

    mapRef.current.on("load", () => {

      mapRef.current.keyboard.disable();
      mapRef.current.__setSelectedFeature = (feature) => {
        setSelectedFeature({ ...feature });

        gsap.fromTo(
          ".mapboxgl-canvas",
          { filter: "drop-shadow(0 0 0px rgba(0,255,242,0.4))"},
          { filter: "drop-shadow(0 0 12px rgba(0,255,242,0.6))", duration: 1.2,
            repeat: 1,
            yoyo: true,
            ease: "power2.inOut",
          }
        )
    };


      // Add layers here
      const wreckLayer = ShipWrecksPoints(mapRef.current);
      const MPALayer = MPA(mapRef.current);
      const interestLayer = InterestPoints(mapRef.current);

      // Hex layers
      layerIdsRef.current["BigHexLayer"] = BigHexLayer(mapRef.current, activeLayer === "BigHexLayer");
      layerIdsRef.current["H3_5FamilyLayer"] = H3_5FamilyLayer(mapRef.current, "h5_family", activeLayer === "H3_5FamilyLayer");
      layerIdsRef.current["H3_6FamilyLayer"] = H3_6FamilyLayer(mapRef.current, "h6_family", activeLayer === "H3_6FamilyLayer");
      layerIdsRef.current["H3_7FamilyLayer"] = H3_7FamilyLayer(mapRef.current, "h7_family", activeLayer === "H3_7FamilyLayer");
      layerIdsRef.current["Shipwrecks"] = wreckLayer;
      layerIdsRef.current["MPA"] = MPALayer;
      layerIdsRef.current["Interest_Points"] = interestLayer;

      setMap(mapRef.current);

      map.on("idle", () => {
        ["Shipwrecks-points","Marine-Protected-Areas", "Interest-points"].forEach((id) => {
          console.log(id)
          if (map.getLayer(id)) map.moveLayer(id);
        });
      });
    });

  }, []);

  // Toggle layers when activeLayer changes
  useEffect(() => {
    if (!map) return;

    Object.entries(layerIdsRef.current).forEach(([name, ids]) => {
      if(!ids) return;

      const visibility = name === activeLayer ? "visible" : "none";

      // Set visibility for both fill and outline layers
      if(ids.fillLayerId && map.getLayer(ids.fillLayerId)) {
        map.setLayoutProperty(ids.fillLayerId, "visibility", visibility);
      }

      if(ids.outlineLayerId && map.getLayer(ids.outlineLayerId)) {
        map.setLayoutProperty(ids.outlineLayerId, "visibility", visibility);
      }

      if(ids.layerId && map.getLayer(ids.layerId)) {
        map.setLayoutProperty(ids.layerId, "visibility", visibility);
      }

      // if (map.getLayer(ids.fillLayerId)) map.setLayoutProperty(ids.fillLayerId, "visibility", visibility);
      // if (map.getLayer(ids.outlineLayerId)) map.setLayoutProperty(ids.outlineLayerId, "visibility", visibility);
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

  useEffect(() => {
      fetchHexFundingData();
    }, []);

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

    const gotoProfile = async (e) => {
      e.preventDefault()
        try {
            navigate("/dashboard")
        } catch (err) {
            console.error(err);
        }
    }

    const fetchHexFundingData = async () => {
      const tables = ["hexes_h5", "hexes_h6", "hexes_h7"];
      const hexDataMap = {};
      let ownershipData = [];

      for (const table of tables) {
        const {data: hexesData, error: error} = await supabase
          .from(table)
          .select(`*`)

        if (!error && hexesData) {
          hexesData.forEach((row) => {
            hexDataMap[row.grid_id] = {...row, table};
          });
        }
      }

      // const {data: ownership, error: ownershipError} = await supabase
      //   .from("hexes_h5")
      //   .select(`*`)

      // if (hexError) {
      //   console.error("Error fetching hex funding data:", hexError);
      //   return;
      // }

      // const hexDataMap = {};
      // hexesData.forEach((row) => {
      //   hexDataMap[row.id] = row;
      // });

      const { data: ownership, error: ownershipError } = await supabase
        .from('hex_ownership')
        .select("hex_id, user_id, amount_funded, percentage_owned");

      if (!ownershipError && ownership) ownershipData = ownership;
      
      
      setHexFundingData({
        hexData: hexDataMap,
        ownershipData: ownershipData || [],
      });
    }

  return (
    <div
      ref={mapContainerRef}
      id='map-container'
      className="map-container"
      style={{ width: "100%", height: "100vh" }}
    >

      <TopToggleBar
        zoomedIn={zoomedIn}
        map={map}
        layerRefs={layerIdsRef}
      />

      <HomeUI
        zoomedIn={zoomedIn}
        zoomToSaintVincent={flyToSaintVincent}
        user={user}
        handleLogout={handleSignOut}
      />
      <MapMenu
        ref={MapMenuRef}
        open={menuOpen}
        setOpen={setMenuOpen}
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        layers={layers}
        goHome={flyToHP}
        handleLogout={handleSignOut}
        gotoProfile={gotoProfile}
      />
      {menuOpen && (
        <div
          className="overlay"
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.3)",
            zIndex: 998,
            opacity: 0,
          }}
          ref={(el) => {
            if (el) gsap.to(el, { opacity: 1, duration: 0.4, ease: "power2.out" });
          }}
        />
      )}

      <LeftMenu
      LeftMenuRef={LeftMenuRef}
      onMenuToggle={() => setMenuOpen(!menuOpen)}
      zoomedIn={zoomedIn}
      />

      <SideMenu
        selectedHex={selectedFeature}
        hexFundingData={hexFundingData}
        onClose={() => setSelectedFeature(null)}
        refreshFundingData={fetchHexFundingData}
        user={user}
      />
      
    </div>
  );
};
