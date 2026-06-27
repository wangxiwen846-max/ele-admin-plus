<!-- 多单位文本录入 -->
<template>
  <div class="multi-unit-input">
    <div v-if="modelValue.length" class="tag-list">
      <el-tag
        v-for="(item, index) in modelValue"
        :key="`${item}-${index}`"
        :closable="!disabled"
        size="small"
        effect="plain"
        :disable-transitions="true"
        @close="remove(index)"
      >
        {{ item }}
      </el-tag>
    </div>
    <div class="input-row">
      <el-input
        v-model="inputValue"
        :disabled="disabled"
        :placeholder="placeholder"
        clearable
        @keyup.enter="add"
      />
      <el-button :disabled="disabled" @click="add">添加</el-button>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { EleMessage } from 'ele-admin-plus';

  const props = defineProps({
    modelValue: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: '输入后按回车或点击添加'
    },
    disabled: Boolean
  });

  const emit = defineEmits(['update:modelValue']);

  const inputValue = ref('');

  const add = () => {
    const text = inputValue.value.trim();
    if (!text) {
      return;
    }
    if (props.modelValue.includes(text)) {
      EleMessage.warning({ message: '该单位已存在', plain: true });
      return;
    }
    emit('update:modelValue', [...props.modelValue, text]);
    inputValue.value = '';
  };

  const remove = (index) => {
    const next = [...props.modelValue];
    next.splice(index, 1);
    emit('update:modelValue', next);
  };
</script>

<style scoped lang="scss">
  .multi-unit-input {
    width: 100%;
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  }

  .input-row {
    display: flex;
    gap: 8px;
  }
</style>
