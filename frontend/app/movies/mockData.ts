// lib/mockData.ts

export interface Review {
  id: number;
  user: string;
  rating: number; // Rating out of 5
  comment: string;
}

export interface Movie {
  id: number;
  title: string;
  genre: string;
  cast: string[];
  rating: number;
  duration: number;
  ageRating: string;
  poster: string;
  category: string;
  description: string; // Added description
  languages: string[]; // Added languages
  reviews: Review[]; // Added reviews
}

export const mockMovies: Movie[] = [
  {
    id: 1,
    title: "The Dark Knight",
    genre: "Action",
    rating: 9.0,
    duration: 152,
    ageRating: "12A",
    poster: "/placeholder.svg?height=300&width=200",
    category: "blockbuster",
    description:
      "Batman faces his greatest psychological and physical tests when the Joker wreaks havoc on Gotham City.",
    cast: [
      "Christian Bale",
      "Heath Ledger",
      "Aaron Eckhart",
      "Maggie Gyllenhaal",
    ],
    languages: ["English", "Hindi", "Tamil"],
    reviews: [
      {
        id: 1,
        user: "Alice",
        rating: 5,
        comment: "One of the best superhero movies ever made!",
      },
    ],
  },
  {
    id: 2,
    title: "Inception",
    genre: "Sci-Fi",
    cast: [
      "Christian Bale",
      "Heath Ledger",
      "Aaron Eckhart",
      "Maggie Gyllenhaal",
    ],
    languages: ["English", "Hindi", "Tamil"],
    rating: 8.8,
    duration: 148,
    ageRating: "12A",
    poster: "/placeholder.svg?height=300&width=200",
    category: "blockbuster",
    description:
      "A skilled thief is offered a chance to have his past crimes forgiven if he can implant an idea into someone's subconscious.",
    reviews: [
      {
        id: 2,
        user: "Bob",
        rating: 5,
        comment: "Mind-bending and visually stunning.",
      },
    ],
  },
  {
    id: 3,
    title: "The Shawshank Redemption",
    genre: "Drama",
    cast: [
      "Christian Bale",
      "Heath Ledger",
      "Aaron Eckhart",
      "Maggie Gyllenhaal",
    ],
    languages: ["English", "Hindi", "Tamil"],
    rating: 9.3,
    duration: 142,
    ageRating: "PG",
    poster: "/placeholder.svg?height=300&width=200",
    category: "classic",
    description:
      "A banker is wrongly imprisoned and forms an unlikely friendship while seeking redemption over decades.",
    reviews: [
      {
        id: 3,
        user: "Charlie",
        rating: 5,
        comment: "A timeless masterpiece about hope and resilience.",
      },
    ],
  },
  {
    id: 4,
    title: "Pulp Fiction",
    genre: "Crime",
    cast: [
      "Christian Bale",
      "Heath Ledger",
      "Aaron Eckhart",
      "Maggie Gyllenhaal",
    ],
    languages: ["English", "Hindi", "Tamil"],
    rating: 8.9,
    duration: 154,
    ageRating: "18",
    poster: "/placeholder.svg?height=300&width=200",
    category: "adult",
    description:
      "Interwoven stories of crime and redemption in Los Angeles, directed by Quentin Tarantino.",
    reviews: [
      {
        id: 4,
        user: "Dana",
        rating: 4,
        comment: "Brilliantly written and darkly funny.",
      },
    ],
  },
  {
    id: 5,
    title: "Interstellar",
    genre: "Sci-Fi",
    cast: [
      "Christian Bale",
      "Heath Ledger",
      "Aaron Eckhart",
      "Maggie Gyllenhaal",
    ],
    languages: ["English", "Hindi", "Tamil"],
    rating: 8.6,
    duration: 169,
    ageRating: "12A",
    poster: "/placeholder.svg?height=300&width=200",
    category: "blockbuster",
    description:
      "A team of explorers travel through a wormhole in space to ensure humanity's survival.",
    reviews: [
      {
        id: 5,
        user: "Eva",
        rating: 5,
        comment: "Emotional, intelligent, and visually breathtaking.",
      },
    ],
  },
  {
    id: 6,
    title: "The Matrix",
    genre: "Action",
    cast: [
      "Christian Bale",
      "Heath Ledger",
      "Aaron Eckhart",
      "Maggie Gyllenhaal",
    ],
    languages: ["English", "Hindi", "Tamil"],
    rating: 8.7,
    duration: 136,
    ageRating: "15",
    poster: "/placeholder.svg?height=300&width=200",
    category: "blockbuster",
    description:
      "A hacker discovers that reality is a simulated world and joins the rebellion against its controllers.",
    reviews: [
      {
        id: 6,
        user: "Frank",
        rating: 5,
        comment: "Revolutionary action and ideas that changed sci-fi forever.",
      },
    ],
  },
  {
    id: 7,
    title: "Forrest Gump",
    genre: "Drama",
    cast: [
      "Christian Bale",
      "Heath Ledger",
      "Aaron Eckhart",
      "Maggie Gyllenhaal",
    ],
    languages: ["English", "Hindi", "Tamil"],
    rating: 8.8,
    duration: 142,
    ageRating: "PG",
    poster: "/placeholder.svg?height=300&width=200",
    category: "classic",
    description:
      "The life journey of a simple man who inadvertently influences major historical events.",
    reviews: [
      {
        id: 7,
        user: "Grace",
        rating: 5,
        comment: "Heartwarming and unforgettable.",
      },
    ],
  },
  {
    id: 8,
    title: "The Avengers",
    genre: "Action",
    cast: [
      "Christian Bale",
      "Heath Ledger",
      "Aaron Eckhart",
      "Maggie Gyllenhaal",
    ],
    languages: ["English", "Hindi", "Tamil"],
    rating: 8.0,
    duration: 143,
    ageRating: "12A",
    poster: "/placeholder.svg?height=300&width=200",
    category: "blockbuster",
    description:
      "Earth's mightiest heroes must unite to stop an alien invasion led by Loki.",
    reviews: [
      {
        id: 8,
        user: "Henry",
        rating: 4,
        comment: "Epic, fun, and full of great character moments.",
      },
    ],
  },
];
