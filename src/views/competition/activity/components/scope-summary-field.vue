<!-- 活动覆盖范围摘要 + 配置入口 -->
<template>
  <div class="scope-summary-field">
    <div class="summary-row">
      <span class="summary-label">参赛范围：</span>
      <span class="summary-text">{{ displayText }}</span>
      <el-button
        v-if="!fixedNational && !disabled"
        type="primary"
        link
        @click.stop="openCoverageRangeDialog"
      >
        配置范围
      </el-button>
    </div>

    <Teleport to="body">
      <scope-config-dialog
        v-if="dialogVisible"
        v-model="dialogVisible"
        :scope="scope"
        :stages="stages"
        :disabled="disabled"
        :show-remark="showRemark"
        @confirm="handleConfirm"
      />
    </Teleport>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import ScopeConfigDialog from './scope-config-dialog.vue';
  import {
    clone,
    createDefaultScope,
    formatScopeDisplaySummary
  } from '../scope-utils.js';

  const props = defineProps({
    modelValue: {
      type: Object,
      default: () => createDefaultScope()
    },
    stages: {
      type: Array,
      default: () => []
    },
    disabled: Boolean,
    showRemark: {
      type: Boolean,
      default: true
    },
    /** 固定全国范围，不可编辑 */
    fixedNational: Boolean
  });

  const emit = defineEmits(['update:modelValue']);

  const dialogVisible = ref(false);

  const scope = computed(() => props.modelValue ?? createDefaultScope());
  const displayText = computed(() =>
    props.fixedNational ? '全国范围' : formatScopeDisplaySummary(scope.value)
  );

  const openCoverageRangeDialog = () => {
    if (props.disabled || props.fixedNational) {
      return;
    }
    dialogVisible.value = true;
  };

  const handleConfirm = (value) => {
    emit('update:modelValue', clone(value));
  };
</script>

<style scoped lang="scss">
  .scope-summary-field {
    width: 100%;
  }

  .summary-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .summary-label {
    flex-shrink: 0;
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }

  .summary-text {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    color: var(--el-text-color-primary);
  }
</style>
