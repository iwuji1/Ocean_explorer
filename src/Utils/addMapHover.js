export default function addMapHover(map, layerId, color = "#44DBDA" ) {
    let hoveredFeatureId = null;

    map.on("mousemove", layerId, (e) => {
        if (e.features.length > 0) {
            map.getCanvas().style.cursor = "pointer";

            const featureId = e.features[0].id || e.features[0].properties?.GRID_ID;

            // Reset previous hover
            if (hoveredFeatureId !== null) {
                map.setFeatureState(
                    { source: map.getLayer(layerId).source, id: hoveredFeatureId },
                    { hover: false }
                );
            }

            // Set new hover
            hoveredFeatureId = featureId;
            map.setFeatureState(
                { source: map.getLayer(layerId).source, id: hoveredFeatureId },
                { hover: true }
            );
        }}
    );

    //When mouse leaves the layer
    map.on("mouseleave", layerId, () => {
        if (hoveredFeatureId !== null) {
            map.setFeatureState(
                { source: map.getLayer(layerId).source, id: hoveredFeatureId },
                { hover: false }
            );
        }
        hoveredFeatureId = null;
        map.getCanvas().style.cursor = "";
    });

    // Set paint property for hover effect
    map.setPaintProperty(layerId, "fill-color", [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        color,
        ["get", "defaultColor"]
    ]);

}