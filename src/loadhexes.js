import fs from 'fs/promises';
import { supabase } from "./supabaseClient.js";

async function loadHexes() {
    const geojson = await fetch('/Data/H3_5_depth_wrecks_family.json').then(res => res.json());

    for (const feature of geojson.features) {
        const { OBJECT_ID, GRID_ID, COUNT, MIN, MAX, MEAN, COUNT_OF_POINTS, WRECKS_OR_OBJS, PARENT_ID, CHILD_ID, SHAPE_LENGTH, SHAPE_AREA } = feature.properties;

        const { error } = await supabase
            .from('hexes_h5')
            .insert({
                object_id: OBJECT_ID,
                grid_id: GRID_ID,
                count: COUNT,
                min_depth: MIN,
                max_depth: MAX,
                mean_depth: MEAN,
                count_of_points: COUNT_OF_POINTS,
                wrecks_or_obstructions: WRECKS_OR_OBJS,
                parent_id: PARENT_ID,
                child_id: CHILD_ID,
                shape_length: SHAPE_LENGTH,
                shape_area: SHAPE_AREA,
                geometry: `SRID=4326;${featureToWKT(feature.geometry)}`,
            });

        if (error) {
            console.error('Error inserting feature:', error);
        }
    }
}

// Helper: convert GeoJSON geometry to WKT (Well-Known Text)
function featureToWKT(geometry) {
    const coords = geometry.coordinates[0]
        .map(([lng, lat]) => `${lng} ${lat}`)
        .join(', ');

    return `POLYGON((${coords}))`;
}

loadHexes();