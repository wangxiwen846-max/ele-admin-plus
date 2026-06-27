<!-- 活动覆盖范围摘要 + 配置入口 -->
<template>
  <div class="scope-summary-field">
    <div class="summary-row">
      <span class="summary-label">覆盖范围：</span>
      <span class="summary-text">{{ summaryText }}</span>
      <el-button type="primary" link :disabled="disabled" @click="openDialog">配置范围</el-button>
    </div>
    <div v-if="scope?.remark" class="summary-remark">说明：{{ scope.remark }}</div>

    <scope-config-dialog
      v-model="visible"
      :scope="scope"
      :disabled="disabled"
      :show-remark="showRemark"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import ScopeConfigDialog from './scope-config-dialog.vue';
  import { clone, createDefaultScope, formatScopeDisplaySummary } from '../scope-utils.js';

  const props = defineProps({
    modelValue: {
      type: Object,
      default: () => createDefaultScope()
    },
    disabled: Boolean,
    showRemark: {
      type: Boolean,
      default: true
    }
  });

  const emit = defineEmits(['update:modelValue']);

  const visible = ref(false);

  const scope = computed(() => props.modelValue ?? createDefaultScope());
  const summaryText = computed(() => formatScopeDisplaySummary(scope.value));

  const openDialog = () => {
    visible.value = true;
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

  .summary-remark {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }
</style>
