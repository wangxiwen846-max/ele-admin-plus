/**
 * 说明：此处为原型 Mock 实现，任意账号密码均可登录成功。
 */

/**
 * 登录
 */
export async function login() {
  return Promise.resolve({
    code: 0,
    message: '登录成功',
    data: { access_token: 'mock-token-' + Date.now() }
  });
}

/**
 * 获取验证码（返回一段静态占位 base64 图形，避免网络请求）
 */
export async function getCaptcha() {
  // 使用内联 SVG 作为占位验证码，内容固定为 "EL96"
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="108" height="40" viewBox="0 0 108 40">' +
    '<rect width="108" height="40" fill="#f5f7fa"/>' +
    '<text x="14" y="28" font-family="Menlo, monospace" font-size="22" fill="#1f2937" letter-spacing="4">EL96</text>' +
    '</svg>';
  const base64 =
    'data:image/svg+xml;base64,' +
    (typeof window !== 'undefined' ? window.btoa(svg) : '');
  return Promise.resolve({ base64, text: 'el96' });
}

/**
 * 退出登录
 */
export async function logout() {
  return '退出登录成功';
}
