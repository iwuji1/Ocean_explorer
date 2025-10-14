import { useState } from "react";
import HamburgerIcon from "../../assets/menu_24px.svg";
import CloseIcon from "../../assets/close_24px.svg";

export default function MapMenu({ref, activeLayer, setActiveLayer, layers, goHome}) {
    const [open, setOpen] = useState(false);

    return (
        <div ref={ref}
            className="MapMenu">
            <button className="menu-button" 
            onClick={() => setOpen(!open)}
            style={{
                background: "none",
                border: "none",
                cursor: "pointer"
            }}>
                <img
                src={open ? CloseIcon : HamburgerIcon}
                alt="Menu toggle"
                style={{ width: 24, height: 24 }}
                />
            </button>

            {open && (
                <div className="menu-content">
                    <button className="gotoHome" onClick={goHome}>
                        Home
                    </button>
                    <div>
                        <h3>Layers</h3>
                        {layers.map((layer) => (
                            <button 
                            key={layer}
                            onClick={() => {setActiveLayer(layer); setOpen(false);}}
                            style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "6px 8px",
                                marginBottom: "4px",
                                background:
                                    activeLayer === layer ? "#003737" : "transparent",
                                color: activeLayer === layer ? "#fff" : "#000",
                                border: "1px solid #ccc",
                                borderRadius: "6px",
                                cursor: "pointer",
                            }}
                            >
                                {layer.replace("HexLayer", " Hexagons")}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}