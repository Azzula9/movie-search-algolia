import React from 'react';
import { Highlight } from 'react-instantsearch';

export default function HitComponent({ hit }) {
  return (
    <div className="flex flex-col items-start gap-2 border p-4 rounded-md shadow-md w-full max-w-md bg-white">
      <img
        src={hit.poster_path}
        alt={hit.title}
        className="w-[150px] h-auto rounded"
      />
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold">
          <Highlight hit={hit} attribute="title" />
        </h2>
        <p className="text-sm text-gray-600">{hit.overview}</p>
        <p className="text-xs text-gray-500">
          Release date: {hit.release_date} | Rating: {hit.vote_average} ⭐
        </p>
        {hit.genres && (
          <div className="flex flex-wrap gap-1 mt-1">
            {hit.genres.map((genre, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
