import mapboxgl from "mapbox-gl";

export default function ShipWrecksPoints(map) {
    map.addSource("shipwrecks", {
        type: "geojson",
        data: "Data/wrecks_clip_EE_FeaturesToJSO.geojson",
    });

    map.addLayer({
        id: "Shipwrecks-points",
        type: "circle",
        source: "shipwrecks",
        paint: {
            "circle-radius": 5,
            "circle-color": "#007cbf",
            "circle-opacity": 0.8
        },
    })
    
    // Create a popup, but don't add to map yet
    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });
    
    // Show popup on hover
    map.on('mouseenter', 'wreck-points', (e) => {
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
    map.on('mouseleave', 'wreck-points', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
}