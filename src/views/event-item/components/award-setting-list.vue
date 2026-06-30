<!-- 设项奖项明细配置 -->
<template>
  <div class="award-setting-list">
    <template v-if="awards.length">
      <div class="award-toolbar">
        <div class="award-summary">{{ summaryText }}</div>
        <el-button type="primary" link :disabled="disabled" @click="addAward">新增奖项</el-button>
      </div>
      <el-table :data="awards" border size="small" class="award-table">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="奖项名称" min-width="140">
          <template #default="{ row }">
            <el-input
              v-model.trim="row.awardName"
              :disabled="disabled"
              placeholder="如冠军、一等奖、达标奖"
            />
          </template>
        </el-table-column>
        <el-table-column label="奖项规则" min-width="160">
          <template #default="{ row }">
            <el-input
              v-model.trim="row.awardRule"
              :disabled="disabled"
              :placeholder="awardRulePlaceholder"
            />
          </template>
        </el-table-column>
        <el-table-column label="获奖对象" width="120" align="center">
          <template #default="{ row }">
            <el-select
              v-model="row.awardTarget"
              :disabled="disabled"
              placeholder="请选择"
              class="ele-fluid"
            >
              <el-option
                v-for="opt in AWARD_TARGET_OPTIONS"
                :key="opt"
                :label="opt"
                :value="opt"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="72" align="center" fixed="right">
          <template #default="{ $index }">
            <el-link
              type="danger"
              underline="never"
              :disabled="disabled"
              @click="removeAward($index)"
            >
              删除
            </el-link>
          </template>
        </el-table-column>
      </el-table>
    </template>
    <div v-else class="award-empty">
      <div class="award-empty-text">暂未配置奖项</div>
      <el-button type="primary" link :disabled="disabled" @click="addAward">新增奖项</el-button>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import {
    AWARD_TARGET_OPTIONS,
    createDefaultAward,
    formatAwardSettingSummary
  } from '../data.js';

  const props = defineProps({
    modelValue: {
      type: Array,
      default: () => []
    },
    disabled: Boolean,
    awardRulePlaceholder: {
      type: String,
      default: '如第1名、前10名、成绩达标'
    }
  });

  const emit = defineEmits(['update:modelValue']);

  const awards = computed({
    get: () => props.modelValue ?? [],
    set: (value) => emit('update:modelValue', value)
  });

  const summaryText = computed(() => formatAwardSettingSummary(awards.value));

  const addAward = () => {
    emit('update:modelValue', [...awards.value, createDefaultAward()]);
  };

  const removeAward = (index) => {
    const next = [...awards.value];
    next.splice(index, 1);
    emit('update:modelValue', next);
  };
</script>

<style scoped lang="scss">
  .award-setting-list {
    width: 100%;
  }

  .award-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .award-summary {
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  .award-empty {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
  }

  .award-empty-text {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
</style>
