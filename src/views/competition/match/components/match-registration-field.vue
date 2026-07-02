<!-- 比赛整体报名设置 -->
<template>
  <el-row :gutter="20">
    <el-col :sm="12" :xs="24">
      <el-form-item label="报名方式" required>
        <el-radio-group
          :model-value="reportMethod"
          :disabled="disabled"
          @change="updateReportMethod"
        >
          <el-radio
            v-for="opt in REGISTRATION_METHOD_OPTIONS"
            :key="opt"
            :value="opt"
            :label="opt"
          />
        </el-radio-group>
      </el-form-item>
    </el-col>
    <el-col :sm="12" :xs="24">
      <el-form-item label="是否限制报名数量">
        <el-radio-group
          :model-value="config.limitEnabled"
          :disabled="disabled"
          @change="updateLimitEnabled"
        >
          <el-radio :value="true">是</el-radio>
          <el-radio :value="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-col>
    <el-col v-if="config.limitEnabled" :sm="12" :xs="24">
      <el-form-item label="报名数量上限" required>
        <el-input-number
          :model-value="config.limitCount"
          :min="1"
          :max="99999"
          class="ele-fluid"
          :disabled="disabled"
          @change="updateField('limitCount', $event)"
        />
      </el-form-item>
    </el-col>
    <el-col v-if="config.limitEnabled" :xs="24">
      <el-form-item label="报名说明">
        <el-input
          :model-value="config.limitRemark"
          type="textarea"
          :rows="2"
          placeholder="如：每校限报 2 支队伍；每个班级最多 10 人；每个学校每个设项限报 3 人"
          :disabled="disabled"
          @update:model-value="updateField('limitRemark', $event)"
        />
      </el-form-item>
    </el-col>
  </el-row>
</template>

<script setup>
  import { computed } from 'vue';
  import {
    clone,
    createDefaultMatchRegistration,
    normalizeRegistrationMethods,
    REGISTRATION_METHOD_OPTIONS
  } from '../data.js';

  const props = defineProps({
    modelValue: { type: Object, default: () => createDefaultMatchRegistration() },
    itemIds: { type: Array, default: () => [] },
    disabled: Boolean
  });

  const emit = defineEmits(['update:modelValue']);

  const config = computed(() => ({
    ...createDefaultMatchRegistration(),
    ...props.modelValue,
    methods: normalizeRegistrationMethods(props.modelValue?.methods)
  }));

  const reportMethod = computed(() => config.value.methods[0] || REGISTRATION_METHOD_OPTIONS[0]);

  const emitConfig = (next) => {
    emit('update:modelValue', clone(next));
  };

  const updateField = (field, value) => {
    emitConfig({ ...config.value, [field]: value });
  };

  const updateReportMethod = (value) => {
    emitConfig({ ...config.value, methods: normalizeRegistrationMethods([value]) });
  };

  const updateLimitEnabled = (value) => {
    const next = { ...config.value, limitEnabled: value };
    if (!value) {
      next.limitCount = null;
      next.limitRemark = '';
    }
    emitConfig(next);
  };
</script>
