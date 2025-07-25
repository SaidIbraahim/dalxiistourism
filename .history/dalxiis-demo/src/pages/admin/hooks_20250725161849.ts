import { useState } from 'react';

export function usePagination<T>(data: T[], itemsPerPage = 5) {
  const [page, setPage] = useState(1);
  const maxPage = Math.ceil(data.length / itemsPerPage);
  const paginated = data.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const goTo = (p: number) => setPage(Math.max(1, Math.min(maxPage, p)));
  return { paginated, page, maxPage, goTo };
} 