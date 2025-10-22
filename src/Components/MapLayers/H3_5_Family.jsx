import addMapHover from "../../Utils/addMapHover";

export default function H3_5FamilyLayer(map, idPrefix = "h5_family", visible = true) {

    const sourceid = `${idPrefix}-hexagons`;
    const fillLayerId = `${idPrefix}-hexagons-fill`;
    const outlineLayerId = `${idPrefix}-hexagons-outline`;

    map.addSource(sourceid, {
        type: "geojson",
        data: "/Data/H3_5_depth_wrecks_family.json",
    });

    map.addLayer({
        id: fillLayerId,
        type: "fill",
        source: sourceid,
        layout: { visibility: visible ? "visible" : "none" },
        paint: {
            "fill-color": [
                "case",
                ["boolean", ["feature-state", "glow"], false],
                "#00fff2", // glowing cyan color
                "#088", // default color
            ],
            "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "glow"], false],
                0.8,
                0.5,
            ],
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

    let activeFeatureId = null;

    map.on("click", fillLayerId, (e) => {
        if (!e.features.length) return;

        const feature = e.features[0];
        const featureId = feature.id || feature.properties.grid_id;

        if (activeFeatureId !== null) {
            map.setFeatureState(
                { source: sourceid, id: activeFeatureId },
                { glow: false }
            );
        }

        if (featureId) {
            activeFeatureId = featureId;
            map.setFeatureState(
                { source: sourceid, id: activeFeatureId },
                { glow: true }
            );
        }

        const featureProps = {...feature.properties, layerLevel: idPrefix, featureId: featureId};
        if (typeof map.__setSelectedFeature === "function") {
            map.__setSelectedFeature(featureProps);
        }
    });

    map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: [fillLayerId],
        });
        if (!features.length && activeFeatureId !== null) {
            map.setFeatureState(
                { source: sourceid, id: activeFeatureId },
                { glow: false })
                activeFeatureId = null;
            }
        })


    return {sourceid, fillLayerId, outlineLayerId}

}