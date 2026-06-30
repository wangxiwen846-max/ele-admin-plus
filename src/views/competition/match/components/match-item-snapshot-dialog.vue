<!-- 比赛设项本场配置查看（只读） -->
<template>
  <ele-modal
    v-model="visible"
    title="查看配置"
    :width="800"
    @closed="$emit('closed')"
  >
    <template v-if="row">
      <div class="section-block">
        <div class="section-title">设项基础信息</div>
        <el-descriptions :column="2" size="small" border class="item-desc">
          <el-descriptions-item label="设项名称">{{ row.itemName }}</el-descriptions-item>
          <el-descriptions-item label="关联项目">{{ row.project }}</el-descriptions-item>
          <el-descriptions-item label="比赛形式">{{ row.matchForm }}</el-descriptions-item>
          <el-descriptions-item label="成绩类型">{{ row.scoreType }}</el-descriptions-item>
          <el-descriptions-item label="适用区域">{{ row.applicableRegion || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="section-block">
        <div class="section-title">本场配置</div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="成绩规则">{{ row.scoreRule || '-' }}</el-descriptions-item>
          <el-descriptions-item label="计分规则">{{ row.scoringRule || '未启用' }}</el-descriptions-item>
          <el-descriptions-item label="报名设置">{{ registrationSummary }}</el-descriptions-item>
          <el-descriptions-item label="保险设置">{{ insuranceSummary }}</el-descriptions-item>
          <el-descriptions-item label="成绩设置">{{ scoreSummary }}</el-descriptions-item>
          <el-descriptions-item label="奖项设置">{{ awardSummary }}</el-descriptions-item>
          <el-descriptions-item label="参赛要求">{{ row.qualification || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </template>

    <template #footer>
      <el-button type="primary" @click="visible = false">关闭</el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import { getAwardCount } from '@/views/event-item/data.js';
  import {
    formatMatchItemInsuranceSummary,
    formatMatchItemRegistrationSummary
  } from '../data.js';

  const props = defineProps({
    match: { type: Object, default: null },
    row: { type: Object, default: null }
  });
  defineEmits(['closed']);

  const visible = ref(true);

  const registrationSummary = computed(() => {
    if (!props.match || !props.row) {
      return '-';
    }
    return formatMatchItemRegistrationSummary(props.match, props.row.itemId);
  });

  const insuranceSummary = computed(() => {
    if (!props.match || !props.row) {
      return '-';
    }
    return formatMatchItemInsuranceSummary(props.match, props.row.itemId);
  });

  const scoreSummary = computed(() => {
    const config = props.row?.scoreConfig;
    if (!config) {
      return '-';
    }
    const submitters = config.submitters?.length ? config.submitters.join('、') : '未设置';
    const methods = config.collectMethods?.length ? config.collectMethods.join('、') : '未设置';
    const time =
      config.submitStartTime || config.submitEndTime
        ? `${config.submitStartTime || '未设置'} 至 ${config.submitEndTime || '未设置'}`
        : '未设置提交时间';
    return `提交人：${submitters}；采集方式：${methods}；${time}`;
  });

  const awardSummary = computed(() => {
    const awards = props.row?.awardConfig?.awards ?? [];
    const count = getAwardCount(awards);
    if (!count) {
      return '暂无奖项';
    }
    const names = awards.map((d) => d.awardName).join('、');
    const remark = props.row?.awardConfig?.awardRemark;
    return remark ? `${count} 个（${names}）；补充说明：${remark}` : `${count} 个（${names}）`;
  });
</script>

<style scoped lang="scss">
  .section-block {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
</style>
