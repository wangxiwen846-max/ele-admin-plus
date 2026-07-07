/**
 * token操作封装
 */
import { PROTOTYPE_AUTO_LOGIN, TOKEN_CACHE_NAME } from '@/config/setting';

/** 原型默认 token */
export const PROTOTYPE_MOCK_TOKEN = 'prototype-mock-token';

/**
 * 原型阶段确保存在默认登录 token
 */
export function ensurePrototypeToken() {
  if (!PROTOTYPE_AUTO_LOGIN) {
    return;
  }
  if (!localStorage.getItem(TOKEN_CACHE_NAME) && !sessionStorage.getItem(TOKEN_CACHE_NAME)) {
    localStorage.setItem(TOKEN_CACHE_NAME, PROTOTYPE_MOCK_TOKEN);
  }
}

/**
 * 获取缓存的token
 */
export function getToken() {
  const token =
    localStorage.getItem(TOKEN_CACHE_NAME) || sessionStorage.getItem(TOKEN_CACHE_NAME);
  if (token) {
    return token;
  }
  if (PROTOTYPE_AUTO_LOGIN) {
    return PROTOTYPE_MOCK_TOKEN;
  }
  return null;
}

/**
 * 缓存token
 * @param token token
 * @param remember 是否永久存储
 */
export function setToken(token, remember) {
  removeToken();
  if (token) {
    if (remember) {
      localStorage.setItem(TOKEN_CACHE_NAME, token);
    } else {
      sessionStorage.setItem(TOKEN_CACHE_NAME, token);
    }
  }
}

/**
 * 移除token
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_CACHE_NAME);
  sessionStorage.removeItem(TOKEN_CACHE_NAME);
}
