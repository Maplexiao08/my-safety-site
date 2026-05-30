import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 12;

function highlightText(text, keyword) {
  if (!keyword || !text) return text;
  const q = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${q})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase()
      ? <mark key={i} className="search-highlight">{part}</mark>
      : part
  );
}

function CaseLibrary() {
  const [accidents, setAccidents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [province, setProvince] = useState('');
  const [level, setLevel] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch('/accidents.json')
      .then(r => r.json())
      .then(data => {
        setAccidents(data);
        setFiltered(data);
      });
  }, []);

  useEffect(() => {
    let result = accidents;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(item =>
        item.brief.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.province.toLowerCase().includes(q) ||
        item.subtype.toLowerCase().includes(q)
      );
    }
    if (type) result = result.filter(item => item.type === type);
    if (province) result = result.filter(item => item.province === province);
    if (level) result = result.filter(item => item.level === level);

    // 按日期排序（最新在前）
    result = [...result].sort((a, b) => b.date.localeCompare(a.date));

    setFiltered(result);
    setCurrentPage(1);
  }, [search, type, province, level, accidents]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const types = [...new Set(accidents.map(a => a.type))];
  const provinces = [...new Set(accidents.map(a => a.province))];
  const levels = [...new Set(accidents.map(a => a.level))];

  // 分页按钮区间
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(pageCount, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [pageCount, currentPage]);

  return (
    <div className="case-library">
      <div className="library-header">
        <h2 className="library-title">事故案例库</h2>
        <div className="library-meta">共 {filtered.length} 条记录</div>
      </div>

      <div className="library-filters">
        <input
          type="text"
          className="filter-input"
          placeholder="搜索事故概要、城市、类型..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={type} onChange={e => setType(e.target.value)}>
          <option value="">全部类型</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="filter-select" value={province} onChange={e => setProvince(e.target.value)}>
          <option value="">全部省份</option>
          {provinces.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="filter-select" value={level} onChange={e => setLevel(e.target.value)}>
          <option value="">全部等级</option>
          {levels.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div className="case-grid">
        {paginated.map(item => (
          <Link to={`/case/${item.id}`} key={item.id} className="case-card">
            <div className="case-card-header">
              <span className="case-id">{item.id}</span>
              <span className={`level-badge level-${item.level}`}>{item.level}</span>
            </div>
            <div className="case-card-body">
              <div className="case-location">
                <span className="case-province">{highlightText(item.province, search)}</span>
                <span className="case-city">{highlightText(item.city, search)}</span>
              </div>
              <div className="case-date">{item.date}</div>
              <div className="case-brief">{highlightText(item.brief, search)}</div>
              <div className="case-stats">
                <span className="case-stat fatal">死亡: {item.deaths}</span>
                <span className="case-stat">受伤: {item.injuries}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            上一页
          </button>
          {pageNumbers[0] > 1 && (
            <>
              <button className="pagination-btn" onClick={() => setCurrentPage(1)}>1</button>
              {pageNumbers[0] > 2 && <span className="pagination-ellipsis">…</span>}
            </>
          )}
          {pageNumbers.map(page => (
            <button
              key={page}
              className={`pagination-btn${page === currentPage ? ' pagination-active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          {pageNumbers[pageNumbers.length - 1] < pageCount && (
            <>
              {pageNumbers[pageNumbers.length - 1] < pageCount - 1 && (
                <span className="pagination-ellipsis">…</span>
              )}
              <button className="pagination-btn" onClick={() => setCurrentPage(pageCount)}>
                {pageCount}
              </button>
            </>
          )}
          <button
            className="pagination-btn"
            disabled={currentPage === pageCount}
            onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}

export default CaseLibrary;
