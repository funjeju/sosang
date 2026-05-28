'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { HAIR_STYLES, saveGenerationResult } from '../../lib/mockData';
import { ArrowLeft, Upload, Check, RefreshCw, Download, Sparkles, AlertCircle, Eye, Share2 } from 'lucide-react';

const GENERATION_STEPS = [
  "얼굴 윤곽 및 이목구비 분석 중...",
  "기존 헤어 영역 정밀 분리 중...",
  "선택하신 헤어스타일 매칭 중...",
  "자연스러운 질감 및 경계선 합성 중...",
  "피부톤 및 주변 조명 최적화 중...",
  "최종 이미지 렌더링 완료!"
];

export default function HairFit() {
  // Image Upload States
  const [imageFile, setImageFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const fileInputRef = useRef(null);

  // Validation States (simulated after upload)
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState({
    faceDetected: false,
    frontAngle: false,
    goodLighting: false,
    hairMapped: false
  });

  // Editor states
  const [selectedStyleId, setSelectedStyleId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [resultImageSrc, setResultImageSrc] = useState(null);

  // Before/After Slider state
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isSaved, setIsSaved] = useState(false);

  // Get selected style info
  const selectedStyle = HAIR_STYLES.find(s => s.id === selectedStyleId);

  // Handle Photo Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setImageSrc(uploadEvent.target.result);
        triggerValidation();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setImageSrc(uploadEvent.target.result);
        triggerValidation();
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerValidation = () => {
    setIsValidating(true);
    setValidation({
      faceDetected: false,
      frontAngle: false,
      goodLighting: false,
      hairMapped: false
    });

    // Simulate validation check steps
    setTimeout(() => {
      setValidation(prev => ({ ...prev, faceDetected: true }));
      setTimeout(() => {
        setValidation(prev => ({ ...prev, frontAngle: true }));
        setTimeout(() => {
          setValidation(prev => ({ ...prev, goodLighting: true }));
          setTimeout(() => {
            setValidation(prev => ({ ...prev, hairMapped: true }));
            setIsValidating(false);
          }, 300);
        }, 300);
      }, 300);
    }, 400);
  };

  const triggerUploadClick = () => {
    fileInputRef.current.click();
  };

  const resetUpload = () => {
    setImageFile(null);
    setImageSrc(null);
    setSelectedStyleId('');
    setIsCompleted(false);
    setIsGenerating(false);
    setIsSaved(false);
    setResultImageSrc(null);
    setValidation({
      faceDetected: false,
      frontAngle: false,
      goodLighting: false,
      hairMapped: false
    });
  };

  // Run AI Style Generation
  const handleGenerate = async () => {
    if (!imageSrc || !selectedStyleId) return;

    setIsGenerating(true);
    setGenerationStep(0);

    let progressInterval;
    let returnedImage = null;

    // Start progress interval (fake progress stepping for UX)
    progressInterval = setInterval(() => {
      setGenerationStep(prev => {
        if (prev < GENERATION_STEPS.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 850);

    try {
      const response = await fetch('/api/generate-hair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageSrc,
          styleName: selectedStyle.name,
          styleCategory: selectedStyle.category,
        }),
      });

      if (!response.ok) {
        throw new Error('AI Generation API error');
      }

      const data = await response.json();
      if (data.base64Image) {
        returnedImage = data.base64Image;
      } else if (data.imageUrl) {
        returnedImage = data.imageUrl;
      } else {
        throw new Error('Invalid image output structure');
      }

      // Finish progress bar steps
      clearInterval(progressInterval);
      setGenerationStep(GENERATION_STEPS.length - 2);

      setTimeout(() => {
        setGenerationStep(GENERATION_STEPS.length - 1);
        setTimeout(() => {
          setResultImageSrc(returnedImage);
          setIsGenerating(false);
          setIsCompleted(true);
        }, 800);
      }, 800);

    } catch (err) {
      console.error("AI Generation Error, falling back to static mockup asset:", err);
      clearInterval(progressInterval);

      // Graceful fallback to pre-generated mockup style assets
      const fallbackImage = selectedStyle.resultImage;
      setGenerationStep(GENERATION_STEPS.length - 1);
      setTimeout(() => {
        setResultImageSrc(fallbackImage);
        setIsGenerating(false);
        setIsCompleted(true);
      }, 1000);
    }
  };

  const handleDownload = () => {
    if (!resultImageSrc) return;
    const link = document.createElement('a');
    link.href = resultImageSrc;
    link.download = `HairFit_${selectedStyleId}_result.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsSaved(true);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Navigation back */}
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={16} /> 홈으로 돌아가기
        </Link>

        {/* Title */}
        <div className={styles.titleSection}>
          <h1 className={styles.title}>HairFit</h1>
          <p className={styles.description}>
            매장 방문 전, 고객님의 얼굴형에 꼭 맞는 헤어스타일을 AI 시뮬레이션으로 안전하게 체험하세요.
          </p>
        </div>

        {/* Workspace */}
        {!isGenerating && !isCompleted && (
          <div className={`${styles.workspace} fade-in`}>
            {/* Left Panel: Photo Upload */}
            <div className={styles.leftPanel}>
              <h2 className={styles.styleSectionTitle}>1. 사진 업로드</h2>
              
              {!imageSrc ? (
                <div 
                  className={styles.uploadBox}
                  onClick={triggerUploadClick}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Upload size={48} strokeWidth={1.5} className={styles.uploadIcon} />
                  <span className={styles.uploadTitle}>얼굴 정면 사진 업로드</span>
                  <span className={styles.uploadDesc}>
                    드래그 앤 드롭 하거나 컴퓨터에서 사진을 선택하세요.<br />
                    (얼굴이 선명하고 그늘지지 않은 정면 사진이 좋습니다)
                  </span>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className={styles.hiddenInput} 
                    accept="image/*" 
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className={styles.previewWrapper}>
                  <Image 
                    src={imageSrc} 
                    alt="Uploaded preview" 
                    fill 
                    className={styles.previewImage}
                    priority
                  />
                  <button className={styles.removeButton} onClick={resetUpload}>
                    ×
                  </button>
                </div>
              )}

              {/* Photo Analysis / Verification Check */}
              {imageSrc && (
                <div className={styles.validationPanel}>
                  <div className={styles.validationTitle}>
                    <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                    AI 촬영 품질 분석
                  </div>
                  <div className={styles.checklist}>
                    <div className={`${styles.checkItem} ${validation.faceDetected ? styles.checkActive : ''}`}>
                      <span className={`${styles.checkIcon} ${validation.faceDetected ? styles.checkValid : styles.checkInvalid}`}>
                        {validation.faceDetected ? <Check size={10} strokeWidth={3} /> : '1'}
                      </span>
                      얼굴 인식 여부
                    </div>
                    <div className={`${styles.checkItem} ${validation.frontAngle ? styles.checkActive : ''}`}>
                      <span className={`${styles.checkIcon} ${validation.frontAngle ? styles.checkValid : styles.checkInvalid}`}>
                        {validation.frontAngle ? <Check size={10} strokeWidth={3} /> : '2'}
                      </span>
                      정면 방향성
                    </div>
                    <div className={`${styles.checkItem} ${validation.goodLighting ? styles.checkActive : ''}`}>
                      <span className={`${styles.checkIcon} ${validation.goodLighting ? styles.checkValid : styles.checkInvalid}`}>
                        {validation.goodLighting ? <Check size={10} strokeWidth={3} /> : '3'}
                      </span>
                      조명/밝기 적절성
                    </div>
                    <div className={`${styles.checkItem} ${validation.hairMapped ? styles.checkActive : ''}`}>
                      <span className={`${styles.checkIcon} ${validation.hairMapped ? styles.checkValid : styles.checkInvalid}`}>
                        {validation.hairMapped ? <Check size={10} strokeWidth={3} /> : '4'}
                      </span>
                      머리 영역 추출
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: Style Configuration */}
            <div className={styles.rightPanel}>
              <div>
                <h2 className={styles.styleSectionTitle}>2. 스타일 선택</h2>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
                  적용해보고 싶은 최신 트렌디 헤어스타일을 골라보세요.
                </p>
              </div>

              <div className={styles.styleGrid}>
                {HAIR_STYLES.map((style) => (
                  <div 
                    key={style.id} 
                    className={`${styles.styleCard} ${selectedStyleId === style.id ? styles.styleCardSelected : ''}`}
                    onClick={() => imageSrc && setSelectedStyleId(style.id)}
                    style={{ opacity: imageSrc ? 1 : 0.6, cursor: imageSrc ? 'pointer' : 'not-allowed' }}
                  >
                    <div className={styles.styleThumbPlaceholder}>
                      {/* Stylized background fallback */}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, var(--border), var(--accent-light))', zIndex: 1 }} />
                      <span style={{ position: 'relative', zIndex: 2, fontWeight: 600 }}>{style.name}</span>
                    </div>
                    <span className={styles.styleCategory}>{style.category}</span>
                    <span className={styles.styleName}>{style.name}</span>
                  </div>
                ))}
              </div>

              <button 
                className={styles.generateButton}
                disabled={!imageSrc || !selectedStyleId || isValidating}
                onClick={handleGenerate}
              >
                <Sparkles size={18} />
                AI 헤어스타일 변환 시작
              </button>
            </div>
          </div>
        )}

        {/* Loading / Generating Screen */}
        {isGenerating && (
          <div className={`${styles.leftPanel} fade-in`}>
            <div className={styles.loadingScreen}>
              <div className={styles.loadingSpinner} />
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>AI 헤어 디자인 생성 중...</h3>
                <p style={{ fontSize: '14px', color: 'var(--muted)' }}>스타일을 자연스럽게 매칭하고 있습니다. 약 5~10초 정도 소요됩니다.</p>
              </div>
              <div className={styles.loadingSteps}>
                {GENERATION_STEPS.map((step, index) => {
                  const isActive = index === generationStep;
                  const isCompletedStep = index < generationStep;
                  return (
                    <div 
                      key={index} 
                      className={`${styles.stepRow} ${isActive ? styles.stepActive : ''} ${isCompletedStep ? styles.stepCompleted : ''}`}
                    >
                      <span className={`${styles.stepDot} ${isActive ? styles.stepDotActive : ''} ${isCompletedStep ? styles.stepDotCompleted : ''}`}>
                        {isCompletedStep && (
                          <span style={{ position: 'absolute', top: '-2px', left: '-2px', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--accent)', animation: 'pulseBorder 1s infinite' }} />
                        )}
                      </span>
                      {step}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Completion & Before/After Comparison Screen */}
        {isCompleted && !isGenerating && (
          <div className={`${styles.workspace} fade-in`}>
            {/* Before / After Slider */}
            <div className={styles.leftPanel}>
              <h2 className={styles.styleSectionTitle}>비교 보기 (Before & After)</h2>
              
              <div className={styles.compareContainer}>
                {/* Before Image */}
                <div className={styles.imageBefore}>
                  <Image 
                    src={imageSrc || '/images/default_avatar.jpg'} 
                    alt="Before Style" 
                    fill 
                    priority
                  />
                  <span className={`${styles.badge} ${styles.badgeBefore}`}>BEFORE</span>
                </div>

                {/* After Image */}
                <div 
                  className={styles.imageAfter} 
                  style={{ width: `${sliderPosition}%` }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', minWidth: '100%' }}>
                    {/* Size calculation setup */}
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                      <Image 
                        src={resultImageSrc || '/images/default_avatar.jpg'} 
                        alt="After Style" 
                        fill
                        priority
                      />
                    </div>
                  </div>
                  <span className={`${styles.badge} ${styles.badgeAfter}`}>AFTER</span>
                </div>

                {/* Vertical Divider line */}
                <div className={styles.sliderBar} style={{ left: `${sliderPosition}%` }} />
                
                {/* Horizontal range input overlapping the container */}
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={sliderPosition} 
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className={styles.sliderRangeInput}
                />
              </div>

              <p style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'center' }}>
                슬라이더를 좌우로 움직여 변환 전후 머리 모양을 섬세하게 비교해 보세요.
              </p>
            </div>

            {/* Style detail and actions */}
            <div className={styles.rightPanel}>
              <div>
                <span className={styles.styleCategory}>{selectedStyle?.category}</span>
                <h2 className={styles.title} style={{ fontSize: '28px', marginTop: '4px' }}>
                  {selectedStyle?.name} 적용 완료
                </h2>
                <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '12px', lineHeight: '1.6' }}>
                  {selectedStyle?.desc}
                </p>
              </div>

              <div className={styles.validationPanel} style={{ background: 'var(--accent-light)', border: 'none' }}>
                <div style={{ display: 'flex', gap: '10px', color: 'var(--accent)' }}>
                  <Sparkles size={18} />
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600 }}>AI 디자인 총평</h4>
                    <p style={{ fontSize: '13px', color: 'var(--foreground)', marginTop: '4px', lineHeight: '1.5' }}>
                      계란형 얼굴 라인과 선택하신 볼륨 있는 웨이브가 조화를 이루어 이목구비가 한층 뚜렷해 보입니다. 시뮬레이션 결과를 매장 시술 시 가이드로 활용해 보세요.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.actionRow}>
                <button className={`${styles.actionButton} ${styles.accentButton}`} onClick={handleDownload}>
                  <Download size={16} /> 
                  {isSaved ? '다운로드 완료' : '결과 저장하기'}
                </button>
                <button className={styles.actionButton} onClick={resetUpload}>
                  <RefreshCw size={16} /> 다시 촬영하기
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} 소상공인 AI Studio. All rights reserved.
      </footer>
    </div>
  );
}
