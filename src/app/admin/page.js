'use client';

import Link from 'next/link';
import styles from './page.module.css';
import { ArrowLeft, Sparkles, Scissors, MessageSquare, Share2, ClipboardList, Settings } from 'lucide-react';

const ADMIN_TOOLS = [
  {
    id: 'hairfit',
    name: 'HairFit 관리',
    description: '여성/남성 헤어스타일 데이터 추가, 수정, 삭제 및 이미지 업로드 관리',
    icon: Scissors,
    path: '/admin/hairfit',
    status: 'active',
    statusText: '운영 중'
  },
  {
    id: 'review-ai',
    name: '리뷰 답변 AI 관리',
    description: '답변 톤앤매너 템플릿, 키워드 사전 및 예시 데이터 관리',
    icon: MessageSquare,
    path: '#',
    status: 'coming_soon',
    statusText: '준비 중'
  },
  {
    id: 'sns-promo',
    name: 'SNS 홍보 생성기 관리',
    description: '프로모션 테마 문구 규칙, 태그 규칙 및 에셋 라이브러리 관리',
    icon: Share2,
    path: '#',
    status: 'coming_soon',
    statusText: '준비 중'
  },
  {
    id: 'menu-maker',
    name: '메뉴판 생성기 관리',
    description: '디자인 레이아웃 템플릿, 업종별 테마 스킨 및 폰트 라이브러리 관리',
    icon: ClipboardList,
    path: '#',
    status: 'coming_soon',
    statusText: '준비 중'
  }
];

export default function AdminHub() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Navigation back */}
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={16} /> 홈으로 돌아가기
        </Link>

        {/* Title Header */}
        <div className={styles.titleSection}>
          <div className={styles.adminBadge}>
            <Settings size={14} /> SYSTEM ADMIN
          </div>
          <h1 className={styles.title}>소상공인 AI 스튜디오 관리 센터</h1>
          <p className={styles.description}>
            AI 스튜디오 플랫폼에 탑재된 모든 비즈니스 인텔리전스 도구의 정적/동적 설정 및 마스터 데이터를 한곳에서 제어합니다.
          </p>
        </div>

        {/* Hub Cards Grid */}
        <div className={styles.hubGrid}>
          {ADMIN_TOOLS.map((tool) => {
            const IconComponent = tool.icon;
            const isActive = tool.status === 'active';

            return (
              <div 
                key={tool.id} 
                className={`${styles.hubCard} ${!isActive ? styles.hubCardDisabled : ''}`}
              >
                <div className={styles.cardHeader}>
                  <div className={`${styles.iconWrapper} ${isActive ? styles.iconActive : ''}`}>
                    <IconComponent size={24} />
                  </div>
                  <span className={`${styles.statusBadge} ${isActive ? styles.statusActive : styles.statusComing}`}>
                    {tool.statusText}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{tool.name}</h3>
                  <p className={styles.cardDesc}>{tool.description}</p>
                </div>

                <div className={styles.cardFooter}>
                  {isActive ? (
                    <Link href={tool.path} className={styles.manageButton}>
                      도구 관리하기 <Sparkles size={14} />
                    </Link>
                  ) : (
                    <button className={styles.disabledButton} disabled>
                      서비스 준비 중
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} 소상공인 AI Studio. Admin System. All rights reserved.
      </footer>
    </div>
  );
}
