// ISO 3166-1 alpha-3 codes for all African Union member states / territories,
// used to filter a world topojson down to just the African continent.
export const AFRICA_ISO3 = [
  "DZA", "AGO", "BEN", "BWA", "BFA", "BDI", "CPV", "CMR", "CAF", "TCD",
  "COM", "COG", "COD", "CIV", "DJI", "EGY", "GNQ", "ERI", "SWZ", "ETH",
  "GAB", "GMB", "GHA", "GIN", "GNB", "KEN", "LSO", "LBR", "LBY", "MDG",
  "MWI", "MLI", "MRT", "MUS", "MAR", "MOZ", "NAM", "NER", "NGA", "RWA",
  "STP", "SEN", "SYC", "SLE", "SOM", "ZAF", "SSD", "SDN", "TZA", "TGO",
  "TUN", "UGA", "ZMB", "ZWE", "ESH",
];

// world-atlas topojson feature ids are ISO 3166-1 *numeric* codes, not
// alpha-3 — this maps the numeric id used by react-simple-maps' Geography
// objects back to the alpha-3 codes above. A few small island states
// (CPV, COM, MUS, STP, SYC) aren't present at 110m resolution.
export const AFRICA_NUMERIC_TO_ISO3: Record<string, string> = {
  "012": "DZA", "024": "AGO", "204": "BEN", "072": "BWA", "854": "BFA",
  "108": "BDI", "120": "CMR", "140": "CAF", "148": "TCD", "178": "COG",
  "180": "COD", "384": "CIV", "262": "DJI", "818": "EGY", "226": "GNQ",
  "232": "ERI", "748": "SWZ", "231": "ETH", "266": "GAB", "270": "GMB",
  "288": "GHA", "324": "GIN", "624": "GNB", "404": "KEN", "426": "LSO",
  "430": "LBR", "434": "LBY", "450": "MDG", "454": "MWI", "466": "MLI",
  "478": "MRT", "504": "MAR", "508": "MOZ", "516": "NAM", "562": "NER",
  "566": "NGA", "646": "RWA", "686": "SEN", "694": "SLE", "706": "SOM",
  "710": "ZAF", "728": "SSD", "729": "SDN", "834": "TZA", "768": "TGO",
  "788": "TUN", "800": "UGA", "894": "ZMB", "716": "ZWE", "732": "ESH",
};
