

import { usePagination, UsePaginationProps } from 'react-instantsearch';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function CustomPagination(props: UsePaginationProps) {

  const {
    pages,
    currentRefinement,
    isFirstPage,
    isLastPage,
    canRefine,
    refine,
    createURL
  } = usePagination(props);

  if (!canRefine) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent className='bg-secondary'>
        <PaginationItem>
          <PaginationPrevious 
            href={createURL(currentRefinement - 1)}
            onClick={(e) => {
              e.preventDefault();
              if(currentRefinement === 0) return;
              refine(currentRefinement - 1);
            }}
            aria-disabled={isFirstPage}
          />
        </PaginationItem>
        {pages.map((page) => (
          <PaginationItem key={page}>
            {page === null ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink 
                href={createURL(page)}
                onClick={(e) => {
                  e.preventDefault();
                  refine(page);
                }}
                isActive={currentRefinement === page}
                className='rounded-none'
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext 
            href={createURL(currentRefinement + 1)}
            onClick={(e) => {
                e.preventDefault();
                if(isLastPage) return;
              refine(currentRefinement + 1);
            }}
            aria-disabled={isLastPage}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

