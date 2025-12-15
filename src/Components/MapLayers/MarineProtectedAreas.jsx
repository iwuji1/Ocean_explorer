import mapboxgl from "mapbox-gl";

function getPopupLngLat(feature) {
  const geom = feature?.geometry;
  if (!geom) return null;

  // If it's a Point, easy
  if (geom.type === "Point") return geom.coordinates;

  // Helper: centroid of a linear ring (array of [lng,lat])
  const ringCentroid = (ring) => {
    if (!Array.isArray(ring) || ring.length === 0) return null;
    let x = 0, y = 0;
    for (const p of ring) {
      x += Number(p[0]);
      y += Number(p[1]);
    }
    return [x / ring.length, y / ring.length];
  };

  // Polygon: coordinates = [ outerRing, hole1, hole2... ]
  if (geom.type === "Polygon") {
    return ringCentroid(geom.coordinates?.[0]);
  }

  // MultiPolygon: coordinates = [ polygon1, polygon2, ... ]
  // polygon1 = [ outerRing, holes... ]
  if (geom.type === "MultiPolygon") {
    return ringCentroid(geom.coordinates?.[0]?.[0]);
  }

  // Fallback: try to unwrap until we hit [lng,lat]
  let coords = geom.coordinates;
  while (Array.isArray(coords?.[0]) && typeof coords?.[0]?.[0] !== "number") {
    coords = coords[0];
  }
  if (Array.isArray(coords) && typeof coords[0] === "number") return coords;

  return null;
}

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
        closeOnClick: false,
        className: "MPA-points"
    });

    map.on('mouseenter', layerId, (e) => {
        map.getCanvas().style.cursor = 'pointer';

        const feature = e.features[0];
        console.log(feature)
        const name = feature.properties["NAME"] || 'Unknown';
        const status= feature.properties["STATUS"] || 'Unknown';
        const status_yr = feature.properties["STATUS_YR"] || 'Unknown';
        
        const esc = (s) => String(s ?? "").replace(/[&<>"']/g, m => ({
            "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
        }[m]));

        const lngLat = getPopupLngLat(feature);
        if (!lngLat) return;

        popup
        .setLngLat(lngLat)
        .setHTML(`<strong>${esc(name)}</strong><br/>Status: ${esc(status)}<br/>Status Year: ${status_yr}`)
        .addTo(map);
    });

    // Remove popup on leave
    map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
    });

    return {sourceId, layerId};
}