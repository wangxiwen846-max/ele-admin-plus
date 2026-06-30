<!-- 范围配置表单（活动覆盖 / 赛段参赛 / 比赛缩小共用） -->
<template>
  <div class="scope-config-panel">
    <div v-for="item in visibleDimensionConfigs" :key="item.key" class="scope-dimension">
      <div class="dimension-head">
        <span class="dimension-label">
          {{ item.label }}
          <span v-if="item.required" class="dimension-required">*</span>
        </span>
        <el-radio-group
          v-if="!item.hideModeRadio"
          v-model="localScope[item.modeKey]"
          :disabled="disabled"
          @change="() => handleModeChange(item)"
        >
          <el-radio :value="SCOPE_MODE_ALL">{{ item.allLabel }}</el-radio>
          <el-radio :value="SCOPE_MODE_SPECIFIED">{{ item.specifiedLabel }}</el-radio>
        </el-radio-group>
        <span v-else-if="item.fixedLabel" class="dimension-fixed">{{ item.fixedLabel }}</span>
      </div>
      <div
        v-if="shouldShowDimensionBody(item)"
        class="dimension-body"
        :class="{ 'dimension-body--no-radio': item.hideModeRadio }"
      >
        <div
          v-if="item.key === 'class' && isClassPickBlocked"
          class="dimension-tip"
        >
          请先选择指定学校
        </div>
        <div v-else-if="!item.hideModeRadio" class="dimension-toolbar">
          <el-button
            v-if="item.key !== 'region'"
            link
            type="primary"
            :disabled="disabled || !getOptionValues(item).length"
            @click="selectAll(item)"
          >
            全选
          </el-button>
          <el-button link type="primary" :disabled="disabled" @click="clearSpecified(item)">
            清空
          </el-button>
        </div>
        <el-cascader
          v-if="item.key === 'region'"
          v-model="localScope.regions"
          :options="regionOptions"
          :props="regionProps"
          clearable
          collapse-tags
          collapse-tags-tooltip
          :disabled="disabled"
          :placeholder="item.placeholder"
          class="ele-fluid"
          @change="() => syncLowerLevels('region')"
        />
        <el-select
          v-else-if="!isClassPickBlocked"
          v-model="localScope[item.valueKey]"
          multiple
          collapse-tags
          collapse-tags-tooltip
          filterable
          :disabled="disabled"
          :placeholder="item.placeholder"
          class="ele-fluid"
          @change="() => handleValueChange(item)"
        >
          <el-option
            v-for="option in getOptions(item)"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>
    </div>

    <el-form-item v-if="showRemark" label="覆盖对象说明" label-width="108px" class="remark-item">
      <el-input
        v-model="localScope.remark"
        type="textarea"
        :rows="3"
        :maxlength="300"
        :disabled="disabled"
        placeholder="例如：面向北京市海淀区指定学校三年级、四年级学生开展。"
      />
    </el-form-item>
  </div>
</template>

<script setup>
  import { computed, ref, watch, nextTick } from 'vue';
  import {
    REGION_OPTIONS,
    SCOPE_MODE_ALL,
    SCOPE_MODE_SPECIFIED,
    clone,
    filterRegionOptionsByPaths,
    formatRegionShortLabel,
    getAvailableClassOptions,
    getAvailableGradeOptions,
    getAvailableSchoolOptions,
    getAvailableStageOptions,
    getParentScopeConstraints,
    migrateLegacyScope
  } from '../scope-utils.js';

  const props = defineProps({
    modelValue: {
      type: Object,
      required: true
    },
    parentScope: Object,
    disabled: Boolean,
    showRemark: {
      type: Boolean,
      default: false
    },
    labelPrefix: {
      type: String,
      default: '覆盖'
    },
    /** default | activity-specified | match-narrow */
    variant: {
      type: String,
      default: 'default'
    }
  });

  const emit = defineEmits(['update:modelValue']);

  const localScope = ref(migrateLegacyScope(props.modelValue));
  let syncingFromParent = false;

  watch(
    () => props.modelValue,
    (value) => {
      syncingFromParent = true;
      localScope.value = migrateLegacyScope(value);
      nextTick(() => {
        syncingFromParent = false;
      });
    },
    { deep: true }
  );

  watch(
    localScope,
    (value) => {
      if (syncingFromParent) {
        return;
      }
      emit('update:modelValue', clone(value));
    },
    { deep: true }
  );

  const isActivitySpecified = computed(() => props.variant === 'activity-specified');
  const isMatchNarrow = computed(() => props.variant === 'match-narrow');
  const hasParent = computed(() => !!props.parentScope);
  const parentConstraints = computed(() =>
    hasParent.value ? getParentScopeConstraints(props.parentScope) : null
  );

  const allSchoolLabel = computed(() => {
    if (hasParent.value) {
      return '当前范围内全部学校';
    }
    if (isActivitySpecified.value) {
      return '所选地区内全部学校';
    }
    return '全部学校';
  });

  const allStageLabel = computed(() =>
    hasParent.value ? '当前范围内全部学段' : '全部学段'
  );
  const allGradeLabel = computed(() =>
    hasParent.value ? '当前范围内全部年级' : '全部年级'
  );
  const allClassLabel = computed(() =>
    hasParent.value ? '当前范围内全部班级' : '全部班级'
  );

  watch(
    isActivitySpecified,
    (value) => {
      if (value && localScope.value.regionMode !== SCOPE_MODE_SPECIFIED) {
        patchScope({ regionMode: SCOPE_MODE_SPECIFIED });
      }
    },
    { immediate: true }
  );

  watch(
    () => parentConstraints.value?.regionSpecified,
    (specified) => {
      if (specified && localScope.value.regionMode !== SCOPE_MODE_SPECIFIED) {
        patchScope({
          regionMode: SCOPE_MODE_SPECIFIED,
          regions: localScope.value.regions?.length
            ? localScope.value.regions
            : parentConstraints.value.regionPaths
        });
      }
    },
    { immediate: true }
  );

  const regionProps = {
    multiple: true,
    checkStrictly: true,
    emitPath: true,
    value: 'value',
    label: 'label',
    children: 'children'
  };

  const buildRegionConfig = () => {
    const constraints = parentConstraints.value;
    if (constraints?.regionSpecified) {
      const labels = constraints.regionPaths
        .map((path) => formatRegionShortLabel(path))
        .join('、');
      return {
        key: 'region',
        label: `${props.labelPrefix}地区`,
        modeKey: 'regionMode',
        valueKey: 'regions',
        hideModeRadio: true,
        fixedLabel: `当前范围内地区（${labels}）`,
        placeholder: '请选择当前范围内地区',
        required: true
      };
    }
    if (hasParent.value && !constraints?.isNational) {
      return {
        key: 'region',
        label: `${props.labelPrefix}地区`,
        modeKey: 'regionMode',
        valueKey: 'regions',
        allLabel: '当前范围内全部地区',
        specifiedLabel: '指定地区',
        placeholder: '请选择指定地区',
        required: false
      };
    }
    if (constraints?.isNational && (isMatchNarrow.value || hasParent.value)) {
      return {
        key: 'region',
        label: `${props.labelPrefix}地区`,
        modeKey: 'regionMode',
        valueKey: 'regions',
        hideModeRadio: true,
        fixedLabel: '全国范围（可指定缩小地区）',
        placeholder: '请选择要缩小的地区',
        required: false
      };
    }
    if (isActivitySpecified.value) {
      return {
        key: 'region',
        label: `${props.labelPrefix}地区`,
        modeKey: 'regionMode',
        valueKey: 'regions',
        hideModeRadio: true,
        fixedLabel: isMatchNarrow.value ? '指定地区' : void 0,
        placeholder: '请选择省 / 市 / 区县（可多选）',
        required: true
      };
    }
    return {
      key: 'region',
      label: `${props.labelPrefix}地区`,
      modeKey: 'regionMode',
      valueKey: 'regions',
      allLabel: '全国',
      specifiedLabel: '指定地区',
      placeholder: '请选择指定地区',
      required: false
    };
  };

  const needsRegionPickFirst = computed(() => {
    const constraints = parentConstraints.value;
    return !!constraints?.isNational && (isMatchNarrow.value || hasParent.value);
  });

  watch(
    () => localScope.value.regions,
    (regions) => {
      if (
        needsRegionPickFirst.value &&
        regions?.length &&
        localScope.value.regionMode !== SCOPE_MODE_SPECIFIED
      ) {
        patchScope({ regionMode: SCOPE_MODE_SPECIFIED });
      }
    },
    { deep: true }
  );

  const isClassPickBlocked = computed(() => {
    if (localScope.value.classMode !== SCOPE_MODE_SPECIFIED) {
      return false;
    }
    const constraints = parentConstraints.value;
    if (constraints?.schoolSpecified) {
      return false;
    }
    return localScope.value.schoolMode !== SCOPE_MODE_SPECIFIED;
  });

  const shouldShowDimensionBody = (item) => {
    if (item.hideModeRadio) {
      return true;
    }
    if (localScope.value[item.modeKey] !== SCOPE_MODE_SPECIFIED) {
      return false;
    }
    if (item.key === 'class' && isClassPickBlocked.value) {
      return true;
    }
    return true;
  };

  const isRegionLevelReady = () => {
    const constraints = parentConstraints.value;
    if (constraints?.regionSpecified) {
      return true;
    }
    if (needsRegionPickFirst.value) {
      return !!(localScope.value.regions?.length);
    }
    return true;
  };

  const isSchoolLevelReady = () => {
    if (!isRegionLevelReady()) {
      return false;
    }
    const constraints = parentConstraints.value;
    if (constraints?.schoolSpecified) {
      return true;
    }
    return true;
  };

  const isStageLevelReady = () => isSchoolLevelReady();
  const isGradeLevelReady = () => isStageLevelReady();

  const isDimensionVisible = (item) => {
    if (!hasParent.value && !isMatchNarrow.value) {
      return true;
    }
    if (item.key === 'region') {
      return true;
    }
    if (item.key === 'school') {
      return isRegionLevelReady();
    }
    if (item.key === 'stage') {
      return isSchoolLevelReady();
    }
    if (item.key === 'grade') {
      return isStageLevelReady();
    }
    if (item.key === 'class') {
      return isGradeLevelReady();
    }
    return true;
  };

  const dimensionConfigs = computed(() => [
    buildRegionConfig(),
    {
      key: 'school',
      label: `${props.labelPrefix}学校`,
      modeKey: 'schoolMode',
      valueKey: 'schools',
      allLabel: allSchoolLabel.value,
      specifiedLabel: '指定学校',
      placeholder: '请选择指定学校'
    },
    {
      key: 'stage',
      label: `${props.labelPrefix}学段`,
      modeKey: 'stageMode',
      valueKey: 'stages',
      allLabel: allStageLabel.value,
      specifiedLabel: '指定学段',
      placeholder: '请选择指定学段'
    },
    {
      key: 'grade',
      label: `${props.labelPrefix}年级`,
      modeKey: 'gradeMode',
      valueKey: 'grades',
      allLabel: allGradeLabel.value,
      specifiedLabel: '指定年级',
      placeholder: '请选择指定年级'
    },
    {
      key: 'class',
      label: `${props.labelPrefix}班级`,
      modeKey: 'classMode',
      valueKey: 'classes',
      allLabel: allClassLabel.value,
      specifiedLabel: '指定班级',
      placeholder: '请选择指定班级'
    }
  ]);

  const visibleDimensionConfigs = computed(() =>
    dimensionConfigs.value.filter((item) => isDimensionVisible(item))
  );

  const regionOptions = computed(() => {
    const constraints = parentConstraints.value;
    if (constraints?.regionSpecified) {
      return filterRegionOptionsByPaths(constraints.regionPaths, REGION_OPTIONS);
    }
    return REGION_OPTIONS;
  });

  const getOptions = (item) => {
    const scope = localScope.value;
    if (item.key === 'school') {
      return getAvailableSchoolOptions(scope, props.parentScope).map((school) => ({
        label: school.label,
        value: school.value
      }));
    }
    if (item.key === 'stage') {
      return getAvailableStageOptions(scope, props.parentScope);
    }
    if (item.key === 'grade') {
      return getAvailableGradeOptions(scope, props.parentScope).map((grade) => ({
        label: grade,
        value: grade
      }));
    }
    if (item.key === 'class') {
      return getAvailableClassOptions(scope, props.parentScope).map((cls) => ({
        label: cls.label,
        value: cls.value
      }));
    }
    return [];
  };

  const getOptionValues = (item) => getOptions(item).map((option) => option.value);

  const patchScope = (patch) => {
    localScope.value = {
      ...localScope.value,
      ...patch
    };
  };

  const handleModeChange = (item) => {
    const patch = {};
    if (localScope.value[item.modeKey] === SCOPE_MODE_ALL) {
      patch[item.valueKey] = [];
    }
    if (item.key === 'class' && localScope.value.classMode === SCOPE_MODE_ALL) {
      patch.classes = [];
    }
    if (item.key === 'region' && parentConstraints.value?.regionSpecified) {
      return;
    }
    patchScope(patch);
    if (item.key === 'stage') {
      syncGrades();
    }
    if (item.key === 'grade' || item.key === 'school' || item.key === 'region' || item.key === 'class') {
      syncLowerLevels(item.key);
    }
  };

  const handleValueChange = (item) => {
    if (item.key === 'stage') {
      syncGrades();
    }
    if (item.key === 'grade') {
      syncClasses();
    }
  };

  const syncGrades = () => {
    const allowed = getAvailableGradeOptions(localScope.value, props.parentScope);
    patchScope({
      grades: (localScope.value.grades ?? []).filter((grade) => allowed.includes(grade))
    });
  };

  const syncClasses = () => {
    const allowed = getAvailableClassOptions(localScope.value, props.parentScope).map(
      (item) => item.value
    );
    patchScope({
      classes: (localScope.value.classes ?? []).filter((id) => allowed.includes(id))
    });
  };

  const syncLowerLevels = (changedKey) => {
    const patch = {};
    if (changedKey === 'region' || changedKey === 'school') {
      const schools = getAvailableSchoolOptions(localScope.value, props.parentScope).map(
        (item) => item.value
      );
      patch.schools = (localScope.value.schools ?? []).filter((id) => schools.includes(id));
    }
    if (changedKey === 'region' || changedKey === 'school' || changedKey === 'stage') {
      const grades = getAvailableGradeOptions(
        { ...localScope.value, ...patch },
        props.parentScope
      );
      patch.grades = (localScope.value.grades ?? []).filter((grade) => grades.includes(grade));
    }
    const classes = getAvailableClassOptions(
      { ...localScope.value, ...patch },
      props.parentScope
    ).map((item) => item.value);
    patch.classes = (localScope.value.classes ?? []).filter((id) => classes.includes(id));
    patchScope(patch);
  };

  const selectAll = (item) => {
    patchScope({
      [item.valueKey]: getOptionValues(item)
    });
    handleValueChange(item);
  };

  const clearSpecified = (item) => {
    if (item.hideModeRadio) {
      if (item.key === 'region' && parentConstraints.value?.regionSpecified) {
        patchScope({ regions: clonePaths(parentConstraints.value.regionPaths) });
      } else {
        patchScope({ [item.valueKey]: [] });
      }
      syncLowerLevels(item.key);
      return;
    }
    patchScope({
      [item.modeKey]: SCOPE_MODE_ALL,
      [item.valueKey]: []
    });
    syncLowerLevels(item.key);
  };

  function clonePaths(paths = []) {
    return paths.map((path) => [...path]);
  }
</script>

<style scoped lang="scss">
  .scope-config-panel {
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

  .dimension-fixed {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .dimension-required {
    margin-left: 2px;
    color: var(--el-color-danger);
  }

  .dimension-body {
    padding-left: 108px;

    &--no-radio {
      padding-left: 0;
    }
  }

  .dimension-toolbar {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  .dimension-tip {
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }

  .remark-item {
    margin-bottom: 0;
  }
</style>
