<!-- 赛段参赛范围配置弹窗 -->
<template>
  <ele-modal
    v-model="visible"
    title="配置赛段参赛范围"
    :width="760"
    :body-style="{ overflow: 'auto', maxHeight: '65vh' }"
    @closed="handleClosed"
  >
    <div class="parent-block">
      <div class="parent-line">
        <span class="parent-label">上级范围：</span>
        <span>活动覆盖范围</span>
      </div>
      <div class="parent-line">
        <span class="parent-label">范围摘要：</span>
        <span class="parent-summary">{{ parentScopeSummary }}</span>
      </div>
    </div>

    <div class="scope-tip">赛段参赛范围不能超出活动覆盖范围。</div>

    <div class="mode-row">
      <span class="mode-label">参赛范围：</span>
      <el-radio-group v-model="scopeMode" @change="handleScopeModeChange">
        <el-radio value="inherit">使用活动覆盖范围</el-radio>
        <el-radio value="specified">指定范围</el-radio>
      </el-radio-group>
    </div>

    <div v-if="scopeMode === 'inherit'" class="inherit-block">
      <div class="inherit-desc">当前赛段参赛范围将直接使用活动覆盖范围。</div>
      <div class="inherit-summary">范围摘要：{{ parentScopeSummary }}。</div>
    </div>

    <div v-else class="stage-scope-fields">
      <div v-if="showRegionPicker" class="scope-dimension">
        <div class="dimension-head">
          <span class="dimension-label">
            参赛地区<span class="dimension-required">*</span>
          </span>
          <span class="dimension-fixed">指定地区</span>
        </div>
        <el-cascader
          v-model="innerScope.regions"
          :options="regionOptions"
          :props="regionProps"
          clearable
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择省 / 市 / 区县（可多选）"
          class="ele-fluid"
          @change="syncLowerLevels"
        />
      </div>

      <div v-else-if="regionReadonlyText" class="scope-dimension scope-dimension--readonly">
        <div class="dimension-head">
          <span class="dimension-label">参赛地区</span>
        </div>
        <div class="readonly-value">{{ regionReadonlyText }}</div>
      </div>

      <div v-if="hasSelectedRegions" class="scope-dimension">
        <div class="dimension-head">
          <span class="dimension-label">学校范围</span>
          <el-radio-group v-model="innerScope.schoolMode" @change="handleSchoolModeChange">
            <el-radio :value="SCOPE_MODE_ALL">当前地区内全部学校</el-radio>
            <el-radio :value="SCOPE_MODE_SPECIFIED">指定学校</el-radio>
          </el-radio-group>
        </div>
        <el-select
          v-if="innerScope.schoolMode === SCOPE_MODE_SPECIFIED"
          v-model="innerScope.schools"
          multiple
          collapse-tags
          collapse-tags-tooltip
          filterable
          placeholder="请选择指定学校"
          class="ele-fluid"
          @change="syncLowerLevels"
        >
          <el-option
            v-for="item in schoolOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <div v-if="schoolRangeReady" class="scope-dimension">
        <div class="dimension-head">
          <span class="dimension-label">学段范围</span>
          <el-radio-group v-model="innerScope.stageMode" @change="handleStageModeChange">
            <el-radio :value="SCOPE_MODE_ALL">全部学段</el-radio>
            <el-radio :value="SCOPE_MODE_SPECIFIED">指定学段</el-radio>
          </el-radio-group>
        </div>
        <el-select
          v-if="innerScope.stageMode === SCOPE_MODE_SPECIFIED"
          v-model="innerScope.stages"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择指定学段"
          class="ele-fluid"
          @change="syncGradesAndClasses"
        >
          <el-option
            v-for="item in stageOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <div v-if="stageRangeReady" class="scope-dimension">
        <div class="dimension-head">
          <span class="dimension-label">年级范围</span>
          <el-radio-group v-model="innerScope.gradeMode" @change="handleGradeModeChange">
            <el-radio :value="SCOPE_MODE_ALL">全部年级</el-radio>
            <el-radio :value="SCOPE_MODE_SPECIFIED">指定年级</el-radio>
          </el-radio-group>
        </div>
        <el-select
          v-if="innerScope.gradeMode === SCOPE_MODE_SPECIFIED"
          v-model="innerScope.grades"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择指定年级"
          class="ele-fluid"
          @change="syncClasses"
        >
          <el-option v-for="item in gradeOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </div>

      <div v-if="showClassConfig" class="scope-dimension">
        <div class="dimension-head">
          <span class="dimension-label">班级范围</span>
          <el-radio-group v-model="innerScope.classMode" @change="handleClassModeChange">
            <el-radio :value="SCOPE_MODE_ALL">全部班级</el-radio>
            <el-radio :value="SCOPE_MODE_SPECIFIED">指定班级</el-radio>
          </el-radio-group>
        </div>
        <el-select
          v-if="innerScope.classMode === SCOPE_MODE_SPECIFIED"
          v-model="innerScope.classes"
          multiple
          collapse-tags
          collapse-tags-tooltip
          filterable
          placeholder="请选择指定班级"
          class="ele-fluid"
        >
          <el-option
            v-for="item in classOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
    </div>

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
  import {
    REGION_OPTIONS,
    SCOPE_MODE_ALL,
    SCOPE_MODE_SPECIFIED,
    STAGE_GRADE_MAP,
    clampScopeToParent,
    clone,
    createDefaultScope,
    createDefaultStageScope,
    filterRegionOptionsByPaths,
    formatRegionReadonlyLabel,
    formatScopeDisplaySummary,
    getAvailableClassOptions,
    getAvailableGradeOptions,
    getAvailableSchoolOptions,
    getAvailableStageOptions,
    getParentScopeConstraints,
    initScopeFromParent,
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
  const scopeMode = ref('inherit');
  const innerScope = ref(createDefaultScope());
  const regionProps = {
    multiple: true,
    checkStrictly: true,
    emitPath: true,
    value: 'value',
    label: 'label',
    children: 'children'
  };

  const parentConstraints = computed(() => getParentScopeConstraints(props.parentScope ?? {}));
  const parentScopeSummary = computed(() => formatScopeDisplaySummary(props.parentScope ?? {}));
  const regionOptions = computed(() =>
    parentConstraints.value.regionSpecified
      ? filterRegionOptionsByPaths(parentConstraints.value.regionPaths, REGION_OPTIONS)
      : REGION_OPTIONS
  );
  const showRegionPicker = computed(() => parentConstraints.value.isNational);
  const regionReadonlyText = computed(() => {
    if (parentConstraints.value.regionSpecified) {
      return formatRegionReadonlyLabel(parentConstraints.value.regionPaths);
    }
    return formatRegionReadonlyLabel(innerScope.value.regions);
  });
  const hasSelectedRegions = computed(() => {
    if (parentConstraints.value.regionSpecified) {
      return true;
    }
    return !!innerScope.value.regions?.length;
  });
  const schoolOptions = computed(() =>
    getAvailableSchoolOptions(innerScope.value, props.parentScope)
  );
  const schoolRangeReady = computed(() => {
    if (!hasSelectedRegions.value) {
      return false;
    }
    return (
      innerScope.value.schoolMode === SCOPE_MODE_ALL ||
      !!innerScope.value.schools?.length
    );
  });
  const stageOptions = computed(() =>
    getAvailableStageOptions(innerScope.value, props.parentScope).filter((item) =>
      ['小学', '初中', '高中'].includes(item.value)
    )
  );
  const stageRangeReady = computed(() => {
    if (!schoolRangeReady.value) {
      return false;
    }
    return (
      innerScope.value.stageMode === SCOPE_MODE_ALL ||
      !!innerScope.value.stages?.length
    );
  });
  const gradeOptions = computed(() => {
    const stages =
      innerScope.value.stageMode === SCOPE_MODE_SPECIFIED && innerScope.value.stages?.length
        ? innerScope.value.stages
        : stageOptions.value.map((item) => item.value);
    const grades = [];
    stages.forEach((stage) => {
      (STAGE_GRADE_MAP[stage] ?? []).forEach((grade) => {
        if (!grades.includes(grade)) {
          grades.push(grade);
        }
      });
    });
    const allowed = getAvailableGradeOptions(innerScope.value, props.parentScope);
    return grades.filter((grade) => allowed.includes(grade));
  });
  const gradeRangeReady = computed(() => {
    if (!stageRangeReady.value) {
      return false;
    }
    return (
      innerScope.value.gradeMode === SCOPE_MODE_ALL ||
      !!innerScope.value.grades?.length
    );
  });
  const showClassConfig = computed(
    () =>
      gradeRangeReady.value &&
      innerScope.value.schoolMode === SCOPE_MODE_SPECIFIED &&
      !!innerScope.value.schools?.length
  );
  const classOptions = computed(() =>
    getAvailableClassOptions(innerScope.value, props.parentScope)
  );

  const initSpecifiedScope = () => {
    const next = initScopeFromParent(props.parentScope ?? {});
    if (parentConstraints.value.isNational) {
      next.regionMode = SCOPE_MODE_SPECIFIED;
      next.regions = [];
    } else if (parentConstraints.value.regionSpecified) {
      next.regionMode = SCOPE_MODE_SPECIFIED;
      next.regions = clone(parentConstraints.value.regionPaths);
    }
    innerScope.value = next;
  };

  const initDialogState = () => {
    const scope = clone(props.scope ?? createDefaultStageScope());
    if (scope.inherit !== false) {
      scopeMode.value = 'inherit';
      innerScope.value = createDefaultScope();
      return;
    }
    scopeMode.value = 'specified';
    const { inherit: _inherit, ...rest } = scope;
    innerScope.value = clampScopeToParent(rest, props.parentScope ?? {});
  };

  watch(
    () => props.modelValue,
    (value) => {
      visible.value = value;
      if (value) {
        initDialogState();
      }
    }
  );

  watch(visible, (value) => {
    emit('update:modelValue', value);
  });

  const handleScopeModeChange = (mode) => {
    if (mode === 'specified') {
      initSpecifiedScope();
    }
  };

  const handleSchoolModeChange = (mode) => {
    if (mode === SCOPE_MODE_ALL) {
      innerScope.value.schools = [];
      innerScope.value.classes = [];
    }
    syncLowerLevels();
  };

  const handleStageModeChange = (mode) => {
    if (mode === SCOPE_MODE_ALL) {
      innerScope.value.stages = [];
    }
    syncGradesAndClasses();
  };

  const handleGradeModeChange = (mode) => {
    if (mode === SCOPE_MODE_ALL) {
      innerScope.value.grades = [];
    }
    syncClasses();
  };

  const handleClassModeChange = (mode) => {
    if (mode === SCOPE_MODE_ALL) {
      innerScope.value.classes = [];
    }
  };

  const syncLowerLevels = () => {
    if (!hasSelectedRegions.value) {
      resetAfterRegion();
      return;
    }
    if (parentConstraints.value.regionSpecified && !innerScope.value.regions?.length) {
      innerScope.value.regionMode = SCOPE_MODE_SPECIFIED;
      innerScope.value.regions = clone(parentConstraints.value.regionPaths);
    }
    const allowedSchools = schoolOptions.value.map((item) => item.value);
    innerScope.value.schools = (innerScope.value.schools ?? []).filter((id) =>
      allowedSchools.includes(id)
    );
    if (innerScope.value.schoolMode !== SCOPE_MODE_SPECIFIED) {
      innerScope.value.classMode = SCOPE_MODE_ALL;
      innerScope.value.classes = [];
    }
    syncGradesAndClasses();
  };

  const syncGradesAndClasses = () => {
    const allowedStages = stageOptions.value.map((item) => item.value);
    innerScope.value.stages = (innerScope.value.stages ?? []).filter((stage) =>
      allowedStages.includes(stage)
    );
    const allowedGrades = gradeOptions.value;
    innerScope.value.grades = (innerScope.value.grades ?? []).filter((grade) =>
      allowedGrades.includes(grade)
    );
    syncClasses();
  };

  const syncClasses = () => {
    if (!showClassConfig.value) {
      innerScope.value.classMode = SCOPE_MODE_ALL;
      innerScope.value.classes = [];
      return;
    }
    const allowedClasses = classOptions.value.map((item) => item.value);
    innerScope.value.classes = (innerScope.value.classes ?? []).filter((id) =>
      allowedClasses.includes(id)
    );
  };

  const resetAfterRegion = () => {
    innerScope.value = {
      ...innerScope.value,
      schools: [],
      stages: [],
      grades: [],
      classes: [],
      schoolMode: SCOPE_MODE_ALL,
      stageMode: SCOPE_MODE_ALL,
      gradeMode: SCOPE_MODE_ALL,
      classMode: SCOPE_MODE_ALL
    };
  };

  const confirm = async () => {
    if (scopeMode.value === 'inherit') {
      emit('confirm', createDefaultStageScope());
      visible.value = false;
      return;
    }

    const normalizedScope = {
      ...innerScope.value,
      regionMode: SCOPE_MODE_SPECIFIED,
      classMode: showClassConfig.value ? innerScope.value.classMode : SCOPE_MODE_ALL,
      classes: showClassConfig.value ? innerScope.value.classes : []
    };
    const clamped = clampScopeToParent(normalizedScope, props.parentScope ?? {});
    const errors = [
      ...validateScopeConfig(clamped, { isStage: true, labelPrefix: '参赛', activitySpecified: true }),
      ...validateStageScopeWithinCoverage(clamped, props.parentScope)
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
    emit('confirm', { inherit: false, ...clone(clamped) });
    visible.value = false;
  };

  const handleClosed = () => {
    emit('update:modelValue', false);
  };
</script>

<style scoped lang="scss">
  .parent-block {
    margin-bottom: 12px;
    padding: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.8;
  }

  .parent-line {
    color: var(--el-text-color-regular);
  }

  .parent-label {
    color: var(--el-text-color-secondary);
  }

  .parent-summary {
    color: var(--el-text-color-primary);
    font-weight: 500;
  }

  .scope-tip {
    margin-bottom: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .mode-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--el-border-color-extra-light);
  }

  .mode-label {
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .inherit-block {
    padding: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.6;
  }

  .inherit-desc {
    color: var(--el-text-color-primary);
  }

  .inherit-summary {
    margin-top: 6px;
    color: var(--el-text-color-secondary);
  }

  .stage-scope-fields {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .scope-dimension {
    padding: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;

    &--readonly {
      .readonly-value {
        font-size: 13px;
        color: var(--el-text-color-primary);
      }
    }
  }

  .dimension-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  .dimension-label {
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .dimension-fixed {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .dimension-required {
    margin-left: 2px;
    color: var(--el-color-danger);
  }
</style>
