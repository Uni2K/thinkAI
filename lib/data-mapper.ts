interface RefinedPropertyData {
  id: string;
  title: string;
  zip: string;
  buyingPrice: number;
  rooms: number;
  squareMeter: number;
  address: {
    displayName?: string;
    town?: string;
    city?: string;
    suburb?: string;
    city_district?: string;
    postcode?: string;
  };
  images: string[];
  ai?: {
    dominantFloor?: string;
    avgBrightness?: number;
    facadeColor?: string;
    kitchenColor?: string;
    bathroomColor?: string;
    saunaType?: string;
  };
}

export interface PropertyListing {
  id: number;
  image: string;
  title: string;
  location: string;
  price: number;
  size: number;
  rooms: number;
  brightness: string;
  brightnessScore: number;
  floorType: string;
  exteriorColor: string;
  kitchenColor: string;
  bathroomTiles: string;
  saunaType: string;
}

export function mapRefinedDataToProperties(refinedData: RefinedPropertyData[]): PropertyListing[] {
  return refinedData.map((item, index) => {
    // Format location from address data
    const location = formatLocation(item.address);
    
    // Extract AI analysis data with fallbacks
    const aiData = item.ai || {};
    const brightnessScore = aiData.avgBrightness || 0;
    const brightness = convertBrightnessScoreToLabel(brightnessScore);
    
    return {
      id: index + 1,
      image: item.images?.[0] || "/placeholder.svg",
      title: item.title || "Immobilie",
      location,
      price: item.buyingPrice || 0,
      size: Math.round(item.squareMeter) || 0,
      rooms: item.rooms || 1,
      brightness,
      brightnessScore,
      floorType: aiData.dominantFloor || "unknown",
      exteriorColor: aiData.facadeColor || "unknown",
      kitchenColor: aiData.kitchenColor || "unknown",
      bathroomTiles: aiData.bathroomColor || "unknown",
      saunaType: aiData.saunaType || "unknown",
    };
  });
}

function convertBrightnessScoreToLabel(score: number): string {
  if (score >= 80) return "Sehr hell";
  if (score >= 60) return "Hell";
  if (score >= 40) return "Mittel";
  if (score >= 20) return "Dunkel";
  if (score > 0) return "Sehr dunkel";
  return "Unbekannt";
}

function formatLocation(address: RefinedPropertyData['address']): string {
  const city = address?.city || address?.town || "Unbekannt";
  const district = address?.suburb || address?.city_district;
  
  if (district) {
    return `${city}, ${district}`;
  }
  
  return city;
}