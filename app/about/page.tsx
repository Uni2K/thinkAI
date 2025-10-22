import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowLeft } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
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
                <Button variant="ghost" className="bg-muted">
                  Über uns
                </Button>
              </Link>
              <Button>Anmelden</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Suche
          </Link>

          <div className="space-y-12">
            {/* Hero Text */}
            <div className="text-center space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-balance">
                Hi wir sind die Thinkis - die süßeste Immobiliensuche der Geschichte
              </h1>
            </div>

            {/* Image */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-border shadow-2xl">
              <Image
                src="/garden-with-tulips-treehouse-green-house.jpg"
                alt="Garten mit Tulpen, Baumhaus und grünem kleinen Haus"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Additional Content */}
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground text-center">
                Mit ThinkAI revolutionieren wir die Immobiliensuche. Unsere KI versteht nicht nur deine Anforderungen,
                sondern auch deine ästhetischen Vorlieben - von der Helligkeit bis zur Farbe der Küche.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
