"use client"

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  MapPin,
  Euro,
  Maximize2,
  Heart,
  Share2,
  Sun,
  Home,
  UtensilsCrossed,
  Droplets,
  Layers,
  Flame,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { mapRefinedDataToProperties, type PropertyListing } from "@/lib/data-mapper"

const mockProperties = [
  {
    id: 1,
    image: "/modern-bright-apartment-with-white-kitchen.jpg",
    title: "Moderne Wohnung in München",
    location: "München, Bayern",
    price: 450000,
    size: 85,
    rooms: 3,
    brightness: "Sehr hell",
    exteriorColor: "Weiß",
    kitchenColor: "Weiß",
    bathroomTiles: "Grau",
    saunaType: "finnisch",
  },
  {
    id: 2,
    image: "/cozy-apartment-with-wooden-kitchen.jpg",
    title: "Gemütliche Altbauwohnung",
    location: "Berlin, Prenzlauer Berg",
    price: 380000,
    size: 72,
    rooms: 2,
    brightness: "Hell",
    exteriorColor: "Beige",
    kitchenColor: "Holz",
    bathroomTiles: "Weiß",
    saunaType: "bio",
  },
  {
    id: 3,
    image: "/luxury-penthouse-with-black-kitchen.jpg",
    title: "Penthouse mit Dachterrasse",
    location: "Hamburg, HafenCity",
    price: 890000,
    size: 120,
    rooms: 4,
    brightness: "Sehr hell",
    exteriorColor: "Grau",
    kitchenColor: "Schwarz",
    bathroomTiles: "Schwarz",
    saunaType: "infrarot",
  },
  {
    id: 4,
    image: "/family-house-with-blue-exterior.jpg",
    title: "Einfamilienhaus mit Garten",
    location: "Frankfurt, Sachsenhausen",
    price: 650000,
    size: 145,
    rooms: 5,
    brightness: "Hell",
    exteriorColor: "Blau",
    kitchenColor: "Weiß",
    bathroomTiles: "Beige",
    saunaType: "dampf",
  },
]

export function PropertyListings() {
  const [properties, setProperties] = useState<PropertyListing[]>([])
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set())
    const [aiQuery, setAiQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [brightnessLevel, setBrightnessLevel] = useState([50])
  const [selectedExteriorColor, setSelectedExteriorColor] = useState<string>("")
  const [selectedKitchenColor, setSelectedKitchenColor] = useState<string>("")
  const [selectedBathroomColor, setSelectedBathroomColor] = useState<string>("")
  const [selectedFloorMaterial, setSelectedFloorMaterial] = useState<string>("")
  const [selectedSaunaType, setSelectedSaunaType] = useState<string>("")

  // Load data from data_refined.json
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const response = await fetch('/data_refined.json')
        const refinedData = await response.json()
        console.log('Refined Data:', refinedData  )
        const mappedProperties = mapRefinedDataToProperties(refinedData)
        console.log('Mapped Properties:', mappedProperties)
        setProperties(mappedProperties)
      } catch (error) {
        console.error('Error loading properties:', error)
        // Fallback to mock data if loading fails
      }
    }
    
    loadProperties()
  }, [])

  const handleImageError = (propertyId: number) => {
    setFailedImages(prev => new Set(prev).add(propertyId))
  }

  const HousePlaceholder = () => (
    <div className="w-full h-full bg-gradient-to-b from-blue-100 to-green-100 flex items-center justify-center">
      <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Sun */}
        <circle cx="170" cy="25" r="12" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
        <line x1="170" y1="8" x2="170" y2="12" stroke="#F59E0B" strokeWidth="2"/>
        <line x1="185" y1="25" x2="181" y2="25" stroke="#F59E0B" strokeWidth="2"/>
        <line x1="170" y1="42" x2="170" y2="38" stroke="#F59E0B" strokeWidth="2"/>
        <line x1="155" y1="25" x2="159" y2="25" stroke="#F59E0B" strokeWidth="2"/>
        <line x1="180" y1="14" x2="178" y2="16" stroke="#F59E0B" strokeWidth="2"/>
        <line x1="182" y1="34" x2="180" y2="36" stroke="#F59E0B" strokeWidth="2"/>
        <line x1="160" y1="36" x2="162" y2="34" stroke="#F59E0B" strokeWidth="2"/>
        <line x1="162" y1="16" x2="160" y2="14" stroke="#F59E0B" strokeWidth="2"/>

        {/* Clouds */}
        <ellipse cx="40" cy="20" rx="8" ry="5" fill="#E5E7EB"/>
        <ellipse cx="45" cy="18" rx="6" ry="4" fill="#E5E7EB"/>
        <ellipse cx="50" cy="20" rx="7" ry="5" fill="#E5E7EB"/>

        {/* Main house roof */}
        <polygon points="100,30 160,65 40,65" fill="#DC2626" stroke="#991B1B" strokeWidth="2"/>

        {/* Chimney */}
        <rect x="125" y="20" width="8" height="25" fill="#7C2D12" stroke="#451A03" strokeWidth="1"/>
        <rect x="123" y="18" width="12" height="4" fill="#991B1B"/>

        {/* Smoke */}
        <circle cx="129" cy="15" r="2" fill="#9CA3AF" opacity="0.7"/>
        <circle cx="132" cy="12" r="1.5" fill="#9CA3AF" opacity="0.5"/>
        <circle cx="127" cy="10" r="1" fill="#9CA3AF" opacity="0.3"/>

        {/* House body */}
        <rect x="50" y="65" width="100" height="60" fill="#FEF3C7" stroke="#D97706" strokeWidth="2"/>

        {/* Door */}
        <rect x="70" y="85" width="25" height="40" fill="#92400E" stroke="#451A03" strokeWidth="2"/>
        <rect x="72" y="87" width="21" height="18" fill="#DBEAFE" rx="2"/>
        <circle cx="88" cy="105" r="2" fill="#374151"/>

        {/* Door steps */}
        <rect x="68" y="123" width="29" height="3" fill="#6B7280"/>
        <rect x="66" y="126" width="33" height="2" fill="#4B5563"/>

        {/* Windows */}
        <rect x="105" y="75" width="20" height="20" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="2"/>
        <rect x="107" y="77" width="16" height="16" fill="#DBEAFE"/>
        <line x1="115" y1="77" x2="115" y2="93" stroke="#1E3A8A" strokeWidth="1"/>
        <line x1="107" y1="85" x2="123" y2="85" stroke="#1E3A8A" strokeWidth="1"/>

        <rect x="130" y="75" width="15" height="15" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="2"/>
        <rect x="132" y="77" width="11" height="11" fill="#DBEAFE"/>
        <line x1="137.5" y1="77" x2="137.5" y2="88" stroke="#1E3A8A" strokeWidth="1"/>
        <line x1="132" y1="82.5" x2="143" y2="82.5" stroke="#1E3A8A" strokeWidth="1"/>

        {/* Flower boxes */}
        <rect x="103" y="95" width="24" height="4" fill="#059669"/>
        <circle cx="107" cy="93" r="2" fill="#EF4444"/>
        <circle cx="115" cy="92" r="2" fill="#F59E0B"/>
        <circle cx="123" cy="93" r="2" fill="#EF4444"/>

        <rect x="128" y="90" width="19" height="3" fill="#059669"/>
        <circle cx="132" cy="88" r="1.5" fill="#8B5CF6"/>
        <circle cx="140" cy="87" r="1.5" fill="#EC4899"/>
        <circle cx="144" cy="88" r="1.5" fill="#8B5CF6"/>

        {/* Grass */}
        <rect x="0" y="125" width="200" height="25" fill="#10B981"/>
        <rect x="0" y="120" width="200" height="8" fill="#059669"/>

        {/* Cute face on house */}
        <circle cx="85" cy="105" r="1.5" fill="#374151"/>
        <circle cx="90" cy="105" r="1.5" fill="#374151"/>
        <path d="M 82 110 Q 87.5 115 93 110" stroke="#374151" strokeWidth="1.5" fill="none"/>

        <text x="100" y="145" textAnchor="middle" fill="#374151" fontSize="12" fontFamily="Arial, sans-serif" fontWeight="bold">
          🏠 Kein Bild verfügbar! 😅
        </text>
      </svg>
    </div>
  )

  const colors = [
    { name: "Weiß", value: "weiß", hex: "#FFFFFF", border: true },
    { name: "Beige", value: "beige", hex: "#F5F5DC" },
    { name: "Grau", value: "grau", hex: "#9CA3AF" },
    { name: "Schwarz", value: "schwarz", hex: "#1F2937" },
    { name: "Blau", value: "blau", hex: "#3B82F6" },
    { name: "Rot", value: "rot", hex: "#EF4444" },
    { name: "Gelb", value: "gelb", hex: "#FBBF24" },
    { name: "Grün", value: "grün", hex: "#10B981" },
    { name: "Unbekannt", value: "unknown", hex: "#6B7280" },
  ]

  const floorMaterials = [
    { name: "Parkett", value: "Parkett" },
    { name: "Laminat", value: "Laminat" },
    { name: "Fliesen", value: "Fliesen" },
    { name: "Holzdielen", value: "Holzdielen" },
    { name: "Vinyl", value: "Vinyl" },
    { name: "Teppich", value: "Teppich" },
    { name: "Naturstein", value: "Naturstein" },
    { name: "Beton", value: "Beton" },
    { name: "Unbekannt", value: "unknown" },
  ]

  const saunaTypes = [
    { name: "Finnische Sauna", value: "Finnische Sauna" },
    { name: "Bio-Sauna", value: "Bio-Sauna" },
    { name: "Infrarot-Sauna", value: "Infrarot-Sauna" },
    { name: "Dampfsauna", value: "Dampfsauna" },
    { name: "Sanarium", value: "Sanarium" },
    { name: "Textilsauna", value: "Textilsauna" },
    { name: "Unbekannt", value: "unknown" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg ai-gradient flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">ThinkAI</h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost">Kaufen</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost">Mieten</Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost">Über uns</Button>
              </Link>
              <Button>Anmelden</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* AI Search Section */}
      <section className=" bg-gradient-to-b from-muted/30 to-background mt-40">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-8">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl ai-gradient flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-5xl font-bold">ThinkAI</h1>
              </div>
              <p className="text-lg text-muted-foreground text-pretty max-w-3xl mx-auto">
                Finde deine Traumimmobilie mit ThinkAI - Beschreibe einfach, was du suchst - unsere KI versteht auch
                visuelle Präferenzen wie Helligkeit und Farben
              </p>
            </div>

            {/* AI Search Input */}
            <div className="relative">
              <div className="absolute inset-0 ai-gradient opacity-20 blur-xl rounded-2xl" />
              <div className="relative bg-card border-2 border-primary/20 rounded-2xl p-2 ai-glow">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg ai-gradient flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <Input
                    placeholder="Ich suche eine Wohnung in München"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    className="border-0 bg-transparent text-base h-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button size="lg" className="ai-gradient text-white flex-shrink-0 cursor-pointer">
                    <Search className="w-5 h-5 mr-2" />
                    Suchen
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">Oder nutze unsere intelligenten Filter:</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {/* Brightness Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 hover:text-border-primary/50 hover:border-primary/50 hover:bg-primary/5 transition-colors bg-transparent"
                    >
                      <Sun className="w-4 h-4 text-amber-500" />
                      Lichtverhältnisse
                      {brightnessLevel[0] > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                          {brightnessLevel[0]}%
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Lichtverhältnisse der Immobilie</label>
                          <span className="text-sm text-muted-foreground">{brightnessLevel[0]}%</span>
                        </div>
                        <Slider
                          value={brightnessLevel}
                          onValueChange={setBrightnessLevel}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground pt-1">
                          <span>Sehr dunkel</span>
                          <span>Sehr hell durchflutet</span>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Exterior Color Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 hover:text-border-primary/50 hover:border-primary/50 hover:bg-primary/5 transition-colors bg-transparent"
                    >
                      <Home className="w-4 h-4 text-blue-500" />
                      Farbe der Fassade
                      {selectedExteriorColor && (
                        <div
                          className="w-4 h-4 rounded-full border ml-1"
                          style={{
                            backgroundColor: colors.find((c) => c.value === selectedExteriorColor)?.hex,
                            borderColor: selectedExteriorColor === "white" ? "#e5e7eb" : "transparent",
                          }}
                        />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Wähle die Farbe der Außenfassade</label>
                      <div className="grid grid-cols-5 gap-3">
                        {colors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() =>
                              setSelectedExteriorColor(selectedExteriorColor === color.value ? "" : color.value)
                            }
                            className={`group relative flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors ${
                              selectedExteriorColor === color.value ? "bg-muted" : ""
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-full border-2 transition-all ${
                                selectedExteriorColor === color.value
                                  ? "border-primary ring-2 ring-primary/20 scale-110"
                                  : color.border
                                    ? "border-border"
                                    : "border-transparent"
                              }`}
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-xs text-center leading-tight">{color.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Kitchen Color Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 hover:text-border-primary/50 hover:border-primary/50 hover:bg-primary/5 transition-colors bg-transparent"
                    >
                      <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                      Küchenfarbe
                      {selectedKitchenColor && (
                        <div
                          className="w-4 h-4 rounded-full border ml-1"
                          style={{
                            backgroundColor: colors.find((c) => c.value === selectedKitchenColor)?.hex,
                            borderColor: selectedKitchenColor === "white" ? "#e5e7eb" : "transparent",
                          }}
                        />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Wähle die Küchenfarbe</label>
                      <div className="grid grid-cols-5 gap-3">
                        {colors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() =>
                              setSelectedKitchenColor(selectedKitchenColor === color.value ? "" : color.value)
                            }
                            className={`group relative flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors ${
                              selectedKitchenColor === color.value ? "bg-muted" : ""
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-full border-2 transition-all ${
                                selectedKitchenColor === color.value
                                  ? "border-primary ring-2 ring-primary/20 scale-110"
                                  : color.border
                                    ? "border-border"
                                    : "border-transparent"
                              }`}
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-xs text-center leading-tight">{color.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Bathroom Tiles Color Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 hover:text-border-primary/50 hover:border-primary/50 hover:bg-primary/5 transition-colors bg-transparent"
                    >
                      <Droplets className="w-4 h-4 text-cyan-500" />
                      Badfarbe
                      {selectedBathroomColor && (
                        <div
                          className="w-4 h-4 rounded-full border ml-1"
                          style={{
                            backgroundColor: colors.find((c) => c.value === selectedBathroomColor)?.hex,
                            borderColor: selectedBathroomColor === "white" ? "#e5e7eb" : "transparent",
                          }}
                        />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Wähle die Badfarbe</label>
                      <div className="grid grid-cols-5 gap-3">
                        {colors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() =>
                              setSelectedBathroomColor(selectedBathroomColor === color.value ? "" : color.value)
                            }
                            className={`group relative flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors ${
                              selectedBathroomColor === color.value ? "bg-muted" : ""
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-full border-2 transition-all ${
                                selectedBathroomColor === color.value
                                  ? "border-primary ring-2 ring-primary/20 scale-110"
                                  : color.border
                                    ? "border-border"
                                    : "border-transparent"
                              }`}
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-xs text-center leading-tight">{color.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Floor Material Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 hover:text-border-primary/50 hover:border-primary/50 hover:bg-primary/5 transition-colors bg-transparent"
                    >
                      <Layers className="w-4 h-4 text-emerald-500" />
                      Bodenbelag
                      {selectedFloorMaterial && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                          {floorMaterials.find((m) => m.value === selectedFloorMaterial)?.name}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Wähle den Bodenbelag</label>
                      <div className="grid grid-cols-2 gap-2">
                        {floorMaterials.map((material) => (
                          <button
                            key={material.value}
                            onClick={() =>
                              setSelectedFloorMaterial(selectedFloorMaterial === material.value ? "" : material.value)
                            }
                            className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                              selectedFloorMaterial === material.value
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border hover:border-primary/50 hover:bg-muted"
                            }`}
                          >
                            {material.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Sauna Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 hover:text-border-primary/50 hover:border-primary/50 hover:bg-primary/5 transition-colors bg-transparent"
                    >
                      <Flame className="w-4 h-4 text-red-500" />
                      Sauna
                      {selectedSaunaType && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                          {saunaTypes.find((s) => s.value === selectedSaunaType)?.name}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Wähle die Sauna-Art</label>
                      <div className="grid grid-cols-2 gap-2">
                        {saunaTypes.map((sauna) => (
                          <button
                            key={sauna.value}
                            onClick={() => setSelectedSaunaType(selectedSaunaType === sauna.value ? "" : sauna.value)}
                            className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                              selectedSaunaType === sauna.value
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border hover:border-primary/50 hover:bg-muted"
                            }`}
                          >
                            {sauna.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Traditional Filters Button */}
                <Button variant="outline" className="gap-2 bg-transparent">
                  <SlidersHorizontal className="w-4 h-4" />
                  Weitere Filter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="container mx-auto px-4 py-8border-t border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold">Verfügbare Immobilien</h3>
            <p className="text-muted-foreground">{properties.length} Ergebnisse gefunden</p>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative aspect-[4/3] overflow-hidden">
                {failedImages.has(property.id) || !property.image.startsWith('http') ? (
                  <HousePlaceholder />
                ) : (
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={() => handleImageError(property.id)}
                  />
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <Button size="icon" variant="secondary" className="rounded-full bg-white/90 hover:bg-white">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="rounded-full bg-white/90 hover:bg-white">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
                <Badge className="absolute bottom-3 left-3 bg-primary text-primary-foreground">
                  {property.brightness}
                </Badge>
              </div>
              <CardContent className="p-5 space-y-4">
                <div>
                  <h4 className="font-semibold text-lg mb-1">{property.title}</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.location}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-2xl font-bold">
                    <Euro className="w-5 h-5" />
                    {property.price.toLocaleString("de-DE")}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Maximize2 className="w-4 h-4" />
                    {property.size} m²
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{property.rooms} Zimmer</Badge>
                  {property.floorType !== "unknown" && <Badge variant="outline">Boden: {property.floorType}</Badge>}
                  {property.exteriorColor !== "unknown" && <Badge variant="outline">Fassade: {property.exteriorColor}</Badge>}
                  {property.kitchenColor !== "unknown" && <Badge variant="outline">Küche: {property.kitchenColor}</Badge>}
                  {property.bathroomTiles !== "unknown" && <Badge variant="outline">Bad: {property.bathroomTiles}</Badge>}
                  {property.saunaType !== "unknown" && <Badge variant="outline">Sauna: {property.saunaType}</Badge>}
                </div>

                <Button className="w-full">Details ansehen</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
