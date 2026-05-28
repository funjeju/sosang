'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { AI_TOOLS, RECOMMENDATIONS, getHistory } from '../lib/mockData';
import { ArrowRight, Sparkles, History, User, Heart, Star } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('beauty');
  const [recentHistory, setRecentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const historyData = await getHistory();
        setRecentHistory(historyData);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setHistoryLoading(false);
      }
    }
    loadHistory();
  }, []);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logo}>
            <Sparkles size={24} className="fade-in" style={{ color: 'var(--accent)' }} />
            <span>소상공인 AI</span> Studio
          </div>
          <div className={styles.profile}>
            <span className={styles.avatar}>
              <User size={18} />
            </span>
          </div>
        </header>

        {/* Hero Section */}
        <section className={`${styles.hero} fade-in`}>
          <span className={styles.heroTag}>사장님 전용 AI 솔루션</span>
          <h1 className={styles.heroTitle}>
            사장님을 위한 가장 쉬운 AI 도구
          </h1>
          <p className={styles.heroSubtitle}>
            사진 시뮬레이션, 매장 홍보, 리뷰 답변, 메뉴판 디자인까지 클릭 몇 번으로 고급스럽게 해결하세요.
          </p>
          <div className={styles.heroBgPattern} />
        </section>

        {/* Recently Used / History Section */}
        {recentHistory.length > 0 && (
          <section className={`${styles.section} fade-in`}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>최근 생성 기록</h2>
                <p className={styles.sectionSubtitle}>최근에 제작한 스타일 변환 결과입니다.</p>
              </div>
              <History size={20} style={{ color: 'var(--muted)' }} />
            </div>
            <div className={styles.historyList}>
              {recentHistory.map((item, idx) => (
                <div key={item.id || idx} className={styles.historyCard}>
                  <div className={styles.historyThumb}>
                    <Image
                      src={item.outputImage || '/images/default_avatar.jpg'}
                      alt="Hair style output"
                      fill
                      sizes="56px"
                      priority
                    />
                  </div>
                  <div className={styles.historyInfo}>
                    <span className={styles.historyToolName}>HairFit 변환 결과</span>
                    <span className={styles.historyDate}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '최근 생성'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI Tools Grid */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>AI 도구 카탈로그</h2>
              <p className={styles.sectionSubtitle}>업무 효율을 200% 올려줄 AI 보조 도구 모음입니다.</p>
            </div>
          </div>
          <div className={styles.grid}>
            {AI_TOOLS.map((tool) => (
              <div key={tool.id} className={styles.card}>
                <div className={styles.cardImageWrapper}>
                  {/* Premium fallback background if no thumbnail loaded */}
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(45deg, var(--accent-light), var(--border))',
                      position: 'absolute',
                      zIndex: 1,
                    }}
                  />
                  <div className={styles.cardTags}>
                    {tool.tags.map((tag, i) => (
                      <span key={i} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                  {/* Status Indicator */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      zIndex: 2,
                      background: 'rgba(0, 0, 0, 0.45)',
                      padding: '4px 10px',
                      borderRadius: '100px',
                      color: '#ffffff',
                    }}
                  >
                    <span className={styles.statusIndicator}>
                      <span className={`${styles.dot} ${tool.isReady ? styles.active : styles.pending}`} />
                      {tool.isReady ? '사용 가능' : '개발 중'}
                    </span>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{tool.name}</h3>
                  <p className={styles.cardDesc}>{tool.description}</p>
                  <div className={styles.cardFooter}>
                    {tool.isReady ? (
                      <Link href={tool.detailUrl} className={styles.cardLink}>
                        시작하기 <ArrowRight size={16} />
                      </Link>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
                        준비 중
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Business-type Recommendations */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>업종별 맞춤 추천</h2>
              <p className={styles.sectionSubtitle}>매장 업종에 최적화된 추천 도구 조합입니다.</p>
            </div>
          </div>
          
          <div className={styles.tabsContainer}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'beauty' ? styles.activeTab : ''}`}
                onClick={() => handleTabChange('beauty')}
              >
                헤어/뷰티 숍
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'cafe' ? styles.activeTab : ''}`}
                onClick={() => handleTabChange('cafe')}
              >
                카페/식음료
              </button>
            </div>
            
            <div className={styles.tabContent}>
              <h3 className={styles.recommendTitle}>
                {RECOMMENDATIONS[activeTab].title}
              </h3>
              <div className={styles.recommendList}>
                {RECOMMENDATIONS[activeTab].toolIds.map((id) => {
                  const tool = AI_TOOLS.find((t) => t.id === id);
                  if (!tool) return null;
                  return (
                    <div key={tool.id} className={styles.recommendItem}>
                      <div className={styles.recommendInfo}>
                        <span className={styles.recommendName}>{tool.name}</span>
                        <span className={styles.recommendDesc}>{tool.description}</span>
                      </div>
                      {tool.isReady ? (
                        <Link href={tool.detailUrl} className={styles.cardLink}>
                          바로가기 <ArrowRight size={14} />
                        </Link>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>대기 중</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} 소상공인 AI Studio. All rights reserved.
      </footer>
    </div>
  );
}
