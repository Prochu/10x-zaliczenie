import React, { useEffect, useRef, useCallback } from "react";
import type { MatchHistoryItemViewModel } from "./hooks/useMatchHistory";
import MatchHistoryItem from "./MatchHistoryItem";

interface MatchHistoryListProps {
  items: MatchHistoryItemViewModel[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

const MatchHistoryList: React.FC<MatchHistoryListProps> = ({ items, hasMore, isLoadingMore, onLoadMore }) => {
  const observerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Infinite scroll implementation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "100px", // Load more when within 100px of the bottom
        threshold: 0.1,
      }
    );

    const currentLoadingRef = loadingRef.current;
    if (currentLoadingRef) {
      observer.observe(currentLoadingRef);
    }

    return () => {
      if (currentLoadingRef) {
        observer.unobserve(currentLoadingRef);
      }
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  const handleLoadMoreClick = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  return (
    <div className="space-y-4" ref={observerRef}>
      {items.map((item) => (
        <MatchHistoryItem key={item.id} match={item} />
      ))}

      {/* Loading indicator for infinite scroll */}
      {isLoadingMore && (
        <div className="flex justify-center py-8" ref={loadingRef}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Manual load more button (fallback for infinite scroll) */}
      {hasMore && !isLoadingMore && (
        <div className="flex justify-center py-8">
          <button
            onClick={handleLoadMoreClick}
            className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            Load More Matches
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchHistoryList;
