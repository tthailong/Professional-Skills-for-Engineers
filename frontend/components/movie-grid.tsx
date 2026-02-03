import Link from "next/link"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Users, Calendar } from "lucide-react"

export interface Movie {
  id: number
  title: string
  genre: string
  actor: string
  rating: number
  duration: number
  ageRating: string
  poster: string
  category: string
}

interface MovieGridProps {
  movies: Movie[]
}

export function MovieGrid({ movies }: MovieGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <Link key={movie.id} href={`/movies/${movie.id}`}>
          <Card className="border-border bg-card hover:bg-card/80 transition cursor-pointer h-full overflow-hidden hover:shadow-lg hover:shadow-primary/20">
            <div className="relative h-64 overflow-hidden bg-secondary">
              <img src={movie.poster || "/placeholder.svg"} alt={movie.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <Star className="w-4 h-4" />
                {movie.rating}
              </div>
            </div>

            <CardContent className="pt-4">
              <CardTitle className="text-lg line-clamp-2">{movie.title}</CardTitle>
              <CardDescription className="mb-3">
                <span className="text-primary font-semibold">{movie.genre}</span>
              </CardDescription>

              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <p className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {movie.actor}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {movie.duration} min • {movie.ageRating}
                </p>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Book Ticket</Button>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
