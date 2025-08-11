// components/algolia/filters/ActiveFilters.tsx
'use client';

import React from 'react';
import { useCurrentRefinements } from 'react-instantsearch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function ActiveFilters() {
  const { items, refine } = useCurrentRefinements();

  if (items.length === 0) return null;

  const formatRefinementValue = (refinement: any) => {
    // Handle numeric ranges (price and size)
    if (refinement.attribute === 'price') {
      if (typeof refinement.value === 'string') {
        // Handle string format like "500000:1000000"
        if (refinement.value.includes(':')) {
          const [min, max] = refinement.value.split(':');
          return `${formatNumber(min)} - ${formatNumber(max)} AED`;
        }
        // Handle single values or ranges in different formats
        return `${formatNumber(refinement.value)} AED`;
      }
      // Handle array format [min, max]
      if (Array.isArray(refinement.value)) {
        const [min, max] = refinement.value;
        return `${formatNumber(min)} - ${formatNumber(max)} AED`;
      }
      return `${refinement.value} AED`;
    }

    if (refinement.attribute === 'size') {
      if (typeof refinement.value === 'string') {
        if (refinement.value.includes(':')) {
          const [min, max] = refinement.value.split(':');
          return `${formatNumber(min)} - ${formatNumber(max)} sqft`;
        }
        return `${formatNumber(refinement.value)} sqft`;
      }
      if (Array.isArray(refinement.value)) {
        const [min, max] = refinement.value;
        return `${formatNumber(min)} - ${formatNumber(max)} sqft`;
      }
      return `${refinement.value} sqft`;
    }
    
    // Handle location hierarchy
    if (refinement.attribute.includes('locationHierarchy')) {
      if (typeof refinement.value === 'string') {
        return refinement.value.split(' > ').pop() || refinement.value;
      }
      return String(refinement.value);
    }
    
    // Handle regular categorical values
    if (typeof refinement.value === 'string') {
      return refinement.value.replace(/_/g, ' ');
    }
    
    return String(refinement.value);
  };

  const formatNumber = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toLocaleString();
  };

  const getAttributeLabel = (attribute: string) => {
    const labels: Record<string, string> = {
      purpose: 'Purpose',
      type: 'Property Type',
      categories: 'Category',
      furnishing: 'Furnishing',
      bedrooms: 'Bedrooms',
      price: 'Price Range',
      size: 'Size Range',
      'locationHierarchy.lvl0': 'Country',
      'locationHierarchy.lvl1': 'City',
      'locationHierarchy.lvl2': 'Area'
    };
    return labels[attribute] || attribute.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-gray-600">Active Filters:</span>
        {items.map((item) =>
          item.refinements.map((refinement, index) => (
            <Badge
              key={`${item.attribute}-${index}`}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span className="text-xs">
                {getAttributeLabel(item.attribute)}: {formatRefinementValue(refinement)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => refine(refinement)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))
        )}
        
        {items.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => items.forEach(item => 
              item.refinements.forEach(refinement => refine(refinement))
            )}
            className="text-xs"
          >
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
}