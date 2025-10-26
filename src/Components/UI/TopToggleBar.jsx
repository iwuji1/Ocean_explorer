import { useState } from "react";
import "./Ui.css";

export default function TopToggleBar({ map, layerRefs }) {
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

  return (
    <div className="TopToggleBar">
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
