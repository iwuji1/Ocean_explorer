import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import "./Ui.css";

export default function TopToggleBar({zoomedIn, map, layerRefs }) {
  const TopToggleBarRef = useRef(null);

  const [activeLayers, setActiveLayers] = useState({
    Shipwrecks: true,
    MPA: true,
    Interest_Points: true,
  });

  const toggleLayer = (key) => {
    const layer = layerRefs.current[key];
    if (!layer || !map) return;

    const currentVisibility = map.getLayoutProperty(layer.layerId, "visibility");
    const newVisibility = currentVisibility === "visible" ? "none" : "visible";

    map.setLayoutProperty(layer.layerId, "visibility", newVisibility);

    setActiveLayers((prev) => ({
      ...prev,
      [key]: newVisibility === "visible",
    }));
  };

  useEffect(() => {
    if (TopToggleBarRef.current) {
      if (zoomedIn) {
        // Fade / slide in when zoomed in
        gsap.fromTo(
          TopToggleBarRef.current,
          { y: "-100%", opacity: 0 },
          { y: "0%", opacity: 1, duration: 1, ease: "power3.out" }
        );
      } else {
        // Fade / slide out when zoomed out
        gsap.to(TopToggleBarRef.current, {
          y: "-100%",
          opacity: 0,
          duration: 0.8,
          ease: "power2.in",
        });
      }
    }
  }, [zoomedIn]);

  return (
    <div className="TopToggleBar" ref={TopToggleBarRef}>
      <button
        className={`toggle-pill ${activeLayers.Shipwrecks ? "active" : ""}`}
        onClick={() => toggleLayer("Shipwrecks")}
      >
        🚢 Shipwrecks
      </button>

      <button
        className={`toggle-pill ${activeLayers.MPA ? "active" : ""}`}
        onClick={() => toggleLayer("MPA")}
      >
        🐠 Protected Areas
      </button>

      <button
        className={`toggle-pill ${activeLayers.Interest_Points ? "active" : ""}`}
        onClick={() => toggleLayer("Interest_Points")}>
          Points of Interest
      </button>

      {/* Example placeholders for more toggles later */}
      {/* 
      <button className="toggle-pill">🌊 Hexes H5</button>
      <button className="toggle-pill">🧩 Hexes H6</button>
      <button className="toggle-pill">🧿 Hexes H7</button> 
      */}
    </div>
  );
}
