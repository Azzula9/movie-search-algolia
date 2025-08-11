// lib/constants.ts
export const INSTANT_SEARCH_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'real_estate_data';
export const INSTANT_SUGGESTIONS_INDEX = process.env.NEXT_PUBLIC_ALGOLIA_SUGGESTIONS_INDEX || 'real_estate_data_query_suggestions';

// For real estate, hierarchical facets should be location-based
export const INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES = [
  'locationHierarchy.lvl0', // UAE
  'locationHierarchy.lvl1', // UAE > Dubai
  'locationHierarchy.lvl2'  // UAE > Dubai > Downtown Dubai
];

// Search configuration
export const SEARCH_CONFIG = {
  hitsPerPage: 6,
  distinct: true,
  getRankingInfo: true,
  facets: [
    'purpose',
    'type', 
    'categories',
    'furnishing',
    'bedrooms',
    'bathrooms',
    'locationHierarchy.lvl0',
    'locationHierarchy.lvl1',
    'locationHierarchy.lvl2',
    'agencyName',
    'yearBuilt'
  ],
  attributesToRetrieve: [
    'objectID',
    'title',
    'description',
    'purpose',
    'price',
    'priceCurrency',
    'rentFrequency',
    'bedrooms',
    'bathrooms',
    'size',
    'sizeUnit',
    'type',
    'locationPathEn',
    'locationHierarchy',
    'agencyName',
    'agentNames',
    '_tags',
    'furnishing',
    'yearBuilt',
    'status',
    '_geoloc'
  ],
  attributesToHighlight: [
    'title',
    'description',
    'locationPathEn'
  ],
  attributesToSnippet: [
    'description:20'
  ]
};

// Filter configuration
export const FILTER_CONFIG = {
  price: {
    min: 0,
    max: 100000000, // 100M AED
    step: 10000
  },
  size: {
    min: 0,
    max: 50000, // 50K sqft
    step: 100
  },
  bedrooms: {
    options: ['Studio', '1', '2', '3', '4', '5', '6+']
  },
  bathrooms: {
    options: ['1', '2', '3', '4', '5', '6+']
  }
};

// Additional useful constants
export const PROPERTY_TYPES = [
  'apartment', 
  'villa', 
  'townhouse', 
  'penthouse', 
  'office', 
  'shop', 
  'warehouse', 
  'farm',
  'studio',
  'loft'
];

export const PURPOSES = ['sale', 'rent'];
export const CATEGORIES = ['residential', 'commercial'];
export const FURNISHING_OPTIONS = ['furnished', 'semi_furnished', 'unfurnished'];

// Popular search queries
export const POPULAR_SEARCHES = [
  'Dubai Marina', 
  'Downtown Dubai', 
  'villa', 
  'apartment for rent',
  'Palm Jumeirah',
  'Business Bay',
  'JBR',
  'Emirates Hills',
  'Dubai Hills',
  'City Walk'
];

// URL routing configuration
export const ROUTING_CONFIG = {
  stateMapping: {
    stateToRoute(uiState: any) {
      const indexUiState = uiState[INSTANT_SEARCH_INDEX_NAME] || {};
      return {
        q: indexUiState.query,
        purpose: indexUiState.refinementList?.purpose,
        type: indexUiState.refinementList?.type,
        location: indexUiState.hierarchicalMenu?.['locationHierarchy.lvl1'],
        page: indexUiState.page,
        priceMin: indexUiState.range?.price?.min,
        priceMax: indexUiState.range?.price?.max,
        sizeMin: indexUiState.range?.size?.min,
        sizeMax: indexUiState.range?.size?.max,
      };
    },
    routeToState(routeState: any) {
      return {
        [INSTANT_SEARCH_INDEX_NAME]: {
          query: routeState.q,
          page: routeState.page,
          refinementList: {
            purpose: routeState.purpose,
            type: routeState.type,
          },
          hierarchicalMenu: {
            'locationHierarchy.lvl1': routeState.location,
          },
          range: {
            price: {
              min: routeState.priceMin,
              max: routeState.priceMax,
            },
            size: {
              min: routeState.sizeMin,
              max: routeState.sizeMax,
            },
          },
        },
      };
    },
  },
};