import addMapHover from "../../Utils/addMapHover";

export default function H3_5FamilyLayer(map, idPrefix = "h5_family", visible = true) {

    const sourceid = `${idPrefix}-hexagons`;
    const fillLayerId = `${idPrefix}-hexagons-fill`;
    const outlineLayerId = `${idPrefix}-hexagons-outline`;

    map.addSource(sourceid, {
        type: "geojson",
        data: "/Data/H3_5_depth_wrecks_family.json",
        promoteId: "GRID_ID",
    });

    map.addLayer({
        id: fillLayerId,
        type: "fill",
        source: sourceid,
        layout: { visibility: visible ? "visible" : "none" },
        paint: {
            "fill-color": "#088",
            "fill-opacity": 0.7,
            },
    });

    map.addLayer({
        id: outlineLayerId,
        type: "line",
        source: sourceid,
        layout: { visibility: visible ? "visible" : "none" },
        paint: {
            "line-color": "#000000",
        "line-width": [
            "case",
            ["any",
            ["boolean", ["feature-state", "selected"], false],
            ["boolean", ["feature-state", "hover"], false]
            ],
            2.5,
            1
        ],
        },
    });

    // Hover effect
    addMapHover(map, fillLayerId);

    map.on("click", fillLayerId, (e) => {

        const f = e.features?.[0];
        if (!f) return;
        
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