<!-- 比赛整体报名设置 -->
<template>
  <el-row :gutter="20">
    <el-col :xs="24">
      <el-form-item label="报名方式" required>
        <el-checkbox-group
          :model-value="config.methods"
          :disabled="disabled"
          @change="updateField('methods', $event)"
        >
          <el-checkbox
            v-for="opt in REGISTRATION_METHOD_OPTIONS"
            :key="opt"
            :value="opt"
            :label="opt"
          />
        </el-checkbox-group>
      </el-form-item>
    </el-col>
    <el-col :sm="12" :xs="24">
      <el-form-item label="是否限制报名数量">
        <el-switch
          :model-value="config.limitEnabled"
          :disabled="disabled"
          @change="updateLimitEnabled"
        />
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
    <el-col :xs="24">
      <el-form-item label="报名数量说明">
        <el-input
          :model-value="config.limitRemark"
          type="textarea"
          :rows="2"
          placeholder="非必填"
          :disabled="disabled"
          @update:model-value="updateField('limitRemark', $event)"
        />
        <div v-if="limitHint" class="field-hint">{{ limitHint }}</div>
      </el-form-item>
    </el-col>
  </el-row>
</template>

<script setup>
  import { computed } from 'vue';
  import { findEventItem } from '@/views/event-item/data.js';
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

  const limitHint = computed(() => {
    const items = (props.itemIds ?? []).map((id) => findEventItem(id)).filter(Boolean);
    if (!items.length) {
      return '';
    }
    const hasPersonal = items.some((d) => d.matchForm === '个人');
    const hasTeam = items.some((d) => d.matchForm === '团体');
    if (hasPersonal && hasTeam) {
      return '个人赛按人数限制，团体赛按队伍数限制。';
    }
    if (hasTeam) {
      return '当前比赛为团体赛，报名数量上限表示队伍数上限。';
    }
    return '当前比赛为个人赛，报名数量上限表示人数上限。';
  });

  const emitConfig = (next) => {
    emit('update:modelValue', clone(next));
  };

  const updateField = (field, value) => {
    const next = { ...config.value, [field]: value };
    if (field === 'methods') {
      next.methods = normalizeRegistrationMethods(value);
    }
    emitConfig(next);
  };

  const updateLimitEnabled = (value) => {
    const next = { ...config.value, limitEnabled: value };
    if (!value) {
      next.limitCount = null;
    }
    emitConfig(next);
  };
</script>

<style scoped lang="scss">
  .field-hint {
    margin-top: 6px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }
</style>
