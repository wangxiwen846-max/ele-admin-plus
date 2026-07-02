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
  },
  // ── 运动数据 ─────────────────────────────────────────
  {
    menuId: 200,
    parentId: 0,
    menuType: 0,
    title: '运动数据',
    icon: 'TrophyOutlined',
    path: '/sport',
    authority: 'sport'
  },
  {
    menuId: 201,
    parentId: 200,
    menuType: 0,
    title: '运动记录管理',
    icon: 'BarChartOutlined',
    path: '/sport/record',
    component: '/sport/record',
    authority: 'sport:record'
  },
  // ── 设项管理 ─────────────────────────────────────────
  {
    menuId: 300,
    parentId: 0,
    menuType: 0,
    title: '设项管理',
    icon: 'TrophyOutlined',
    path: '/event-item',
    component: '/event-item',
    authority: 'event-item'
  },
  // ── 比赛管理 ─────────────────────────────────────────
  {
    menuId: 400,
    parentId: 0,
    menuType: 0,
    title: '比赛管理',
    icon: 'FlagOutlined',
    path: '/competition',
    authority: 'competition'
  },
  {
    menuId: 401,
    parentId: 400,
    menuType: 0,
    title: '活动管理',
    icon: 'CalendarOutlined',
    path: '/competition/activity',
    component: '/competition/activity',
    authority: 'competition:activity'
  },
  {
    menuId: 402,
    parentId: 400,
    menuType: 0,
    title: '新建活动',
    hide: true,
    path: '/competition/activity/add',
    component: '/competition/activity/add',
    authority: 'competition:activity:add'
  },
  {
    menuId: 403,
    parentId: 400,
    menuType: 0,
    title: '编辑活动',
    hide: true,
    path: '/competition/activity/edit/:id',
    component: '/competition/activity/edit',
    authority: 'competition:activity:edit'
  },
  {
    menuId: 404,
    parentId: 400,
    menuType: 0,
    title: '活动详情',
    hide: true,
    path: '/competition/activity/detail/:id',
    component: '/competition/activity/detail',
    authority: 'competition:activity:detail'
  },
  {
    menuId: 405,
    parentId: 400,
    menuType: 0,
    title: '比赛管理',
    icon: 'TrophyOutlined',
    path: '/competition/match',
    component: '/competition/match',
    authority: 'competition:match'
  },
  {
    menuId: 406,
    parentId: 400,
    menuType: 0,
    title: '发布比赛',
    hide: true,
    path: '/competition/match/add',
    component: '/competition/match/add',
    authority: 'competition:match:add'
  },
  {
    menuId: 407,
    parentId: 400,
    menuType: 0,
    title: '编辑比赛',
    hide: true,
    path: '/competition/match/edit/:id',
    component: '/competition/match/edit',
    authority: 'competition:match:edit'
  },
  {
    menuId: 408,
    parentId: 400,
    menuType: 0,
    title: '比赛详情',
    hide: true,
    path: '/competition/match/detail/:id',
    component: '/competition/match/detail',
    authority: 'competition:match:detail'
  },
  {
    menuId: 409,
    parentId: 400,
    menuType: 0,
    title: '参赛名单',
    icon: 'TeamOutlined',
    path: '/competition/registration',
    component: '/competition/registration',
    authority: 'competition:registration'
  },
  {
    menuId: 410,
    parentId: 400,
    menuType: 0,
    title: '保险管理',
    icon: 'SafetyCertificateOutlined',
    path: '/competition/insurance',
    authority: 'competition:insurance'
  },
  {
    menuId: 411,
    parentId: 410,
    menuType: 0,
    title: '保险方案管理',
    icon: 'SolutionOutlined',
    path: '/competition/insurance/plan',
    component: '/competition/insurance/plan',
    authority: 'competition:insurance:plan'
  },
  {
    menuId: 413,
    parentId: 410,
    menuType: 0,
    title: '参保记录',
    icon: 'ProfileOutlined',
    path: '/competition/insurance/record',
    component: '/competition/insurance/record',
    authority: 'competition:insurance:record'
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
