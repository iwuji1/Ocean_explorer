
const handleHexClick = async (hex) => {
  setSelectedHex(hex);

  // Get hex_id from GeoJSON
  const hexId = hex.properties["GRID_ID"];

  // Fetch the dynamic data from Supabase
  const { data, error } = await supabase
    .from("hexes")
    .select(`
      hex_id,
      total_funded,
      total_cost,
      hex_ownerships (
        amount_funded,
        user_id
      )
    `)
    .eq("hex_id", hexId)
    .single();

  if (data) {
    setHexFundingData(data);
  }
};