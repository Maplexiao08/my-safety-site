import { useState, useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';

function Dashboard() {
  const [accidents, setAccidents] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const lineRef = useRef(null);
  const pieRef = useRef(null);
  const barRef = useRef(null);
  const lineChart = useRef(null);
  const pieChart = useRef(null);
  const barChart = useRef(null);

  useEffect(() => {
    fetch('/accidents.json')
      .then(r => r.json())
      .then(data => {
        setAccidents(data);
        const dates = data.map(d => d.date).sort();
        setDateFrom(dates[0] || '');
        setDateTo(dates[dates.length - 1] || '');
      });
  }, []);

  const filtered = useMemo(() => {
    return accidents.filter(item => {
      if (dateFrom && item.date < dateFrom) return false;
      if (dateTo && item.date > dateTo) return false;
      return true;
    });
  }, [accidents, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const monthlyCount = {};
    const monthlyDeaths = {};
    const typeCount = {};
    const provinceCount = {};

    for (const item of filtered) {
      const m = item.date.slice(0, 7);
      monthlyCount[m] = (monthlyCount[m] || 0) + 1;
      monthlyDeaths[m] = (monthlyDeaths[m] || 0) + (item.deaths || 0);
      typeCount[item.type || '未知'] = (typeCount[item.type || '未知'] || 0) + 1;
      provinceCount[item.province || '未知'] = (provinceCount[item.province || '未知'] || 0) + 1;
    }

    return { monthlyCount, monthlyDeaths, typeCount, provinceCount };
  }, [filtered]);

  /* ====== 月度趋势折线图 ====== */
  useEffect(() => {
    if (!lineRef.current) return;
    if (!lineChart.current) lineChart.current = echarts.init(lineRef.current, null, { renderer: 'canvas' });

    const months = Object.keys(stats.monthlyCount).sort();
    lineChart.current.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'oklch(0.18 0.01 260)',
        borderColor: 'oklch(0.3 0.01 260)',
        textStyle: { color: 'oklch(0.85 0.01 260)', fontSize: 13 }
      },
      legend: {
        data: ['事故数', '死亡人数'],
        textStyle: { color: 'oklch(0.6 0.01 260)', fontSize: 12 },
        top: 0,
        left: 'center'
      },
      grid: { left: 48, right: 48, top: 40, bottom: 32 },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: { lineStyle: { color: 'oklch(0.28 0.01 260)' } },
        axisTick: { show: false },
        axisLabel: { color: 'oklch(0.6 0.01 260)', fontSize: 12 }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: { lineStyle: { color: 'oklch(0.22 0.01 260)' } },
        axisLabel: { color: 'oklch(0.6 0.01 260)', fontSize: 12 }
      },
      series: [
        {
          name: '事故数',
          type: 'line',
          data: months.map(m => stats.monthlyCount[m]),
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: 'oklch(0.75 0.16 85)', width: 2.5 },
          itemStyle: { color: 'oklch(0.75 0.16 85)' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'oklch(0.75 0.16 85 / 0.25)' },
              { offset: 1, color: 'oklch(0.75 0.16 85 / 0.02)' }
            ])
          }
        },
        {
          name: '死亡人数',
          type: 'line',
          data: months.map(m => stats.monthlyDeaths[m]),
          smooth: true,
          symbol: 'diamond',
          symbolSize: 8,
          lineStyle: { color: 'oklch(0.62 0.22 28)', width: 2.5, type: 'dashed' },
          itemStyle: { color: 'oklch(0.62 0.22 28)' }
        }
      ]
    }, true);
  }, [stats]);

  /* ====== 事故类型饼图 ====== */
  useEffect(() => {
    if (!pieRef.current) return;
    if (!pieChart.current) pieChart.current = echarts.init(pieRef.current, null, { renderer: 'canvas' });

    const pieData = Object.entries(stats.typeCount).map(([name, value]) => ({ name, value }));

    pieChart.current.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'oklch(0.18 0.01 260)',
        borderColor: 'oklch(0.3 0.01 260)',
        textStyle: { color: 'oklch(0.85 0.01 260)', fontSize: 13 }
      },
      legend: {
        orient: 'vertical',
        right: 0,
        top: 'center',
        textStyle: { color: 'oklch(0.6 0.01 260)', fontSize: 12 }
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['42%', '50%'],
          avoidLabelOverlap: false,
          padAngle: 2,
          itemStyle: {
            borderRadius: 4,
            borderColor: 'oklch(0.15 0.01 260)',
            borderWidth: 3
          },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold', color: 'oklch(0.9 0.01 260)' },
            scaleSize: 8
          },
          data: pieData,
          color: [
            'oklch(0.62 0.22 28)',
            'oklch(0.68 0.17 55)',
            'oklch(0.75 0.16 85)',
            'oklch(0.55 0.05 260)',
            'oklch(0.5 0.01 220)',
            'oklch(0.78 0.14 95)'
          ]
        }
      ]
    }, true);
  }, [stats]);

  /* ====== 省份分布柱状图 ====== */
  useEffect(() => {
    if (!barRef.current) return;
    if (!barChart.current) barChart.current = echarts.init(barRef.current, null, { renderer: 'canvas' });

    const provinces = Object.entries(stats.provinceCount).sort((a, b) => b[1] - a[1]);

    barChart.current.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'oklch(0.18 0.01 260)',
        borderColor: 'oklch(0.3 0.01 260)',
        textStyle: { color: 'oklch(0.85 0.01 260)', fontSize: 13 }
      },
      grid: { left: 48, right: 32, top: 16, bottom: 32 },
      xAxis: {
        type: 'category',
        data: provinces.map(p => p[0]),
        axisLine: { lineStyle: { color: 'oklch(0.28 0.01 260)' } },
        axisTick: { show: false },
        axisLabel: { color: 'oklch(0.6 0.01 260)', fontSize: 12, rotate: provinces.length > 5 ? 30 : 0 }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: { lineStyle: { color: 'oklch(0.22 0.01 260)' } },
        axisLabel: { color: 'oklch(0.6 0.01 260)', fontSize: 12 }
      },
      series: [
        {
          type: 'bar',
          data: provinces.map(p => p[1]),
          barWidth: '50%',
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'oklch(0.68 0.17 55)' },
              { offset: 1, color: 'oklch(0.45 0.08 55)' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'oklch(0.75 0.16 85)' },
                { offset: 1, color: 'oklch(0.55 0.1 85)' }
              ])
            }
          }
        }
      ]
    }, true);
  }, [stats]);

  /* resize 监听 */
  useEffect(() => {
    const resize = () => {
      lineChart.current?.resize();
      pieChart.current?.resize();
      barChart.current?.resize();
    };
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      lineChart.current?.dispose();
      pieChart.current?.dispose();
      barChart.current?.dispose();
      lineChart.current = null;
      pieChart.current = null;
      barChart.current = null;
    };
  }, []);

  if (!accidents.length) return <div className="loading">加载中...</div>;

  const totalAccidents = filtered.length;
  const totalDeaths = filtered.reduce((a, b) => a + (b.deaths || 0), 0);
  const totalInjuries = filtered.reduce((a, b) => a + (b.injuries || 0), 0);
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthCount = filtered.filter(d => d.date.startsWith(thisMonth)).length;

  return (
    <div className="dashboard">
      {/* ---- 日期筛选 ---- */}
      <div className="filter-bar">
        <label className="filter-label">
          起始日期
          <input type="date" className="filter-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </label>
        <span className="filter-sep">—</span>
        <label className="filter-label">
          结束日期
          <input type="date" className="filter-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </label>
        <span className="filter-hint">筛选 {filtered.length} 条记录</span>
      </div>

      {/* ---- 统计卡片 ---- */}
      <div className="stat-grid">
        <div className="stat-card stat-critical">
          <span className="stat-number">{totalAccidents}</span>
          <span className="stat-desc">总事故数</span>
        </div>
        <div className="stat-card stat-fatal">
          <span className="stat-number">{totalDeaths}</span>
          <span className="stat-desc">总死亡人数</span>
        </div>
        <div className="stat-card stat-warning">
          <span className="stat-number">{totalInjuries}</span>
          <span className="stat-desc">总受伤人数</span>
        </div>
        <div className="stat-card stat-info">
          <span className="stat-number">{thisMonthCount}</span>
          <span className="stat-desc">本月新增</span>
        </div>
      </div>

      {/* ---- 图表区 ---- */}
      <div className="chart-section">
        <h3 className="chart-title">月度趋势</h3>
        <div ref={lineRef} className="chart-container" />
      </div>

      <div className="chart-row">
        <div className="chart-section chart-half">
          <h3 className="chart-title">事故类型占比</h3>
          <div ref={pieRef} className="chart-container" />
        </div>
        <div className="chart-section chart-half">
          <h3 className="chart-title">省份分布</h3>
          <div ref={barRef} className="chart-container" />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;