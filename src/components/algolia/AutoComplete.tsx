// autocomplete component with instant suggestions
import type { LiteClient as SearchClient } from 'algoliasearch/lite';
import type { BaseItem } from '@algolia/autocomplete-core';
import type { AutocompleteOptions } from '@algolia/autocomplete-js';

import {
  createElement,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createRoot, Root } from 'react-dom/client';

import {
  useHierarchicalMenu,
  usePagination,
  useSearchBox,
} from 'react-instantsearch';
import { autocomplete } from '@algolia/autocomplete-js';
import { createLocalStorageRecentSearchesPlugin } from '@algolia/autocomplete-plugin-recent-searches';
import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions';
import { debounce } from '@algolia/autocomplete-shared';

import {
  INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES,
  INSTANT_SEARCH_INDEX_NAME,
  INSTANT_SUGGESTIONS_INDEX,
} from '@/lib/constants';

import '@algolia/autocomplete-theme-classic';

type AutocompleteProps = Partial<AutocompleteOptions<BaseItem>> & {
  searchClient: SearchClient;
  className?: string;
};

type SetInstantSearchUiStateOptions = {
  query: string;
  categories?: string;
};

export default function Autocomplete({
  searchClient,
  className,
  ...autocompleteProps
}: AutocompleteProps) {
  const autocompleteContainer = useRef<HTMLDivElement>(null);
  const panelRootRef = useRef<Root | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);

  const { query, refine: setQuery } = useSearchBox();
  const { items: categories, refine: setCategory } = useHierarchicalMenu({
    attributes: INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES,
  });

  const { refine: setPage } = usePagination();

  const [instantSearchUiState, setInstantSearchUiState] =
    useState<SetInstantSearchUiStateOptions>({ query });

  // Remove debounce for instant suggestions - we only update on submit
  const debouncedSetInstantSearchUiState = debounce(
    setInstantSearchUiState,
    500
  );

  useEffect(() => {
    setQuery(instantSearchUiState.query);
    if (instantSearchUiState.categories) {
      setCategory(instantSearchUiState.categories);
    }
    setPage(0);
  }, [instantSearchUiState]);

  const currentCategory = useMemo(
    () => categories.find(({ isRefined }) => isRefined)?.value,
    [categories]
  );

  // Create a source for location suggestions
  const locationSuggestionsSource = useMemo(() => {
    return {
      sourceId: 'locationSuggestions',
      getItems({ query }: { query: string }) {
        if (!query) return [];
        
        return searchClient.search([{
          indexName: INSTANT_SEARCH_INDEX_NAME,
          query,
          params: {
            hitsPerPage: 8,
            attributesToRetrieve: ['locationPathEn', 'locationHierarchy'],
            facets: ['locationHierarchy.lvl0', 'locationHierarchy.lvl1', 'locationHierarchy.lvl2'],
            distinct: true,
          }
        }]).then(({ results }) => {
          const hits = results[0].hits;
          const locationSuggestions = new Set();
          
          // Extract unique location suggestions
          hits.forEach((hit: any) => {
            if (hit.locationPathEn) {
              locationSuggestions.add(hit.locationPathEn);
            }
            if (hit.locationHierarchy) {
              Object.values(hit.locationHierarchy).forEach((location: any) => {
                if (location && typeof location === 'string') {
                  locationSuggestions.add(location);
                }
              });
            }
          });

          return Array.from(locationSuggestions)
            .filter((location: any) => 
              location.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 8)
            .map((location: any) => ({
              label: location,
              query: location,
            }));
        });
      },
      templates: {
        item({ item }: { item: any }) {
          const query = autocompleteContainer.current?.querySelector('input')?.value || '';
          const highlightedLabel = item.label.replace(
            new RegExp(`(${query})`, 'gi'),
            '<mark>$1</mark>'
          );
          
          return (
            <div className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
              <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span dangerouslySetInnerHTML={{ __html: highlightedLabel }} />
            </div>
          );
        },
        noResults() {
          return (
            <div className="p-4 text-center text-gray-500">
              No locations found
            </div>
          );
        },
      },
      onSelect({ item }: { item: any }) {
        // Set the query but don't trigger search immediately
        const input = autocompleteContainer.current?.querySelector('input');
        if (input) {
          input.value = item.label;
        }
        // Close the autocomplete panel
        const panel = document.querySelector('.aa-Panel');
        if (panel) {
          (panel as HTMLElement).style.display = 'none';
        }
      },
    };
  }, [searchClient]);

  const plugins = useMemo(() => {
    const recentSearches = createLocalStorageRecentSearchesPlugin({
      key: 'instantsearch',
      limit: 3,
      transformSource({ source }) {
        return {
          ...source,
          onSelect({ item }) {
            setInstantSearchUiState({
              query: item.label,
              categories: item.category,
            });
          },
        };
      },
    });

    return [recentSearches];
  }, []);

  useEffect(() => {
    if (!autocompleteContainer.current) {
      return;
    }

    const autocompleteInstance = autocomplete({
      ...autocompleteProps,
      container: autocompleteContainer.current,
      initialState: { query },
      insights: true,
      plugins,
      getSources() {
        return [locationSuggestionsSource];
      },
      onReset() {
        setInstantSearchUiState({ query: '', categories: currentCategory });
      },
      onSubmit({ state }) {
        // Only trigger full search on submit (Enter key)
        setInstantSearchUiState({ query: state.query });
      },
      onStateChange({ prevState, state }) {
        // Don't trigger search on every keystroke - only show suggestions
        // The actual search will only happen on submit
      },
      renderer: { createElement, Fragment, render: () => {} },
      render({ children }, root) {
        if (!panelRootRef.current || rootRef.current !== root) {
          rootRef.current = root;
          panelRootRef.current?.unmount();
          panelRootRef.current = createRoot(root);
        }
        panelRootRef.current.render(children);
      },
    });

    return () => autocompleteInstance.destroy();
  }, [plugins, locationSuggestionsSource]);

  return <div className={className} ref={autocompleteContainer} />;
}

