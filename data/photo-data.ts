export interface Photo {
  src: string;
  alt: string;
  caption: string;
  attraction?: string;
}

export interface AtlasStop {
  id: string;
  country: string;
  title: string;
  location: string;
  region: string;
  lat: number;
  lon: number;
  summary: string;
  palette: string[];
  photos: Photo[];
}

export interface CountryGroup {
  name: string;
  stopIds: string[];
}

export interface AtlasData {
  stops: AtlasStop[];
  carouselPhotos: string[];
  countries: CountryGroup[];
}
