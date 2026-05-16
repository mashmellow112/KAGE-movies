export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  trailerUrl: string;
  downloadUrl?: string;
  price: number;
  genre: string[];
  rating: number;
  year?: number;
}

export interface Payment {
  id: string;
  userId: string;
  movieId: string;
  phoneNumber: string;
  provider: 'airtel' | 'mtn';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: any;
}
