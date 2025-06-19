//* public/runtime-env.js - Production environment priority configuration
console.log('=== RUNTIME-ENV.JS LOADED ===');

// Production environment detection function
const isProduction = () => {
  // Production environment detection logic
  return window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1' &&
         !window.location.hostname.includes('dev');
};

// Default ingress host setting (from deploy_env_vars)
const DEFAULT_INGRESS_HOST = 'smarketing.20.249.184.228.nip.io';

// Environment-specific API URL configuration
const getBaseUrl = () => {
  if (isProduction()) {
    // Production: use ingress host
    return `http://${DEFAULT_INGRESS_HOST}`;
  } else {
    // Development: use localhost
    return '';
  }
};

const baseUrl = getBaseUrl();

window.__runtime_config__ = {
  // Use ingress host in production, localhost in development
  AUTH_URL: isProduction() ? 
    `${baseUrl}/api/auth` : 
    'http://localhost:8081/api/auth',
    
  MEMBER_URL: isProduction() ? 
    `${baseUrl}/api/member` : 
    'http://localhost:8081/api/member',
    
  STORE_URL: isProduction() ? 
    `${baseUrl}/api/store` : 
    'http://localhost:8082/api/store',
    
  MENU_URL: isProduction() ? 
    `${baseUrl}/api/menu` : 
    'http://localhost:8082/api/menu',
    
  SALES_URL: isProduction() ? 
    `${baseUrl}/api/sales` : 
    'http://localhost:8082/api/sales',
    
  CONTENT_URL: isProduction() ? 
    `${baseUrl}/api/content` : 
    'http://localhost:8083/api/content',
    
  RECOMMEND_URL: isProduction() ? 
    `${baseUrl}/api/recommendations` : 
    'http://localhost:8084/api/recommendations',
   
  // Gateway URL
  GATEWAY_URL: isProduction() ? baseUrl : 'http://20.1.2.3',
  
  // Feature flags
  FEATURES: {
    ANALYTICS: true,
    PUSH_NOTIFICATIONS: true,
    SOCIAL_LOGIN: false,
    MULTI_LANGUAGE: false,
    API_HEALTH_CHECK: true,
  },

  // Environment settings
  ENV: isProduction() ? 'production' : 'development',
  DEBUG: !isProduction(),

  // API timeout settings
  API_TIMEOUT: 30000,
  
  // Retry settings
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,

  // Version information
  VERSION: '1.0.0',
  BUILD_DATE: new Date().toISOString(),
  
  // Backend service port information (for debugging)
  BACKEND_PORTS: {
    AUTH: 8081,
    STORE: 8082,
    CONTENT: 8083,
    AI_RECOMMEND: 8084
  }
};

// Configuration validation function
const validateConfig = () => {
  const config = window.__runtime_config__;
  const requiredUrls = ['AUTH_URL', 'STORE_URL', 'SALES_URL', 'RECOMMEND_URL'];
  
  for (const url of requiredUrls) {
    if (!config[url]) {
      console.error(`Missing required URL: ${url}`);
      return false;
    }
  }
  
  console.log('Config validation completed');
  return true;
};

// Environment-specific detailed logging
if (window.__runtime_config__.DEBUG) {
  console.log('=== Current Environment Info ===');
  console.log('Environment:', window.__runtime_config__.ENV);
  console.log('Hostname:', window.location.hostname);
  console.log('Is Production:', isProduction());
  
  console.log('=== Backend API URLs ===');
  console.log('AUTH_URL:', window.__runtime_config__.AUTH_URL);
  console.log('STORE_URL:', window.__runtime_config__.STORE_URL);
  console.log('SALES_URL:', window.__runtime_config__.SALES_URL);
  console.log('RECOMMEND_URL:', window.__runtime_config__.RECOMMEND_URL);
  console.log('CONTENT_URL:', window.__runtime_config__.CONTENT_URL);
  
  console.log('=== Detailed Configuration ===');
  console.log('Full config:', window.__runtime_config__);
}

// Global configuration access functions
window.getApiConfig = () => window.__runtime_config__;
window.getApiUrl = (serviceName) => {
  const config = window.__runtime_config__;
  const urlKey = `${serviceName.toUpperCase()}_URL`;
  return config[urlKey] || null;
};

// Execute configuration validation
validateConfig();

console.log(`Runtime configuration loaded successfully (${window.__runtime_config__.ENV} environment)`);