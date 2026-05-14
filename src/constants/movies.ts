import { Movie } from '../types';

export const MOVIES: Movie[] = [
  {
    id: 'm1',
    title: 'The Beekeeper',
    description: "One man's brutal campaign for vengeance takes on national stakes after he is revealed to be a former operative of a powerful and clandestine organization known as Beekeepers.",
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMzE0NWVlZGEtYTUyYy00Y2I5LWI2NzktZGEzY2M1N2U0NjRjXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=SzINZZ6iq7Y',
    price: 4000,
    genre: ['Action', 'Thriller'],
    rating: 6.4,
    year: 2024
  },
  {
    id: 'm2',
    title: 'Alienoid: Return to the Future',
    description: 'Ean and Muruk travel through time and space in an effort to obtain a divine sword and prevent the destruction of humanity.',
    posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000',
    trailerUrl: 'https://www.youtube.com/watch?v=d_U04p_E14g',
    price: 4000,
    genre: ['Action', 'Sci-Fi', 'Fantasy'],
    rating: 6.6,
    year: 2024
  },
  {
    id: 'm3',
    title: 'Badland Hunters',
    description: 'After a deadly earthquake turns Seoul into a lawless badland, a fearless huntsman springs into action to rescue a teenager from a mad doctor.',
    posterUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=1000',
    trailerUrl: 'https://www.youtube.com/watch?v=2Tz8i1W5a48',
    price: 4000,
    genre: ['Action', 'Sci-Fi'],
    rating: 6.0,
    year: 2024
  },
  {
    id: 'm4',
    title: 'Code 8: Part II',
    description: 'A girl fighting to get justice for her slain brother with the help of an ex-con and his former partner-in-crime faces down a corrupt police sergeant.',
    posterUrl: 'https://images.unsplash.com/photo-1514468418042-4b2169747196?auto=format&fit=crop&q=80&w=1000',
    trailerUrl: 'https://www.youtube.com/watch?v=7uV_m9Gf1mI',
    price: 4000,
    genre: ['Action', 'Crime', 'Sci-Fi'],
    rating: 5.9,
    year: 2024
  }
];
