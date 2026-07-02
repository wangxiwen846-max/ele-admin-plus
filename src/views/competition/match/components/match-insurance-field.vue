<!-- 比赛整体保险设置 -->
<template>
  <el-row :gutter="20">
    <el-col :sm="12" :xs="24">
      <el-form-item label="保险类型" required>
        <span class="readonly-text">{{ insuranceType || '选择比赛类型后自动带出' }}</span>
      </el-form-item>
    </el-col>
    <el-col :sm="12" :xs="24">
      <el-form-item label="保险方案" required>
        <el-select
          :model-value="config.planId"
          :disabled="disabled || !insuranceType"
          filterable
          placeholder="请选择保险方案"
          class="ele-fluid"
          @update:model-value="updateField('planId', $event)"
        >
          <el-option
            v-for="plan in planOptions"
            :key="plan.planId"
            :label="plan.planName"
            :value="plan.planId"
          />
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :sm="12" :xs="24">
      <el-form-item label="保险方式" required>
        <el-radio-group
          :model-value="config.method"
          :disabled="disabled"
          @change="updateField('method', $event)"
        >
          <el-radio
            v-for="opt in INSURANCE_METHOD_OPTIONS"
            :key="opt"
            :value="opt"
            :label="opt"
          />
        </el-radio-group>
      </el-form-item>
    </el-col>
    <el-col v-if="insuranceType === INSURANCE_TYPE_SEMESTER && semesterWarning" :xs="24">
      <el-alert type="warning" show-icon :closable="false" :title="semesterWarning" />
    </el-col>
  </el-row>
</template>

<script setup>
  import { computed, watch } from 'vue';
  import { createDefaultInsuranceSetting } from '@/views/event-item/data.js';
  import {
    INSURANCE_TYPE_SEMESTER,
    findInsurancePlan,
    findSemesterPlanByDate,
    getInsurancePlanOptions,
    getInsuranceTypeByMatchType,
    isPlanCoveringDate
  } from '@/views/competition/insurance/data.js';
  import { clone } from '../data.js';

  const INSURANCE_METHOD_OPTIONS = ['统一购买', '自行购买'];

  const props = defineProps({
    modelValue: { type: Object, default: () => createDefaultInsuranceSetting() },
    disabled: Boolean,
    matchType: { type: String, default: '' },
    startTime: { type: String, default: '' }
  });

  const emit = defineEmits(['update:modelValue']);

  const config = computed(() => ({
    ...createDefaultInsuranceSetting(),
    ...props.modelValue
  }));

  const insuranceType = computed(() => getInsuranceTypeByMatchType(props.matchType));
  const planOptions = computed(() => getInsurancePlanOptions(insuranceType.value, props.startTime));
  const selectedPlan = computed(() => findInsurancePlan(config.value.planId));
  const matchedPlan = computed(() => findSemesterPlanByDate(props.startTime));

  const semesterWarning = computed(() => {
    if (!props.startTime) {
      return '';
    }
    if (selectedPlan.value && isPlanCoveringDate(selectedPlan.value, props.startTime)) {
      return '';
    }
    if (matchedPlan.value) {
      return '';
    }
    return '当前比赛时间未匹配到有效学期保险方案，请先维护按学期收费的保险方案。';
  });

  const emitConfig = (next) => {
    emit('update:modelValue', clone(next));
  };

  const updateField = (field, value) => {
    emitConfig({ ...config.value, [field]: value });
  };

  watch(
    [insuranceType, planOptions],
    ([type, options]) => {
      if (!type) {
        return;
      }
      const planStillValid = options.some((plan) => plan.planId === config.value.planId);
      const method = INSURANCE_METHOD_OPTIONS.includes(config.value.method)
        ? config.value.method
        : '统一购买';
      const next = {
        ...config.value,
        required: true,
        insuranceType: type,
        method,
        planId: planStillValid ? config.value.planId : ''
      };
      if (
        next.insuranceType !== config.value.insuranceType ||
        next.method !== config.value.method ||
        next.planId !== config.value.planId
      ) {
        emitConfig(next);
      }
    },
    { immediate: true }
  );
</script>

<style scoped>
  .readonly-text {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
</style>
