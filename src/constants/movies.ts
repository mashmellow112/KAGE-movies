import { Movie } from '../types';

export const MOVIES: Movie[] = [
  {
    id: 'm1',
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    posterUrl: 'https://images.unsplash.com/photo-1542204111-970176884a86?auto=format&fit=crop&q=80&w=1000',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    price: 4000,
    genre: ['Sci-Fi', 'Adventure'],
    rating: 8.9,
    year: 2024
  },
  {
    id: 'm5',
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=1000',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    price: 4000,
    genre: ['Biography', 'Drama'],
    rating: 8.4,
    year: 2023
  },
  {
    id: 'm2',
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1000',
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    price: 4000,
    genre: ['Action', 'Crime'],
    rating: 9.0,
    year: 2008
  },
  {
    id: 'm3',
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1000',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    price: 4000,
    genre: ['Action', 'Sci-Fi'],
    rating: 8.8,
    year: 2010
  }
];
