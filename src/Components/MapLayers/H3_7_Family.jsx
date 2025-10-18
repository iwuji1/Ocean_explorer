import addMapHover from "../../Utils/addMapHover";

export default function H3_7FamilyLayer(map, idPrefix = "h7_family", visible = true) {

    const sourceid = `${idPrefix}-hexagons`;
    const fillLayerId = `${idPrefix}-hexagons-fill`;
    const outlineLayerId = `${idPrefix}-hexagons-outline`;

    map.addSource(sourceid, {
        type: "geojson",
        data: "/Data/H3_7_depth_wrecks_family.json",
    });

    map.addLayer({
        id: fillLayerId,
        type: "fill",
        source: sourceid,
        layout: { visibility: visible ? "visible" : "none" },
        paint: {
        "fill-color": "#088",
        "fill-opacity": 0.5,
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
    addMapHover(map, fillLayerId, "#44DBDA");

    map.on("click", fillLayerId, (e) => {
        if (e.features.length > 0) {
        const featureProps = e.features[0].properties;
        // Send to parent
        if (typeof map.__setSelectedFeature === "function") {
            map.__setSelectedFeature(featureProps);
            }
        }
    });

    return {sourceid, fillLayerId, outlineLayerId}

}