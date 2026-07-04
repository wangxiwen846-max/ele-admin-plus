<!-- 比赛详情大弹窗 -->
<template>
  <ele-modal
    v-model="visible"
    :width="'86%'"
    title="比赛详情"
    :body-style="{ padding: '0' }"
    class="match-detail-modal"
    @closed="$emit('closed')"
  >
    <div v-if="data" class="detail-scroll">
      <div class="overview-card">
        <div class="overview-head">
          <div>
            <ele-text type="heading" size="lg">{{ data.matchName }}</ele-text>
            <div class="overview-meta">
              <el-tag size="small" effect="plain">{{ matchTypeLabel }}</el-tag>
              <span>{{ formatMatchTime(data) }}</span>
            </div>
          </div>
        </div>
        <el-row :gutter="12" class="stat-row">
          <template v-if="isClass">
            <el-col :md="4" :sm="8" :xs="12">
              <div class="stat-item">
                <div class="stat-label">比赛状态</div>
                <div class="stat-value stat-value--sm">
                  <el-tag :type="getStatusTagType(data.matchStatus)" size="small" effect="plain">
                    {{ data.matchStatus }}
                  </el-tag>
                </div>
              </div>
            </el-col>
            <el-col :md="4" :sm="8" :xs="12">
              <div class="stat-item">
                <div class="stat-label">报名状态</div>
                <div class="stat-value stat-value--sm">
                  <el-tag
                    :type="getRegistrationStatusTagType(data.registrationStatus)"
                    size="small"
                    effect="plain"
                  >
                    {{ data.registrationStatus }}
                  </el-tag>
                </div>
              </div>
            </el-col>
            <el-col :md="4" :sm="8" :xs="12">
              <div class="stat-item">
                <div class="stat-label">设项数量</div>
                <div class="stat-value">{{ itemStats.total }}</div>
              </div>
            </el-col>
            <el-col :md="4" :sm="8" :xs="12">
              <div class="stat-item">
                <div class="stat-label">个人赛数量</div>
                <div class="stat-value">{{ itemStats.personal }}</div>
              </div>
            </el-col>
            <el-col :md="4" :sm="8" :xs="12">
              <div class="stat-item">
                <div class="stat-label">团体赛数量</div>
                <div class="stat-value">{{ itemStats.team }}</div>
              </div>
            </el-col>
            <el-col :md="4" :sm="8" :xs="12">
              <div class="stat-item">
                <div class="stat-label">报名概况</div>
                <div class="stat-value stat-value--sm">{{ formatRegistrationOverview(data) }}</div>
              </div>
            </el-col>
          </template>
          <template v-else>
            <el-col :md="6" :sm="12" :xs="12">
              <div class="stat-item">
                <div class="stat-label">已启用数据来源</div>
                <div class="stat-value stat-value--sm">{{ enabledSourceCount }} 类</div>
              </div>
            </el-col>
            <el-col :md="6" :sm="12" :xs="12">
              <div class="stat-item">
                <div class="stat-label">参与方式</div>
                <div class="stat-value stat-value--sm">无需报名，自动参与</div>
              </div>
            </el-col>
            <el-col :md="6" :sm="12" :xs="12">
              <div class="stat-item">
                <div class="stat-label">评分方案</div>
                <div class="stat-value stat-value--sm">{{ SCORING_PLAN_NAME }}</div>
              </div>
            </el-col>
            <el-col :md="6" :sm="12" :xs="12">
              <div class="stat-item">
                <div class="stat-label">排名对象</div>
                <div class="stat-value stat-value--sm">{{ joinText(data.rankingRules?.targets) }}</div>
              </div>
            </el-col>
          </template>
        </el-row>
      </div>

      <div class="detail-block">
        <div class="block-title">基础信息</div>
        <el-descriptions :column="2" size="small" class="desc-plain">
          <el-descriptions-item label="所属活动">{{ activity?.activityName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="所属赛段">{{ data.stageName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="比赛类型">{{ matchTypeDetailText }}</el-descriptions-item>
          <el-descriptions-item label="比赛名称">{{ data.matchName }}</el-descriptions-item>
          <el-descriptions-item label="开展形式">{{ data.deliveryForm || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="比赛说明" :span="2">
            <detail-text-cell :text="data.description || '未填写'" :max-length="120" />
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-block">
        <div class="block-title">时间信息</div>
        <el-descriptions :column="2" size="small" class="desc-plain">
          <el-descriptions-item label="比赛开始时间">{{ data.startTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="比赛结束时间">{{ data.endTime || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="isClass" label="报名时间">{{ registrationTimeText }}</el-descriptions-item>
          <el-descriptions-item label="比赛状态">
            <el-tag :type="getStatusTagType(data.matchStatus)" size="small" effect="plain">
              {{ data.matchStatus }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-block">
        <div class="block-title">参赛范围</div>
        <div class="coverage-summary">
          <div class="coverage-summary-line">
            <span class="coverage-label">范围来源：</span>
            <span>{{ scopeDisplay.source }}</span>
          </div>
          <div class="coverage-summary-line">
            <span class="coverage-label">范围摘要：</span>
            <span class="coverage-summary-main">{{ scopeDisplay.summary }}</span>
          </div>
          <el-table
            v-if="scopeDisplay.detailRows.length"
            :data="scopeDisplay.detailRows"
            border
            size="small"
            class="coverage-detail-table"
          >
            <el-table-column prop="level" label="范围层级" width="120" />
            <el-table-column prop="content" label="内容" min-width="280">
              <template #default="{ row }">
                <detail-text-cell :text="row.content" :max-length="80" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 传统赛（校园赛 / 区域赛 / 全国总决赛） -->
      <template v-if="isClass">
        <div class="detail-block">
          <div class="block-title">比赛设项</div>
          <el-table :data="linkedItems" border size="small">
            <el-table-column prop="itemName" label="设项名称" min-width="110" show-overflow-tooltip />
            <el-table-column prop="project" label="关联体育项目" min-width="130" show-overflow-tooltip />
            <el-table-column prop="matchForm" label="比赛形式" width="88" align="center" />
            <el-table-column prop="scoreType" label="成绩类型" width="96" align="center" />
            <el-table-column label="计分规则" min-width="100">
              <template #default="{ row }">
                <detail-text-cell :text="row.scoringRule || '未启用'" :max-length="16" />
              </template>
            </el-table-column>
            <el-table-column label="奖项设置" min-width="100">
              <template #default="{ row }">
                <detail-text-cell :text="row.awardSummary || '暂无奖项'" :max-length="16" />
              </template>
            </el-table-column>
            <el-table-column label="参赛要求" min-width="120">
              <template #default="{ row }">
                <detail-text-cell :text="row.qualification || '-'" :max-length="20" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="88" align="center" fixed="right">
              <template #default="{ row }">
                <el-link type="primary" underline="never" @click="openItemSnapshot(row)">
                  查看配置
                </el-link>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="detail-block">
          <div class="block-title">报名设置</div>
          <el-descriptions :column="1" size="small" class="desc-plain">
            <el-descriptions-item label="报名方式">
              {{ formatRegistrationMethods(data.matchRegistration?.methods) || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="是否限制报名数量">
              {{ data.matchRegistration?.limitEnabled ? '是' : '否' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="data.matchRegistration?.limitEnabled" label="报名数量上限">
              {{ data.matchRegistration?.limitCount ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="data.matchRegistration?.limitEnabled" label="报名说明">
              {{ data.matchRegistration?.limitRemark || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-block">
          <div class="block-title">保险设置</div>
          <el-descriptions :column="1" size="small" class="desc-plain">
            <el-descriptions-item label="保险类型">
              {{ getInsuranceTypeByMatchType(data.matchType) || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="保险方案">
              {{ getInsurancePlanName(data.matchInsurance?.planId) }}
            </el-descriptions-item>
            <el-descriptions-item label="保险方式">{{ data.matchInsurance?.method || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-block">
          <div class="block-title">成绩设置</div>
          <el-table :data="scoreRows" border size="small">
            <el-table-column prop="itemName" label="设项名称" min-width="120" />
            <el-table-column label="成绩提交人" min-width="120">
              <template #default="{ row }">{{ joinText(row.submitters) }}</template>
            </el-table-column>
            <el-table-column label="成绩采集方式" min-width="120">
              <template #default="{ row }">{{ joinText(row.collectMethods) }}</template>
            </el-table-column>
            <el-table-column prop="submitStartTime" label="提交开始时间" width="150">
              <template #default="{ row }">{{ row.submitStartTime || '未设置' }}</template>
            </el-table-column>
            <el-table-column prop="submitEndTime" label="提交截止时间" width="150">
              <template #default="{ row }">{{ row.submitEndTime || '未设置' }}</template>
            </el-table-column>
            <el-table-column label="重复提交规则" min-width="160">
              <template #default>允许重复提交；按最新成绩计算</template>
            </el-table-column>
            <el-table-column label="成绩提交说明" min-width="140">
              <template #default="{ row }">
                <detail-text-cell :text="row.remark || '-'" :max-length="24" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>

      <!-- 每日积分赛 -->
      <template v-else>
        <div class="detail-block">
          <div class="block-title">参与方式</div>
          <div class="section-tip">无需报名，参赛范围内学生自动参与积分统计。</div>
        </div>

        <div class="detail-block">
          <div class="block-title">评分方案</div>
          <el-descriptions :column="2" size="small" class="desc-plain">
            <el-descriptions-item label="评分方案">{{ SCORING_PLAN_NAME }}</el-descriptions-item>
            <el-descriptions-item label="规则状态">系统预置，不支持本场比赛修改核心评分规则</el-descriptions-item>
            <el-descriptions-item label="规则版本">{{ SCORING_PLAN_VERSION }}</el-descriptions-item>
            <el-descriptions-item label="权重配置">支持按数据来源配置权重</el-descriptions-item>
            <el-descriptions-item label="生成配置">支持配置日积分、周积分、阶段累计积分生成时间</el-descriptions-item>
            <el-descriptions-item label="发布后规则">
              {{ data.scoringPlanSnapshot?.savedAt ? `已保存快照（${data.scoringPlanSnapshot.savedAt}）` : '发布后保存评分规则版本、数据来源配置、权重配置和积分生成配置快照' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-block">
          <div class="block-title">数据来源</div>
          <el-table :data="enabledSources" border size="small">
            <el-table-column prop="sourceType" label="数据来源" width="130" />
            <el-table-column label="状态" width="72" align="center">
              <template #default>启用</template>
            </el-table-column>
            <el-table-column label="提交 / 采集角色" min-width="140">
              <template #default="{ row }">{{ row.roleSummary || joinText(row.submitRoles) }}</template>
            </el-table-column>
            <el-table-column label="采集方式" min-width="130">
              <template #default="{ row }">{{ row.methodSummary || joinText(row.collectMethods) }}</template>
            </el-table-column>
            <el-table-column label="计入口径" min-width="150">
              <template #default="{ row }">{{ row.countInCaliber || '-' }}</template>
            </el-table-column>
            <el-table-column label="归属日期" width="96">
              <template #default="{ row }">{{ row.belongDate || '-' }}</template>
            </el-table-column>
            <el-table-column label="权重" width="72" align="center">
              <template #default="{ row }">{{ formatSourceWeight(row) }}</template>
            </el-table-column>
          </el-table>
          <div v-if="disabledSources.length" class="section-tip disabled-sources">
            已停用：{{ disabledSources.map((d) => d.sourceType).join('、') }}
          </div>
        </div>

        <div class="detail-block">
          <div class="block-title">积分生成规则</div>
          <el-descriptions :column="2" size="small" class="desc-plain">
            <el-descriptions-item label="日积分生成">固定开启</el-descriptions-item>
            <el-descriptions-item label="日积分生成时间">{{ pointsRulesDisplay.dailyGenerateTime }}</el-descriptions-item>
            <el-descriptions-item label="数据截止时间">{{ pointsRulesDisplay.dataCutoffTime }}</el-descriptions-item>
            <el-descriptions-item label="超过截止时间的数据">{{ pointsRulesDisplay.overdueDataHandling }}</el-descriptions-item>
            <el-descriptions-item label="周积分生成">{{ pointsRulesDisplay.weeklyEnabled ? '开启' : '关闭' }}</el-descriptions-item>
            <el-descriptions-item v-if="pointsRulesDisplay.weeklyEnabled" label="周统计周期">
              {{ pointsRulesDisplay.weeklyStatPeriod }}
            </el-descriptions-item>
            <el-descriptions-item v-if="pointsRulesDisplay.weeklyEnabled" label="周积分生成时间">
              {{ pointsRulesDisplay.weeklyGenerateTime }}
            </el-descriptions-item>
            <el-descriptions-item v-if="pointsRulesDisplay.weeklyEnabled" label="周榜是否展示">
              {{ pointsRulesDisplay.weeklyRankingVisible ? '是' : '否' }}
            </el-descriptions-item>
            <el-descriptions-item label="阶段累计积分">固定生成</el-descriptions-item>
            <el-descriptions-item label="阶段累计更新方式">{{ pointsRulesDisplay.stageUpdateMethod }}</el-descriptions-item>
            <el-descriptions-item
              v-if="pointsRulesDisplay.stageUpdateMethod !== '比赛结束后生成'"
              label="阶段累计更新时间"
            >
              {{ pointsRulesDisplay.stageUpdateTime || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="阶段累计规则">{{ pointsRulesDisplay.stageRule }}</el-descriptions-item>
            <el-descriptions-item label="是否允许补交">
              {{ pointsRulesDisplay.allowLateSubmit ? '是' : '否' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="pointsRulesDisplay.allowLateSubmit" label="补交截止时间">
              {{ pointsRulesDisplay.lateSubmitDeadline || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="是否允许补算">
              {{ pointsRulesDisplay.allowRecalculate ? '是' : '否' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="pointsRulesDisplay.allowRecalculate" label="补算范围">
              {{ pointsRulesDisplay.recalculateScope }}
            </el-descriptions-item>
            <el-descriptions-item v-if="pointsRulesDisplay.recalculateRemark" label="补算说明" :span="2">
              <detail-text-cell :text="pointsRulesDisplay.recalculateRemark" :max-length="80" />
            </el-descriptions-item>
            <el-descriptions-item label="重复提交规则" :span="2">
              {{ pointsRulesDisplay.resubmitRule }}
            </el-descriptions-item>
            <el-descriptions-item v-if="pointsRulesDisplay.description" label="生成规则说明" :span="2">
              <detail-text-cell :text="pointsRulesDisplay.description" :max-length="80" />
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-block">
          <div class="block-title">排名规则</div>
          <el-descriptions :column="2" size="small" class="desc-plain">
            <el-descriptions-item label="排名对象">{{ joinText(data.rankingRules?.targets) }}</el-descriptions-item>
            <el-descriptions-item label="榜单类型">{{ joinText(rankingPeriods) }}</el-descriptions-item>
            <el-descriptions-item label="排名依据">{{ RANKING_BASIS_FIXED }}</el-descriptions-item>
            <el-descriptions-item label="并列处理">{{ data.rankingRules?.tieRule || '-' }}</el-descriptions-item>
            <el-descriptions-item label="结果展示范围" :span="2">
              {{ joinText(data.rankingRules?.displayScopes) }}
            </el-descriptions-item>
            <el-descriptions-item v-if="data.rankingRules?.description" label="排名规则说明" :span="2">
              <detail-text-cell :text="data.rankingRules.description" :max-length="80" />
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-block">
          <div class="block-title">保险设置</div>
          <el-descriptions :column="2" size="small" class="desc-plain">
            <el-descriptions-item label="保险类型">
              {{ getInsuranceTypeByMatchType(data.matchType) || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="保险方案">
              {{ getInsurancePlanName(data.dailyInsurance?.planId) }}
            </el-descriptions-item>
            <el-descriptions-item label="保险方式">{{ data.dailyInsurance?.method || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-block">
          <div class="block-title">奖项设置</div>
          <div v-if="!dailyAwardRows.length" class="section-tip">暂无奖项</div>
          <div v-else class="award-group">
            <div class="award-group-head">
              <span class="award-group-meta">已配置奖项 {{ dailyAwardRows.length }} 个</span>
            </div>
            <div v-for="award in dailyAwardRows" :key="award.id" class="award-line">
              <span class="award-line-name">{{ award.awardName }}：</span>
              <span>{{ award.awardRule }}</span>
              <span v-if="award.awardTarget" class="award-line-target">
                （获奖对象：{{ award.awardTarget }}）
              </span>
            </div>
            <div v-if="data.dailyAwards?.awardRemark" class="award-remark">
              补充说明：{{ data.dailyAwards.awardRemark }}
            </div>
          </div>
        </div>
      </template>

      <div class="detail-block">
        <div class="block-title">附件</div>
        <match-attachment-readonly :list="data.attachments ?? []" />
      </div>

      <div class="detail-block detail-block--last">
        <div class="block-title">操作信息</div>
        <el-descriptions :column="2" size="small" class="desc-plain">
          <el-descriptions-item label="创建人">{{ data.createBy || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ data.createTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="最近更新人">{{ data.updateBy || '-' }}</el-descriptions-item>
          <el-descriptions-item label="最近更新时间">{{ data.updateTime || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <template #footer>
      <div class="detail-footer-bar">
        <el-button type="primary" @click="emitAction('edit')">编辑比赛</el-button>
        <el-button @click="emitAction('copy')">复制比赛</el-button>
        <el-button v-if="isDaily" @click="emitAction('view-registration')">查看参与记录</el-button>
        <el-button v-else @click="emitAction('view-registration')">查看参赛名单</el-button>
        <el-button @click="visible = false">关闭</el-button>
      </div>
    </template>
  </ele-modal>

  <match-item-snapshot-dialog
    v-if="snapshotItem"
    :match="data"
    :row="snapshotItem"
    @closed="snapshotItem = null"
  />
</template>

<script setup>
  import { computed, ref } from 'vue';
  import DetailTextCell from '@/views/competition/activity/components/detail-text-cell.vue';
  import { findActivity } from '@/views/competition/activity/data.js';
  import { getAwardCount } from '@/views/event-item/data.js';
  import {
    getInsurancePlanName,
    getInsuranceTypeByMatchType
  } from '@/views/competition/insurance/data.js';
  import MatchAttachmentReadonly from './match-attachment-readonly.vue';
  import MatchItemSnapshotDialog from './match-item-snapshot-dialog.vue';
  import {
    findMatch,
    formatMatchItemAwardCountText,
    formatMatchItemInsuranceSummary,
    formatMatchItemRegistrationSummary,
    formatMatchTime,
    formatMatchTypeLabel,
    formatRegistrationTime,
    formatRegistrationOverview,
    formatRegistrationMethods,
    formatSourceWeight,
    getMatchItemStats,
    getMatchLinkedItems,
    getMatchScopeDisplayInfo,
    getItemRegistrationRows,
    getItemInsuranceRows,
    getItemScoreRows,
    getRegistrationStatusTagType,
    getStatusTagType,
    isClassMatch,
    isDailyMatch,
    normalizeDataSources,
    normalizePointsRules,
    RANKING_BASIS_FIXED,
    SCORING_PLAN_NAME,
    SCORING_PLAN_VERSION
  } from '../data.js';

  const props = defineProps({
    matchId: { type: String, required: true }
  });
  const emit = defineEmits(['closed', 'edit', 'copy', 'view-registration']);

  const visible = ref(true);
  const snapshotItem = ref(null);
  const data = computed(() => findMatch(props.matchId));
  const activity = computed(() => (data.value ? findActivity(data.value.activityId) : null));
  const stage = computed(() =>
    activity.value?.stages?.find((d) => d.stageId === data.value?.stageId)
  );
  const isClass = computed(() => isClassMatch(data.value));
  const isDaily = computed(() => isDailyMatch(data.value));
  const matchTypeLabel = computed(() =>
    formatMatchTypeLabel(data.value?.matchType, data.value?.stageName)
  );
  const matchTypeDetailText = computed(() => matchTypeLabel.value);
  const registrationTimeText = computed(() => formatRegistrationTime(data.value));
  const itemStats = computed(() => getMatchItemStats(data.value ?? {}));
  const linkedItems = computed(() => getMatchLinkedItems(data.value));
  const registrationRows = computed(() => getItemRegistrationRows(data.value));
  const insuranceRows = computed(() => getItemInsuranceRows(data.value));
  const scoreRows = computed(() => getItemScoreRows(data.value));
  const scopeDisplay = computed(() =>
    getMatchScopeDisplayInfo(data.value, activity.value, stage.value)
  );
  const enabledSourceCount = computed(
    () => (data.value?.dataSources ?? []).filter((d) => d.enabled).length
  );
  const normalizedSources = computed(() => normalizeDataSources(data.value?.dataSources ?? []));
  const enabledSources = computed(() => normalizedSources.value.filter((d) => d.enabled));
  const disabledSources = computed(() => normalizedSources.value.filter((d) => !d.enabled));
  const rankingPeriods = computed(() => {
    const rules = data.value?.rankingRules ?? {};
    if (rules.periods?.length) {
      return rules.periods;
    }
    if (rules.period) {
      const map = { 每日: '日榜', 每周: '周榜', 阶段: '阶段榜' };
      return [map[rules.period] ?? rules.period];
    }
    return [];
  });
  const pointsRulesDisplay = computed(() =>
    normalizePointsRules(data.value?.scoringPlanSnapshot?.pointsRules ?? data.value?.pointsRules)
  );

  const awardGroups = computed(() =>
    (data.value?.itemIds ?? []).map((id) => {
      const item = linkedItems.value.find((d) => d.itemId === id);
      const config = data.value?.itemAwardConfig?.[String(id)] ?? { awards: [], awardRemark: '' };
      const awards = config.awards ?? [];
      const count = getAwardCount(awards);
      const targets = count
        ? [...new Set(awards.map((d) => d.awardTarget).filter(Boolean))].join('、')
        : '';
      return {
        itemId: id,
        itemName: item?.itemName ?? '-',
        countText: count ? `已配置奖项 ${count} 个` : '暂无奖项',
        targets,
        awards,
        awardRemark: config.awardRemark || ''
      };
    })
  );

  const dailyAwardRows = computed(() => data.value?.dailyAwards?.awards ?? []);

  const joinText = (list) => (list?.length ? list.join('、') : '-');

  const openItemSnapshot = (row) => {
    snapshotItem.value = row;
  };

  const emitAction = (action) => {
    visible.value = false;
    emit(action, data.value);
  };
</script>

<style scoped lang="scss">
  .detail-scroll {
    max-height: calc(72vh - 8px);
    overflow-y: auto;
    padding: 14px 20px 6px;
  }

  .overview-card {
    margin-bottom: 12px;
    padding: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
  }

  .overview-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
    flex-wrap: wrap;
  }

  .stat-row {
    margin-top: 12px;
  }

  .stat-item {
    padding: 10px;
    background: var(--el-bg-color);
    border-radius: 6px;
  }

  .stat-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .stat-value {
    margin-top: 6px;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);

    &--sm {
      font-size: 15px;
    }
  }

  .detail-block {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color-extra-light);

    &--last {
      margin-bottom: 0;
      border-bottom: none;
    }
  }

  .block-title {
    margin-bottom: 10px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    padding-left: 8px;
    border-left: 3px solid var(--el-color-primary);
  }

  .section-tip {
    color: var(--el-text-color-secondary);
    font-size: 13px;

    &.disabled-sources {
      margin-top: 10px;
    }
  }

  .coverage-summary {
    padding: 10px 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
    font-size: 13px;
  }

  .coverage-summary-line {
    margin-bottom: 6px;
    color: var(--el-text-color-regular);

    &:last-of-type {
      margin-bottom: 10px;
    }
  }

  .coverage-label {
    color: var(--el-text-color-secondary);
  }

  .coverage-summary-main {
    color: var(--el-text-color-primary);
    font-weight: 500;
  }

  .coverage-detail-table {
    margin-top: 4px;
  }

  .award-group {
    padding: 10px 12px;
    margin-bottom: 10px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .award-group-head {
    margin-bottom: 8px;
    font-size: 13px;
    color: var(--el-text-color-primary);
    font-weight: 500;
  }

  .award-group-name {
    font-weight: 600;
  }

  .award-group-meta {
    color: var(--el-text-color-secondary);
    font-weight: 400;
  }

  .award-line {
    font-size: 13px;
    color: var(--el-text-color-regular);
    line-height: 1.8;

    &--empty {
      color: var(--el-text-color-secondary);
    }
  }

  .award-line-name {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .award-line-target {
    color: var(--el-text-color-secondary);
    margin-left: 4px;
  }

  .award-remark {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed var(--el-border-color-lighter);
    font-size: 13px;
    color: var(--el-text-color-secondary);
    line-height: 1.6;
  }

  .detail-footer-bar {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    width: 100%;
  }
</style>
