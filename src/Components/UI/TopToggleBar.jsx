import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import "./Ui.css";

function ToggleButton({ label, icon, active, onClick }) {
  return (
    <button
      className={`toggle-pill ${active ? "active" : ""}`}
      role="switch"
      aria-checked={active}
      onClick={onClick}
    >
      <span className="toggle-label">
        {icon && <span className="toggle-icon">{icon}</span>}
        {label}
      </span>
      <span className={`toggle-knob ${active ? "on" : ""}`} />
    </button>
  );
}

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
      <ToggleButton
        label="Shipwrecks"
        icon="🚢"
        active={activeLayers.Shipwrecks}
        onClick={() => toggleLayer("Shipwrecks")}
      />

      <ToggleButton
        label="Protected Areas"
        icon="🐠"
        active={activeLayers.MPA}
        onClick={() => toggleLayer("MPA")}
      />

      <ToggleButton
        label="Points of Interest"
        icon="📍"
        active={activeLayers.Interest_Points}
        onClick={() => toggleLayer("Interest_Points")}
      />

      {/* Example placeholders for more toggles later */}
      {/* 
      <button className="toggle-pill">🌊 Hexes H5</button>
      <button className="toggle-pill">🧩 Hexes H6</button>
      <button className="toggle-pill">🧿 Hexes H7</button> 
      */}
    </div>
  );
}
