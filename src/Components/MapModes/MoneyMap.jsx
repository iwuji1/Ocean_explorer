import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { gsap } from "gsap";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

import H3_5FamilyLayer from "../MapLayers/H3_5_Family";
import H3_6FamilyLayer from "../MapLayers/H3_6_Family";
import H3_7FamilyLayer from "../MapLayers/H3_7_Family";

import LeftMenu from "../UI/LeftMenu";

import HamburgerIcon from "../../assets/menu_24px.svg";

import "./Map.css"
import "mapbox-gl/dist/mapbox-gl.css";
import { UserAuth } from "../../context/AuthContext";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MoneyMap() {
    const { session, signOut } = UserAuth();
    const user = session?.user || null;
    const mapRef = useRef(null);
    const moneyContainerRef = useRef(null);
    const [map, setMap] = useState(null);
    const [leftMenuOpen, setLeftMenuOpen] = useState(true);
    const LeftMenuRef = useRef(null);

    const navigate = useNavigate();
    const [activeLayer, setActiveLayer] = useState("H3_6FamilyLayer");

    useEffect(() => {
        if (mapRef.current) return; // initialize map only once

        mapRef.current = new mapboxgl.Map({
            container: moneyContainerRef.current,
            style: "mapbox://styles/obiwuji/cmgqlgnco001501s8aut0245o",
            center: [-61.2872, 13.1568],
            zoom: window.innerWidth < 420 ? 6 : 10
        });

        mapRef.current.on("load", () => {
            const m = mapRef.current;
            if (!m) return;

            // Hex layers
            const h3_6_family = H3_6FamilyLayer(m, "h6_family", activeLayer === "H3_6FamilyLayer");

            setMap(mapRef.current);
        });
    }, []);


    return (
        <div
            ref={moneyContainerRef}
            id="money-container"
            className="money-container"
            style={{ width: "100%", height: "100vh"}}
        >

            <h1>Money Map</h1>
        </div>
    );
}