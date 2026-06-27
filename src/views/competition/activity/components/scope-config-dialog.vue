<!-- 活动覆盖范围配置弹窗 -->
<template>
  <ele-modal
    v-model="visible"
    :title="title"
    :width="760"
    @closed="handleClosed"
  >
    <div class="coverage-mode-row">
      <span class="coverage-mode-label">覆盖模式：</span>
      <el-radio-group v-model="coverageMode" :disabled="disabled" @change="handleCoverageModeChange">
        <el-radio :value="COVERAGE_MODE_NATIONAL">全国范围</el-radio>
        <el-radio :value="COVERAGE_MODE_SPECIFIED">指定范围</el-radio>
      </el-radio-group>
    </div>

    <div v-if="coverageMode === COVERAGE_MODE_NATIONAL" class="national-block">
      <div class="national-summary">
        当前覆盖范围：全国范围，包含全部学校、全部学段、全部年级、全部班级。
      </div>
      <el-form-item label="覆盖对象说明" label-width="108px" class="remark-item">
        <el-input
          v-model="nationalRemark"
          type="textarea"
          :rows="3"
          :maxlength="300"
          :disabled="disabled"
          placeholder="对覆盖对象的补充说明"
        />
      </el-form-item>
    </div>

    <scope-config-panel
      v-else-if="innerScope"
      v-model="innerScope"
      variant="activity-specified"
      :disabled="disabled"
      :show-remark="showRemark"
      :label-prefix="labelPrefix"
    />

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { ref, watch } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import ScopeConfigPanel from './scope-config-panel.vue';
  import {
    COVERAGE_MODE_NATIONAL,
    COVERAGE_MODE_SPECIFIED,
    SCOPE_MODE_SPECIFIED,
    clone,
    createDefaultScope,
    createNationalScope,
    getCoverageMode,
    validateScopeConfig
  } from '../scope-utils.js';

  const props = defineProps({
    modelValue: Boolean,
    scope: Object,
    disabled: Boolean,
    title: {
      type: String,
      default: '配置活动覆盖范围'
    },
    labelPrefix: {
      type: String,
      default: '覆盖'
    },
    showRemark: {
      type: Boolean,
      default: true
    }
  });

  const emit = defineEmits(['update:modelValue', 'confirm']);

  const visible = ref(false);
  const innerScope = ref(createDefaultScope());
  const coverageMode = ref(COVERAGE_MODE_NATIONAL);
  const nationalRemark = ref('');

  watch(
    () => props.modelValue,
    (value) => {
      visible.value = value;
      if (value) {
        const scope = clone(props.scope ?? createDefaultScope());
        coverageMode.value = getCoverageMode(scope);
        nationalRemark.value = scope.remark ?? '';
        if (coverageMode.value === COVERAGE_MODE_SPECIFIED) {
          innerScope.value = {
            ...scope,
            regionMode: SCOPE_MODE_SPECIFIED
          };
        } else {
          innerScope.value = createDefaultScope();
        }
      }
    }
  );

  watch(visible, (value) => {
    emit('update:modelValue', value);
  });

  const handleCoverageModeChange = (mode) => {
    if (mode === COVERAGE_MODE_NATIONAL) {
      nationalRemark.value = innerScope.value?.remark ?? nationalRemark.value;
      return;
    }
    innerScope.value = {
      ...createDefaultScope(),
      regionMode: SCOPE_MODE_SPECIFIED,
      remark: nationalRemark.value
    };
  };

  const confirm = () => {
    if (coverageMode.value === COVERAGE_MODE_NATIONAL) {
      emit('confirm', createNationalScope(nationalRemark.value.trim()));
      visible.value = false;
      return;
    }
    const errors = validateScopeConfig(innerScope.value, {
      labelPrefix: props.labelPrefix,
      activitySpecified: true
    });
    if (errors.length) {
      EleMessage.error({ message: errors[0], plain: true });
      return;
    }
    emit(
      'confirm',
      clone({
        ...innerScope.value,
        regionMode: SCOPE_MODE_SPECIFIED
      })
    );
    visible.value = false;
  };

  const handleClosed = () => {
    emit('update:modelValue', false);
  };
</script>

<style scoped lang="scss">
  .coverage-mode-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--el-border-color-extra-light);
  }

  .coverage-mode-label {
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .national-block {
    padding: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
  }

  .national-summary {
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
    margin-bottom: 12px;
  }

  .remark-item {
    margin-bottom: 0;
  }
</style>
