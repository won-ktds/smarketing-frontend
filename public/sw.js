// Service Worker for ₩ON AI Marketing Service
const CACHE_NAME = 'won-marketing-v1.0.0';
const OFFLINE_URL = '/offline.html';

// 캐시할 정적 자원들
const STATIC_CACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/runtime-env.js',
  '/images/logo.png',
  '/images/logo-192.png',
  '/images/logo-512.png',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap',
  'https://cdn.jsdelivr.net/npm/@mdi/font@6.9.96/css/materialdesignicons.min.css'
];

// 캐시하지 않을 URL 패턴
const NO_CACHE_PATTERNS = [
  /\/api\//,
  /\/auth\//,
  /\/admin\//
];

// Service Worker 설치
self.addEventListener('install', (event) => {
  console.log('Service Worker 설치 중...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('정적 자원 캐시 중...');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  console.log('Service Worker 활성화 중...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 네트워크 요청 처리
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 캐시하지 않을 패턴 체크
  const shouldNotCache = NO_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
  
  if (shouldNotCache) {
    // API 요청 등은 캐시하지 않고 네트워크만 사용
    event.respondWith(fetch(request));
    return;
  }
  
  // GET 요청만 캐시 전략 적용
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // 캐시된 응답이 있으면 반환하고, 백그라운드에서 업데이트
            fetch(request)
              .then((response) => {
                if (response.status === 200) {
                  const responseClone = response.clone();
                  caches.open(CACHE_NAME)
                    .then((cache) => {
                      cache.put(request, responseClone);
                    });
                }
              })
              .catch(() => {
                // 네트워크 오류 무시
              });
            
            return cachedResponse;
          }
          
          // 캐시된 응답이 없으면 네트워크에서 가져오기
          return fetch(request)
            .then((response) => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            })
            .catch(() => {
              // 네트워크 오류 시 오프라인 페이지 표시
              if (request.destination === 'document') {
                return caches.match(OFFLINE_URL);
              }
              
              // 이미지 요청 실패 시 기본 이미지 반환
              if (request.destination === 'image') {
                return new Response(
                  '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">이미지 없음</text></svg>',
                  { headers: { 'Content-Type': 'image/svg+xml' } }
                );
              }
              
              throw error;
            });
        })
    );
  } else {
    // POST, PUT, DELETE 등은 네트워크만 사용
    event.respondWith(fetch(request));
  }
});

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('백그라운드 동기화 실행');
    event.waitUntil(doBackgroundSync());
  }
});

// 푸시 알림 처리
self.addEventListener('push', (event) => {
  console.log('푸시 알림 수신:', event);
  
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
    icon: '/images/logo-192.png',
    badge: '/images/logo-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/images/close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('₩ON 알림', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('알림 클릭:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // 알림만 닫기
  } else {
    // 기본 동작 - 앱 열기
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 백그라운드 동기화 함수
async function doBackgroundSync() {
  try {
    // 오프라인 상태에서 저장된 데이터를 서버로 전송
    const pendingRequests = await getStoredRequests();
    
    for (const request of pendingRequests) {
      try {
        await fetch(request.url, request.options);
        await removeStoredRequest(request.id);
      } catch (error) {
        console.log('동기화 실패:', error);
      }
    }
  } catch (error) {
    console.log('백그라운드 동기화 오류:', error);
  }
}

// 저장된 요청 조회
async function getStoredRequests() {
  // IndexedDB나 Cache API를 사용하여 오프라인 요청 저장/조회
  return [];
}

// 저장된 요청 삭제
async function removeStoredRequest(id) {
  // IndexedDB에서 요청 삭제
  return Promise.resolve();
}