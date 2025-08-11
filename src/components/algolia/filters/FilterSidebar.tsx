// components/algolia/filters/FilterSidebar.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  PurposeFilter,
  PropertyTypeFilter,
  PriceRangeFilter,
  CategoriesFilter,
  FurnishingFilter,
  SizeRangeFilter,
  LocationFilter,
  ClearFilters
} from './PropertyFilters';

interface FilterSidebarProps {
  className?: string;
}

export default function FilterSidebar({ className }: FilterSidebarProps) {
  return (
    <Card className={`w-full max-w-sm ${className || ''}`}>
      <CardHeader>
        <CardTitle className="text-xl">Filters</CardTitle>
        <ClearFilters />
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px] px-6">
          <div className="space-y-6 pb-6">
            {/* Purpose Filter */}
            <PurposeFilter />
            <Separator />

            {/* Property Type Filter */}
            <PropertyTypeFilter />
            <Separator />

            {/* Location Filter */}
            <LocationFilter />
            <Separator />

            {/* Categories Filter */}
            <CategoriesFilter />
            <Separator />


            {/* Price Range Filter - Use either PriceRangeFilter or CustomPriceRangeFilter */}
            <PriceRangeFilter />
            {/* Alternative: <CustomPriceRangeFilter /> */}
            <Separator />

            {/* Size Range Filter - Use either SizeRangeFilter or CustomSizeRangeFilter */}
            <SizeRangeFilter />
            {/* Alternative: <CustomSizeRangeFilter /> */}
            <Separator />

            {/* Furnishing Filter */}
            <FurnishingFilter />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}