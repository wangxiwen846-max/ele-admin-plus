/**
 * 说明：此处为原型 Mock 实现，返回本地静态数据，跳过后端调用。
 * 便于前端原型直接运行与预览。
 */

/**
 * 体测数据采集 - 菜单授权数据（flat 格式）
 * - menuType: 0 菜单，1 按钮
 * - toTree 会根据 parentId 构建菜单树
 */
const FITNESS_AUTHORITIES = [
  {
    menuId: 100,
    parentId: 0,
    menuType: 0,
    title: '体测数据采集',
    icon: 'FundOutlined',
    path: '/fitness',
    authority: 'fitness'
  },
  {
    menuId: 101,
    parentId: 100,
    menuType: 0,
    title: '体测方案',
    icon: 'BookOutlined',
    path: '/fitness/plan',
    component: '/fitness/plan',
    authority: 'fitness:plan'
  },
  {
    menuId: 102,
    parentId: 100,
    menuType: 0,
    title: '体测记录',
    icon: 'FormOutlined',
    path: '/fitness/record',
    component: '/fitness/record',
    authority: 'fitness:record'
  }
];

/**
 * 获取当前登录用户的个人信息/菜单/权限/角色
 */
// eslint-disable-next-line no-unused-vars
export async function getUserInfo(_toRoute) {
  return Promise.resolve({
    userId: 1,
    username: 'admin',
    nickname: '体测管理员',
    avatar: '',
    sex: '0',
    roles: [{ roleId: 1, roleCode: 'admin', roleName: '管理员' }],
    authorities: FITNESS_AUTHORITIES
  });
}

/**
 * 修改当前登录用户的密码
 */
export async function updatePassword() {
  return '修改成功';
}

/**
 * 修改当前登录用户的个人信息
 */
export async function updateUserInfo(data) {
  return { ...data };
}
