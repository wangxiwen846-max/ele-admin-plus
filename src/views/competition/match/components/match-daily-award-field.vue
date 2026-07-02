<!-- 每日积分赛 - 奖项配置 -->
<template>
  <div class="match-daily-award-field">
    <template v-if="awards.length">
      <div class="award-toolbar">
        <div class="award-summary">{{ summaryText }}</div>
        <el-button type="primary" link @click="addAward">新增奖项</el-button>
      </div>
      <el-table :data="awards" border size="small" class="award-table">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="奖项名称" min-width="130">
          <template #default="{ row }">
            <el-input v-model.trim="row.awardName" placeholder="建议填写" />
          </template>
        </el-table-column>
        <el-table-column label="获奖规则" min-width="150">
          <template #default="{ row }">
            <el-input v-model.trim="row.awardRule" placeholder="如积分排名前10名" />
          </template>
        </el-table-column>
        <el-table-column label="获奖对象" width="88" align="center">
          <template #default>
            <span class="cell-text">个人</span>
          </template>
        </el-table-column>
        <el-table-column label="奖项数量" width="110">
          <template #default="{ row }">
            <el-input v-model.trim="row.awardQuantity" placeholder="非必填" />
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="120">
          <template #default="{ row }">
            <el-input v-model.trim="row.remark" placeholder="非必填" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="72" align="center" fixed="right">
          <template #default="{ $index }">
            <el-link type="danger" underline="never" @click="removeAward($index)">删除</el-link>
          </template>
        </el-table-column>
      </el-table>
    </template>
    <div v-else class="award-empty">
      <div class="award-empty-text">暂未配置奖项，可直接发布比赛</div>
      <el-button type="primary" link @click="addAward">新增奖项</el-button>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { createDefaultAward } from '@/views/event-item/data.js';
  import { formatDailyAwardSummary } from '../data.js';

  const dailyAwards = defineModel({ type: Object, default: () => ({ awards: [], awardRemark: '' }) });

  const awards = computed({
    get: () => dailyAwards.value?.awards ?? [],
    set: (value) => {
      dailyAwards.value = {
        ...(dailyAwards.value ?? {}),
        awards: value
      };
    }
  });

  const summaryText = computed(() => {
    const summary = formatDailyAwardSummary(dailyAwards.value ?? {});
    return summary === '未配置' ? '暂未配置奖项' : summary;
  });

  const createDailyAward = () => {
    const award = createDefaultAward({ awardTarget: '个人' });
    return {
      ...award,
      awardQuantity: '',
      remark: ''
    };
  };

  const addAward = () => {
    awards.value = [...awards.value, createDailyAward()];
  };

  const removeAward = (index) => {
    const next = [...awards.value];
    next.splice(index, 1);
    awards.value = next;
  };
</script>

<style scoped lang="scss">
  .match-daily-award-field {
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

  .cell-text {
    color: var(--el-text-color-regular);
    font-size: 13px;
  }
</style>
