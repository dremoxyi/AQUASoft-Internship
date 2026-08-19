import { useSearch } from '../../../../features/search/hooks/useSearch.ts';
import styles from '../Navbar.module.css';

export default function SearchInput() {
  const { query, setQuery } = useSearch();

  return (
    <div className={styles.searchWrapper}>
      <div className={styles.searchBox}>
        <input
          id="search"
          name="search"
          type="text"
          placeholder="Search hotels, cities..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>
    </div>
  );
}