<!-- 比赛类型级联选择（与发布比赛页结构一致） -->
<template>
  <el-cascader
    :model-value="innerValue"
    :options="cascaderOptions"
    :props="cascaderProps"
    :disabled="disabled"
    :placeholder="placeholder"
    :clearable="clearable"
    :collapse-tags="multiple"
    :collapse-tags-tooltip="multiple"
    :class="cascaderClass"
    @update:model-value="handleChange"
  />
</template>

<script setup>
  import { computed } from 'vue';
  import {
    MATCH_TYPE_CASCADER_PROPS_MULTIPLE,
    MATCH_TYPE_CASCADER_PROPS_SINGLE,
    MATCH_TYPE_LEAF_OPTIONS,
    buildMatchTypeCascaderOptions,
    cascaderPathToLeaf,
    cascaderValueToPublishMatchTypes,
    leafToCascaderPath,
    publishMatchTypesToCascaderValue
  } from '@/views/competition/match-type.js';

  const props = defineProps({
    modelValue: {
      type: [String, Array],
      default: ''
    },
    multiple: {
      type: Boolean,
      default: false
    },
    allowedLeafTypes: {
      type: Array,
      default: () => MATCH_TYPE_LEAF_OPTIONS
    },
    disabled: Boolean,
    placeholder: {
      type: String,
      default: '请选择比赛类型'
    },
    clearable: {
      type: Boolean,
      default: true
    },
    cascaderClass: {
      type: String,
      default: 'match-type-cascader'
    }
  });

  const emit = defineEmits(['update:modelValue']);

  const cascaderOptions = computed(() => buildMatchTypeCascaderOptions(props.allowedLeafTypes));

  const cascaderProps = computed(() =>
    props.multiple ? MATCH_TYPE_CASCADER_PROPS_MULTIPLE : MATCH_TYPE_CASCADER_PROPS_SINGLE
  );

  const innerValue = computed(() => {
    if (props.multiple) {
      return publishMatchTypesToCascaderValue(Array.isArray(props.modelValue) ? props.modelValue : []);
    }
    return props.modelValue ? leafToCascaderPath(props.modelValue) : [];
  });

  const handleChange = (value) => {
    if (props.multiple) {
      emit('update:modelValue', cascaderValueToPublishMatchTypes(value));
      return;
    }
    emit('update:modelValue', cascaderPathToLeaf(Array.isArray(value) ? value : []));
  };
</script>

<style scoped lang="scss">
  .match-type-cascader {
    width: 100%;
  }
</style>
