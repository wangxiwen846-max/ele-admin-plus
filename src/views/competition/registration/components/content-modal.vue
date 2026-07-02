<!-- 主内容区域内居中弹窗（不遮挡左侧菜单与顶部导航） -->
<template>
  <div v-if="modelValue" class="content-modal" :style="{ zIndex }">
    <div class="content-modal__mask" @click="onMaskClick"></div>
    <div class="content-modal__panel" :style="panelStyle">
      <div class="content-modal__header">
        <span class="content-modal__title">{{ title }}</span>
        <button type="button" class="content-modal__close" @click="close">×</button>
      </div>
      <div class="content-modal__body">
        <slot></slot>
      </div>
      <div v-if="$slots.footer" class="content-modal__footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    modelValue: Boolean,
    title: { type: String, default: '' },
    width: { type: String, default: '960px' },
    zIndex: { type: Number, default: 20 },
    maskClosable: { type: Boolean, default: true }
  });

  const emit = defineEmits(['update:modelValue', 'close']);

  const panelStyle = computed(() => ({ width: props.width, maxWidth: '96%' }));

  const close = () => {
    emit('update:modelValue', false);
    emit('close');
  };

  const onMaskClick = () => {
    if (props.maskClosable) {
      close();
    }
  };
</script>

<style scoped lang="scss">
  .content-modal {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;

    &__mask {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
    }

    &__panel {
      position: relative;
      display: flex;
      flex-direction: column;
      max-height: calc(100% - 24px);
      background: var(--el-bg-color, #fff);
      border-radius: 8px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
      overflow: hidden;
    }

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    &__title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    &__close {
      padding: 0 6px;
      font-size: 20px;
      line-height: 1;
      color: var(--el-text-color-secondary);
      background: transparent;
      border: none;
      cursor: pointer;

      &:hover {
        color: var(--el-color-primary);
      }
    }

    &__body {
      flex: 1;
      padding: 18px 20px;
      overflow: auto;
    }

    &__footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 12px 20px;
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }
</style>
