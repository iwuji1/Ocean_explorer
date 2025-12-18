import { use, useEffect, useRef, useState } from "react";
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

import HamburgerIcon from "../../assets/menu_24px.svg";

import "./Map.css"

import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MainMap() {
  const { session, signOut } = UserAuth();
  const user = session?.user || null;

  const [map, setMap] = useState(null);
  const [activeLayer, setActiveLayer] = useState("H3_6FamilyLayer");
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [hexFundingData, setHexFundingData] = useState({ hexData: {}, ownershipData: [] });
  const [menuOpen, setMenuOpen] = useState(false);
  const [leftMenuOpen, setLeftMenuOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [colorMode, setColorMode] = useState("funding"); // "funding" or "depth"

  
  const MapMenuRef = useRef(null);
  const LeftMenuRef = useRef(null);
  const layerIdsRef = useRef({});
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  const [zoomedIn, setZoomedIn] = useState(false);
  const navigate = useNavigate();

  // Store layer IDs for toggling

  const layers = [ "H3_5FamilyLayer", "H3_6FamilyLayer", "H3_7FamilyLayer"];

  useEffect(() => {
    if (mapRef.current) return; // initialize map only once
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/obiwuji/cmgqlgnco001501s8aut0245o", // or satellite-streets-v12
      // center: [-61.2872, 13.1568], // Saint Vincent coordinates
      zoom: window.innerWidth < 420 ? 0.5 : 2,
      maxZoom: 15,
      minZoom: 0.5
      
    });

    mapRef.current.on("load", () => {

      const m = mapRef.current;
      if (!m) return;

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
      const wreckLayer = ShipWrecksPoints(m);
      const MPALayer = MPA(m);
      const interestLayer = InterestPoints(m);

      // Hex layers
      layerIdsRef.current["H3_5FamilyLayer"] = H3_5FamilyLayer(m, "h5_family", activeLayer === "H3_5FamilyLayer");
      layerIdsRef.current["H3_6FamilyLayer"] = H3_6FamilyLayer(m, "h6_family", activeLayer === "H3_6FamilyLayer");
      layerIdsRef.current["H3_7FamilyLayer"] = H3_7FamilyLayer(m, "h7_family", activeLayer === "H3_7FamilyLayer");
      layerIdsRef.current["Shipwrecks"] = wreckLayer;
      layerIdsRef.current["MPA"] = MPALayer;
      layerIdsRef.current["Interest_Points"] = interestLayer;

      setMap(m);

      m.on("idle", () => {
        ["Shipwrecks-points","Marine-Protected-Areas", "Interest-points"].forEach((id) => {
          if (m.getLayer(id)) m.moveLayer(id);
        });
      });

      setMapReady(true);
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
        zoom: window.innerWidth < 420 ? 6 : 10,
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
      try {
        // -----------------------------
        // 1) FETCH ALL HEXES (PAGINATED)
        // -----------------------------
        const pageSize = 1000;
        let from = 0;
        let allHexRows = [];

        while (true) {
          const { data, error } = await supabase
            .from("hexes")
            .select("grid_id, price, total_funded")
            .range(from, from + pageSize - 1);

          console.log("hexes page:", { from, to: from + pageSize - 1, count: data?.length, error });

          if (error) {
            console.error("Error fetching hexes:", error);
            return;
          }

          allHexRows = allHexRows.concat(data || []);

          // last page (returned fewer than pageSize)
          if (!data || data.length < pageSize) break;

          from += pageSize;
        }

        console.log("hexes total rows fetched:", allHexRows.length);

        // -----------------------------
        // 2) BUILD hexDataMap (NORMALISED KEY)
        // -----------------------------
        const hexDataMap = {};
        (allHexRows || []).forEach((row) => {
          const key = String(row.grid_id ?? "").trim().toLowerCase();
          if (!key) return;

          const price = Number(row.price || 0);

          // clamp to avoid weird negatives showing up
          const totalFunded = Math.max(0, Number(row.total_funded || 0));

          const pct = price > 0 ? (totalFunded / price) * 100 : 0;

          hexDataMap[key] = { ...row, funding_pct: pct };
        });

        // -----------------------------
        // 3) FETCH OWNERSHIP (UNCHANGED)
        // -----------------------------
        const { data: ownership, error: ownershipError } = await supabase
          .from("hex_ownership")
          .select("hex_id, user_id, amount_funded, percentage_owned");

        console.log("ownership select:", { ownershipError, count: ownership?.length });

        if (ownershipError) {
          console.error("Error fetching ownership:", ownershipError);
        }

        const ownershipData = ownership || [];

        // -----------------------------
        // 4) SET STATE
        // -----------------------------
        setHexFundingData({
          hexData: hexDataMap,
          ownershipData,
        });

        // -----------------------------
        // 5) APPLY FEATURE STATE AFTER MAP IDLE
        // -----------------------------
        const m = mapRef.current;
        if (m) {
          m.once("idle", () => {
            applyFundingFeatureState(m, hexDataMap, layerIdsRef.current);
          });
        }
      } catch (err) {
        console.error("fetchHexFundingData failed:", err);
      }
    };

    function getColorForFundingPct(pct) {
      const p = Math.max(0, pct);
      if (p >= 100) return "#00FF9C";  // fully funded – bright green
      if (p >= 75) return "#5CFFDA";   // 75–99%
      if (p >= 50) return "#00A7FF";   // 50–74%
      if (p >= 25) return "#005CFF";   // 25–49%
      if (p > 0)   return "#222C5C";   // 1–24% (barely glowing)
      return "#888888";                  // 0% (not funded)
    }

    function applyFundingColours(map, hexDataMap, layerIds) {
      if (!map) return;

      // Build MATCH expression safely
      const matchExpr = ["match", ["get", "GRID_ID"]];

      Object.entries(hexDataMap).forEach(([gridId, row]) => {
        if (!gridId) return; // skip null/undefined grid_id
        const pct = Number(row?.funding_pct ?? 0);
        const color = getColorForFundingPct(pct);
        matchExpr.push(String(gridId), color);
      });

      matchExpr.push("#073642"); // default

      const fillExprWithHover = [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        "#e8a302",
        matchExpr
      ];

      const outlineExprWithHover = [
        "case",
        // ["boolean", ["feature-state", "selected"], false], "#e8a302",
        ["boolean", ["feature-state", "hover"], false], "#44DBDA",
        "#000000"
      ];

      ["H3_5FamilyLayer", "H3_6FamilyLayer", "H3_7FamilyLayer"].forEach((key) => {
        const ids = layerIds[key];
        if (!ids?.fillLayerId) return;
        if (!map.getLayer(ids.fillLayerId)) return;

        map.setPaintProperty(ids.fillLayerId, "fill-color", fillExprWithHover);
        map.setPaintProperty(ids.fillLayerId, "fill-opacity", 0.7);

        map.setPaintProperty(ids.outlineLayerId, "line-color", outlineExprWithHover);
        map.setPaintProperty(ids.outlineLayerId, "line-width", [
          "case",
          ["any",
            ["boolean", ["feature-state", "selected"], false],
            ["boolean", ["feature-state", "hover"], false]
          ],
          2.5,
          1
        ]);


      });
    }


    useEffect(() => {
      if (!map || !Object.keys(hexFundingData.hexData).length) return;
      if (colorMode !== "funding") return;

      applyFundingColours(map, hexFundingData.hexData, layerIdsRef.current);
    }, [map, hexFundingData, colorMode]);

    useEffect(() => {
      if (!map) return;
      if (colorMode !== "depth") return;

      applyDepthColors(map, layerIdsRef.current);
    }, [map, colorMode]);

    function applyFundingFeatureState(map, hexDataMap, layerIds) {
      const familyKeys = ["H3_5FamilyLayer", "H3_6FamilyLayer", "H3_7FamilyLayer"];

      familyKeys.forEach((key) => {
        const ids = layerIds[key];
        if (!ids?.sourceid) return;
        if (!map.getSource(ids.sourceid)) return;

        // for each hex in DB, set feature-state on the matching GRID_ID in this source
        Object.entries(hexDataMap).forEach(([gridId, row]) => {
          const pct = Number(row.funding_pct || 0);
          map.setFeatureState(
            { source: ids.sourceid, id: gridId }, // id comes from promoteId
            { fundingColor: getColorForFundingPct(pct) }
          );
        });
      });
    }

    function applyDepthColors(map, layerIds) {
      if(!map) return;

      const depthColorRamp = [
        "case",

        // Unknown / missing MEAN
        ["!", ["has", "MEAN"]],
        "#888888",

        // Known values → step ramp
        [
        "step",
        ["get", "MEAN"],

        // default (MEAN < -5000)
        "#051833",

        -5000, "#103b53",
        -3000, "#205b71",
        -2000, "#307e8d",
        -1500, "#409eac",
        -100,  "#5ce2e7",
        0,     "#a7a7a7" // > 0
        ]
      ];

      const familyKeys = ["H3_5FamilyLayer", "H3_6FamilyLayer", "H3_7FamilyLayer"];

      familyKeys.forEach((key) => {
        const ids = layerIds[key];
        if (!ids?.fillLayerId) return;
        if (!map.getLayer(ids.fillLayerId)) return;

        map.setPaintProperty(ids.fillLayerId, "fill-color", depthColorRamp);
        map.setPaintProperty(ids.fillLayerId, "fill-opacity", 0.7);

        map.setPaintProperty(ids.outlineLayerId, "line-color", [
          "case",
          ["boolean", ["feature-state", "selected"], false], "#e8a302",
          ["boolean", ["feature-state", "hover"], false], "#ffffff",
          "#000000"
        ]);

      });
  }


    useEffect(() => {
      if (!mapReady) return;
      fetchHexFundingData();
    }, [mapReady]);

    useEffect(() => {
      const m = mapRef.current;
      if (!mapReady || !m) return;

      const hexDataMap = hexFundingData?.hexData || {};
      if (!Object.keys(hexDataMap).length) return;

      m.once("idle", () => {
        applyFundingFeatureState(m, hexDataMap, layerIdsRef.current);
      });
    }, [mapReady, hexFundingData]);


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
        colorMode={colorMode}
        setColorMode={setColorMode}
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        layers={layers}
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

      {/* Dark overlay when menu is open (mobile) */}
      {leftMenuOpen && (
        <div
          className="overlay"
          onClick={() => setLeftMenuOpen(false)}
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

      {zoomedIn && (
        <button
          type="button"
          className="MobileMenuToggle"
          onClick={() => setLeftMenuOpen(prev => !prev)}
          aria-label={leftMenuOpen ? "Close menu" : "Open menu"}
        >
          <img src={HamburgerIcon} alt="" />
        </button>
      )}

      {zoomedIn && (
        <LeftMenu
          LeftMenuRef={LeftMenuRef}
          zoomedIn={zoomedIn}
          isLeftMenuOpen={leftMenuOpen}
          goHome={flyToHP}
          handleLogout={handleSignOut}
          gotoProfile={gotoProfile}
        />
      )}

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
