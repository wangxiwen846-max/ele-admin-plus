<!-- 覆盖范围 / 参赛范围字段 -->
<template>
  <el-row :gutter="16">
    <el-col :xs="24">
      <el-form-item :label="regionLabel" :prop="regionProp" :rules="regionRules">
        <el-cascader
          v-model="scope.regions"
          :options="REGION_OPTIONS"
          :props="regionProps"
          clearable
          collapse-tags
          collapse-tags-tooltip
          :disabled="disabled"
          placeholder="选择覆盖区域"
          class="ele-fluid"
        />
      </el-form-item>
    </el-col>
    <el-col :xs="24">
      <el-form-item label="覆盖学校">
        <el-select
          v-model="scope.schools"
          multiple
          collapse-tags
          collapse-tags-tooltip
          filterable
          :disabled="disabled"
          placeholder="选择覆盖学校"
          class="ele-fluid"
        >
          <el-option
            v-for="item in schoolOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :sm="12" :xs="24">
      <el-form-item label="覆盖学段">
        <el-select
          v-model="scope.stages"
          multiple
          collapse-tags
          :disabled="disabled"
          placeholder="选择学段"
          class="ele-fluid"
          @change="handleStageChange"
        >
          <el-option v-for="item in STAGE_OPTIONS" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :sm="12" :xs="24">
      <el-form-item label="覆盖年级">
        <el-select
          v-model="scope.grades"
          multiple
          collapse-tags
          collapse-tags-tooltip
          :disabled="disabled"
          placeholder="选择年级"
          class="ele-fluid"
        >
          <el-option v-for="item in gradeOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :xs="24">
      <el-form-item label="覆盖班级">
        <el-select
          v-model="scope.classes"
          multiple
          collapse-tags
          collapse-tags-tooltip
          :disabled="disabled"
          placeholder="选择班级"
          class="ele-fluid"
        >
          <el-option
            v-for="item in classOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-col>
    <el-col v-if="showRemark" :xs="24">
      <el-form-item label="覆盖对象说明">
        <el-input
          v-model="scope.remark"
          type="textarea"
          :rows="3"
          :maxlength="300"
          :disabled="disabled"
          placeholder="对活动覆盖对象的补充说明"
        />
      </el-form-item>
    </el-col>
  </el-row>
</template>

<script setup>
  import { computed } from 'vue';
  import {
    CLASS_OPTIONS,
    REGION_OPTIONS,
    SCHOOL_OPTIONS,
    STAGE_GRADE_MAP,
    STAGE_OPTIONS,
    filterSchoolOptions,
    filterClassOptions
  } from '../data.js';

  const props = defineProps({
    modelValue: {
      type: Object,
      default: () => ({})
    },
    disabled: Boolean,
    showRemark: {
      type: Boolean,
      default: true
    },
    regionRequired: Boolean,
    regionLabel: {
      type: String,
      default: '覆盖区域'
    },
    regionProp: String,
    parentScope: Object
  });

  const emit = defineEmits(['update:modelValue']);

  const scope = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  });

  const regionProps = {
    multiple: true,
    checkStrictly: true,
    emitPath: true,
    value: 'value',
    label: 'label',
    children: 'children'
  };

  const regionRules = computed(() =>
    props.regionRequired
      ? [{ required: true, message: '请选择覆盖区域', trigger: 'change' }]
      : []
  );

  const schoolOptions = computed(() =>
    filterSchoolOptions(scope.value, props.parentScope)
  );

  const gradeOptions = computed(() => {
    const stages = scope.value?.stages ?? [];
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

  const classOptions = computed(() =>
    filterClassOptions(scope.value, props.parentScope)
  );

  const handleStageChange = () => {
    const allowed = gradeOptions.value;
    scope.value.grades = (scope.value.grades ?? []).filter((grade) => allowed.includes(grade));
  };
</script>
