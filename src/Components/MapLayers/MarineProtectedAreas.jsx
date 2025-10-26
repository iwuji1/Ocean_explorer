import mapboxgl from "mapbox-gl";

export default function MPA(map) {
    const sourceId = "marine_protected_areas";
    const layerId = "Marine-Protected-Areas";

    if(!map.getSource(sourceId)) {
        map.addSource(sourceId, {
            type: "geojson",
            data: "Data/WDPA_poly_Oct25_Marine.geojson",
        });
    }

    if (!map.getLayer(layerId)) {
        map.addLayer({
            id: layerId,
            type: "fill",
            source: sourceId,
            layout: {},
            paint: {
                "fill-color": "#008000",
                "fill-opacity": 0.7,
                "fill-outline-color": "#00ffff"
            },
        });

    }

    // Create a popup, but don't add to map yet
    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mouseenter', layerId, (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const feature = e.features[0];
        const name = feature.properties.Name || 'Unknown';
        const nationality = feature.properties.Nationality || 'Unknown';
        const cause_lost = feature.properties["Cause Lost"] || 'Unknown';
        
        popup
        .setLngLat(feature.geometry.coordinates)
        .setHTML(`<strong>${name}</strong><br/>Nationality: ${nationality}<br/>Cause Lost: ${cause_lost}`)
        .addTo(map);
    });

    // Remove popup on leave
    map.on('mouseleave', 'MPAs', () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
    });

    return {sourceId, layerId};
}