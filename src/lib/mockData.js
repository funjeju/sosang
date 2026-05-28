import { db, auth, isFirebaseEnabled } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export const AI_TOOLS = [
  {
    id: 'hairfit',
    name: 'HairFit',
    description: '고객 맞춤 헤어스타일 AI 시뮬레이션 및 분석',
    thumbnail: '/images/tools/hairfit.jpg',
    category: 'beauty',
    tags: ['인기', '미용실', '헤어샵'],
    isReady: true,
    detailUrl: '/hairfit',
  },
  {
    id: 'review-ai',
    name: '리뷰 답변 AI',
    description: '감성적인 고객 맞춤형 리뷰 답변 자동 생성',
    thumbnail: '/images/tools/review.jpg',
    category: 'general',
    tags: ['추천', '카페', '식당'],
    isReady: false,
    detailUrl: '#',
  },
  {
    id: 'sns-promo',
    name: 'SNS 홍보 생성기',
    description: '인스타그램 피드 및 홍보 문구 자동 제작',
    thumbnail: '/images/tools/sns.jpg',
    category: 'marketing',
    tags: ['마케팅', '인스타'],
    isReady: false,
    detailUrl: '#',
  },
  {
    id: 'menu-maker',
    name: '메뉴판 생성기',
    description: '클릭 몇 번으로 완성되는 감성적인 메뉴판 디자인',
    thumbnail: '/images/tools/menu.jpg',
    category: 'design',
    tags: ['식음료', '디자인'],
    isReady: false,
    detailUrl: '#',
  }
];

export const RECOMMENDATIONS = {
  beauty: {
    title: '미용/뷰티 사장님을 위한 추천',
    toolIds: ['hairfit', 'review-ai'],
  },
  cafe: {
    title: '카페/식음료 사장님을 위한 추천',
    toolIds: ['menu-maker', 'sns-promo', 'review-ai'],
  }
};

export const HAIR_STYLES = [
  {
    id: 'style_wave_perm',
    name: '네추럴 웨이브 펌',
    category: '여성 웨이브',
    thumbnail: '/images/styles/wave_perm_thumb.jpg',
    resultImage: '/images/styles/wave_perm_result.jpg',
    desc: '부드러운 에스컬과 풍성한 볼륨감의 고급스러운 스타일',
  },
  {
    id: 'style_short_cut',
    name: '시크 리프 숏컷',
    category: '여성 숏컷',
    thumbnail: '/images/styles/short_cut_thumb.jpg',
    resultImage: '/images/styles/short_cut_result.jpg',
    desc: '귀 뒤로 넘겨 연출하는 차분하고 세련된 느낌의 숏컷',
  },
  {
    id: 'style_bob_cut',
    name: '테슬 숏 단발',
    category: '여성 단발',
    thumbnail: '/images/styles/bob_cut_thumb.jpg',
    resultImage: '/images/styles/bob_cut_result.jpg',
    desc: '일자 느낌으로 떨어지며 시크하고 도도한 무드의 단발컷',
  },
  {
    id: 'style_leaf_cut',
    name: '내추럴 리프컷',
    category: '남성 스타일',
    thumbnail: '/images/styles/leaf_cut_thumb.jpg',
    resultImage: '/images/styles/leaf_cut_result.jpg',
    desc: '가르마 라인을 타고 자연스럽게 흘러내리는 감성적인 리프컷',
  }
];

// LocalStorage Fallback Helper
const getLocalHistory = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('sosang_history');
  return stored ? JSON.parse(stored) : [];
};

const saveLocalHistory = (entry) => {
  if (typeof window === 'undefined') return;
  const history = getLocalHistory();
  const newHistory = [entry, ...history].slice(0, 10);
  localStorage.setItem('sosang_history', JSON.stringify(newHistory));
};

// Database Methods
export const saveGenerationResult = async (styleId, inputImage, outputImage) => {
  const newEntry = {
    userId: auth?.currentUser?.uid || 'guest_user',
    toolId: 'hairfit',
    styleId,
    inputImage,
    outputImage,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseEnabled && db) {
    try {
      const docRef = await addDoc(collection(db, 'generations'), newEntry);
      console.log('Document written to Firebase Firestore with ID: ', docRef.id);
      return docRef.id;
    } catch (e) {
      console.error('Error adding document to Firestore: ', e);
      saveLocalHistory(newEntry);
      return 'local_fallback';
    }
  } else {
    saveLocalHistory(newEntry);
    return 'local_fallback';
  }
};

export const getHistory = async () => {
  if (isFirebaseEnabled && db) {
    try {
      const q = query(
        collection(db, 'generations'),
        where('userId', '==', auth?.currentUser?.uid || 'guest_user'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    } catch (e) {
      console.error('Error fetching from Firestore, falling back to LocalStorage: ', e);
      return getLocalHistory();
    }
  } else {
    return getLocalHistory();
  }
};
