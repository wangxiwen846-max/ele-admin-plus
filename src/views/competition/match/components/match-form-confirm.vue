<!-- 比赛发布确认摘要 -->
<template>
  <div class="match-form-confirm">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="请确认以下比赛配置无误后再保存。如需修改，请点击「上一步」返回对应步骤调整。"
      class="confirm-tip"
    />

    <div class="confirm-block">
      <div class="block-title">基础信息</div>
      <el-descriptions :column="2" size="small" border>
        <el-descriptions-item label="所属活动">{{ activityName }}</el-descriptions-item>
        <el-descriptions-item label="所属赛段">{{ stageName }}</el-descriptions-item>
        <el-descriptions-item label="比赛类型">{{ form.matchType || '-' }}</el-descriptions-item>
        <el-descriptions-item label="比赛名称">{{ form.matchName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="开展形式">{{ form.deliveryForm || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="比赛说明" :span="2">{{ form.description || '未填写' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="confirm-block">
      <div class="block-title">比赛时间</div>
      <el-descriptions :column="1" size="small" border>
        <el-descriptions-item label="比赛时间">{{ matchTimeText }}</el-descriptions-item>
        <el-descriptions-item v-if="isClass" label="报名时间">{{ regTimeText }}</el-descriptions-item>
        <el-descriptions-item v-if="isDaily" label="参与方式">
          无需报名，参赛范围内学生自动参与积分统计。
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="confirm-block">
      <div class="block-title">参赛范围</div>
      <div class="summary-text">{{ scopeSummary }}</div>
    </div>

    <div v-if="isClass" class="confirm-block">
      <div class="block-title">比赛设项</div>
      <el-table v-if="classItems.length" :data="classItems" border size="small">
        <el-table-column prop="itemName" label="设项名称" min-width="110" />
        <el-table-column prop="project" label="关联体育项目" min-width="130" />
        <el-table-column prop="matchForm" label="比赛形式" width="88" align="center" />
        <el-table-column prop="scoreType" label="成绩类型" width="96" align="center" />
        <el-table-column prop="scoringRule" label="计分规则" min-width="100" show-overflow-tooltip />
        <el-table-column prop="awardSummary" label="奖项设置" min-width="100" show-overflow-tooltip />
        <el-table-column prop="qualification" label="参赛要求" min-width="120" show-overflow-tooltip />
      </el-table>
      <div v-else class="empty-text">未选择设项</div>
    </div>

    <div v-if="isClass" class="confirm-block">
      <div class="block-title">报名设置</div>
      <div class="summary-text">{{ registrationSummary }}</div>
    </div>

    <div v-if="isClass" class="confirm-block">
      <div class="block-title">保险设置</div>
      <div class="summary-text">{{ insuranceSummary }}</div>
    </div>

    <div v-if="isClass" class="confirm-block">
      <div class="block-title">成绩设置</div>
      <el-table :data="classItems" border size="small">
        <el-table-column prop="itemName" label="设项" min-width="100" />
        <el-table-column prop="scoreSummary" label="成绩设置" min-width="200" show-overflow-tooltip />
      </el-table>
    </div>

    <div v-if="isDaily" class="confirm-block">
      <div class="block-title">数据来源</div>
      <el-table :data="dailySources" border size="small">
        <el-table-column prop="sourceType" label="数据来源" min-width="120" />
        <el-table-column prop="enabledText" label="状态" width="80" align="center" />
        <el-table-column prop="weightText" label="权重" width="80" align="center" />
        <el-table-column prop="roleSummary" label="提交角色" min-width="120" show-overflow-tooltip />
        <el-table-column prop="methodSummary" label="采集方式" min-width="120" show-overflow-tooltip />
      </el-table>
    </div>

    <div v-if="isDaily" class="confirm-block">
      <div class="block-title">积分生成规则</div>
      <el-descriptions :column="1" size="small" border>
        <el-descriptions-item label="日积分生成">固定开启</el-descriptions-item>
        <el-descriptions-item label="日积分生成时间">{{ pointsRules.dailyGenerateTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="数据截止时间">{{ pointsRules.dataCutoffTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="是否允许补交补算">
          {{ pointsRules.allowLateRecalculate ? '是' : '否' }}
        </el-descriptions-item>
        <el-descriptions-item label="权重合计">{{ weightHint }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <div v-if="isDaily" class="confirm-block">
      <div class="block-title">评分规则</div>
      <div class="summary-text">{{ scoringPlanText }}</div>
    </div>

    <div v-if="isDaily" class="confirm-block">
      <div class="block-title">保险设置</div>
      <div class="summary-text">{{ dailyInsuranceSummary }}</div>
    </div>

    <div class="confirm-block">
      <div class="block-title">附件</div>
      <div v-if="form.attachments?.length" class="summary-list">
        <div v-for="file in form.attachments" :key="file.id" class="summary-line">{{ file.name }}</div>
      </div>
      <div v-else class="empty-text">暂无附件</div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { findActivity } from '@/views/competition/activity/data.js';
  import {
    formatMatchInsuranceSummary,
    formatMatchRegistrationSummary,
    formatMatchScopeSummary,
    formatWeightTotalHint,
    getMatchLinkedItems,
    isClassMatch,
    isDailyMatch,
    normalizeDataSources,
    normalizePointsRules
  } from '../data.js';

  const props = defineProps({
    form: {
      type: Object,
      required: true
    }
  });

  const isClass = computed(() => isClassMatch(props.form));
  const isDaily = computed(() => isDailyMatch(props.form));

  const activity = computed(() => findActivity(props.form.activityId));
  const stage = computed(() =>
    activity.value?.stages?.find((d) => d.stageId === props.form.stageId)
  );

  const activityName = computed(() => activity.value?.activityName || '-');
  const stageName = computed(() => stage.value?.stageName || '-');

  const matchTimeText = computed(() => {
    if (!props.form.startTime || !props.form.endTime) {
      return '未设置';
    }
    return `${props.form.startTime} 至 ${props.form.endTime}`;
  });

  const regTimeText = computed(() => {
    if (!props.form.regStartTime || !props.form.regEndTime) {
      return '未设置';
    }
    return `${props.form.regStartTime} 至 ${props.form.regEndTime}`;
  });

  const scopeSummary = computed(() =>
    formatMatchScopeSummary(props.form, activity.value, stage.value)
  );

  const registrationSummary = computed(() => formatMatchRegistrationSummary(props.form));
  const insuranceSummary = computed(() => formatMatchInsuranceSummary(props.form));

  const classItems = computed(() => {
    if (!isClass.value) {
      return [];
    }
    return getMatchLinkedItems(props.form).map((row) => {
      const scoreConfig = row.scoreConfig ?? {};
      const submitters = scoreConfig.submitters?.length ? scoreConfig.submitters.join('、') : '未设置';
      const methods = scoreConfig.collectMethods?.length
        ? scoreConfig.collectMethods.join('、')
        : '未设置';
      return {
        ...row,
        scoreSummary: `提交人：${submitters}；采集：${methods}`
      };
    });
  });

  const pointsRules = computed(() => normalizePointsRules(props.form.pointsRules ?? {}));

  const dailySources = computed(() => {
    if (!isDaily.value) {
      return [];
    }
    return normalizeDataSources(props.form.dataSources ?? []).map((source) => ({
      ...source,
      enabledText: source.enabled ? '已启用' : '未启用',
      weightText: source.countInPoints === false ? '不计分' : `${source.weight ?? 0}%`
    }));
  });

  const weightHint = computed(() => formatWeightTotalHint(props.form.dataSources ?? []));

  const scoringPlanText = computed(() => {
    const plan = props.form.scoringPlan;
    if (!plan?.name) {
      return '未配置';
    }
    return plan.version ? `${plan.name}（${plan.version}）` : plan.name;
  });

  const dailyInsuranceSummary = computed(() => formatMatchInsuranceSummary(props.form));
</script>

<style scoped lang="scss">
  .match-form-confirm {
    padding-bottom: 8px;
  }

  .confirm-tip {
    margin-bottom: 16px;
  }

  .confirm-block {
    margin-bottom: 12px;
    padding: 12px 20px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
  }

  .block-title {
    margin-bottom: 10px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    padding-left: 8px;
    border-left: 3px solid var(--el-color-primary);
  }

  .summary-text,
  .empty-text {
    font-size: 13px;
    color: var(--el-text-color-regular);
    line-height: 1.6;
  }

  .summary-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .summary-line {
    font-size: 13px;
    color: var(--el-text-color-regular);
    line-height: 1.5;
  }
</style>
