// components/algolia/Search.tsx
'use client';

import { searchClient } from "@/lib/algolia/searchCient";
import { INSTANT_SEARCH_INDEX_NAME } from "@/lib/constants";
import React, { useState } from "react";
import { Configure, Hits, Stats, useSearchBox } from "react-instantsearch";
import Autocomplete from "./AutoComplete";
import HitComponent from "@/components/algolia/HitComponent";
import CustomPagination from "./CustomPagination";
import PopularSearches from "./PopularSearches";
import { NextInstantSearch } from "./NextInstantSearch";
import FilterSidebar from "./filters/FilterSidebar";
import ActiveFilters from "./filters/ActiveFilters";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Component to conditionally show results
function SearchResults() {
  const { query } = useSearchBox();
  
  // Only show results if there's a query (after Enter is pressed)
  if (!query || query.trim() === '') {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-600 mb-4">
          Start typing to search for properties
        </h2>
        <PopularSearches queries={["Dubai Marina", "Downtown Dubai", "Business Bay", "JBR"]} />
      </div>
    );
  }

  return (
    <>
      {/* Search Stats */}
      <div className="flex justify-between items-center mb-6">
        <Stats
          translations={{
            rootElementText: ({ nbHits, processingTimeMS }) =>
              `${nbHits.toLocaleString()} results found in ${processingTimeMS}ms`,
          }}
          className="text-sm text-gray-600"
        />
      </div>

      {/* Active Filters */}
      <ActiveFilters className="mb-4" />

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Hits hitComponent={HitComponent} />
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <CustomPagination />
      </div>
    </>
  );
}

export default function Search() {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <NextInstantSearch
      initialUiState={{
        [INSTANT_SEARCH_INDEX_NAME]: {
          query: "",
          page: 1,
        },
      }}
      searchClient={searchClient}
      indexName={INSTANT_SEARCH_INDEX_NAME}
      routing={{
        cleanUrlOnDispose: false,
      }}
      insights
      future={{
        preserveSharedStateOnUnmount: true,
      }}
    >
      <Configure 
        hitsPerPage={6} 
        distinct={true} 
        getRankingInfo={true}
        facets={[
          'purpose',
          'type', 
          'categories',
          'furnishing',
          'locationHierarchy.lvl0',
          'locationHierarchy.lvl1',
          'locationHierarchy.lvl2'
        ]}
        attributesToRetrieve={[
          'objectID',
          'title',
          'description',
          'purpose',
          'price',
          'priceCurrency',
          'rentFrequency',
          'bathrooms',
          'size',
          'sizeUnit',
          'type',
          'locationPathEn',
          'agencyName',
          'agentNames',
          '_tags',
          'furnishing',
          'yearBuilt'
        ]}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Box */}
            <div className="flex-1 w-full">
              <Autocomplete
                searchClient={searchClient}
                className="w-full"
                placeholder="Search for properties by location..."
              />
            </div>
            
            {/* Filter Toggle for Mobile */}
            <div className="lg:hidden">
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <FilterSidebar />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-4">
              <FilterSidebar />
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1">
            <SearchResults />
          </div>
        </div>
      </div>
    </NextInstantSearch>
  );
}

