//* src/store/content.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 콘텐츠 관리 스토어
 * 마케팅 콘텐츠 CRUD 및 상태 관리
 */
export const useContentStore = defineStore('content', () => {
  // State
  const contents = ref([])
  const currentContent = ref(null)
  const isLoading = ref(false)
  const isGenerating = ref(false)
  const filters = ref({
    type: 'all',
    platform: 'all',
    status: 'all',
    dateRange: 'all',
  })

  // 풍부한 더미 데이터
  const sampleContents = [
    {
      id: 1,
      title: '🌶️ 떡볶이 신메뉴 출시 이벤트',
      type: 'sns',
      platform: 'INSTAGRAM',
      content: '🌶️ 떡볶이 신메뉴 출시! 치즈가 듬뿍 들어간 치즈떡볶이가 새로 나왔어요! 매콤한 떡볶이와 고소한 치즈의 완벽한 조화✨\n\n#떡볶이 #신메뉴 #치즈떡볶이 #맛집 #분식 #매콤달콤',
      hashtags: ['떡볶이', '신메뉴', '치즈떡볶이', '맛집', '분식', '매콤달콤'],
      images: ['/images/menu-placeholder.png'],
      status: 'PUBLISHED',
      views: 1240,
      likes: 85,
      comments: 12,
      createdAt: '2024-01-15T10:30:00',
      publishedAt: '2024-01-15T14:00:00',
    },
    {
      id: 2,
      title: '📸 우리 매장 소개 포스터',
      type: 'poster',
      platform: 'POSTER',
      content: '따뜻한 분위기의 우리 매장을 소개합니다. 정성스럽게 만든 음식으로 여러분을 맞이하겠습니다.',
      hashtags: ['매장소개', '분식집', '맛집', '정성'],
      images: ['/images/store-placeholder.png'],
      status: 'DRAFT',
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: '2024-01-14T16:20:00',
      publishedAt: null,
    },
    {
      id: 3,
      title: '🎉 특별 할인 이벤트 안내',
      type: 'sns',
      platform: 'INSTAGRAM',
      content: '🎉 오늘 하루만 특별 할인! 모든 메뉴 20% 할인 이벤트 진행중🔥\n\n놓치면 후회할 기회! 지금 바로 방문하세요!\n\n⏰ 할인 시간: 오후 6시까지\n📍 위치: 서울 강남구 테헤란로 123',
      hashtags: ['할인', '이벤트', '특가', '분식', '강남맛집'],
      images: ['/images/event-poster.png'],
      status: 'PUBLISHED',
      views: 892,
      likes: 45,
      comments: 8,
      createdAt: '2024-01-13T09:15:00',
      publishedAt: '2024-01-13T12:00:00',
    },
    {
      id: 4,
      title: '🍜 김치찌개 맛집 블로그 포스팅',
      type: 'blog',
      platform: 'NAVER_BLOG',
      content: '추운 겨울, 몸을 따뜻하게 해줄 김치찌개 한 그릇은 어떠세요? 우리 매장의 시그니처 메뉴인 김치찌개를 소개합니다.\n\n✅ 3년 묵은 김치 사용\n✅ 국내산 돼지고기\n✅ 진한 국물맛\n✅ 푸짐한 양\n\n한 번 맛보시면 계속 생각나는 그런 맛입니다!',
      hashtags: ['김치찌개', '맛집', '추천메뉴', '겨울음식', '따뜻한국물'],
      images: ['/images/kimchi-jjigae.jpg'],
      status: 'PUBLISHED',
      views: 2156,
      likes: 123,
      comments: 15,
      createdAt: '2024-01-12T14:45:00',
      publishedAt: '2024-01-12T16:00:00',
    },
    {
      id: 5,
      title: '🥢 순대국밥 홍보 포스터',
      type: 'poster',
      platform: 'POSTER',
      content: '진짜 맛있는 순대국밥! 24시간 끓인 진한 국물과 신선한 순대로 만든 특별한 한 그릇',
      hashtags: ['순대국밥', '24시간', '진한국물', '신선한순대'],
      images: ['/images/sundae-soup.jpg'],
      status: 'PUBLISHED',
      views: 567,
      likes: 34,
      comments: 3,
      createdAt: '2024-01-11T11:20:00',
      publishedAt: '2024-01-11T15:30:00',
    },
    {
      id: 6,
      title: '🌈 컬러풀 떡볶이 인스타 스토리',
      type: 'sns',
      platform: 'INSTAGRAM',
      content: '무지개 떡볶이 만들어봤어요! 🌈 천연 색소로 만든 건강한 컬러 떡볶이✨ 맛도 색깔만큼 다양해요!\n\n빨강: 매운맛 🔥\n노랑: 치즈맛 🧀\n초록: 깻잎맛 🌿\n보라: 자색고구마맛 🍠',
      hashtags: ['컬러떡볶이', '무지개떡볶이', '천연색소', '건강한간식', '예쁜음식'],
      images: ['/images/colorful-tteokbokki.jpg'],
      status: 'DRAFT',
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: '2024-01-10T13:30:00',
      publishedAt: null,
    },
    {
      id: 7,
      title: '🍖 불고기 김밥 신메뉴 소개',
      type: 'blog',
      platform: 'NAVER_BLOG',
      content: '달콤짭짤한 불고기와 신선한 채소가 들어간 불고기 김밥이 새로 출시되었습니다!\n\n🥩 국내산 소고기 불고기\n🥬 신선한 상추와 당근\n🍚 고슬고슬한 밥\n🥒 아삭한 단무지\n\n한 입 베어물면 입 안 가득 퍼지는 불고기의 달콤함과 채소의 아삭함이 조화롭게 어우러집니다.',
      hashtags: ['불고기김밥', '신메뉴', '국내산소고기', '신선한채소', '달콤짭짤'],
      images: ['/images/bulgogi-kimbap.jpg'],
      status: 'PUBLISHED',
      views: 1834,
      likes: 76,
      comments: 9,
      createdAt: '2024-01-09T16:15:00',
      publishedAt: '2024-01-09T18:00:00',
    },
    {
      id: 8,
      title: '🎊 개업 1주년 기념 이벤트',
      type: 'poster',
      platform: 'POSTER',
      content: '감사합니다! 개업 1주년을 맞아 특별 이벤트를 준비했습니다. 고객님들의 사랑에 보답하는 마음으로!',
      hashtags: ['1주년', '감사이벤트', '특별할인', '기념일'],
      images: ['/images/anniversary-event.jpg'],
      status: 'DRAFT',
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: '2024-01-08T10:00:00',
      publishedAt: null,
    },
    {
      id: 9,
      title: '🍲 라면 끓이기 꿀팁 공유',
      type: 'sns',
      platform: 'NAVER_BLOG',
      content: '집에서도 맛있는 라면 끓이는 법! 우리 매장 셰프가 알려주는 특별한 비법을 공개합니다.\n\n1️⃣ 물이 끓기 시작할 때 면 투입\n2️⃣ 스프는 면이 익은 후 넣기\n3️⃣ 계란은 마지막 1분에 추가\n4️⃣ 파는 불을 끄기 직전에!\n\n이 방법으로 끓이면 훨씬 더 맛있어요! 한번 시도해보세요 😊',
      hashtags: ['라면끓이기', '꿀팁', '요리비법', '맛있는라면', '셰프추천'],
      images: ['/images/ramen-cooking.jpg'],
      status: 'PUBLISHED',
      views: 3245,
      likes: 189,
      comments: 27,
      createdAt: '2024-01-07T12:30:00',
      publishedAt: '2024-01-07T14:00:00',
    },
    {
      id: 10,
      title: '🥟 수제 만두 제작 과정',
      type: 'sns',
      platform: 'INSTAGRAM',
      content: '손으로 직접 빚는 우리 매장의 수제 만두! 👐\n\n매일 아침 일찍 와서 정성스럽게 만듭니다 🥟\n신선한 재료만 사용해요!\n\n📹 만두 빚는 과정 영상도 준비했어요\n👀 스토리에서 확인하세요!',
      hashtags: ['수제만두', '정성', '신선한재료', '매일제작', '장인정신'],
      images: ['/images/handmade-mandu.jpg'],
      status: 'PUBLISHED',
      views: 987,
      likes: 67,
      comments: 5,
      createdAt: '2024-01-06T08:45:00',
      publishedAt: '2024-01-06T10:00:00',
    },
    {
      id: 11,
      title: '❄️ 겨울 한정 메뉴 출시',
      type: 'poster',
      platform: 'POSTER',
      content: '추운 겨울을 따뜻하게! 겨울 한정 메뉴들이 출시되었습니다. 몸과 마음을 따뜻하게 해드릴게요.',
      hashtags: ['겨울한정', '따뜻한음식', '한정메뉴', '계절메뉴'],
      images: ['/images/winter-menu.jpg'],
      status: 'DRAFT',
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: '2024-01-05T15:20:00',
      publishedAt: null,
    },
    {
      id: 12,
      title: '🍜 우동 맛집 후기 모음',
      type: 'blog',
      platform: 'NAVER_BLOG',
      content: '고객님들이 남겨주신 우동 후기를 모아봤습니다! 정말 감사한 마음입니다 💕\n\n"국물이 정말 진해요!"\n"면발이 쫄깃쫄깃해서 좋아요"\n"야채가 신선하고 양도 많아요"\n"사장님이 친절하세요"\n\n앞으로도 더 맛있는 우동으로 보답하겠습니다!',
      hashtags: ['우동', '고객후기', '진한국물', '쫄깃한면', '신선한야채'],
      images: ['/images/udon-reviews.jpg'],
      status: 'PUBLISHED',
      views: 1456,
      likes: 89,
      comments: 12,
      createdAt: '2024-01-04T14:10:00',
      publishedAt: '2024-01-04T16:30:00',
    },
    {
      id: 13,
      title: '🎯 주말 특가 이벤트',
      type: 'sns',
      platform: 'INSTAGRAM',
      content: '주말 특가 이벤트! 🎯\n\n토요일, 일요일 이틀간만!\n모든 음료 50% 할인! 🥤\n\n✅ 콜라, 사이다\n✅ 주스류\n✅ 전통차\n✅ 커피\n\n주말에 가족, 친구들과 함께 오세요! 👨‍👩‍👧‍👦',
      hashtags: ['주말특가', '음료할인', '50%할인', '가족외식', '친구모임'],
      images: ['/images/weekend-drink-sale.jpg'],
      status: 'PUBLISHED',
      views: 1123,
      likes: 78,
      comments: 14,
      createdAt: '2024-01-03T11:00:00',
      publishedAt: '2024-01-03T13:00:00',
    },
    {
      id: 14,
      title: '🏆 맛집 인증서 획득!',
      type: 'poster',
      platform: 'POSTER',
      content: '드디어! 지역 맛집 인증서를 받았습니다! 고객님들의 사랑 덕분입니다. 감사합니다!',
      hashtags: ['맛집인증', '지역맛집', '인증서', '고객감사'],
      images: ['/images/restaurant-certificate.jpg'],
      status: 'PUBLISHED',
      views: 756,
      likes: 124,
      comments: 18,
      createdAt: '2024-01-02T09:30:00',
      publishedAt: '2024-01-02T11:00:00',
    },
    {
      id: 15,
      title: '🌟 2024년 신년 인사',
      type: 'sns',
      platform: 'NAVER_BLOG',
      content: '2024년 새해가 밝았습니다! ✨\n\n지난 한 해 동안 저희 매장을 사랑해주신 모든 고객님들께 진심으로 감사드립니다.\n\n새해에도 더욱 맛있는 음식과 따뜻한 서비스로 보답하겠습니다.\n\n🎊 새해 복 많이 받으세요! 🎊\n\n올해도 많은 관심과 사랑 부탁드립니다!',
      hashtags: ['신년인사', '새해복', '고객감사', '2024년', '따뜻한서비스'],
      images: ['/images/new-year-greeting.jpg'],
      status: 'PUBLISHED',
      views: 2341,
      likes: 156,
      comments: 23,
      createdAt: '2024-01-01T00:00:00',
      publishedAt: '2024-01-01T09:00:00',
    },
    {
      id: 16,
      title: '🍕 피자떡볶이 실험중!',
      type: 'sns',
      platform: 'INSTAGRAM',
      content: '새로운 메뉴 개발중! 🍕+🌶️\n\n피자떡볶이가 과연 맛있을까요?\nR&D 중인 신메뉴를 살짝 공개! 👀\n\n토마토 소스 베이스에\n모짜렐라 치즈 토핑\n바질과 오레가노 향신료까지!\n\n출시 전 맛보기 이벤트도 계획중이에요!',
      hashtags: ['피자떡볶이', '신메뉴개발', 'R&D', '실험적메뉴', '맛보기이벤트'],
      images: ['/images/pizza-tteokbokki.jpg'],
      status: 'DRAFT',
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: '2023-12-30T16:45:00',
      publishedAt: null,
    },
    {
      id: 17,
      title: '🎄 크리스마스 특별 메뉴',
      type: 'poster',
      platform: 'POSTER',
      content: '크리스마스를 맛있게! 특별한 날을 위한 특별한 메뉴들을 준비했습니다.',
      hashtags: ['크리스마스', '특별메뉴', '연말', '특별한날'],
      images: ['/images/christmas-menu.jpg'],
      status: 'PUBLISHED',
      views: 1678,
      likes: 93,
      comments: 7,
      createdAt: '2023-12-20T10:15:00',
      publishedAt: '2023-12-20T12:00:00',
    },
    {
      id: 18,
      title: '🔥 매운맛 도전 이벤트',
      type: 'sns',
      platform: 'INSTAGRAM',
      content: '매운맛 도전자 모집! 🔥🔥🔥\n\n👹 지옥 떡볶이 도전!\n🌶️ 매운맛 단계별 도전\n🏅 완주시 상품 증정\n📹 도전 영상 촬영 가능\n\n용기있는 분들의 도전을 기다립니다!\n(단, 매운 것 못 드시는 분은 조심하세요 😅)',
      hashtags: ['매운맛도전', '지옥떡볶이', '도전이벤트', '상품증정', '용기있는자'],
      images: ['/images/spicy-challenge.jpg'],
      status: 'PUBLISHED',
      views: 2567,
      likes: 234,
      comments: 45,
      createdAt: '2023-12-15T14:20:00',
      publishedAt: '2023-12-15T15:00:00',
    },
    {
      id: 19,
      title: '☕ 겨울 음료 메뉴 소개',
      type: 'blog',
      platform: 'NAVER_BLOG',
      content: '추운 겨울, 따뜻한 음료 한 잔은 어떠세요? ☕\n\n우리 매장의 겨울 음료 메뉴를 소개합니다:\n\n🍫 진한 핫초콜릿\n🍯 꿀유자차\n🌿 생강차\n☕ 아메리카노\n🥛 따뜻한 우유\n\n모든 음료는 직접 우린 차와 신선한 재료로 만듭니다!\n겨울 추위를 이겨내는 따뜻함을 선사해드릴게요.',
      hashtags: ['겨울음료', '따뜻한차', '핫초콜릿', '꿀유자차', '생강차'],
      images: ['/images/winter-drinks.jpg'],
      status: 'PUBLISHED',
      views: 1234,
      likes: 67,
      comments: 8,
      createdAt: '2023-12-10T13:30:00',
      publishedAt: '2023-12-10T15:00:00',
    },
    {
      id: 20,
      title: '🍱 도시락 배달 서비스 시작',
      type: 'poster',
      platform: 'POSTER',
      content: '이제 도시락 배달도 가능합니다! 회사나 집에서 편리하게 주문하세요.',
      hashtags: ['도시락배달', '배달서비스', '회사도시락', '편리한주문'],
      images: ['/images/lunchbox-delivery.jpg'],
      status: 'DRAFT',
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: '2023-12-05T11:45:00',
      publishedAt: null,
    }
  ]

  // Getters
  const contentCount = computed(() => contents.value.length)

  const filteredContents = computed(() => {
    let filtered = contents.value

    if (filters.value.type !== 'all') {
      filtered = filtered.filter((content) => content.type === filters.value.type)
    }

    if (filters.value.platform !== 'all') {
      filtered = filtered.filter((content) => content.platform === filters.value.platform)
    }

    if (filters.value.status !== 'all') {
      filtered = filtered.filter((content) => content.status === filters.value.status)
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })

  const publishedContents = computed(() =>
    contents.value.filter((content) => content.status === 'PUBLISHED')
  )

  const draftContents = computed(() =>
    contents.value.filter((content) => content.status === 'DRAFT')
  )

  const scheduledContents = computed(() =>
    contents.value.filter((content) => content.status === 'SCHEDULED')
  )

  const recentContents = computed(() => {
    return contents.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  })

  const totalViews = computed(() =>
    contents.value.reduce((sum, content) => sum + (content.views || 0), 0)
  )

  const totalLikes = computed(() =>
    contents.value.reduce((sum, content) => sum + (content.likes || 0), 0)
  )

  // Actions
  const fetchContents = async () => {
    try {
      isLoading.value = true

      // API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 더미 데이터 로드
      contents.value = [...sampleContents]

      console.log('콘텐츠 목록 로드 완료:', contents.value.length)
      return contents.value
    } catch (error) {
      console.error('콘텐츠 로드 실패:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const loadContents = async () => {
    return await fetchContents()
  }

  const getContentById = (id) => {
    return contents.value.find((content) => content.id === parseInt(id))
  }

  const addContent = (content) => {
    const newContent = {
      ...content,
      id: Date.now(), // 임시 ID
      createdAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: 0,
    }
    contents.value.unshift(newContent)
    return newContent
  }

  const updateContent = async (contentId, updatedData) => {
    try {
      const index = contents.value.findIndex((content) => content.id === contentId)
      if (index !== -1) {
        contents.value[index] = {
          ...contents.value[index],
          ...updatedData,
          updatedAt: new Date().toISOString(),
        }
        
        // API 호출 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 500))
        
        return contents.value[index]
      }
      throw new Error('콘텐츠를 찾을 수 없습니다.')
    } catch (error) {
      console.error('콘텐츠 수정 실패:', error)
      throw error
    }
  }

  const deleteContent = async (contentId) => {
    try {
      const index = contents.value.findIndex((content) => content.id === contentId)
      if (index !== -1) {
        const deletedContent = contents.value[index]
        contents.value.splice(index, 1)
        
        // API 호출 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 300))
        
        return deletedContent
      }
      throw new Error('콘텐츠를 찾을 수 없습니다.')
    } catch (error) {
      console.error('콘텐츠 삭제 실패:', error)
      throw error
    }
  }

  const deleteMultipleContents = async (contentIds) => {
    try {
      // API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      const deletedContents = []
      contentIds.forEach(id => {
        const index = contents.value.findIndex((content) => content.id === id)
        if (index !== -1) {
          deletedContents.push(contents.value[index])
          contents.value.splice(index, 1)
        }
      })
      
      return deletedContents
    } catch (error) {
      console.error('콘텐츠 일괄 삭제 실패:', error)
      throw error
    }
  }

  const publishContent = async (contentId) => {
    try {
      isLoading.value = true

      // API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const content = updateContent(contentId, {
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
      })

      console.log('콘텐츠 발행 완료:', content?.title)
      return content
    } catch (error) {
      console.error('콘텐츠 발행 실패:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const scheduleContent = async (contentId, scheduledTime) => {
    try {
      isLoading.value = true

      // API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500))

      const content = updateContent(contentId, {
        status: 'SCHEDULED',
        scheduledAt: new Date(scheduledTime).toISOString(),
      })

      console.log('콘텐츠 예약 완료:', content?.title)
      return content
    } catch (error) {
      console.error('콘텐츠 예약 실패:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const generateContent = async (options) => {
    try {
      isGenerating.value = true

      // AI 콘텐츠 생성 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const generatedContent = {
        title: `AI 생성 콘텐츠 - ${options.type}`,
        type: options.type,
        platform: options.platform,
        content: `AI가 생성한 ${options.type} 콘텐츠입니다. ${options.description || ''}`,
        hashtags: options.hashtags || [],
        images: options.images || [],
        status: 'DRAFT',
      }

      const newContent = addContent(generatedContent)
      console.log('AI 콘텐츠 생성 완료:', newContent.title)

      return newContent
    } catch (error) {
      console.error('AI 콘텐츠 생성 실패:', error)
      throw error
    } finally {
      isGenerating.value = false
    }
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const resetFilters = () => {
    filters.value = {
      type: 'all',
      platform: 'all',
      status: 'all',
      dateRange: 'all',
    }
  }

  const setCurrentContent = (content) => {
    currentContent.value = content
  }

  const clearCurrentContent = () => {
    currentContent.value = null
  }

  return {
    // State
    contents,
    currentContent,
    isLoading,
    isGenerating,
    filters,
    // Getters
    contentCount,
    filteredContents,
    publishedContents,
    draftContents,
    scheduledContents,
    recentContents,
    totalViews,
    totalLikes,
    // Actions
    loadContents,
    fetchContents,
    getContentById,
    addContent,
    updateContent,
    deleteContent,
    deleteMultipleContents,
    publishContent,
    scheduleContent,
    generateContent,
    setFilters,
    resetFilters,
    setCurrentContent,
    clearCurrentContent,
  }
})