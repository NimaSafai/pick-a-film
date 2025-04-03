export interface Genre {
  id: number;
  name: string;
}

export interface Decade {
  id: string;
  name: string;
  range: string;
}

export interface Country {
  code: string;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number;
  genres: string[];
}
