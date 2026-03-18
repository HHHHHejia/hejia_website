export interface Photo {
  src: string;
  alt: string;
  caption: string;
}

export interface AtlasStop {
  id: string;
  title: string;
  location: string;
  region: string;
  when: string;
  lat: number;
  lon: number;
  summary: string;
  palette: string[];
  photos: Photo[];
}

export interface AtlasData {
  stops: AtlasStop[];
  carouselPhotos: string[];
}
