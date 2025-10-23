"use client"

import {useState, useEffect, useRef, useMemo} from "react"
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
    Wind, Waves, ShowerHead, Bath, Thermometer
} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Badge} from "@/components/ui/badge"
import {Card, CardContent} from "@/components/ui/card"
import {Slider} from "@/components/ui/slider"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {mapRefinedDataToProperties, type PropertyListing} from "@/lib/data-mapper"
import {Checkbox} from "@radix-ui/react-checkbox";
import {Separator} from "@radix-ui/react-dropdown-menu";


const BATH_FEATURES = [
    {label: "Fenster", icon: Wind},
    {label: "Tageslicht", icon: Sun},
    {label: "Badewanne", icon: Waves},
    {label: "Dusche", icon: Droplets},
    {label: "Ebenerdige Dusche", icon: ShowerHead},
    {label: "Doppelwaschbecken", icon: Bath},
    {label: "Handtuchheizung", icon: Thermometer},
    {label: "Gäste-WC", icon: Bath},
]


export function PropertyListings() {
    const [properties, setProperties] = useState<PropertyListing[]>([])
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set())
    const [aiQuery, setAiQuery] = useState("")
    const [brightnessLevel, setBrightnessLevel] = useState([50])
    const [selectedExteriorColor, setSelectedExteriorColor] = useState<string>("")
    const [selectedKitchenColor, setSelectedKitchenColor] = useState<string>("")
    const [selectedBathroomColor, setSelectedBathroomColor] = useState<string>("")
    const [selectedFloorMaterial, setSelectedFloorMaterial] = useState<string>("")
    const [searchStarted, setSearchStarted] = useState(false)

    const [bathFeatures, setBathFeatures] = useState<string>("")


    const toggleFeature = (feature: string) => {
        if (bathFeatures === feature) {
            setBathFeatures("")
        } else {
            setBathFeatures(feature)
        }
    }

    const searchSectionRef = useRef<HTMLDivElement>(null)
    const handleSearch = async () => {
        try {
            const res = await fetch('/api/filter', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({aiQuery}),
            });

            const filters = await res.json();


            setSelectedExteriorColor(filters.facadeColor || "");
            setSelectedKitchenColor(filters.kitchenColor || "");
            setSelectedBathroomColor(filters.bathroomColor || "");
            setSelectedFloorMaterial(filters.floorType || "");
            setBrightnessLevel([filters.brightnessScore || 50]);
            setBathFeatures(filters.bathFeature || "");

            searchSectionRef.current?.scrollIntoView({behavior: "smooth", block: "start"})
            setSearchStarted(true)
        } catch (err) {
            console.error('Fehler beim Abrufen der Filter:', err);
        }
    };
    useEffect(() => {
        const loadProperties = async () => {
            try {
                const response = await fetch('/data_refined.json')
                const refinedData = await response.json()
                console.log('Refined Data:', refinedData)
                const mappedProperties = mapRefinedDataToProperties(refinedData)
                const filtered = mappedProperties.filter((property: PropertyListing) => {
                    if (brightnessLevel[0] > 0 && property.brightnessScore < brightnessLevel[0]) {
                        console.log(property.brightnessScore, brightnessLevel[0])
                        return false
                    }
                    // Fassadenfarbe
                    if (selectedExteriorColor && property.exteriorColor !== selectedExteriorColor) {
                        console.log(property.exteriorColor)
                        return false
                    }
                    // Küchenfarbe
                    if (selectedKitchenColor && property.kitchenColor !== selectedKitchenColor) {
                        console.log(property.kitchenColor)
                        return false
                    }
                    // Badfarbe
                    if (selectedBathroomColor && property.bathroomTiles !== selectedBathroomColor) {
                        console.log(property.bathroomTiles)
                        return false
                    }
                    // Bodenbelag
                    if (selectedFloorMaterial && property.floorType !== selectedFloorMaterial) {
                        console.log(property.floorType)
                        return false
                    }
                    // Sauna
                    if (bathFeatures && property.bathFeature !== bathFeatures) {
                        console.log(property.bathFeature)
                        return false
                    }
                    if (!aiQuery) {
                        console.log(aiQuery)
                        return false
                    }
                    return true
                })

                console.log('Mapped Properties:', filtered)
                setProperties(filtered)
            } catch (error) {
                console.error('Error loading properties:', error)
            }
        }

        loadProperties()
    }, [
        aiQuery,
        brightnessLevel,
        selectedExteriorColor,
        selectedKitchenColor,
        selectedBathroomColor,
        selectedFloorMaterial,
        bathFeatures
    ])


    const handleImageError = (propertyId: number) => {
        setFailedImages(prev => new Set(prev).add(propertyId))
    }

    const HousePlaceholder = () => (
        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Modern minimalist house outline */}
                {/* Roof line */}
                <path d="M40 15 L65 35 L15 35 Z" stroke="#3B82F6" strokeWidth="2" fill="none"/>

                {/* House base */}
                <rect x="20" y="35" width="40" height="25" stroke="#3B82F6" strokeWidth="2" fill="none"/>

                {/* Door */}
                <rect x="35" y="45" width="10" height="15" stroke="#3B82F6" strokeWidth="1.5" fill="none"/>

                {/* Windows */}
                <rect x="25" y="42" width="6" height="6" stroke="#3B82F6" strokeWidth="1.5" fill="none"/>
                <rect x="49" y="42" width="6" height="6" stroke="#3B82F6" strokeWidth="1.5" fill="none"/>

                {/* Window cross lines */}
                <line x1="28" y1="42" x2="28" y2="48" stroke="#3B82F6" strokeWidth="0.5"/>
                <line x1="25" y1="45" x2="31" y2="45" stroke="#3B82F6" strokeWidth="0.5"/>
                <line x1="52" y1="42" x2="52" y2="48" stroke="#3B82F6" strokeWidth="0.5"/>
                <line x1="49" y1="45" x2="55" y2="45" stroke="#3B82F6" strokeWidth="0.5"/>
            </svg>
        </div>
    )

    const colors = [
        {name: "Weiß", value: "weiß", hex: "#FFFFFF", border: true},
        {name: "Beige", value: "beige", hex: "#F5F5DC"},
        {name: "Grau", value: "grau", hex: "#9CA3AF"},
        {name: "Schwarz", value: "schwarz", hex: "#1F2937"},
        {name: "Blau", value: "blau", hex: "#3B82F6"},
        {name: "Rot", value: "rot", hex: "#EF4444"},
        {name: "Gelb", value: "gelb", hex: "#FBBF24"},
        {name: "Grün", value: "grün", hex: "#10B981"},
        {name: "Unbekannt", value: "unknown", hex: "#6B7280"},
    ]

    const floorMaterials = [
        {name: "Parkett", value: "Parkett"},
        {name: "Laminat", value: "Laminat"},
        {name: "Fliesen", value: "Fliesen"},
        {name: "Holzdielen", value: "Holzdielen"},
        {name: "Vinyl", value: "Vinyl"},
        {name: "Teppich", value: "Teppich"},
        {name: "Naturstein", value: "Naturstein"},
        {name: "Beton", value: "Beton"},
        {name: "Unbekannt", value: "unknown"},
    ]


    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <img width={40} src={"logo-small.png"}></img>
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
            <section  ref={searchSectionRef} className=" bg-gradient-to-b from-muted/30 to-background mt-40">
                <div className="container mx-auto px-4 py-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="text-center space-y-8">
                            <div className="flex items-center justify-center gap-3">
                                <img height={200} width={400} src={"/logo-large.png"}></img>
                            </div>
                            <p className="text-lg text-muted-foreground text-pretty max-w-3xl mx-auto">
                                Finde deine Traumimmobilie mit ThinkAI - Beschreibe einfach, was du suchst - unsere KI
                                versteht auch
                                visuelle Präferenzen wie Helligkeit und Farben
                            </p>
                        </div>

                        {/* AI Search Input */}
                        <div className="relative">
                            <div className="absolute inset-0 ai-gradient opacity-20 blur-xl rounded-2xl"/>
                            <div className="relative bg-card border-0 border-primary/20 rounded-2xl p-2 ai-glow">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="flex items-center justify-center w-10 h-10 rounded-lg ai-gradient flex-shrink-0">
                                        <Sparkles className="w-5 h-5 text-white"/>
                                    </div>
                                    <Input
                                        placeholder="Ich suche eine Wohnung in München"
                                        value={aiQuery}
                                        onChange={(e) => setAiQuery(e.target.value)}
                                        className="border-0 bg-transparent text-base h-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                    <Button onClick={handleSearch} disabled={!aiQuery} size="lg"
                                            className="ai-gradient text-white flex-shrink-0 cursor-pointer">
                                        <Search className="w-5 h-5 mr-2"/>
                                        Suchen
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground text-center">Oder nutze unsere intelligenten
                                Filter:</p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                {/* Brightness Filter */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="gap-2 hover:text-border-primary/50 hover:border-primary/50 hover:bg-primary/5 transition-colors bg-transparent"
                                        >
                                            <Sun className="w-4 h-4 text-amber-500"/>
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
                                                    <label className="text-sm font-medium">Lichtverhältnisse der
                                                        Immobilie</label>
                                                    <span
                                                        className="text-sm text-muted-foreground">{brightnessLevel[0]}%</span>
                                                </div>
                                                <Slider
                                                    value={brightnessLevel}
                                                    onValueChange={setBrightnessLevel}
                                                    max={100}
                                                    step={1}
                                                    className="w-full"
                                                />
                                                <div
                                                    className="flex justify-between text-xs text-muted-foreground pt-1">
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
                                            <Home className="w-4 h-4 text-blue-500"/>
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
                                            <label className="text-sm font-medium">Wähle die Farbe der
                                                Außenfassade</label>
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
                                                            style={{backgroundColor: color.hex}}
                                                        />
                                                        <span
                                                            className="text-xs text-center leading-tight">{color.name}</span>
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
                                            <UtensilsCrossed className="w-4 h-4 text-orange-500"/>
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
                                                            style={{backgroundColor: color.hex}}
                                                        />
                                                        <span
                                                            className="text-xs text-center leading-tight">{color.name}</span>
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
                                            <Droplets className="w-4 h-4 text-cyan-500"/>
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
                                                            style={{backgroundColor: color.hex}}
                                                        />
                                                        <span
                                                            className="text-xs text-center leading-tight">{color.name}</span>
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
                                            <Layers className="w-4 h-4 text-emerald-500"/>
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
                                            <Wind className="w-4 h-4 text-primary"/>
                                            <span className="font-medium">Badausstattung</span>

                                            {bathFeatures &&
                                                <>
                                                    <div className="flex items-center gap-1.5">
                                                        {[bathFeatures].slice(0, 2).map((feature) => (
                                                            <Badge
                                                                key={feature}
                                                                variant="secondary"
                                                                className="h-5 px-2 text-xs font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
                                                            >
                                                                {feature}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </>}

                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-80 p-0" align="start">
                                        <div className="p-4 border-b border-border">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-sm text-foreground">Badausstattung</h4>
                                                    <p className="text-xs text-muted-foreground mt-0.5">Wählen Sie die
                                                        gewünschten Merkmale</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setBathFeatures("")}
                                                    className="h-8 px-2 text-xs text-muted-foreground"
                                                >
                                                    Zurücksetzen
                                                </Button>

                                            </div>
                                        </div>

                                        <div className="p-2 max-h-[320px] overflow-y-auto">
                                            {BATH_FEATURES.map((feature) => {
                                                const Icon = feature.icon
                                                const isChecked = bathFeatures === feature.label

                                                return (
                                                    <div
                                                        key={feature.label}
                                                        className={`${isChecked ? "bg-foreground/10" : ""} flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-foreground/5 transition-colors cursor-pointer group`}
                                                        onClick={() => toggleFeature(feature.label)}
                                                    >
                                                        <Checkbox
                                                            id={`bath-${feature.label}`}
                                                            checked={isChecked}
                                                            onCheckedChange={() => toggleFeature(feature.label)}
                                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                        />
                                                        <Icon
                                                            className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors"/>
                                                        <label
                                                            htmlFor={`bath-${feature.label}`}
                                                            className="text-sm font-medium text-foreground cursor-pointer flex-1 select-none"
                                                        >
                                                            {feature.label}
                                                        </label>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {[bathFeatures].length > 0 && (
                                            <div className="p-3 border-t border-border bg-muted/30">
                                                <p className="text-xs text-muted-foreground">
                                                    {[bathFeatures].length} {[bathFeatures].length === 1 ? "Merkmal" : "Merkmale"} ausgewählt
                                                </p>
                                            </div>
                                        )}
                                    </PopoverContent>
                                </Popover>

                                {/* Traditional Filters Button */}
                                <Button variant="outline" className="gap-2 bg-transparent">
                                    <SlidersHorizontal className="w-4 h-4"/>
                                    Weitere Filter
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Results */}
            <section
                     className={`container mx-auto px-4 lg:px-16 xl:px-24 py-4 border-t border-border min-h-[500px] ${!searchStarted ? "invisible" : ""}`}>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-2xl font-bold">Verfügbare Immobilien</h3>
                        <p className="text-muted-foreground">{properties.length} Ergebnisse gefunden</p>
                    </div>
                </div>

                {/* Property Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {properties.map((property) => (
                        <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow group p-0 flex flex-col">
                            <div className="relative aspect-square overflow-hidden">
                                {failedImages.has(property.id) || !property.image.startsWith('http') ? (
                                    <HousePlaceholder/>
                                ) : (
                                    <img
                                        src={property.image}
                                        alt={property.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={() => handleImageError(property.id)}
                                    />
                                )}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <Button size="icon" variant="secondary"
                                            className="rounded-full bg-white/90 hover:bg-white h-6 w-6">
                                        <Heart className="w-3 h-3"/>
                                    </Button>
                                    <Button size="icon" variant="secondary"
                                            className="rounded-full bg-white/90 hover:bg-white h-6 w-6">
                                        <Share2 className="w-3 h-3"/>
                                    </Button>
                                </div>
                                <Badge className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs">
                                    {property.brightness}
                                </Badge>
                            </div>
                            <CardContent className="p-3 flex flex-col h-full">
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <h4 className="font-medium text-sm mb-1 line-clamp-2 leading-tight">{property.title}</h4>
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <MapPin className="w-3 h-3 mr-1"/>
                                            {property.location}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-lg font-bold">
                                            <Euro className="w-4 h-4"/>
                                            {property.price.toLocaleString("de-DE")}
                                        </div>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Maximize2 className="w-4 h-4"/>
                                            {property.size} m²
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline">{property.rooms} Zimmer</Badge>
                                        {property.floorType !== "unknown" &&
                                            <Badge variant="outline">Boden: {property.floorType.charAt(0).toUpperCase() + property.floorType.slice(1)}</Badge>}
                                        {property.exteriorColor !== "unknown" &&
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                Fassade: {property.exteriorColor.charAt(0).toUpperCase() + property.exteriorColor.slice(1)}
                                                <div
                                                    className="w-2 h-2 rounded-full border"
                                                    style={{
                                                        backgroundColor: colors.find((c) => c.value === property.exteriorColor)?.hex,
                                                        borderColor: "#576582ff" ,
                                                    }}
                                                />
                                            </Badge>}
                                        {property.kitchenColor !== "unknown" &&
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                Küche: {property.kitchenColor.charAt(0).toUpperCase() + property.kitchenColor.slice(1)}
                                                <div
                                                    className="w-2 h-2 rounded-full border"
                                                    style={{
                                                        backgroundColor: colors.find((c) => c.value === property.kitchenColor)?.hex,
                                                        borderColor: "#576582ff",
                                                    }}
                                                />
                                            </Badge>}
                                        {property.bathroomTiles !== "unknown" &&
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                Bad: {property.bathroomTiles.charAt(0).toUpperCase() + property.bathroomTiles.slice(1)}
                                                <div
                                                    className="w-2 h-2 rounded-full border"
                                                    style={{
                                                        backgroundColor: colors.find((c) => c.value === property.bathroomTiles)?.hex,
                                                        borderColor: "#576582ff",
                                                    }}
                                                />
                                            </Badge>}
                                        {property.bathFeature !== "unknown" &&
                                            <Badge variant="outline">Badausstattung: {property.bathFeature.charAt(0).toUpperCase() + property.bathFeature.slice(1)}</Badge>}
                                    </div>
                                </div>

                                <Button 
                                    className="w-full mt-auto cursor-pointer" 
                                    onClick={() => property.url && window.open(property.url, '_blank')}
                                    disabled={!property.url}
                                >
                                    Details ansehen
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    )
}
