import request from '@/utils/request';

/**
 * 登录
 */
export async function login(data) {
  const res = await request.post('/login', data);
  if (res.data.code === 0) {
    return res.data;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 获取验证码
 */
export async function getCaptcha() {
  const res = await request.get('/captcha');
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 退出登录
 */
export async function logout() {
  return '退出登录成功';
  /* const res = await request.delete('/logout');
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message)); */
}
