import React from 'react';
import { Highlight } from 'react-instantsearch';

export default function HitComponent({ hit }) {
  const formatPrice = (price, currency, purpose) => {
    const formatter = new Intl.NumberFormat('en-US');
    const formattedPrice = formatter.format(price);
    
    if (purpose === 'rent') {
      const frequency = hit.rentFrequency === 'monthly' ? '/month' : '/year';
      return `${currency} ${formattedPrice}${frequency}`;
    }
    return `${currency} ${formattedPrice}`;
  };

  const getBedBathText = () => {
    if (hit.bedrooms === 0) return 'Studio';
    if (!hit.bedrooms) return '';
    
    return `${hit.bedrooms} BR${hit.bathrooms ? ` • ${hit.bathrooms} BA` : ''}`;
  };

  return (
    <div className="flex flex-col items-start gap-3 border p-4 rounded-md shadow-md w-full max-w-md bg-white">
      {/* Property Image - you might need a placeholder or default image */}
      <div className="w-[200px] h-[150px] bg-gray-200 rounded flex items-center justify-center">
        <span className="text-gray-500 text-sm">Property Image</span>
      </div>
      
      <div className="flex flex-col gap-2 w-full">
        {/* Title with highlighting */}
        <h2 className="text-lg font-bold">
          <Highlight hit={hit} attribute="title" />
        </h2>
        
        {/* Price and Purpose */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-green-600">
            {formatPrice(hit.price, hit.priceCurrency, hit.purpose)}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            hit.purpose === 'sale' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
          }`}>
            For {hit.purpose.charAt(0).toUpperCase() + hit.purpose.slice(1)}
          </span>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {getBedBathText() && <span>{getBedBathText()}</span>}
          {hit.size && <span>{hit.size} {hit.sizeUnit}</span>}
          {hit.type && (
            <span className="capitalize bg-gray-100 px-2 py-1 rounded">
              {hit.type}
            </span>
          )}
        </div>

        {/* Location */}
        <p className="text-sm text-gray-600">
          <Highlight hit={hit} attribute="locationPathEn" />
        </p>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          <Highlight hit={hit} attribute="description" />
        </p>

        {/* Tags */}
        {hit._tags && hit._tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {hit._tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
              >
                {tag.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}

        {/* Agency Info */}
        <div className="text-xs text-gray-500 mt-2">
          <span>Listed by: {hit.agencyName}</span>
          {hit.agentNames && hit.agentNames.length > 0 && (
            <span> • Agent: {hit.agentNames[0]}</span>
          )}
        </div>
      </div>
    </div>
  );
} 