import { defineStore } from 'pinia';
import { toTree, mapTree } from 'ele-admin-plus';
import { formatUserMenu } from '@/utils/menu-util';
import defaultAvatarUrl from '@/assets/avatar.png';
import { getUserInfo } from '@/api/layout';

/**
 * 登录用户状态管理
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    /** 当前登录用户的信息 */
    info: null,
    /** 当前登录用户的菜单数据 */
    menus: null,
    /** 当前登录用户的按钮权限数据 */
    authorities: [],
    /** 当前登录用户的角色权限数据 */
    roles: []
  }),
  actions: {
    /**
     * 请求登录用户的个人信息/权限/角色/菜单
     * @param toRoute 路由守卫中要进入的路由
     */
    async fetchUserInfo(toRoute) {
      try {
        // 请求用户信息接口
        const userInfo = await getUserInfo(toRoute);
        // 处理菜单数据格式
        const userMenu = toTree({
          data: userInfo.authorities?.filter?.((d) => d.menuType !== 1),
          idField: 'menuId',
          parentIdField: 'parentId'
        });
        const userMenuResult = formatUserMenu(userMenu);
        // 数据更新到状态管理中
        this.setInfo(userInfo);
        this.setAuthorities(
          userInfo?.authorities?.map?.((d) => d.authority)?.filter?.((a) => !!a)
        );
        this.setRoles(userInfo?.roles?.map?.((d) => d.roleCode));
        this.setMenus(userMenuResult.menus);
        return userMenuResult;
      } catch (e) {
        console.error(e);
      }
      return {};
    },
    /**
     * 更新用户信息
     */
    setInfo(data) {
      if (data == null) {
        this.info = null;
      } else {
        this.info = { ...data, avatar: data?.avatar || defaultAvatarUrl };
      }
    },
    /**
     * 更新菜单数据
     */
    setMenus(menus) {
      this.menus = menus;
    },
    /**
     * 更新按钮权限数据
     */
    setAuthorities(authorities) {
      this.authorities = authorities;
    },
    /**
     * 更新角色权限数据
     */
    setRoles(roles) {
      this.roles = roles;
    },
    /**
     * 清空状态数据
     */
    clearData() {
      this.setInfo(null);
      this.setMenus(null);
      this.setAuthorities(null);
      this.setRoles(null);
    },
    /**
     * 更新菜单的徽章
     * @param path 菜单地址
     * @param value 徽章值
     * @param type 徽章类型
     */
    setMenuBadge(path, value, type) {
      this.menus = mapTree(this.menus, (m) => {
        if (path === m.path) {
          const meta = m.meta || {};
          return {
            ...m,
            meta: {
              ...meta,
              props: {
                ...meta.props,
                badge: value == null ? void 0 : { value, type }
              }
            }
          };
        }
        return m;
      });
    }
  }
});
