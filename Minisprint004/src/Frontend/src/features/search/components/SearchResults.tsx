import { Virtuoso } from "react-virtuoso";

import { useSearch } from "../hooks/useSearch";
import HotelCard from "./HotelCard";

import styles from "../SearchResults.module.css";


export default function SearchResults() {
  const {
    results,
    isLoading,
    query,
    loadMore,
    hasMore,
    hasSearched,
    total,
    performSearch
  } = useSearch();

  const title = query
    ? (<>{total ?? results.length} hotels found for <span>"{query}"</span></>)
    : (<><span>All {total ?? results.length} hotels</span></>);

  if (isLoading && results.length === 0) {
    return (
      <div className={styles.loading}>
        Searching hotels...
      </div>
    );
  }


  if (!hasSearched) {
    return (
      <div className={styles.empty}>
        <h2>Discover Hotels</h2>

        <p>
          Start typing in the search bar above to see results
        </p>

        <button className={styles.showAllButton} onClick={() => void performSearch("")}>
          <span>Show all hotels</span>
        </button>
      </div>
    );
  }


  if (results.length === 0 && !isLoading) {
    return (
      <div className={styles.empty}>
        <h2>
          No results found for "{query}"
        </h2>
        <p>
          Try searching for a different city or hotel name
        </p>
      </div>
    );
  }


  return (
    <div className={styles.results}>
      <h2 className={styles.title}>
        {title}
      </h2>

      <div className={styles.grid}>
        <Virtuoso
          style={{
            height: "100%",
            width: "100%",
          }}

          data={results}

          overscan={300}

          endReached={() => {
            if (hasMore) {
              loadMore();
            }
          }}

          itemContent={(_, hotel) => (
            <HotelCard hotel={hotel} />
          )}
        />
      </div>
    </div>
  );
}