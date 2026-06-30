<!-- 活动覆盖范围配置弹窗 -->
<template>
  <ele-modal
    v-model="visible"
    title="配置活动覆盖范围"
    :width="760"
    :max-height="''"
    :body-style="{ overflow: 'auto', maxHeight: '65vh' }"
    :destroy-on-close="true"
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
    </div>

    <div v-else class="activity-scope-fields">
      <div class="scope-dimension">
        <div class="dimension-head">
          <span class="dimension-label">
            {{ labelPrefix }}地区<span class="dimension-required">*</span>
          </span>
          <span class="dimension-fixed">指定地区</span>
        </div>
        <el-cascader
          v-model="innerScope.regions"
          :options="REGION_OPTIONS"
          :props="regionProps"
          clearable
          collapse-tags
          collapse-tags-tooltip
          :disabled="disabled"
          placeholder="请选择省 / 市 / 区县（可多选）"
          class="ele-fluid"
          @change="syncLowerLevels"
        />
      </div>

      <div v-if="hasSelectedRegions" class="scope-dimension">
        <div class="dimension-head">
          <span class="dimension-label">学校范围</span>
          <el-radio-group v-model="innerScope.schoolMode" :disabled="disabled" @change="handleSchoolModeChange">
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
          :disabled="disabled"
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
          <el-radio-group v-model="innerScope.stageMode" :disabled="disabled" @change="handleStageModeChange">
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
          :disabled="disabled"
          placeholder="请选择指定学段"
          class="ele-fluid"
          @change="syncGradesAndClasses"
        >
          <el-option
            v-for="item in coverageStageOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <div v-if="stageRangeReady" class="scope-dimension">
        <div class="dimension-head">
          <span class="dimension-label">年级范围</span>
          <el-radio-group v-model="innerScope.gradeMode" :disabled="disabled" @change="handleGradeModeChange">
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
          :disabled="disabled"
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
          <el-radio-group v-model="innerScope.classMode" :disabled="disabled" @change="handleClassModeChange">
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
          :disabled="disabled"
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

      <el-form-item v-if="showRemark" label="覆盖对象说明" label-width="108px" class="remark-item">
        <el-input
          v-model="innerScope.remark"
          type="textarea"
          :rows="3"
          :maxlength="300"
          :disabled="disabled"
          placeholder="填写覆盖对象的补充说明，例如面向北京市海淀区指定学校三年级、四年级学生开展。"
        />
      </el-form-item>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import {
    COVERAGE_MODE_NATIONAL,
    COVERAGE_MODE_SPECIFIED,
    REGION_OPTIONS,
    SCOPE_MODE_ALL,
    SCOPE_MODE_SPECIFIED,
    clone,
    createDefaultScope,
    createNationalScope,
    getAvailableClassOptions,
    getAvailableSchoolOptions,
    STAGE_GRADE_MAP,
    getCoverageMode,
    validateCoverageAgainstStages,
    validateScopeConfig
  } from '../scope-utils.js';

  const props = defineProps({
    modelValue: Boolean,
    scope: Object,
    stages: {
      type: Array,
      default: () => []
    },
    disabled: Boolean,
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
  const regionProps = {
    multiple: true,
    checkStrictly: true,
    emitPath: true,
    value: 'value',
    label: 'label',
    children: 'children'
  };

  const coverageStageOptions = ['小学', '初中', '高中'].map((item) => ({
    label: item,
    value: item
  }));

  const hasSelectedRegions = computed(() => !!innerScope.value.regions?.length);
  const schoolRangeReady = computed(() => {
    if (!hasSelectedRegions.value) {
      return false;
    }
    return (
      innerScope.value.schoolMode === SCOPE_MODE_ALL ||
      !!innerScope.value.schools?.length
    );
  });
  const stageRangeReady = computed(() => {
    if (!schoolRangeReady.value) {
      return false;
    }
    return (
      innerScope.value.stageMode === SCOPE_MODE_ALL ||
      !!innerScope.value.stages?.length
    );
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

  const schoolOptions = computed(() => getAvailableSchoolOptions(innerScope.value));
  const gradeOptions = computed(() => {
    const stages =
      innerScope.value.stageMode === SCOPE_MODE_SPECIFIED && innerScope.value.stages?.length
        ? innerScope.value.stages
        : coverageStageOptions.map((item) => item.value);
    const grades = [];
    stages.forEach((stage) => {
      (STAGE_GRADE_MAP[stage] ?? []).forEach((grade) => {
        if (!grades.includes(grade)) {
          grades.push(grade);
        }
      });
    });
    return grades;
  });
  const classOptions = computed(() => getAvailableClassOptions(innerScope.value));

  const initDialogState = () => {
    const scope = clone(props.scope ?? createDefaultScope());
    coverageMode.value = getCoverageMode(scope);
    if (coverageMode.value === COVERAGE_MODE_SPECIFIED) {
      innerScope.value = {
        ...scope,
        regionMode: SCOPE_MODE_SPECIFIED
      };
    } else {
      innerScope.value = createDefaultScope();
    }
  };

  watch(
    () => props.modelValue,
    (value) => {
      visible.value = value;
      if (value) {
        initDialogState();
      }
    },
    { immediate: true }
  );

  watch(visible, (value) => {
    emit('update:modelValue', value);
  });

  const handleCoverageModeChange = (mode) => {
    if (mode === COVERAGE_MODE_NATIONAL) {
      return;
    }
    innerScope.value = {
      ...createDefaultScope(),
      regionMode: SCOPE_MODE_SPECIFIED,
      schoolMode: SCOPE_MODE_ALL,
      stageMode: SCOPE_MODE_ALL,
      gradeMode: SCOPE_MODE_ALL,
      classMode: SCOPE_MODE_ALL
    };
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
    const allowedSchools = schoolOptions.value.map((item) => item.value);
    innerScope.value.schools = (innerScope.value.schools ?? []).filter((id) =>
      allowedSchools.includes(id)
    );
    if (innerScope.value.schoolMode !== SCOPE_MODE_SPECIFIED) {
      innerScope.value.classes = [];
      innerScope.value.classMode = SCOPE_MODE_ALL;
    }
    syncGradesAndClasses();
  };

  const syncGradesAndClasses = () => {
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

  const confirm = () => {
    if (coverageMode.value === COVERAGE_MODE_NATIONAL) {
      const nextCoverage = createNationalScope('');
      const stageErrors = validateCoverageAgainstStages(nextCoverage, props.stages);
      if (stageErrors.length) {
        EleMessage.error({ message: stageErrors[0], plain: true });
        return;
      }
      emit('confirm', nextCoverage);
      visible.value = false;
      return;
    }
    const errors = [
      ...validateScopeConfig(innerScope.value, {
        labelPrefix: props.labelPrefix,
        activitySpecified: true
      }),
      ...validateCoverageAgainstStages(innerScope.value, props.stages)
    ];
    if (errors.length) {
      EleMessage.error({ message: errors[0], plain: true });
      return;
    }
    emit(
      'confirm',
      clone({
        ...innerScope.value,
        regionMode: SCOPE_MODE_SPECIFIED,
        classMode: showClassConfig.value ? innerScope.value.classMode : SCOPE_MODE_ALL,
        classes: showClassConfig.value ? innerScope.value.classes : []
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
  }

  .activity-scope-fields {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .scope-dimension {
    padding: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
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
    width: 108px;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .dimension-fixed,
  .dimension-tip {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .dimension-required {
    margin-left: 2px;
    color: var(--el-color-danger);
  }

  .remark-item {
    margin-bottom: 0;
  }
</style>
