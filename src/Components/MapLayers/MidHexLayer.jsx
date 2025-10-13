export default function BigHexLayer(map, idPrefix = "mid", visible = true) {

  const sourceid = `${idPrefix}-hexagons`;
  const fillLayerId = `${idPrefix}-hexagons-fill`;
  const outlineLayerId = `${idPrefix}-hexagons-outline`;

  map.addSource(sourceid, {
    type: "geojson",
    data: "/Data/PairwiseClipH3_FeaturesToJSO.geojson",
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
  map.on("mousemove", fillLayerId, (e) => {
    if (e.features.length > 0) {
        map.getCanvas().style.cursor = "pointer";

        // Example: highlight on hover
        map.setPaintProperty(fillLayerId, "fill-color", [
          "case",
          ["==", ["get", "GRID_ID"], e.features[0].properties.GRID_ID],
          "#f00",
          "#088",
        ]);
      }
    }
  );

  map.on("click", fillLayerId, (e) => {
    if (e.features.length > 0) {
      const featureProps = e.features[0].properties;
      // Send to parent
      if (typeof map.__setSelectedFeature === "function") {
        map.__setSelectedFeature(featureProps);
      }
    }
  });
  
  map.on("mouseleave", fillLayerId, () => {
    map.getCanvas().style.cursor = "";
    map.setPaintProperty(fillLayerId, "fill-color", "#088");
  });

  return {sourceid, fillLayerId, outlineLayerId}
};

