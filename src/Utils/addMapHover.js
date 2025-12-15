export default function addMapHover(map, layerId) {
  let hoveredFeatureId = null;
  const sourceId = map.getLayer(layerId).source;

  map.on("mousemove", layerId, (e) => {
    if (!e.features?.length) return;

    map.getCanvas().style.cursor = "pointer";
    const featureId = e.features[0].id; // numeric ids from GeoJSON
    if (featureId == null) return;

    if (hoveredFeatureId != null && hoveredFeatureId !== featureId) {
      map.setFeatureState({ source: sourceId, id: hoveredFeatureId }, { hover: false });
    }

    hoveredFeatureId = featureId;
    map.setFeatureState({ source: sourceId, id: hoveredFeatureId }, { hover: true });
  });

  map.on("mouseleave", layerId, () => {
    if (hoveredFeatureId != null) {
      map.setFeatureState({ source: sourceId, id: hoveredFeatureId }, { hover: false });
    }
    hoveredFeatureId = null;
    map.getCanvas().style.cursor = "";
  });
}
