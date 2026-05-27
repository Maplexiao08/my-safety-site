import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function CaseDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch('/accidents.json')
      .then(r => r.json())
      .then(data => {
        const found = data.find(d => d.id === id);
        if (found) {
          setItem(found);
        } else {
          setNotFound(true);
        }
      });
  }, [id]);

  if (notFound) {
    return (
      <div className="detail-empty">
        <p className="detail-empty-text">未找到编号为 <code>{id}</code> 的事故案例</p>
        <Link to="/cases" className="detail-back-btn">返回案例库</Link>
      </div>
    );
  }

  if (!item) return <div className="loading">加载中...</div>;

  return (
    <div className="case-detail">
      {/* ---- 面包屑 ---- */}
      <nav className="breadcrumb">
        <Link to="/" className="breadcrumb-link">首页</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to="/cases" className="breadcrumb-link">案例库</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{item.id}</span>
      </nav>

      {/* ---- 标题区 ---- */}
      <div className="detail-hero">
        <div className="detail-hero-top">
          <span className="detail-id">{item.id}</span>
          <span className={`level-badge level-${item.level}`}>{item.level}</span>
          <span className={`level-badge level-subtype`}>{item.subtype}</span>
          <span className={`level-badge level-type`}>{item.type}</span>
        </div>
        <h1 className="detail-title">{item.brief}</h1>
        <div className="detail-meta">
          <span>{item.date}</span>
          <span className="meta-sep">|</span>
          <span>{item.province} {item.city}</span>
        </div>
      </div>

      {/* ---- 核心指标 ---- */}
      <div className="detail-stats">
        <div className="detail-stat detail-stat-fatal">
          <span className="detail-stat-num">{item.deaths}</span>
          <span className="detail-stat-label">死亡人数</span>
        </div>
        <div className="detail-stat detail-stat-injured">
          <span className="detail-stat-num">{item.injuries}</span>
          <span className="detail-stat-label">受伤人数</span>
        </div>
        <div className="detail-stat detail-stat-level">
          <span className="detail-stat-num">{item.level}</span>
          <span className="detail-stat-label">事故等级</span>
        </div>
        <div className="detail-stat detail-stat-type">
          <span className="detail-stat-num">{item.type}</span>
          <span className="detail-stat-label">事故类型</span>
        </div>
      </div>

      {/* ---- 详细经过与分析 ---- */}
      <section className="detail-section detail-section-highlight">
        <h2 className="detail-section-title">详细经过与分析</h2>
        <div className="detail-content">{item.analysis}</div>
      </section>

      {/* ---- 后续影响 ---- */}
      <section className="detail-section detail-section-highlight">
        <h2 className="detail-section-title">后续影响与处理</h2>
        <div className="detail-content">{item.impact}</div>
      </section>

      {/* ---- 基本信息 ---- */}
      <section className="detail-section">
        <h2 className="detail-section-title">基本信息</h2>
        <div className="detail-info-grid">
          <div className="detail-info-item">
            <span className="detail-info-label">事故编号</span>
            <span className="detail-info-value">{item.id}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">发生日期</span>
            <span className="detail-info-value">{item.date}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">省份</span>
            <span className="detail-info-value">{item.province}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">城市</span>
            <span className="detail-info-value">{item.city}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">事故类型</span>
            <span className="detail-info-value">{item.type}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">细分子类</span>
            <span className="detail-info-value">{item.subtype}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">事故等级</span>
            <span className="detail-info-value">{item.level}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">死亡人数</span>
            <span className="detail-info-value detail-info-fatal">{item.deaths}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">受伤人数</span>
            <span className="detail-info-value">{item.injuries}</span>
          </div>
        </div>
      </section>

      {/* ---- 来源 ---- */}
      {item.source && (
        <section className="detail-section">
          <h2 className="detail-section-title">信息来源</h2>
          <a href={item.source} target="_blank" rel="noopener noreferrer" className="detail-source">
            {item.source}
          </a>
        </section>
      )}

      {/* ---- 底部操作 ---- */}
      <div className="detail-actions">
        <Link to="/cases" className="detail-back-btn">← 返回案例库</Link>
      </div>
    </div>
  );
}

export default CaseDetail;