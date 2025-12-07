export type SeriesFacultyMember = {
  id: number;
  kelloggdirectoryName: string | null;
  twentyfiveliveName: string | null;
  email: string | null;
  kelloggdirectoryTitle?: string | null;
  kelloggdirectorySubtitle?: string | null;
  kelloggdirectoryImageUrl?: string | null;
  cutoutImage?: string | null;
};

export type SeriesSearchRow = {
  id: number;
  seriesName: string;
  seriesType: string;
  totalEvents: number;
  firstDate: string;
  lastDate: string;
  quarter: string | null;
  year: number | null;
  faculty: SeriesFacultyMember[];
};

export type SeriesSearchResponse = {
  rows: SeriesSearchRow[];
  total: number;
  page: number;
  size: number;
};
