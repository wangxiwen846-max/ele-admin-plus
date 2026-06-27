<!-- 范围配置表单（活动覆盖 / 赛段参赛共用） -->
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
          v-model="innerScope[item.modeKey]"
          :disabled="disabled"
          @change="() => handleModeChange(item)"
        >
          <el-radio :value="SCOPE_MODE_ALL">{{ item.allLabel }}</el-radio>
          <el-radio :value="SCOPE_MODE_SPECIFIED">{{ item.specifiedLabel }}</el-radio>
        </el-radio-group>
      </div>
      <div
        v-if="item.hideModeRadio || innerScope[item.modeKey] === SCOPE_MODE_SPECIFIED"
        class="dimension-body"
        :class="{ 'dimension-body--no-radio': item.hideModeRadio }"
      >
        <div v-if="!item.hideModeRadio" class="dimension-toolbar">
          <el-button
            v-if="item.key !== 'region'"
            link
            type="primary"
            :disabled="disabled || !getOptionValues(item).length"
            @click="selectAll(item)"
          >
            全选
          </el-button>
          <el-button
            link
            type="primary"
            :disabled="disabled"
            @click="clearSpecified(item)"
          >
            清空
          </el-button>
        </div>
        <el-cascader
          v-if="item.key === 'region'"
          v-model="innerScope.regions"
          :options="regionOptions"
          :props="regionProps"
          clearable
          collapse-tags
          collapse-tags-tooltip
          :disabled="disabled"
          placeholder="请选择指定地区"
          class="ele-fluid"
          @change="() => syncLowerLevels('region')"
        />
        <el-select
          v-else
          v-model="innerScope[item.valueKey]"
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
        v-model="innerScope.remark"
        type="textarea"
        :rows="3"
        :maxlength="300"
        :disabled="disabled"
        placeholder="对覆盖对象的补充说明"
      />
    </el-form-item>
  </div>
</template>

<script setup>
  import { computed, watch } from 'vue';
  import {
    REGION_OPTIONS,
    SCOPE_MODE_ALL,
    SCOPE_MODE_SPECIFIED,
    getAvailableClassOptions,
    getAvailableGradeOptions,
    getAvailableSchoolOptions,
    getAvailableStageOptions,
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
    /** default：赛段等；activity-specified：活动指定范围模式 */
    variant: {
      type: String,
      default: 'default'
    }
  });

  const emit = defineEmits(['update:modelValue']);

  const innerScope = computed({
    get: () => migrateLegacyScope(props.modelValue),
    set: (value) => emit('update:modelValue', value)
  });

  const isActivitySpecified = computed(() => props.variant === 'activity-specified');

  watch(
    isActivitySpecified,
    (value) => {
      if (value && innerScope.value.regionMode !== SCOPE_MODE_SPECIFIED) {
        patchScope({ regionMode: SCOPE_MODE_SPECIFIED });
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

  const dimensionConfigs = computed(() => [
    {
      key: 'region',
      label: `${props.labelPrefix}区域`,
      modeKey: 'regionMode',
      valueKey: 'regions',
      allLabel: '全国',
      specifiedLabel: '指定地区',
      placeholder: '请选择指定地区',
      hideModeRadio: isActivitySpecified.value,
      required: isActivitySpecified.value
    },
    {
      key: 'school',
      label: `${props.labelPrefix}学校`,
      modeKey: 'schoolMode',
      valueKey: 'schools',
      allLabel: isActivitySpecified.value ? '所选区域内全部学校' : '全部学校',
      specifiedLabel: '指定学校',
      placeholder: '请选择指定学校'
    },
    {
      key: 'stage',
      label: `${props.labelPrefix}学段`,
      modeKey: 'stageMode',
      valueKey: 'stages',
      allLabel: '全部学段',
      specifiedLabel: '指定学段',
      placeholder: '请选择指定学段'
    },
    {
      key: 'grade',
      label: `${props.labelPrefix}年级`,
      modeKey: 'gradeMode',
      valueKey: 'grades',
      allLabel: '全部年级',
      specifiedLabel: '指定年级',
      placeholder: '请选择指定年级'
    },
    {
      key: 'class',
      label: `${props.labelPrefix}班级`,
      modeKey: 'classMode',
      valueKey: 'classes',
      allLabel: '全部班级',
      specifiedLabel: '指定班级',
      placeholder: '请选择指定班级'
    }
  ]);

  const visibleDimensionConfigs = computed(() => dimensionConfigs.value);

  const regionOptions = computed(() => REGION_OPTIONS);

  const getOptions = (item) => {
    const scope = innerScope.value;
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
    emit('update:modelValue', {
      ...innerScope.value,
      ...patch
    });
  };

  const handleModeChange = (item) => {
    const patch = {};
    if (innerScope.value[item.modeKey] === SCOPE_MODE_ALL) {
      patch[item.valueKey] = [];
    }
    patchScope(patch);
    if (item.key === 'stage') {
      syncGrades();
    }
    if (item.key === 'grade' || item.key === 'school' || item.key === 'region') {
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
    const allowed = getAvailableGradeOptions(innerScope.value, props.parentScope);
    patchScope({
      grades: (innerScope.value.grades ?? []).filter((grade) => allowed.includes(grade))
    });
  };

  const syncClasses = () => {
    const allowed = getAvailableClassOptions(innerScope.value, props.parentScope).map(
      (item) => item.value
    );
    patchScope({
      classes: (innerScope.value.classes ?? []).filter((id) => allowed.includes(id))
    });
  };

  const syncLowerLevels = (changedKey) => {
    const patch = {};
    if (changedKey === 'region' || changedKey === 'school') {
      const schools = getAvailableSchoolOptions(innerScope.value, props.parentScope).map(
        (item) => item.value
      );
      patch.schools = (innerScope.value.schools ?? []).filter((id) => schools.includes(id));
    }
    if (changedKey === 'region' || changedKey === 'school' || changedKey === 'stage') {
      const grades = getAvailableGradeOptions(
        { ...innerScope.value, ...patch },
        props.parentScope
      );
      patch.grades = (innerScope.value.grades ?? []).filter((grade) => grades.includes(grade));
    }
    const classes = getAvailableClassOptions(
      { ...innerScope.value, ...patch },
      props.parentScope
    ).map((item) => item.value);
    patch.classes = (innerScope.value.classes ?? []).filter((id) => classes.includes(id));
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
      patchScope({ [item.valueKey]: [] });
      syncLowerLevels(item.key);
      return;
    }
    patchScope({
      [item.modeKey]: SCOPE_MODE_ALL,
      [item.valueKey]: []
    });
  };
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

  .remark-item {
    margin-bottom: 0;
  }
</style>
