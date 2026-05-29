import { db, auth, isFirebaseEnabled } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

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
  // --- 여성용 헤어스타일 (8개) ---
  {
    id: 'style_wave_perm',
    gender: 'women',
    name: '네추럴 웨이브 펌',
    category: '여성 웨이브',
    thumbnail: '/images/styles/wave_perm_thumb.jpg',
    resultImage: '/images/styles/wave_perm_result.jpg',
    desc: '부드러운 에스컬과 풍성한 볼륨감의 고급스러운 스타일',
    promptEng: 'long voluptuous wave perm hairstyle, soft S-curls cascading down the shoulders, side-swept elegant bangs, high volume'
  },
  {
    id: 'style_short_cut',
    gender: 'women',
    name: '시크 리프 숏컷',
    category: '여성 숏컷',
    thumbnail: '/images/styles/short_cut_thumb.jpg',
    resultImage: '/images/styles/short_cut_result.jpg',
    desc: '귀 뒤로 넘겨 연출하는 차분하고 세련된 느낌의 숏컷',
    promptEng: 'chic leaf cut short hair style, wispy bangs, soft layered sides tucked neatly behind the ears, clean back taper'
  },
  {
    id: 'style_bob_cut',
    gender: 'women',
    name: '테슬 숏 단발',
    category: '여성 단발',
    thumbnail: '/images/styles/bob_cut_thumb.jpg',
    resultImage: '/images/styles/bob_cut_result.jpg',
    desc: '일자 느낌으로 떨어지며 시크하고 도도한 무드의 단발컷',
    promptEng: 'blunt tassel bob cut, straight sleek dark bob hairstyle reaching the jawline, modern sharp edges, no bangs'
  },
  {
    id: 'style_layered_c',
    gender: 'women',
    name: '레이어드 C컬 펌',
    category: '여성 레이어드',
    thumbnail: '/images/styles/wave_perm_thumb.jpg',
    resultImage: '/images/styles/wave_perm_result.jpg',
    desc: '자연스러운 층을 내어 끝부분에 C컬을 살린 트렌디한 디자인',
    promptEng: 'layered hair with soft C-curl perm at the ends, clean long layers, gentle side bangs, voluminous styling'
  },
  {
    id: 'style_hush_cut',
    gender: 'women',
    name: '세련된 허쉬 컷',
    category: '여성 레이어드',
    thumbnail: '/images/styles/short_cut_thumb.jpg',
    resultImage: '/images/styles/short_cut_result.jpg',
    desc: '가볍고 불규칙한 질감으로 세련되고 유니크한 분위기를 내는 스타일',
    promptEng: 'shaggy hush cut, textured layers with wispy ends, medium length, airy messy curtain bangs, lightweight finish'
  },
  {
    id: 'style_sleek_long',
    gender: 'women',
    name: '슬릭 롱 스트레이트',
    category: '여성 생머리',
    thumbnail: '/images/styles/wave_perm_thumb.jpg',
    resultImage: '/images/styles/wave_perm_result.jpg',
    desc: '깔끔하게 떨어지는 긴 생머리로 도시적이고 맑은 이미지를 연출',
    promptEng: 'sleek long straight hair, glossy smooth black hair cascading straight down past shoulders, middle part, minimal texture'
  },
  {
    id: 'style_hippie_perm',
    gender: 'women',
    name: '젤리 히피 펌',
    category: '여성 웨이브',
    thumbnail: '/images/styles/wave_perm_thumb.jpg',
    resultImage: '/images/styles/wave_perm_result.jpg',
    desc: '뿌리부터 촘촘하게 들어간 컬로 발랄하고 자유분방한 개성을 표출',
    promptEng: 'curly hippie perm hairstyle, small tight springy curls from root to tip, voluminous messy curly hair with curly bangs'
  },
  {
    id: 'style_pixie_cut',
    gender: 'women',
    name: '에지 픽시 컷',
    category: '여성 숏컷',
    thumbnail: '/images/styles/short_cut_thumb.jpg',
    resultImage: '/images/styles/short_cut_result.jpg',
    desc: '보이시하면서도 이목구비를 시원하게 살려주는 스타일리시한 초단발',
    promptEng: 'edgy short pixie cut, cropped sides and back, textured styling on top, short wispy bangs, boyish yet elegant style'
  },
  
  // --- 남성용 헤어스타일 (8개) ---
  {
    id: 'style_leaf_cut',
    gender: 'men',
    name: '내추럴 리프컷',
    category: '남성 스타일',
    thumbnail: '/images/styles/sample_leaf_cut.png',
    resultImage: '/images/styles/sample_leaf_cut.png',
    desc: '가르마 라인을 타고 자연스럽게 흘러내리는 감성적인 리프컷',
    promptEng: 'natural leaf cut hairstyle, long soft textured hair parted in the middle falling gently around the eyes, clean sides and neck taper'
  },
  {
    id: 'style_dandy_cut',
    gender: 'men',
    name: '소프트 댄디 컷',
    category: '남성 스타일',
    thumbnail: '/images/styles/sample_as_perm.png',
    resultImage: '/images/styles/sample_as_perm.png',
    desc: '차분하게 내려오는 앞머리로 깔끔하고 부드러운 호감형 인상을 주는 스타일',
    promptEng: 'soft dandy cut hairstyle, neat straight bangs covering the forehead, clean sideburns and tapered back, gentle casual look'
  },
  {
    id: 'style_two_block',
    gender: 'men',
    name: '클래식 투블럭 컷',
    category: '남성 스타일',
    thumbnail: '/images/styles/sample_shadow_perm.png',
    resultImage: '/images/styles/sample_shadow_perm.png',
    desc: '옆머리를 깔끔하게 정리하고 윗머리에 볼륨을 주어 세련된 기본 스타일',
    promptEng: 'classic two-block haircut, shaved sides and back, textured voluminous longer top hair styled neatly'
  },
  {
    id: 'style_shadow_perm',
    gender: 'men',
    name: '텍스처 쉐도우 펌',
    category: '남성 스타일',
    thumbnail: '/images/styles/sample_shadow_perm.png',
    resultImage: '/images/styles/sample_shadow_perm.png',
    desc: '그림자 같은 자연스러운 웨이브와 볼륨감으로 캐주얼하고 영한 느낌의 펌',
    promptEng: 'textured shadow perm hairstyle, soft messy wavy curls on top with natural volume, clean short sides and back'
  },
  {
    id: 'style_regent_cut',
    gender: 'men',
    name: '클래식 리젠트 컷',
    category: '남성 스타일',
    thumbnail: '/images/styles/sample_ivy_league.png',
    resultImage: '/images/styles/sample_ivy_league.png',
    desc: '앞머리를 세워 이마를 드러내어 깔끔하고 신뢰감 높은 이미지를 보여주는 스타일',
    promptEng: 'classic regent haircut, front hair styled up and backward exposing the forehead, clean short sides and back, professional look'
  },
  {
    id: 'style_as_perm',
    gender: 'men',
    name: '내추럴 애즈 펌',
    category: '남성 스타일',
    thumbnail: '/images/styles/sample_as_perm.png',
    resultImage: '/images/styles/sample_as_perm.png',
    desc: '이마가 살짝 보이는 자연스러운 가르마 펌으로 부드럽고 훈훈한 스타일',
    promptEng: 'natural as-perm hairstyle, soft curtain perm with a slight forehead reveal in the middle, gentle natural waves'
  },
  {
    id: 'style_wolf_cut',
    gender: 'men',
    name: '쉬크 울프 컷',
    category: '남성 스타일',
    thumbnail: '/images/styles/sample_wolf_cut.png',
    resultImage: '/images/styles/sample_wolf_cut.png',
    desc: '뒷머리를 트렌디하게 기르고 질감을 가볍게 쳐낸 개성 있고 반항적인 무드',
    promptEng: 'chic wolf cut hairstyle, textured layers, short messy top and sides with longer mullet tail hair in the back'
  },
  {
    id: 'style_ivy_league',
    gender: 'men',
    name: '아이비리그 컷',
    category: '남성 스타일',
    thumbnail: '/images/styles/sample_ivy_league.png',
    resultImage: '/images/styles/sample_ivy_league.png',
    desc: '짧게 올린 앞머리와 스포티한 텍스처로 남성미와 청량감을 살린 스타일',
    promptEng: 'ivy league haircut, very short cropped sides and back, front hair styled upward with a slight textured lift'
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

// DB에서 헤어스타일 가져오기 및 초기 시딩(Seeding)
export const getStylesFromDB = async () => {
  // LocalStorage Fallback Helper
  const getLocalStyles = () => {
    if (typeof window === 'undefined') return HAIR_STYLES; // fallback to static array on SSR
    const stored = localStorage.getItem('hairfit_styles');
    if (!stored) {
      localStorage.setItem('hairfit_styles', JSON.stringify(HAIR_STYLES));
      return HAIR_STYLES;
    }
    return JSON.parse(stored);
  };

  if (isFirebaseEnabled && db) {
    try {
      const q = query(collection(db, 'hairstyles'));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      if (list.length === 0) {
        console.log("Firebase Firestore 'hairstyles' collection is empty. Seeding initial 16 styles...");
        // Seed initial data
        const seedPromises = HAIR_STYLES.map(async (style) => {
          const { id, ...dataWithoutId } = style;
          // Use style.id as document id to keep reference
          await setDoc(doc(db, 'hairstyles', id), dataWithoutId);
          return { id, ...dataWithoutId };
        });
        const seededList = await Promise.all(seedPromises);
        return seededList;
      }
      return list;
    } catch (e) {
      console.error('Error fetching hairstyles from Firestore, falling back to LocalStorage: ', e);
      return getLocalStyles();
    }
  } else {
    return getLocalStyles();
  }
};

// 신규 스타일 추가
export const addStyleToDB = async (styleData) => {
  const newId = 'style_' + Date.now();
  const newStyle = {
    ...styleData,
    createdAt: new Date().toISOString()
  };

  if (isFirebaseEnabled && db) {
    try {
      await setDoc(doc(db, 'hairstyles', newId), newStyle);
      return { id: newId, ...newStyle };
    } catch (e) {
      console.error('Error adding style to Firestore, saving to LocalStorage fallback: ', e);
    }
  }

  // LocalStorage Fallback
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('hairfit_styles');
    const list = stored ? JSON.parse(stored) : [...HAIR_STYLES];
    const createdStyle = { id: newId, ...newStyle };
    localStorage.setItem('hairfit_styles', JSON.stringify([createdStyle, ...list]));
    return createdStyle;
  }
  return { id: newId, ...newStyle };
};

// 기존 스타일 수정
export const updateStyleInDB = async (id, styleData) => {
  const updatedStyle = {
    ...styleData,
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseEnabled && db) {
    try {
      await updateDoc(doc(db, 'hairstyles', id), updatedStyle);
      return { id, ...updatedStyle };
    } catch (e) {
      console.error('Error updating style in Firestore, falling back to LocalStorage: ', e);
    }
  }

  // LocalStorage Fallback
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('hairfit_styles');
    let list = stored ? JSON.parse(stored) : [...HAIR_STYLES];
    list = list.map(item => item.id === id ? { ...item, ...updatedStyle } : item);
    localStorage.setItem('hairfit_styles', JSON.stringify(list));
    return { id, ...updatedStyle };
  }
  return { id, ...updatedStyle };
};

// 스타일 삭제
export const deleteStyleFromDB = async (id) => {
  if (isFirebaseEnabled && db) {
    try {
      await deleteDoc(doc(db, 'hairstyles', id));
      return id;
    } catch (e) {
      console.error('Error deleting style from Firestore, falling back to LocalStorage: ', e);
    }
  }

  // LocalStorage Fallback
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('hairfit_styles');
    let list = stored ? JSON.parse(stored) : [...HAIR_STYLES];
    list = list.filter(item => item.id !== id);
    localStorage.setItem('hairfit_styles', JSON.stringify(list));
    return id;
  }
  return id;
};
