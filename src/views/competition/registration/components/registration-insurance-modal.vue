<!-- 查看保险 - 主内容区域弹窗 -->
<template>
  <content-modal
    :model-value="visible"
    :title="detail.title || '保险详情'"
    width="1000px"
    :z-index="zIndex"
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="ins-summary">
      <div class="summary-item">
        <span class="label">保险类型</span>
        <span class="value">{{ detail.summary.insuranceType || '-' }}</span>
      </div>
      <div class="summary-item">
        <span class="label">保险方案</span>
        <span class="value">{{ detail.summary.insurancePlan || '-' }}</span>
      </div>
      <div class="summary-item">
        <span class="label">保险方式</span>
        <span class="value">{{ detail.summary.insuranceMethod || '-' }}</span>
      </div>
      <div class="summary-item">
        <span class="label">保险状态</span>
        <span class="value">
          <el-tag :type="statusTag(detail.summary.insuranceStatus)" size="small" effect="plain">
            {{ detail.summary.insuranceStatus || '-' }}
          </el-tag>
        </span>
      </div>
      <div class="summary-item">
        <span class="label">应参保人数</span>
        <span class="value">{{ detail.summary.requiredCount || 0 }}</span>
      </div>
      <div class="summary-item">
        <span class="label">已参保人数</span>
        <span class="value">{{ detail.summary.insuredCount || 0 }}</span>
      </div>
      <div class="summary-item">
        <span class="label">待参保人数</span>
        <span class="value">{{ detail.summary.pendingCount || 0 }}</span>
      </div>
      <div class="summary-item">
        <span class="label">异常人数</span>
        <span class="value">{{ detail.summary.exceptionCount || 0 }}</span>
      </div>
    </div>

    <el-table :data="detail.students" border size="small" max-height="420">
      <el-table-column prop="participantNumber" label="参赛编号" width="96" align="center" fixed="left" />
      <el-table-column prop="studentName" label="学生姓名" width="100" />
      <el-table-column prop="school" label="学校" min-width="130" show-overflow-tooltip />
      <template v-if="isDailyView">
        <el-table-column prop="grade" label="年级" width="100" align="center" />
        <el-table-column prop="className" label="班级" width="100" align="center" />
      </template>
      <template v-else>
        <el-table-column prop="idNo" label="证件号" min-width="160" show-overflow-tooltip />
        <el-table-column prop="gradeClass" label="年级班级" width="120" />
      </template>
      <el-table-column prop="insuranceType" label="保险类型" width="120" align="center" />
      <el-table-column prop="insurancePlan" label="保险方案" min-width="160" show-overflow-tooltip />
      <el-table-column prop="insuranceMethod" label="保险方式" width="100" align="center" />
      <el-table-column prop="relationScope" label="关联范围" min-width="150" show-overflow-tooltip />
      <el-table-column label="保险状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.insuranceStatus)" size="small" effect="plain">
            {{ row.insuranceStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="exceptionReason" label="异常原因" min-width="150" show-overflow-tooltip />
    </el-table>

    <template #footer>
      <el-button @click="emit('update:visible', false)">关闭</el-button>
    </template>
  </content-modal>
</template>

<script setup>
  import { computed } from 'vue';
  import ContentModal from './content-modal.vue';
  import { getInsuranceDetail } from '../data.js';

  const props = defineProps({
    visible: Boolean,
    context: { type: Object, default: () => ({}) },
    zIndex: { type: Number, default: 22 }
  });

  const emit = defineEmits(['update:visible']);

  const isDailyView = computed(
    () => props.context?.scope === 'daily' || props.context?.fromDaily === true
  );

  const detail = computed(() => {
    if (!props.visible || !props.context?.matchId) {
      return { title: '保险详情', summary: {}, students: [] };
    }
    return getInsuranceDetail(props.context);
  });

  const statusTag = (status) => {
    const map = { 已参保: 'success', 待参保: 'info' };
    return map[status] || 'info';
  };
</script>

<style scoped lang="scss">
  .ins-summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 14px;
    background: var(--el-fill-color-light);
    border-radius: 6px;

    .label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .value {
      font-size: 15px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
</style>
