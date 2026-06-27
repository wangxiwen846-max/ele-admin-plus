<!-- 赛事组委会成员列表 -->
<template>
  <div class="committee-member-list">
    <div class="member-toolbar">
      <span class="member-label">赛事组委会名单</span>
      <el-button type="primary" link :disabled="disabled" @click="addMember">新增成员</el-button>
    </div>

    <el-table v-if="members.length" :data="members" border size="small" class="member-table">
      <el-table-column label="姓名" min-width="120">
        <template #default="{ row }">
          <el-input
            v-model.trim="row.name"
            :disabled="disabled"
            placeholder="输入姓名"
          />
        </template>
      </el-table-column>
      <el-table-column label="职务" min-width="120">
        <template #default="{ row }">
          <el-input
            v-model.trim="row.position"
            :disabled="disabled"
            placeholder="输入职务"
          />
        </template>
      </el-table-column>
      <el-table-column label="单位" min-width="160">
        <template #default="{ row }">
          <el-input
            v-model.trim="row.organization"
            :disabled="disabled"
            placeholder="输入单位"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="72" align="center" fixed="right">
        <template #default="{ $index }">
          <el-link
            type="danger"
            underline="never"
            :disabled="disabled"
            @click="removeMember($index)"
          >
            删除
          </el-link>
        </template>
      </el-table-column>
    </el-table>
    <div v-else class="member-empty">暂无组委会成员，可点击新增成员添加</div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { createCommitteeMember } from '../data.js';

  const props = defineProps({
    modelValue: {
      type: Array,
      default: () => []
    },
    disabled: Boolean
  });

  const emit = defineEmits(['update:modelValue']);

  const members = computed({
    get: () => props.modelValue ?? [],
    set: (value) => emit('update:modelValue', value)
  });

  const addMember = () => {
    emit('update:modelValue', [...members.value, createCommitteeMember()]);
  };

  const removeMember = (index) => {
    const next = [...members.value];
    next.splice(index, 1);
    emit('update:modelValue', next);
  };
</script>

<style scoped lang="scss">
  .committee-member-list {
    width: 100%;
  }

  .member-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .member-label {
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  .member-empty {
    padding: 16px;
    text-align: center;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-lighter);
    border: 1px dashed var(--el-border-color-lighter);
    border-radius: 4px;
  }

  .member-table :deep(.el-input__wrapper) {
    box-shadow: none;
    padding: 0 4px;
  }
</style>
