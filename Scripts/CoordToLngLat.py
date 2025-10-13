import os
import geopandas as gpd

# base_dir = os.path.dirname(__file__)  # folder containing your script
# file_path = os.path.join("..", "public", "Data", "FeaturesToJSON_OutJsonFile_Clips_PairwiseClip_370000000_SquareMeters.geojson") ## changing projection from co-ordinates to lnglat
file_path = os.path.join("..", "public", "Data", "PairwiseClipH3_FeaturesToJSO.geojson")
file_path = os.path.join("..", "public", "Data", "wrecks_clip_EE_FeaturesToJSO.geojson") # already in lnglat so no need to change

# Load your geojson
gdf = gpd.read_file(file_path)

# Reproject from EPSG:32620 to EPSG:4326
gdf = gdf.to_crs(epsg=4326)

# Save the new geojson
gdf.to_file("../public/Data/Big_hexagon_projection.geojson", driver="GeoJSON")