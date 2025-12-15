import mapboxgl from "mapbox-gl";
import { gsap } from "gsap";

export default function addLiveShipDots(map) {
  const sourceId = "live-ships";
  const dotLayerId = "live-ships-dot";
  const ringLayerId = "live-ships-ring";

  const center = [-61.2872, 13.1568];
  const randomPointNear = ([lng, lat], maxOffset = 0.6) => ([
    lng + (Math.random() - 0.5) * maxOffset,
    lat + (Math.random() - 0.5) * maxOffset
  ]);

  const features = Array.from({ length: 5 }).map((_, i) => ({
    type: "Feature",
    id: `ship-${i}`,
    properties: { shipId: `ship-${i}`, launchdate:"24/12/2025" },
    geometry: { type: "Point", coordinates: randomPointNear(center) }
  }));

  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: "geojson",
      data: { type: "FeatureCollection", features }
    });
  } else {
    map.getSource(sourceId).setData({ type: "FeatureCollection", features });
  }

  if (!map.getLayer(dotLayerId)) {
    map.addLayer({
      id: dotLayerId,
      type: "circle",
      source: sourceId,
      paint: {
        "circle-color": "#00fff2",
        "circle-radius": 5,
        "circle-opacity": 1
      }
    });
  }

  if (!map.getLayer(ringLayerId)) {
    map.addLayer({
      id: ringLayerId,
      type: "circle",
      source: sourceId,
      paint: {
        "circle-color": "#00fff2",
        "circle-radius": [
          "interpolate", ["linear"],
          ["coalesce", ["feature-state", "pulse"], 0],
          0, 6,
          1, 18
        ],
        "circle-opacity": [
          "interpolate", ["linear"],
          ["coalesce", ["feature-state", "pulse"], 0],
          0, 0.8,
          1, 0
        ],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#00fff2",
        "circle-stroke-opacity": [
          "interpolate", ["linear"],
          ["coalesce", ["feature-state", "pulse"], 0],
          0, 0.9,
          1, 0
        ]
      }
    });
  }

  let raf;
  let t = 0;
  const tick = () => {
    t += 0.03;
    for (let i = 0; i < 5; i++) {
      const phase = (t + i * 0.6) % 1;
      map.setFeatureState({ source: sourceId, id: `ship-${i}` }, { pulse: phase });
    }
    raf = requestAnimationFrame(tick);
  };
  tick();

  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    className: "Ship-dots"
  });

  map.on('mouseenter', dotLayerId, (e) => {
    map.getCanvas().style.cursor = 'pointer';

    const feature = e.features[0];
    const name = feature.properties.shipId || 'Unknown';
    const launch = feature.properties.launchdate || 'Unknown';

    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, m=> ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[m]));

    popup
    .setLngLat(feature.geometry.coordinates)
    .setHTML(`<strong>${esc(name)}</strong><br/>Launch Date: ${esc(launch)}`)
    .addTo(map);
  })

    // Remove popup on leave
  map.on('mouseleave', dotLayerId, () => {
      map.getCanvas().style.cursor = '';
      popup.remove();
  });

  return {
    sourceId,
    dotLayerId,
    ringLayerId,
    stop: () => raf && cancelAnimationFrame(raf)
  };
}
