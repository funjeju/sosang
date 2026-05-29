'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { getStylesFromDB, addStyleToDB, updateStyleInDB, deleteStyleFromDB } from '../../../lib/mockData';
import { ArrowLeft, Plus, Edit2, Trash2, Upload, X, Check, AlertTriangle, Sparkles } from 'lucide-react';

const INITIAL_FORM_STATE = {
  name: '',
  category: '',
  gender: 'women',
  desc: '',
  promptEng: '',
  thumbnail: ''
};

export default function HairfitAdmin() {
  const [hairStyles, setHairStyles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [genderTab, setGenderTab] = useState('women');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentEditId, setCurrentEditId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);

  // Load data from DB
  const loadStyles = async () => {
    setIsLoading(true);
    try {
      const data = await getStylesFromDB();
      setHairStyles(data);
    } catch (err) {
      console.error("Failed to fetch hairstyles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStyles();
  }, []);

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Image Upload and 1:1 Square Compression logic
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 선택해 주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Target 1:1 aspect ratio square of 400x400 for high quality & small payload
        const targetSize = 400;
        canvas.width = targetSize;
        canvas.height = targetSize;

        // Crop to center square
        const minSize = Math.min(img.width, img.height);
        const sx = (img.width - minSize) / 2;
        const sy = (img.height - minSize) / 2;

        ctx.drawImage(img, sx, sy, minSize, minSize, 0, 0, targetSize, targetSize);

        // Convert to high-compression JPEG Base64 Data URI
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        setFormData(prev => ({ ...prev, thumbnail: base64 }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeUploadedImage = () => {
    setFormData(prev => ({ ...prev, thumbnail: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open Modal for Adding
  const openAddModal = () => {
    setModalMode('add');
    setFormData(INITIAL_FORM_STATE);
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Modal for Editing
  const openEditModal = (style) => {
    setModalMode('edit');
    setCurrentEditId(style.id);
    setFormData({
      name: style.name || '',
      category: style.category || '',
      gender: style.gender || 'women',
      desc: style.desc || '',
      promptEng: style.promptEng || '',
      thumbnail: style.thumbnail || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(INITIAL_FORM_STATE);
    setFormError('');
  };

  // Handle Save
  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    const { name, category, desc, promptEng, thumbnail } = formData;
    if (!name.trim() || !category.trim() || !desc.trim() || !promptEng.trim()) {
      setFormError('모든 필드(이미지 제외)를 올바르게 작성해 주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        // If no image uploaded, default mock wave perm image as fallback
        thumbnail: thumbnail || '/images/styles/wave_perm_thumb.jpg',
        resultImage: thumbnail || '/images/styles/wave_perm_thumb.jpg'
      };

      if (modalMode === 'add') {
        const added = await addStyleToDB(dataToSave);
        setHairStyles(prev => [added, ...prev]);
      } else {
        const updated = await updateStyleInDB(currentEditId, dataToSave);
        setHairStyles(prev => prev.map(s => s.id === currentEditId ? updated : s));
      }
      closeModal();
    } catch (err) {
      console.error("Save error:", err);
      setFormError('저장하는 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id, name) => {
    if (window.confirm(`정말로 "${name}" 스타일을 삭제하시겠습니까?`)) {
      try {
        await deleteStyleFromDB(id);
        setHairStyles(prev => prev.filter(s => s.id !== id));
      } catch (err) {
        console.error("Delete error:", err);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // Filter styles by active gender tab
  const filteredStyles = hairStyles.filter(s => s.gender === genderTab);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Hub back nav */}
        <Link href="/admin" className={styles.backLink}>
          <ArrowLeft size={16} /> 관리자 홈으로 돌아가기
        </Link>

        {/* Header section */}
        <div className={styles.headerRow}>
          <div className={styles.titleSection}>
            <span className={styles.toolPath}>AI STUDIO / HAIRFIT ADMIN</span>
            <h1 className={styles.title}>HairFit 스타일 데이터 기획</h1>
            <p className={styles.description}>
              Gemini AI 가상 체험에 제공되는 여성 및 남성 헤어스타일 마스터 데이터를 실시간으로 등록하고 변경합니다.
            </p>
          </div>

          <button className={styles.addButton} onClick={openAddModal}>
            <Plus size={16} /> 새 스타일 추가
          </button>
        </div>

        {/* Gender Tabs */}
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tabButton} ${genderTab === 'women' ? styles.tabButtonActive : ''}`}
            onClick={() => setGenderTab('women')}
          >
            여성 헤어스타일 ({hairStyles.filter(s => s.gender === 'women').length})
          </button>
          <button 
            className={`${styles.tabButton} ${genderTab === 'men' ? styles.tabButtonActive : ''}`}
            onClick={() => setGenderTab('men')}
          >
            남성 헤어스타일 ({hairStyles.filter(s => s.gender === 'men').length})
          </button>
        </div>

        {/* Styles Grid View */}
        {isLoading ? (
          <div className={styles.loadingArea}>
            <div className={styles.spinner} />
            <p>스타일 데이터베이스를 스캔하는 중...</p>
          </div>
        ) : filteredStyles.length === 0 ? (
          <div className={styles.emptyArea}>
            <AlertTriangle size={36} className={styles.emptyIcon} />
            <h3>등록된 스타일이 없습니다</h3>
            <p>우측 상단의 "새 스타일 추가" 버튼을 눌러 첫 번째 디자인 데이터를 생성해 보세요.</p>
          </div>
        ) : (
          <div className={styles.stylesGrid}>
            {filteredStyles.map((style) => (
              <div key={style.id} className={styles.styleCard}>
                <div className={styles.imageSection}>
                  <Image 
                    src={style.thumbnail || '/images/styles/wave_perm_thumb.jpg'} 
                    alt={style.name} 
                    fill
                    sizes="200px"
                    style={{ objectFit: 'cover' }}
                  />
                  <div className={styles.cardOverlay}>
                    <button className={styles.cardActionBtn} onClick={() => openEditModal(style)} title="수정">
                      <Edit2 size={14} />
                    </button>
                    <button className={`${styles.cardActionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(style.id, style.name)} title="삭제">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className={styles.cardDetails}>
                  <div className={styles.categoryBadge}>{style.category}</div>
                  <h4 className={styles.cardName}>{style.name}</h4>
                  <p className={styles.cardDesc}>{style.desc}</p>
                  <div className={styles.promptBox}>
                    <strong>AI Prompt:</strong>
                    <code>{style.promptEng}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>{modalMode === 'add' ? '새 헤어스타일 추가' : '헤어스타일 정보 수정'}</h3>
                <button className={styles.closeBtn} onClick={closeModal}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className={styles.modalForm}>
                {formError && <div className={styles.errorMessage}>{formError}</div>}

                {/* Form fields */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>성별 구분</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}>
                      <option value="women">여성용 (Women)</option>
                      <option value="men">남성용 (Men)</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>스타일 이름</label>
                    <input 
                      type="text" 
                      name="name" 
                      placeholder="예: 텍스처 쉐도우 펌" 
                      value={formData.name} 
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>세부 카테고리</label>
                  <input 
                    type="text" 
                    name="category" 
                    placeholder="예: 남성 펌 / 여성 단발" 
                    value={formData.category} 
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>스타일 설명 (한글)</label>
                  <textarea 
                    name="desc" 
                    rows={2}
                    placeholder="고객에게 보여줄 자연스럽고 상세한 스타일 묘사를 작성하세요."
                    value={formData.desc}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>
                    AI 생성용 상세 영어 묘사 프롬프트
                    <span className={styles.infoLabel}>
                      (인물 얼굴은 유지하며 머리 모양을 완전히 변경하도록 구체적으로 묘사하세요)
                    </span>
                  </label>
                  <textarea 
                    name="promptEng" 
                    rows={3}
                    placeholder="예: textured shadow perm hairstyle, soft messy wavy curls on top with natural volume, clean short sides"
                    value={formData.promptEng}
                    onChange={handleChange}
                  />
                </div>

                {/* Image upload area */}
                <div className={styles.formGroup}>
                  <label>스타일 대표 이미지 (정사각형 비율로 크롭 및 압축 저장됨)</label>
                  
                  {!formData.thumbnail ? (
                    <div className={styles.imageUploadPlaceholder} onClick={triggerFileInput}>
                      <Upload size={24} className={styles.uploadIcon} />
                      <span>이미지 파일 찾기</span>
                      <small>정면 헤어가 잘 표현된 예시 모델 사진을 권장합니다</small>
                    </div>
                  ) : (
                    <div className={styles.imagePreviewWrapper}>
                      <div className={styles.previewContainer}>
                        <Image 
                          src={formData.thumbnail} 
                          alt="Upload Preview" 
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <button type="button" className={styles.imageRemoveBtn} onClick={removeUploadedImage}>
                        <X size={12} /> 이미지 변경
                      </button>
                    </div>
                  )}
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={closeModal} disabled={isSaving}>
                    취소
                  </button>
                  <button type="submit" className={styles.submitBtn} disabled={isSaving}>
                    {isSaving ? '저장 중...' : <><Check size={16} /> 저장하기</>}
                  </button>
                </div>
              </form>
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
