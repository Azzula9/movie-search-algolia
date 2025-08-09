export const INSTANT_SEARCH_INDEX_NAME = 'algolia_movie_sample_dataset';
export const INSTANT_SUGGESTIONS_INDEX = 'algolia_movie_sample_dataset_query_suggestions';

// For movies, hierarchical facets might be genres → keywords
export const INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES = [
  'genres',
  'keywords'
];
