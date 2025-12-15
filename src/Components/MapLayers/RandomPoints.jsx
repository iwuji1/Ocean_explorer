import mapboxgl from "mapbox-gl";

import qmark from '../../assets/black_q_mark.png';

export default function RPoints(map) {
    const sourceId = "interest_points";
    const layerId = "Interest-points";

    if(!map.hasImage("q-mark")) {
        map.loadImage(qmark, (error, image) => {
            if (error) throw error;
            if (!map.hasImage("qmark")) map.addImage("q-mark", image);
        });
    }

    if(!map.getSource(sourceId)) {
        map.addSource(sourceId, {
            type: "geojson",
            data: "Data/random_POI.geojson"
        });
    }

    if (!map.getLayer(layerId)) {
        map.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            layout: {
                "icon-image": "q-mark",
                "icon-size": ["interpolate", ["linear"], ["zoom"], 0, 0.05, 2, 0.2],
                "icon-allow-overlap": true,
            },
            paint: {
                "icon-opacity": 1,
            }
        })
    }

    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mouseenter', layerId, (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const feature = e.features[0];

        const esc = (s) => String(s ?? "").replace(/[&<>"']/g, m => ({
            "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
        }[m]));

        popup
        .setLngLat(e.lngLat)
        .addTo(map);

    });

    map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });

    return {sourceId, layerId}
}