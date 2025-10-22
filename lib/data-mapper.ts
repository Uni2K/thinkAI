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
    floorType?: string;
    brightnessScore?: number;
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
    const brightnessScore = aiData.brightnessScore || 0;
    const brightness = convertBrightnessScoreToLabel(brightnessScore);
    
    return {
      id: index + 1,
      image: item.images?.[0] || generateHousePlaceholder(),
      title: item.title || "Immobilie",
      location,
      price: item.buyingPrice || 0,
      size: Math.round(item.squareMeter) || 0,
      rooms: item.rooms || 1,
      brightness: brightness ?? "Unbekannt",
      brightnessScore,
      floorType: aiData.floorType || "unknown",
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

function generateHousePlaceholder(): string {
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjxwb2x5Z29uIHBvaW50cz0iMjAwLDUwIDM1MCwxNTAgNTAsMTUwIiBmaWxsPSIjRDk3NzA2IiBzdHJva2U9IiNCNDUzMDkiIHN0cm9rZS13aWR0aD0iMiIvPgo8cmVjdCB4PSI3NSIgeT0iMTUwIiB3aWR0aD0iMjUwIiBoZWlnaHQ9IjEzMCIgZmlsbD0iI0ZCQkYyNCIgc3Ryb2tlPSIjRDk3NzA2IiBzdHJva2Utd2lkdGg9IjIiLz4KPHJlY3QgeD0iMTAwIiB5PSIxNzAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzZCNzI4MCIgc3Ryb2tlPSIjMzc0MTUxIiBzdHJva2Utd2lkdGg9IjIiLz4KPHJlY3QgeD0iMTA1IiB5PSIxNzUiIHdpZHRoPSI1MCIgaGVpZ2h0PSIzNSIgZmlsbD0iI0RCRUFGRSINIC8+CjxyZWN0IHg9IjI0MCIgeT0iMTcwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiM2QjcyODAiIHN0cm9rZT0iIzM3NDE1MSIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxyZWN0IHg9IjI0NSIgeT0iMTc1IiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNEQkVBRkUiLz4KPGNpcmNsZSBjeD0iMTU1IiBjeT0iMjEwIiByPSIzIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjkwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMzc0MTUxIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPktlaW5lIEJpbGRlciB2ZXJmw7xnYmFyPC90ZXh0Pgo8L3N2Zz4K";
}

function formatLocation(address: RefinedPropertyData['address']): string {
  const city = address?.city || address?.town || "Unbekannt";
  const district = address?.suburb || address?.city_district;
  
  if (district) {
    return `${city}, ${district}`;
  }
  
  return city;
}