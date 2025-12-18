import addMapHover from "../../Utils/addMapHover";

export default function BigHexLayer(map, idPrefix = "h3_6", visible = true) {

  const sourceid = `${idPrefix}-hexagons`;
  const fillLayerId = `${idPrefix}-hexagons-fill`;
  const outlineLayerId = `${idPrefix}-hexagons-outline`;

  const depthColorRamp = [
    "case",

    // Unknown / missing MEAN
    ["!", ["has", "MEAN"]],
    "#888888",

    // Known values → step ramp
    [
      "step",
      ["get", "MEAN"],

      // default (MEAN < -5000)
      "#051833",

      -5000, "#103b53",
      -3000, "#205b71",
      -2000, "#307e8d",
      -1500, "#409eac",
      -100,  "#5ce2e7",
      0,     "#a7a7a7" // > 0
    ]
  ];

  map.addSource(sourceid, {
    type: "geojson",
    data: "/Data/FeaturesToJSON_OutJsonFile_H3_6_depth_wrecks.geojson",
  });

  map.addLayer({
    id: fillLayerId,
    type: "fill",
    source: sourceid,
    layout: { visibility: visible ? "visible" : "none" },
    paint: {
      "fill-color": depthColorRamp,
      "fill-opacity": 0.65,
    },
  });

  map.addLayer({
    id: outlineLayerId,
    type: "line",
    source: sourceid,
    layout: { visibility: visible ? "visible" : "none" },
    paint: {
      "line-color": "#ffffff",
      "line-width": 1,
    },
  });
  

  // Hover effect
  addMapHover(map, fillLayerId, [
    "case",
    ["boolean", ["feature-state", "hover"], false],
    "#000000",
    depthColorRamp
  ]);

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
};

