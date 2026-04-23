<template>
  <el-config-provider :locale="elLocale">
    <ele-config-provider
      :locale="eleLocale"
      :table="tableConfig"
      :map-key="mapKey"
      :license="license"
    >
      <ele-app>
        <router-view />
      </ele-app>
    </ele-config-provider>
  </el-config-provider>
</template>

<script setup>
  import { useGlobalConfig } from '@/config/use-global-config';
  import { useThemeStore } from '@/store/modules/theme';
  import { useLocale } from '@/i18n/use-locale';
  const mapKey = import.meta.env.VITE_MAP_KEY;
  const license = import.meta.env.VITE_LICENSE;

  /** 组件全局配置 */
  const { tableConfig } = useGlobalConfig();

  /** 恢复缓存主题 */
  const themeStore = useThemeStore();
  themeStore.recoverTheme();

  /** 国际化配置 */
  const { elLocale, eleLocale } = useLocale();
</script>
