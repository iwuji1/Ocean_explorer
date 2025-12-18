import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import "./Ui.css";

function ToggleButton({ label, icon, active, onClick, compact = false}) {
  return (
    <button
      className={`toggle-pill ${active ? "active" : ""} ${compact ? "compact" : ""}`}
      role="switch"
      aria-checked={active}
      title={label}
      onClick={onClick}
      type="button"
    >
      <span className="toggle-label">
        {icon && <span className="toggle-icon">{icon}</span>}
        {!compact && <span className="toggle-text">{label}</span>}
      </span>
      {!compact && <span className={`toggle-knob ${active ? "on" : ""}`} />}
    </button>
  );
}

const LAYER_LABELS = {
  H3_5FamilyLayer: "H5",
  H3_6FamilyLayer: "H6",
  H3_7FamilyLayer: "H7",
};

export default function TopToggleBar({zoomedIn, map, layerRefs, colorMode, setColorMode, activeLayer, setActiveLayer, layers }) {

  const TopToggleBarRef = useRef(null);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const compact = isMobile;

  const [activeLayers, setActiveLayers] = useState({
    Shipwrecks: false,
    MPA: false,
    Interest_Points: false,
  });

  const toggleLayer = (key) => {
    const layer = layerRefs.current[key];
    if (!layer || !map) return;
    if (!map.getLayer(layer.layerId)) return;

    const currentVisibility = map.getLayoutProperty(layer.layerId, "visibility");
    const newVisibility = currentVisibility === "visible" ? "none" : "visible";

    map.setLayoutProperty(layer.layerId, "visibility", newVisibility);

    setActiveLayers((prev) => ({
      ...prev,
      [key]: newVisibility === "visible",
    }));
  };

  const toggleColorMode = () => {
    setColorMode(prev => (prev === "funding" ? "depth" : "funding"));
  };

  useEffect(() => {
    if (TopToggleBarRef.current) {
      if (zoomedIn) {
        // Fade / slide in when zoomed in
        gsap.fromTo(
          TopToggleBarRef.current,
          compact ? { x: "120%", opacity: 0 } : { y: "-100%", opacity: 0 },
          compact ? { x: "0%", opacity: 1, duration: 0.8, ease: "power3.out" }: { y: "0%", opacity: 1, duration: 1, ease: "power3.out" },
        );
      } else {
        // Fade / slide out when zoomed out
        gsap.to(TopToggleBarRef.current, compact 
          ? { x: "120%", opacity: 0, duration: 0.6, ease: "power2.in" } 
          : { y: "-100%", opacity: 0, duration: 0.8, ease: "power2.in" },
        );
      }
    }
  }, [zoomedIn, compact]);

  return (
    <div className={`TopToggleBar ${compact ? "TopToggleBar--mobile" : ""}`} ref={TopToggleBarRef}>
      <ToggleButton
        label="Shipwrecks"
        icon="🚢"
        active={activeLayers.Shipwrecks}
        onClick={() => toggleLayer("Shipwrecks")}
        compact={compact}
      />

      <ToggleButton
        label="Protected Areas"
        icon="🐠"
        active={activeLayers.MPA}
        onClick={() => toggleLayer("MPA")}
        compact={compact}
      />

      <ToggleButton
        label="Points of Interest"
        icon="📍"
        active={activeLayers.Interest_Points}
        onClick={() => toggleLayer("Interest_Points")}
        compact={compact}
      />

      <ToggleButton
        label={colorMode === "funding" ? "Funding Mode" : "Depth Mode"}
        icon={colorMode === "funding" ? "💰" : "🌊"}
        active={colorMode === "depth"}
        onClick={toggleColorMode}
        compact={compact}
      />

      {layers.map((layer) => {
        const label = LAYER_LABELS[layer] || layer;

        return (  
          <button
            key={layer}
            onClick={() => {setActiveLayer(layer)}}
            style={{
              background:
                activeLayer === layer ? "#e8a302" : "#003737",
              color:
                activeLayer === layer ? "#ffffff" : "#000000",
            }}
            title={label}>
            {label}
          </button>
        );
      })}
    </div>
  );
}
