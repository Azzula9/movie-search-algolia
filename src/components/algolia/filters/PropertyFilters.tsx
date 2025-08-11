// components/algolia/filters/PropertyFilters.tsx
'use client';

import React from 'react';
import { 
  useRefinementList, 
  useRange, 
  useMenu, 
  useClearRefinements,
  useNumericMenu 
} from 'react-instantsearch';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Purpose Filter (Sale/Rent)
export function PurposeFilter() {
  const { items, refine } = useRefinementList({
    attribute: 'purpose',
    operator: 'or'
  });

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Purpose</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.value} className="flex items-center space-x-2">
            <Checkbox
              id={`purpose-${item.value}`}
              checked={item.isRefined}
              onCheckedChange={() => refine(item.value)}
            />
            <Label 
              htmlFor={`purpose-${item.value}`}
              className="capitalize cursor-pointer"
            >
              {item.value} ({item.count})
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

// Property Type Filter
export function PropertyTypeFilter() {
  const { items, refine } = useRefinementList({
    attribute: 'type',
    operator: 'or'
  });

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Property Type</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.value} className="flex items-center space-x-2">
            <Checkbox
              id={`type-${item.value}`}
              checked={item.isRefined}
              onCheckedChange={() => refine(item.value)}
            />
            <Label 
              htmlFor={`type-${item.value}`}
              className="capitalize cursor-pointer"
            >
              {item.value} ({item.count})
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

// Bedrooms Filter
export function BedroomsFilter() {
  const { items, refine, currentRefinement } = useMenu({
    attribute: 'bedrooms'
  });

  const handleSelectionChange = (value: string) => {
    if (value === 'all' || value === currentRefinement) {
      refine(''); // Clear the refinement
    } else {
      refine(value);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Bedrooms</h3>
      <Select 
        value={currentRefinement || 'all'} 
        onValueChange={handleSelectionChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Any bedrooms" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any bedrooms</SelectItem>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.value === '0' ? 'Studio' : `${item.value} BR`} ({item.count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Price Range Filter - Fixed version using numeric menu
export function PriceRangeFilter() {
  const { items, refine, currentRefinement } = useNumericMenu({
    attribute: 'price',
    items: [
      { label: 'Any price', start: 0, end: Infinity },
      { label: 'Under 500K', start: 0, end: 500000 },
      { label: '500K - 1M', start: 500000, end: 1000000 },
      { label: '1M - 2M', start: 1000000, end: 2000000 },
      { label: '2M - 5M', start: 2000000, end: 5000000 },
      { label: 'Above 5M', start: 5000000, end: Infinity }
    ]
  });

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Price Range (AED)</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox
              id={`price-${index}`}
              checked={item.isRefined}
              onCheckedChange={() => refine(item.value)}
            />
            <Label 
              htmlFor={`price-${index}`}
              className="cursor-pointer text-sm"
            >
              {item.label} {item.count > 0 && `(${item.count})`}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

// Alternative Custom Price Range Filter using useRange
export function CustomPriceRangeFilter() {
  const { range, canRefine, refine, start } = useRange({
    attribute: 'price'
  });

  const [minPrice, setMinPrice] = React.useState('');
  const [maxPrice, setMaxPrice] = React.useState('');

  // Update local state when range changes
  React.useEffect(() => {
    if (start && start[0] !== undefined) {
      setMinPrice(start[0].toString());
    }
    if (start && start[1] !== undefined) {
      setMaxPrice(start[1].toString());
    }
  }, [start]);

  if (!canRefine || !range.min || !range.max) return null;

  const handleApplyPriceFilter = () => {
    const min = minPrice ? parseFloat(minPrice) : range.min;
    const max = maxPrice ? parseFloat(maxPrice) : range.max;
    
    if (min !== undefined && max !== undefined && min <= max) {
      refine([min, max]);
    }
  };

  const handleClearPriceFilter = () => {
    refine([range.min, range.max]);
    setMinPrice('');
    setMaxPrice('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Price Range (AED)</h3>
      <div className="space-y-2">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Label htmlFor="min-price" className="text-xs">Min</Label>
            <Input
              id="min-price"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder={formatPrice(range.min)}
              className="text-xs"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="max-price" className="text-xs">Max</Label>
            <Input
              id="max-price"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder={formatPrice(range.max)}
              className="text-xs"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleApplyPriceFilter} className="flex-1" size="sm">
            Apply
          </Button>
          <Button onClick={handleClearPriceFilter} variant="outline" className="flex-1" size="sm">
            Clear
          </Button>
        </div>
        <div className="text-xs text-gray-500">
          Range: {formatPrice(range.min)} - {formatPrice(range.max)}
        </div>
      </div>
    </div>
  );
}

// Categories Filter
export function CategoriesFilter() {
  const { items, refine } = useRefinementList({
    attribute: 'categories',
    operator: 'or'
  });

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Category</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.value} className="flex items-center space-x-2">
            <Checkbox
              id={`category-${item.value}`}
              checked={item.isRefined}
              onCheckedChange={() => refine(item.value)}
            />
            <Label 
              htmlFor={`category-${item.value}`}
              className="capitalize cursor-pointer"
            >
              {item.value} ({item.count})
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

// Furnishing Filter
export function FurnishingFilter() {
  const { items, refine } = useRefinementList({
    attribute: 'furnishing',
    operator: 'or'
  });

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Furnishing</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.value} className="flex items-center space-x-2">
            <Checkbox
              id={`furnishing-${item.value}`}
              checked={item.isRefined}
              onCheckedChange={() => refine(item.value)}
            />
            <Label 
              htmlFor={`furnishing-${item.value}`}
              className="capitalize cursor-pointer"
            >
              {item.value.replace('_', ' ')} ({item.count})
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

// Size Range Filter - Fixed version using numeric menu
export function SizeRangeFilter() {
  const { items, refine } = useNumericMenu({
    attribute: 'size',
    items: [
      { label: 'Any size', start: 0, end: Infinity },
      { label: 'Under 500 sqft', start: 0, end: 500 },
      { label: '500 - 1000 sqft', start: 500, end: 1000 },
      { label: '1000 - 2000 sqft', start: 1000, end: 2000 },
      { label: '2000 - 3000 sqft', start: 2000, end: 3000 },
      { label: 'Above 3000 sqft', start: 3000, end: Infinity }
    ]
  });

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Size Range</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox
              id={`size-${index}`}
              checked={item.isRefined}
              onCheckedChange={() => refine(item.value)}
            />
            <Label 
              htmlFor={`size-${index}`}
              className="cursor-pointer text-sm"
            >
              {item.label} {item.count > 0 && `(${item.count})`}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

// Alternative Custom Size Range Filter
export function CustomSizeRangeFilter() {
  const { range, canRefine, refine, start } = useRange({
    attribute: 'size'
  });

  const [minSize, setMinSize] = React.useState('');
  const [maxSize, setMaxSize] = React.useState('');

  React.useEffect(() => {
    if (start && start[0] !== undefined) {
      setMinSize(start[0].toString());
    }
    if (start && start[1] !== undefined) {
      setMaxSize(start[1].toString());
    }
  }, [start]);

  if (!canRefine || !range.min || !range.max) return null;

  const handleApplySizeFilter = () => {
    const min = minSize ? parseFloat(minSize) : range.min;
    const max = maxSize ? parseFloat(maxSize) : range.max;
    
    if (min !== undefined && max !== undefined && min <= max) {
      refine([min, max]);
    }
  };

  const handleClearSizeFilter = () => {
    refine([range.min, range.max]);
    setMinSize('');
    setMaxSize('');
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Size Range (sqft)</h3>
      <div className="space-y-2">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Label htmlFor="min-size" className="text-xs">Min</Label>
            <Input
              id="min-size"
              type="number"
              value={minSize}
              onChange={(e) => setMinSize(e.target.value)}
              placeholder={String(range.min)}
              className="text-xs"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="max-size" className="text-xs">Max</Label>
            <Input
              id="max-size"
              type="number"
              value={maxSize}
              onChange={(e) => setMaxSize(e.target.value)}
              placeholder={String(range.max)}
              className="text-xs"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleApplySizeFilter} className="flex-1" size="sm">
            Apply
          </Button>
          <Button onClick={handleClearSizeFilter} variant="outline" className="flex-1" size="sm">
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}

// Location Hierarchy Filter
export function LocationFilter() {
  const { items, refine } = useRefinementList({
    attribute: 'locationHierarchy.lvl1', // Dubai level
    operator: 'or'
  });

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Location</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.value} className="flex items-center space-x-2">
            <Checkbox
              id={`location-${item.value}`}
              checked={item.isRefined}
              onCheckedChange={() => refine(item.value)}
            />
            <Label 
              htmlFor={`location-${item.value}`}
              className="cursor-pointer"
            >
              {item.value} ({item.count})
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

// Clear All Filters - Fixed version
export function ClearFilters() {
  const { refine, canRefine } = useClearRefinements({
    includedAttributes: [
      'purpose',
      'type',
      'categories',
      'furnishing',
      'bedrooms',
      'locationHierarchy.lvl0',
      'locationHierarchy.lvl1',
      'locationHierarchy.lvl2',
      'price',
      'size'
    ]
  });

  if (!canRefine) return null;

  return (
    <Button 
      onClick={() => refine()}
      variant="outline" 
      className="w-full"
    >
      Clear All Filters
    </Button>
  );
}