// autocomplete component
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
//   INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES,
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
// components/algolia/AutoComplete.tsx

// ... (imports remain the same)

// ... (AutocompleteProps and SetInstantSearchUiStateOptions types remain the same)

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

    const querySuggestionsInCategory = createQuerySuggestionsPlugin({
      searchClient,
      indexName: INSTANT_SUGGESTIONS_INDEX,
      getSearchParams() {
        // تصحيح: تم تبسيط `facetFilters` ليعمل بشكل صحيح
        // يفترض أن فهرس الاقتراحات يحتوي على facet باسم `locationHierarchy`
        if (!currentCategory) {
          return recentSearches.data!.getAlgoliaSearchParams({ hitsPerPage: 0 });
        }
        return recentSearches.data!.getAlgoliaSearchParams({
          hitsPerPage: 3,
          facetFilters: [
            `locationHierarchy:${currentCategory}`
          ],
        });
      },
      transformSource({ source }) {
        return {
          ...source,
          sourceId: 'querySuggestionsInCategoryPlugin',
          onSelect({ item }) {
            setInstantSearchUiState({
              query: item.query,
              categories: item.__autocomplete_qsCategory,
            });
          },
          getItems(params) {
            if (!currentCategory) {
              return [];
            }
            return source.getItems(params);
          },
          templates: {
            ...source.templates,
            header({ items }) {
              if (items.length === 0) {
                return <Fragment />;
              }
              return (
                <div className="p-2">
                  <span className="text-md text-secondary font-medium">
                    In {currentCategory}
                  </span>
                </div>
              );
            },
          },
        };
      },
    });

    const querySuggestions = createQuerySuggestionsPlugin({
      searchClient,
      indexName: INSTANT_SUGGESTIONS_INDEX,
      // تصحيح: تم تعديل `categoryAttribute` ليتوافق مع بنية البيانات
      categoryAttribute: [
        INSTANT_SEARCH_INDEX_NAME,
        'facets',
        'exact_matches',
        'locationHierarchy',
      ],
      getSearchParams() {
        const searchParams = {
          hitsPerPage: currentCategory ? 3 : 6,
          facetFilters: [`${INSTANT_SEARCH_INDEX_NAME}.facets.exact_matches.locationHierarchy.value:-${currentCategory}`],
        };
        return recentSearches.data!.getAlgoliaSearchParams(searchParams);
      },
      transformSource({ source }) {
        return {
          ...source,
          sourceId: 'querySuggestionsPlugin',
          onSelect({ item }) {
            setInstantSearchUiState({
              query: item.query,
              categories: item.__autocomplete_qsCategory || '',
            });
          },
          getItems(params) {
            if (!params.state.query) {
              return [];
            }
            return source.getItems(params);
          },
          templates: {
            ...source.templates,
            header({ items }) {
              if (!currentCategory || items.length === 0) {
                return <Fragment />;
              }
              return (
                <div className="p-2">
                  <span className="font-bold text-primary">
                    In other categories
                  </span>
                </div>
              );
            },
          },
        };
      },
    });

    return [recentSearches, querySuggestions, querySuggestionsInCategory];
  }, [currentCategory, searchClient]);

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
      onReset() {
        setInstantSearchUiState({ query: '', categories: currentCategory });
      },
      onSubmit({ state }) {
        setInstantSearchUiState({ query: state.query });
      },
      onStateChange({ prevState, state }) {
        if (prevState.query !== state.query) {
          debouncedSetInstantSearchUiState({
            query: state.query,
          });
        }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plugins]);

  return <div className={className} ref={autocompleteContainer} />;
}
