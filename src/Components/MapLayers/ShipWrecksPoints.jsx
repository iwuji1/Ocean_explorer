import mapboxgl from "mapbox-gl";
import { gsap } from "gsap";

import redx from '../../assets/Red_X.svg.png';

export default function ShipWrecksPoints(map) {
    const sourceId = "shipwrecks";
    const layerId = "Shipwrecks-points";

    if(!map.hasImage("cross-15")) {
        map.loadImage(redx, (error, image) => {
            if (error) throw error;
            map.addImage("cross-15", image);
        });
    }

    if(!map.getSource(sourceId)) {
        map.addSource(sourceId, {
            type: "geojson",
            data: "Data/wrecks_clip_EE_FeaturesToJSO.geojson",
        });
    }

    if(!map.getLayer(layerId)) {
        map.addLayer({
            id: "Shipwrecks-points",
            type: "symbol",
            source: sourceId,
            layout: {
                "icon-image": "cross-15",
                "icon-size": ["interpolate", ["linear"], ["zoom"], 0, 0.1, 10, 0.6],
                "icon-allow-overlap": true,
            },
            paint: {
                "icon-opacity": 0,
            },
        });

        animateRadarFadeIn(map, layerId);
    }


    
    // Create a popup, but don't add to map yet
    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    function animateRadarFadeIn(map, layerId) {
    if (!map || !map.getLayer(layerId)) return; // guard against premature call

    const state = { opacity: 0 };

    gsap.to(state, {
        opacity: 1,
        duration: 1.8,
        ease: "power2.inOut",
        onUpdate: () => {
        if (map && map.getLayer(layerId)) {
            map.setPaintProperty(layerId, "icon-opacity", state.opacity);
        }
        },
    });

    // Optional glow pulse
    const halo = { blur: 0 };
    gsap.to(halo, {
        blur: 12,
        duration: 1,
        ease: "sine.inOut",
        yoyo: true,
        repeat: 1,
        onUpdate: () => {
        if (map && map.getLayer(layerId)) {
            map.setPaintProperty(layerId, "icon-halo-blur", halo.blur);
            map.setPaintProperty(layerId, "icon-halo-width", halo.blur / 2);
            map.setPaintProperty(layerId, "icon-halo-color", "rgba(255, 50, 50, 0.8)");
        }
        },
    });
    }


    
    // Show popup on hover
    map.on('mouseenter', layerId, (e) => {
        map.getCanvas().style.cursor = 'pointer';
    
        const feature = e.features[0];
        const name = feature.properties.Name || 'Unknown';
        const year = feature.properties["Year found"] || 'Unknown';
    
        popup
        .setLngLat(feature.geometry.coordinates)
        .setHTML(`<strong>${name}</strong><br/>Year Found: ${year}`)
        .addTo(map);
    });
    
    // Remove popup on leave
    map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });


    return {sourceId, layerId}
}