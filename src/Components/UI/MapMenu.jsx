import { use, useEffect, useState } from "react";
import { gsap } from "gsap";
import HamburgerIcon from "../../assets/menu_24px.svg";
import CloseIcon from "../../assets/close_24px.svg";

export default function MapMenu({ref, open, setOpen, activeLayer, setActiveLayer, layers, goHome, handleLogout, gotoProfile}) {

    useEffect(() => {
        if (!ref.current) return;
        
        if (open) {
            gsap.to(ref.current, {
                x: 0,
                opacity: 1,
                duration: 0.6,
                ease: "elastic.out(1, 0.6)",
                pointerEvents: "auto",
            });
        } else {
            gsap.to(ref.current, {
                x: "-100%",
                opacity: 0,
                duration: 0.5,
                ease: "power2.in",
                pointerEvents: "none",
            });
        }
    }, [open, ref]);

    return (
        <div ref={ref}
            className="MapMenu"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                height: "100vh",
                width: "280px",
                backgroundColor: "#fff",
                boxShadow: "2px 0 8px rgba(0,0,0,0.3)",
                zIndex: 999,
                padding: "16px",
                transform: "translateX(-100%)", // start off-screen
                opacity: 0,
            }}>
            <button 
            className="menu-button"
            onClick={() => setOpen(false)}
            style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                position: "absolute",
                top: "16px",
                right: "16px",
            }}>
                <img
                src={CloseIcon}
                alt="Close menu"
                style={{ width: 24, height: 24 }}
                />
            </button>

            {open && (
                <div className="menu-content">
                    <button className="gotoHome" onClick={goHome}>
                        Home
                    </button>

                    <button className="LogoutButton" onClick={handleLogout}>
                        Logout
                    </button>

                    <button className="ProfileButton" onClick={gotoProfile}>
                        Profile
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