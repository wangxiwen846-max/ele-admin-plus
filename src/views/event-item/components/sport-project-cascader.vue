<!-- 体育项目层级筛选（一级 / 二级，多选） -->
<template>
  <el-cascader
    :model-value="modelValue"
    :options="SPORT_PROJECT_CASCADER_OPTIONS"
    :props="cascaderProps"
    :disabled="disabled"
    placeholder="请选择体育项目"
    clearable
    filterable
    collapse-tags
    collapse-tags-tooltip
    class="ele-fluid sport-project-cascader"
    @update:model-value="emit('update:modelValue', $event ?? [])"
  />
</template>

<script setup>
  import { SPORT_PROJECT_CASCADER_OPTIONS } from '@/views/event-item/data.js';

  defineProps({
    modelValue: { type: Array, default: () => [] },
    disabled: Boolean
  });

  const emit = defineEmits(['update:modelValue']);

  const cascaderProps = {
    multiple: true,
    checkStrictly: true,
    emitPath: true,
    value: 'value',
    label: 'label',
    children: 'children'
  };
</script>
