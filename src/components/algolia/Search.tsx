// components/algolia/Search.tsx
'use client';

import { searchClient } from "@/lib/algolia/searchCient";
import { INSTANT_SEARCH_INDEX_NAME } from "@/lib/constants";
import React, { useState } from "react";
import { Configure, Hits, Stats } from "react-instantsearch";
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
        cleanUrlOnDispose: false, // Future behavior: keep URL state when component unmounts
      }}
      insights
      future={{
        preserveSharedStateOnUnmount: true, // Future behavior: preserve widget state when unmounted
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
        // تم إزالة السطر التالي: filters="" 
      />
      
      <div className="container mx-auto px-4">
        {/* Search Header */}
        <div className="flex flex-col items-center mb-8">
          <Autocomplete
            searchClient={searchClient}
            placeholder="Search properties by location, type, or features..."
            detachedMediaQuery="none"
            className="rounded-none border-none w-full max-w-2xl"
            openOnFocus
          />

          <PopularSearches queries={[
            'Dubai Marina', 
            'Downtown Dubai', 
            'villa', 
            'apartment for rent',
            'Palm Jumeirah',
            'Business Bay'
          ]}/>
        </div>

        {/* Main Content Area */}
        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block flex-shrink-0">
            <FilterSidebar />
          </div>

          {/* Mobile Filters Sheet */}
          <div className="lg:hidden">
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="mb-4">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <FilterSidebar className="border-0 shadow-none" />
              </SheetContent>
            </Sheet>
          </div>

          {/* Results Area */}
          <div className="flex-1 min-w-0">
            {/* Active Filters */}
            <ActiveFilters />

            {/* Results Stats */}
            <div className="mb-6 flex justify-between items-center">
              <Stats 
                translations={{
                  stats: (nbHits, processingTimeMS) => 
                    `${nbHits.toLocaleString()} properties found in ${processingTimeMS}ms`
                }}
                className="text-sm text-gray-600"
              />
              
              {/* Mobile Filter Button (alternative position) */}
              <div className="lg:hidden">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(true)}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Results Grid */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <Hits hitComponent={({ hit }) => <HitComponent hit={hit}/>}/>
              </div>
              
              {/* Pagination */}
              <div className="flex justify-center">
                <CustomPagination />
              </div>
            </div>
          </div>
        </div>
      </div>
    </NextInstantSearch>
  );
}
