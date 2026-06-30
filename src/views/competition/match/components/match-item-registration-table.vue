<!-- 班班赛 - 按设项报名设置 -->
<template>
  <el-table :data="rows" border size="small">
    <el-table-column prop="itemName" label="设项名称" min-width="120" />
    <el-table-column label="报名方式" min-width="180">
      <template #default="{ row }">
        <el-checkbox-group
          :model-value="row.methods"
          :disabled="disabled"
          @change="(val) => updateRow(row.itemId, 'methods', val)"
        >
          <el-checkbox
            v-for="opt in REGISTRATION_METHOD_OPTIONS"
            :key="opt"
            :value="opt"
            :label="opt"
          />
        </el-checkbox-group>
      </template>
    </el-table-column>
    <el-table-column label="是否限制报名数量" width="140" align="center">
      <template #default="{ row }">
        <el-switch
          :model-value="row.limitEnabled"
          :disabled="disabled"
          @change="(val) => updateRow(row.itemId, 'limitEnabled', val)"
        />
      </template>
    </el-table-column>
    <el-table-column label="报名数量上限" width="130" align="center">
      <template #default="{ row }">
        <el-input-number
          v-if="row.limitEnabled"
          :model-value="row.limitCount"
          :min="1"
          :max="99999"
          size="small"
          controls-position="right"
          :disabled="disabled"
          @change="(val) => updateRow(row.itemId, 'limitCount', val)"
        />
        <span v-else>-</span>
      </template>
    </el-table-column>
    <el-table-column label="报名数量说明" min-width="160">
      <template #default="{ row }">
        <el-input
          :model-value="row.limitRemark"
          size="small"
          placeholder="非必填"
          :disabled="disabled"
          @update:model-value="(val) => updateRow(row.itemId, 'limitRemark', val)"
        />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
  import { computed } from 'vue';
  import { findEventItem } from '@/views/event-item/data.js';
  import {
    clone,
    createDefaultItemRegistration,
    normalizeRegistrationMethods,
    REGISTRATION_METHOD_OPTIONS
  } from '../data.js';

  const props = defineProps({
    modelValue: { type: Object, default: () => ({}) },
    itemIds: { type: Array, default: () => [] },
    itemNames: { type: Object, default: () => ({}) },
    disabled: Boolean
  });

  const emit = defineEmits(['update:modelValue']);

  const rows = computed(() =>
    (props.itemIds ?? []).map((id) => {
      const key = String(id);
      const item = findEventItem(id);
      const config = props.modelValue?.[key] ?? createDefaultItemRegistration();
      return {
        itemId: id,
        itemName: props.itemNames[id] || item?.itemName || `设项${id}`,
        matchForm: item?.matchForm ?? '个人',
        ...config,
        methods: normalizeRegistrationMethods(config.methods)
      };
    })
  );

  const updateRow = (itemId, field, value) => {
    const next = clone(props.modelValue ?? {});
    const key = String(itemId);
    const current = next[key] ?? createDefaultItemRegistration();
    next[key] = {
      ...current,
      [field]: field === 'methods' ? normalizeRegistrationMethods(value) : value
    };
    if (field === 'limitEnabled' && !value) {
      next[key].limitCount = null;
    }
    emit('update:modelValue', next);
  };
</script>
