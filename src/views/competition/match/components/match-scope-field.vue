<!-- 比赛参赛范围：主页面摘要 + 弹窗配置 -->
<template>
  <div class="match-scope-field">
    <el-alert
      v-if="activityId && stageId && !stageOptions.length"
      type="warning"
      :closable="false"
      show-icon
      title="当前活动暂无可用赛段，请先在活动管理中配置赛段。"
      style="margin-bottom: 12px"
    />

    <template v-if="stageId">
      <div class="scope-summary-card">
        <div class="scope-summary-content">
          <div class="scope-mode-line">
            <span class="scope-label">参赛范围：</span>
            <span>{{ modeText }}</span>
          </div>
          <div class="scope-summary-line">
            <span class="scope-label">范围摘要：</span>
            <span>{{ summaryText }}</span>
          </div>
        </div>
        <el-button type="primary" link :disabled="disabled" @click="openDialog">修改范围</el-button>
      </div>
    </template>

    <div v-else-if="activityId" class="scope-placeholder">请先选择所属赛段</div>
    <div v-else class="scope-placeholder">请先选择所属活动</div>

    <el-dialog
      v-model="dialogVisible"
      title="修改参赛范围"
      width="720px"
      destroy-on-close
      draggable
    >
      <div class="scope-dialog-body">
        <el-form label-width="96px">
          <el-form-item label="范围模式" required>
            <el-radio-group v-model="draftMode" @change="handleDraftModeChange">
              <el-radio value="default">默认范围</el-radio>
              <el-radio value="specified">指定范围</el-radio>
            </el-radio-group>
          </el-form-item>

          <template v-if="draftMode === 'default'">
            <div class="default-scope-block">
              <div>默认范围：继承所属赛段参赛范围</div>
              <div class="scope-muted">范围摘要：{{ inheritedSummaryText }}</div>
            </div>
          </template>

          <template v-else>
            <el-form-item v-if="showRegionPicker" label="参赛区域" required>
              <el-cascader
                v-model="draftScope.regions"
                :options="regionOptions"
                :props="regionProps"
                clearable
                collapse-tags
                collapse-tags-tooltip
                placeholder="请选择参赛区域"
                class="ele-fluid"
                @change="handleRegionsChange"
              />
            </el-form-item>

            <el-form-item v-else-if="regionReadonlyText" label="参赛区域">
              <span class="readonly-text">{{ regionReadonlyText }}</span>
            </el-form-item>

            <template v-if="hasSelectedRegions">
              <el-form-item label="学校范围" required>
                <el-radio-group v-model="draftScope.schoolMode" @change="handleSchoolModeChange">
                  <el-radio :value="SCOPE_MODE_ALL">全部学校</el-radio>
                  <el-radio :value="SCOPE_MODE_SPECIFIED">指定学校</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item
                v-if="draftScope.schoolMode === SCOPE_MODE_SPECIFIED"
                label="指定学校"
                required
              >
                <el-select
                  v-model="draftScope.schools"
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  filterable
                  placeholder="请选择学校"
                  class="ele-fluid"
                  @change="handleSchoolsChange"
                >
                  <el-option
                    v-for="item in schoolOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </template>

            <template v-if="schoolRangeReady">
              <el-form-item label="学段范围" required>
                <el-radio-group v-model="draftScope.stageMode" @change="handleStageModeChange">
                  <el-radio :value="SCOPE_MODE_ALL">全部学段</el-radio>
                  <el-radio :value="SCOPE_MODE_SPECIFIED">指定学段</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item
                v-if="draftScope.stageMode === SCOPE_MODE_SPECIFIED"
                label="指定学段"
                required
              >
                <el-select
                  v-model="draftScope.stages"
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  placeholder="请选择学段"
                  class="ele-fluid"
                  @change="handleStagesChange"
                >
                  <el-option
                    v-for="item in stageSelectOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </template>

            <template v-if="stageRangeReady">
              <el-form-item label="年级范围" required>
                <el-radio-group v-model="draftScope.gradeMode" @change="handleGradeModeChange">
                  <el-radio :value="SCOPE_MODE_ALL">全部年级</el-radio>
                  <el-radio :value="SCOPE_MODE_SPECIFIED">指定年级</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item
                v-if="draftScope.gradeMode === SCOPE_MODE_SPECIFIED"
                label="指定年级"
                required
              >
                <el-select
                  v-model="draftScope.grades"
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  placeholder="请选择年级"
                  class="ele-fluid"
                >
                  <el-option v-for="item in gradeOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </template>
          </template>
        </el-form>

        <div class="dialog-summary">
          <span class="scope-label">范围摘要：</span>
          <span>{{ draftSummaryText }}</span>
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmScope">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import {
    REGION_OPTIONS,
    SCOPE_MODE_ALL,
    SCOPE_MODE_SPECIFIED,
    STAGE_GRADE_MAP,
    clampScopeToParent,
    clone,
    filterRegionOptionsByPaths,
    formatRegionReadonlyLabel,
    getAvailableGradeOptions,
    getAvailableSchoolOptions,
    getAvailableStageOptions,
    getParentScopeConstraints,
    validateScopeConfig,
    validateScopeWithinParent
  } from '@/views/competition/activity/scope-utils.js';
  import { findActivity } from '@/views/competition/activity/data.js';
  import {
    createDefaultMatchScope,
    formatMatchScopeSummary,
    getStageEffectiveScope,
    getStageOptions,
    isMatchScopeInherit
  } from '../data.js';

  const props = defineProps({
    modelValue: {
      type: Object,
      default: () => createDefaultMatchScope()
    },
    activityId: [Number, String],
    stageId: String,
    disabled: Boolean
  });

  const emit = defineEmits(['update:modelValue']);

  const innerScope = ref(createDefaultMatchScope());
  const dialogVisible = ref(false);
  const draftMode = ref('default');
  const draftScope = ref(createDefaultMatchScope());

  const regionProps = {
    multiple: true,
    checkStrictly: true,
    emitPath: true,
    value: 'value',
    label: 'label',
    children: 'children'
  };

  const activity = computed(() => findActivity(props.activityId));
  const stage = computed(() =>
    activity.value?.stages?.find((d) => d.stageId === props.stageId)
  );
  const stageOptions = computed(() =>
    props.activityId ? getStageOptions(props.activityId) : []
  );
  const stageEffectiveScope = computed(() =>
    getStageEffectiveScope(stage.value, activity.value)
  );
  const parentConstraints = computed(() => getParentScopeConstraints(stageEffectiveScope.value));
  const regionOptions = computed(() =>
    parentConstraints.value.regionSpecified
      ? filterRegionOptionsByPaths(parentConstraints.value.regionPaths, REGION_OPTIONS)
      : REGION_OPTIONS
  );
  const showRegionPicker = computed(() => !parentConstraints.value.regionSpecified);
  const regionReadonlyText = computed(() => {
    if (parentConstraints.value.regionSpecified) {
      return formatRegionReadonlyLabel(parentConstraints.value.regionPaths);
    }
    return formatRegionReadonlyLabel(draftScope.value.regions);
  });
  const hasSelectedRegions = computed(() => {
    if (parentConstraints.value.regionSpecified) {
      return true;
    }
    return !!draftScope.value.regions?.length;
  });
  const schoolOptions = computed(() =>
    getAvailableSchoolOptions(draftScope.value, stageEffectiveScope.value)
  );
  const schoolRangeReady = computed(() => {
    if (!hasSelectedRegions.value) {
      return false;
    }
    return (
      draftScope.value.schoolMode === SCOPE_MODE_ALL ||
      !!draftScope.value.schools?.length
    );
  });
  const stageSelectOptions = computed(() =>
    getAvailableStageOptions(draftScope.value, stageEffectiveScope.value)
  );
  const stageRangeReady = computed(
    () =>
      schoolRangeReady.value &&
      draftScope.value.stageMode === SCOPE_MODE_SPECIFIED &&
      !!draftScope.value.stages?.length
  );
  const gradeOptions = computed(() => {
    const stages = draftScope.value.stages?.length
      ? draftScope.value.stages
      : stageSelectOptions.value.map((item) => item.value);
    const grades = [];
    stages.forEach((stageName) => {
      (STAGE_GRADE_MAP[stageName] ?? []).forEach((grade) => {
        if (!grades.includes(grade)) {
          grades.push(grade);
        }
      });
    });
    const allowed = getAvailableGradeOptions(draftScope.value, stageEffectiveScope.value);
    return grades.filter((grade) => allowed.includes(grade));
  });

  const modeText = computed(() =>
    isMatchScopeInherit(innerScope.value)
      ? '默认范围（继承所属赛段参赛范围）'
      : '指定范围'
  );
  const summaryText = computed(() =>
    formatMatchScopeSummary({ scope: innerScope.value }, activity.value, stage.value)
  );
  const inheritedSummaryText = computed(() =>
    formatMatchScopeSummary({ scope: createDefaultMatchScope() }, activity.value, stage.value)
  );
  const draftSummaryText = computed(() => {
    if (draftMode.value === 'default') {
      return inheritedSummaryText.value;
    }
    return formatMatchScopeSummary({ scope: draftScope.value }, activity.value, stage.value);
  });

  const syncFromProps = () => {
    innerScope.value = clone({
      ...createDefaultMatchScope(),
      ...props.modelValue
    });
  };

  watch(
    () => props.modelValue,
    () => syncFromProps(),
    { immediate: true, deep: true }
  );

  watch(
    () => props.stageId,
    () => {
      if (!props.stageId) {
        innerScope.value = createDefaultMatchScope();
        emit('update:modelValue', createDefaultMatchScope());
      }
    }
  );

  const initSpecifiedScope = () => {
    const next = {
      ...createDefaultMatchScope(),
      customized: true,
      regionMode: SCOPE_MODE_SPECIFIED,
      schoolMode: SCOPE_MODE_ALL,
      stageMode: SCOPE_MODE_ALL,
      gradeMode: SCOPE_MODE_ALL
    };
    if (parentConstraints.value.regionSpecified) {
      next.regions = clone(parentConstraints.value.regionPaths);
    }
    draftScope.value = clampScopeToParent(next, stageEffectiveScope.value);
  };

  const normalizeDraftForDialog = () => {
    if (isMatchScopeInherit(innerScope.value)) {
      draftMode.value = 'default';
      draftScope.value = createDefaultMatchScope();
      return;
    }
    draftMode.value = 'specified';
    draftScope.value = clampScopeToParent(
      {
        ...createDefaultMatchScope(),
        ...clone(innerScope.value),
        customized: true,
        regionMode: SCOPE_MODE_SPECIFIED
      },
      stageEffectiveScope.value
    );
  };

  const openDialog = () => {
    normalizeDraftForDialog();
    dialogVisible.value = true;
  };

  const handleDraftModeChange = (mode) => {
    if (mode === 'default') {
      draftScope.value = createDefaultMatchScope();
    } else {
      initSpecifiedScope();
    }
  };

  const handleRegionsChange = () => {
    draftScope.value.regionMode = SCOPE_MODE_SPECIFIED;
    draftScope.value.customized = true;
    draftScope.value.schoolMode = SCOPE_MODE_ALL;
    draftScope.value.schools = [];
    draftScope.value.stageMode = SCOPE_MODE_ALL;
    draftScope.value.stages = [];
    draftScope.value.gradeMode = SCOPE_MODE_ALL;
    draftScope.value.grades = [];
  };

  const handleSchoolModeChange = (mode) => {
    if (mode === SCOPE_MODE_ALL) {
      draftScope.value.schools = [];
    }
    draftScope.value.stageMode = SCOPE_MODE_ALL;
    draftScope.value.stages = [];
    draftScope.value.gradeMode = SCOPE_MODE_ALL;
    draftScope.value.grades = [];
  };

  const handleSchoolsChange = () => {
    const allowedSchools = schoolOptions.value.map((item) => item.value);
    draftScope.value.schools = (draftScope.value.schools ?? []).filter((id) =>
      allowedSchools.includes(id)
    );
    draftScope.value.stageMode = SCOPE_MODE_ALL;
    draftScope.value.stages = [];
    draftScope.value.gradeMode = SCOPE_MODE_ALL;
    draftScope.value.grades = [];
  };

  const handleStageModeChange = (mode) => {
    if (mode === SCOPE_MODE_ALL) {
      draftScope.value.stages = [];
    }
    draftScope.value.gradeMode = SCOPE_MODE_ALL;
    draftScope.value.grades = [];
  };

  const handleStagesChange = () => {
    const allowedStages = stageSelectOptions.value.map((item) => item.value);
    draftScope.value.stages = (draftScope.value.stages ?? []).filter((stageName) =>
      allowedStages.includes(stageName)
    );
    const allowedGrades = gradeOptions.value;
    draftScope.value.grades = (draftScope.value.grades ?? []).filter((grade) =>
      allowedGrades.includes(grade)
    );
    draftScope.value.gradeMode = SCOPE_MODE_ALL;
  };

  const handleGradeModeChange = (mode) => {
    if (mode === SCOPE_MODE_ALL) {
      draftScope.value.grades = [];
    }
  };

  const validateDraftScope = (scope) => {
    if (!scope.regions?.length && !parentConstraints.value.regionSpecified) {
      return ['请选择参赛区域'];
    }
    if (scope.schoolMode === SCOPE_MODE_SPECIFIED && !scope.schools?.length) {
      return ['请选择指定学校'];
    }
    if (scope.stageMode === SCOPE_MODE_SPECIFIED && !scope.stages?.length) {
      return ['请选择指定学段'];
    }
    if (scope.gradeMode === SCOPE_MODE_SPECIFIED && !scope.grades?.length) {
      return ['请选择指定年级'];
    }
    return [
      ...validateScopeConfig(scope, { isStage: true, labelPrefix: '参赛', activitySpecified: true }),
      ...validateScopeWithinParent(scope, stageEffectiveScope.value, { labelPrefix: '参赛' })
    ];
  };

  const confirmScope = () => {
    if (draftMode.value === 'default') {
      innerScope.value = createDefaultMatchScope();
      emit('update:modelValue', createDefaultMatchScope());
      dialogVisible.value = false;
      return;
    }

    const normalized = clampScopeToParent(
      {
        ...draftScope.value,
        customized: true,
        regionMode: SCOPE_MODE_SPECIFIED,
        classMode: SCOPE_MODE_ALL,
        classes: []
      },
      stageEffectiveScope.value
    );
    const errors = validateDraftScope(normalized);
    if (errors.length) {
      EleMessage.error({ message: errors[0], plain: true });
      return;
    }
    innerScope.value = clone(normalized);
    emit('update:modelValue', clone(normalized));
    dialogVisible.value = false;
  };
</script>

<style scoped lang="scss">
  .match-scope-field {
    width: 100%;
  }

  .scope-summary-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 14px;
    background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-extra-light);
    border-radius: 6px;
  }

  .scope-summary-content {
    min-width: 0;
    font-size: 13px;
    line-height: 1.7;
    color: var(--el-text-color-regular);
  }

  .scope-label,
  .scope-muted {
    color: var(--el-text-color-secondary);
  }

  .scope-dialog-body {
    padding-right: 8px;
  }

  .default-scope-block,
  .dialog-summary {
    padding: 12px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--el-text-color-regular);
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
  }

  .dialog-summary {
    margin-top: 12px;
  }

  .readonly-text,
  .scope-placeholder {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
</style>
