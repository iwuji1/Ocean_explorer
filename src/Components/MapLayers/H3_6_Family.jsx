import addMapHover from "../../Utils/addMapHover";

export default function H3_6FamilyLayer(map, idPrefix = "h6_family", visible = true) {

    const sourceid = `${idPrefix}-hexagons`;
    const fillLayerId = `${idPrefix}-hexagons-fill`;
    const outlineLayerId = `${idPrefix}-hexagons-outline`;

    map.addSource(sourceid, {
        type: "geojson",
        data: "/Data/H3_6_depth_wrecks_family.json",
        promoteId: "GRID_ID",
    });

    map.addLayer({
        id: fillLayerId,
        type: "fill",
        source: sourceid,
        layout: { visibility: visible ? "visible" : "none" },
        paint: {
            "fill-color": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                "#44DBDA",
                "#073642" // base fallback until we inject match expression
            ],
            "fill-opacity": 0.7,
            },
    });

    map.addLayer({
        id: outlineLayerId,
        type: "line",
        source: sourceid,
        layout: { visibility: visible ? "visible" : "none" },
        paint: {
        "line-color": "#000",
        "line-width": 1,
        },
    });

    // Hover effect
    addMapHover(map, fillLayerId);

    map.on("click", fillLayerId, (e) => {

        const f = e.features?.[0];
        if (!f) return;

        console.log("CLICKED layer:", fillLayerId);
        console.log("feature.id:", f.id);
        console.log("GRID_ID:", f.properties?.GRID_ID);
        console.log("source:", map.getLayer(fillLayerId)?.source);
        console.log("sourceLayer:", map.getLayer(fillLayerId)?.["source-layer"]);
        
        if (e.features.length > 0) {
        const featureProps = e.features[0].properties;
        const layerData = {...featureProps, layerLevel: idPrefix}
        // Send to parent
        if (typeof map.__setSelectedFeature === "function") {
            map.__setSelectedFeature(layerData);
            }
        }
    });

    return {sourceid, fillLayerId, outlineLayerId}

}