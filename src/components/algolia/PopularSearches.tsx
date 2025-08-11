import React from 'react'
import { useSearchBox, UseSearchBoxProps } from 'react-instantsearch'
import { Button } from '../ui/button';

interface PopularSearchQueries extends UseSearchBoxProps {
    queries: string[]
}

export default function PopularSearches({ queries, ...props}: PopularSearchQueries) {
    const { refine } = useSearchBox(props);

  return (
    <div className='mt-4 flex gap-2 items-center flex-wrap justify-center'>
        {
            queries.map((query: string, index: number) => (
                <Button key={index}
                    className='rounded-none'
                    variant={'outline'}
                    onClick={() => refine(query)}
                >
                    Search for 
                    <span className='font-bold uppercase underline text-blue-600'>
                        {query}
                    </span>
                </Button>
            ))
        }
    </div>
  )
}