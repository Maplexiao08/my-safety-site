import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function CaseLibrary() {
  const [accidents, setAccidents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [province, setProvince] = useState('');

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
    setFiltered(result);
  }, [search, type, province, accidents]);

  const types = [...new Set(accidents.map(a => a.type))];
  const provinces = [...new Set(accidents.map(a => a.province))];

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
      </div>

      <div className="case-grid">
        {filtered.map(item => (
          <Link to={`/case/${item.id}`} key={item.id} className="case-card">
            <div className="case-card-header">
              <span className="case-id">{item.id}</span>
              <span className={`level-badge level-${item.level}`}>{item.level}</span>
            </div>
            <div className="case-card-body">
              <div className="case-location">
                <span className="case-province">{item.province}</span>
                <span className="case-city">{item.city}</span>
              </div>
              <div className="case-date">{item.date}</div>
              <div className="case-brief">{item.brief}</div>
              <div className="case-stats">
                <span className="case-stat fatal">死亡: {item.deaths}</span>
                <span className="case-stat">受伤: {item.injuries}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CaseLibrary;