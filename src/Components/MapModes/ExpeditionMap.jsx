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

import SideMenu from "../UI/SideMenu_v2";
import MapMenu from "../UI/MapMenu";
import LeftMenu from "../UI/LeftMenu";
import TopToggleBar from "../UI/TopToggleBar";
import HomeUI from "../UI/HomeUI";

import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function ExpeditionMap() {
    const { session } = UserAuth();
    const navigate = useNavigate();

    const exploreContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);

    useEffect(() => {
        if (mapRef.current) return; // initialize map only once

        mapRef.current = new mapboxgl.Map({
            container: exploreContainerRef.current,
            style: "mapbox://styles/obiwuji/cmgqlgnco001501s8aut0245o",
            center: [-30, 20],
            zoom: window.innerWidth < 420 ? 1.5 : 2
        });

        mapRef.current.on("load", () => {
            mapRef.current.scrollZoom.disable();
            mapRef.current.doubleClickZoom.disable();
            mapRef.current.boxZoom.disable();
            mapRef.current.dragRotate.disable();
            mapRef.current.keyboard.disable();
            mapRef.current.touchZoomRotate.disable();

            setMap(mapRef.current);
        });
    }, []);

    return (
        <div>
            <HomeUI handleLoginClick={() => {
                if (session) navigate("/dashboard");
                else navigate("/signin");
            }}/>

            <div ref={exploreContainerRef}
            id="explore-container"
            className="explore-container"
            style={{ width: "100vw", height: "100vh" }}>
            </div>
        </div>
    );
}