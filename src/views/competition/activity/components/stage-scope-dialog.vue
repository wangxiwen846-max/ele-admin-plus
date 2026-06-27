<!-- 赛段参赛范围配置弹窗 -->
<template>
  <ele-modal
    v-model="visible"
    title="配置赛段参赛范围"
    :width="760"
    @closed="handleClosed"
  >
    <div class="scope-tip">赛段参赛范围不能超出活动覆盖范围。</div>
    <el-form label-width="148px" class="inherit-form">
      <el-form-item label="是否继承活动覆盖范围">
        <el-radio-group v-model="innerScope.inherit">
          <el-radio :value="true">是</el-radio>
          <el-radio :value="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <div v-if="innerScope.inherit" class="inherit-summary">
      <div class="inherit-summary-title">当前参赛范围：继承活动覆盖范围</div>
      <div class="inherit-summary-desc">
        活动覆盖范围：{{ parentScopeSummary }}
      </div>
    </div>

    <scope-config-panel
      v-else
      v-model="innerScope"
      :parent-scope="parentScope"
      label-prefix="参赛"
      :show-remark="false"
    />

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';
  import { ElMessageBox } from 'element-plus';
  import { EleMessage } from 'ele-admin-plus';
  import ScopeConfigPanel from './scope-config-panel.vue';
  import {
    clone,
    createDefaultStageScope,
    formatScopeDisplaySummary,
    validateScopeConfig,
    validateStageScopeWithinCoverage
  } from '../scope-utils.js';

  const props = defineProps({
    modelValue: Boolean,
    scope: Object,
    parentScope: Object,
    stageMatchCount: {
      type: Number,
      default: 0
    }
  });

  const emit = defineEmits(['update:modelValue', 'confirm']);

  const visible = ref(false);
  const innerScope = ref(createDefaultStageScope());

  const parentScopeSummary = computed(() =>
    formatScopeDisplaySummary(props.parentScope ?? {})
  );

  watch(
    () => props.modelValue,
    (value) => {
      visible.value = value;
      if (value) {
        innerScope.value = clone(props.scope ?? createDefaultStageScope());
      }
    }
  );

  watch(visible, (value) => {
    emit('update:modelValue', value);
  });

  const confirm = async () => {
    if (innerScope.value.inherit) {
      emit('confirm', clone(innerScope.value));
      visible.value = false;
      return;
    }
    const errors = [
      ...validateScopeConfig(innerScope.value, { isStage: true, labelPrefix: '参赛' }),
      ...validateStageScopeWithinCoverage(innerScope.value, props.parentScope)
    ];
    if (errors.length) {
      EleMessage.error({ message: errors[0], plain: true });
      return;
    }
    if (props.stageMatchCount > 0) {
      try {
        await ElMessageBox.confirm(
          '该赛段已关联比赛，缩小参赛范围可能影响已有比赛或报名数据，是否继续保存？',
          '范围调整提示',
          { type: 'warning', draggable: true }
        );
      } catch {
        return;
      }
    }
    emit('confirm', clone(innerScope.value));
    visible.value = false;
  };

  const handleClosed = () => {
    emit('update:modelValue', false);
  };
</script>

<style scoped lang="scss">
  .scope-tip {
    margin-bottom: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .inherit-form {
    margin-bottom: 8px;
  }

  .inherit-summary {
    padding: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.6;
  }

  .inherit-summary-title {
    color: var(--el-text-color-primary);
    font-weight: 500;
  }

  .inherit-summary-desc {
    margin-top: 6px;
    color: var(--el-text-color-secondary);
  }
</style>
