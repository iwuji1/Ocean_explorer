import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { gsap } from "gsap";

import GPS_ships from "../MapLayers/Gps_Points";

import { useNavigate } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext";

import LeftMenu from "../UI/LeftMenu";

import HamburgerIcon from "../../assets/menu_24px.svg";

import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function ExpeditionMap() {
    const { session, signOut } = UserAuth();
    const navigate = useNavigate();
    const user = session?.user || null;

    const exploreContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [leftMenuOpen, setLeftMenuOpen] = useState(true);
    const LeftMenuRef = useRef(null);

    useEffect(() => {
        if (mapRef.current) return; // initialize map only once

        mapRef.current = new mapboxgl.Map({
            container: exploreContainerRef.current,
            style: "mapbox://styles/obiwuji/cmgqlgnco001501s8aut0245o",
            center: [-61.2872, 13.1568],
            zoom: window.innerWidth < 420 ? 6 : 10
        });

        mapRef.current.on("load", () => {
            const m = mapRef.current;
            if (!m) return;

            const shipDots = GPS_ships(m)

            setMap(mapRef.current);
        });
    }, []);

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


    return (
        <div
            ref={exploreContainerRef}
            id="explore-container"
            className="explore-container"
            style={{ width: "100%", height: "100vh" }}
        >
            {/* UI overlay sits ABOVE the map canvas */}
            {leftMenuOpen && (
                <div
                className="overlay"
                onClick={() => setLeftMenuOpen(false)}
                ref={(el) => {
                    if (el) gsap.to(el, { opacity: 1, duration: 0.4, ease: "power2.out" });
                }}
                />
            )}

            <button
                type="button"
                className="MobileMenuToggle"
                onClick={() => setLeftMenuOpen((prev) => !prev)}
                aria-label={leftMenuOpen ? "Close menu" : "Open menu"}
            >
                <img src={HamburgerIcon} alt="" />
            </button>

            <LeftMenu
                LeftMenuRef={LeftMenuRef}
                zoomedIn={true}
                isLeftMenuOpen={leftMenuOpen}
                handleLogout={handleSignOut}
                gotoProfile={gotoProfile}
            />
        </div>
        );
}