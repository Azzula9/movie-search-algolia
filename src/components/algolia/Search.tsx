'use client';

import { searchClient } from "@/lib/algolia/searchCient";
import { INSTANT_SEARCH_INDEX_NAME } from "@/lib/constants";
import React from "react";
import { Configure, Hits } from "react-instantsearch";
import Autocomplete from "./AutoComplete";
import HitComponent from "@/components/algolia/HitComponent";
import CustomPagination from "./CustomPagination";
import PopularSearches from "./PopularSearches";
import { NextInstantSearch } from "./NextInstantSearch";

export default function Search() {
  return (
   <NextInstantSearch
  initialUiState={{
    algolia_movie_sample_dataset: {
      query: "",
      page: 1,
    },
  }}
  searchClient={searchClient}
  indexName={INSTANT_SEARCH_INDEX_NAME}
      routing
      insights
    >
      <Configure hitsPerPage={6} distinct={true} getRankingInfo={true}/>
      <div className="flex flex-col items-center">
        {/* the autocomplete input and some hits or data to be shown */}
        <Autocomplete

          searchClient={searchClient}
          placeholder="Search for any post..."
          detachedMediaQuery="none"
          className="rounded-none border-none w-[60%]"
          openOnFocus
        />
        {/* add the popular search queries */}

        <PopularSearches queries={['comedy', 'drama', 'action', 'thriller']}/>
      </div>

      <div className="mt-8 flex items-center gap-4 flex-col ">
          {/* the hist or the data */}
          <Hits hitComponent={({ hit }) => <HitComponent hit={hit}/>}/>
          {/* the pagination */}
          <CustomPagination />
      </div>
    </NextInstantSearch>
  );
}
