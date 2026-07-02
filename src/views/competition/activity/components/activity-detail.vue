<!-- 活动详情大弹窗 -->
<template>
  <ele-modal
    v-model="visible"
    :width="'86%'"
    title="活动详情"
    :body-style="{ padding: '0' }"
    class="activity-detail-modal"
    @closed="$emit('closed')"
  >
    <div v-if="data" class="detail-scroll">
      <div class="overview-card">
        <div class="overview-head">
          <div>
            <ele-text type="heading" size="lg">{{ data.activityName }}</ele-text>
            <div class="overview-meta">
              <el-tag
                :type="getStatusTagType(status)"
                size="small"
                effect="plain"
                :disable-transitions="true"
              >
                {{ status }}
              </el-tag>
              <span>{{ formatActivityTime(data) }}</span>
              <span class="status-tip">（状态由活动时间自动计算）</span>
            </div>
          </div>
        </div>
        <el-row :gutter="12" class="stat-row">
          <el-col :md="4" :sm="8" :xs="12">
            <div class="stat-item">
              <div class="stat-label">未开始比赛</div>
              <div class="stat-value">{{ matchStats.notStarted }}</div>
            </div>
          </el-col>
          <el-col :md="4" :sm="8" :xs="12">
            <div class="stat-item">
              <div class="stat-label">进行中比赛</div>
              <div class="stat-value">{{ matchStats.inProgress }}</div>
            </div>
          </el-col>
          <el-col :md="4" :sm="8" :xs="12">
            <div class="stat-item">
              <div class="stat-label">已结束比赛</div>
              <div class="stat-value">{{ matchStats.ended }}</div>
            </div>
          </el-col>
          <el-col :md="4" :sm="8" :xs="12">
            <div class="stat-item">
              <div class="stat-label">覆盖学校数</div>
              <div class="stat-value">{{ data.schoolCount }}</div>
            </div>
          </el-col>
          <el-col :md="4" :sm="8" :xs="12">
            <div class="stat-item">
              <div class="stat-label">覆盖学生数</div>
              <div class="stat-value">{{ data.studentCount }}</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="detail-block">
        <div class="block-title">活动基础信息</div>
        <el-descriptions :column="2" size="small" class="desc-plain">
          <el-descriptions-item label="活动名称">{{ data.activityName }}</el-descriptions-item>
          <el-descriptions-item label="活动封面">
            <el-image
              v-if="data.cover"
              :src="data.cover"
              fit="cover"
              style="width: 72px; height: 48px; border-radius: 4px"
            />
            <span v-else class="text-secondary">未上传</span>
          </el-descriptions-item>
          <el-descriptions-item label="活动介绍" :span="2">
            <detail-text-cell :text="data.introduction" :max-length="120" />
          </el-descriptions-item>
          <el-descriptions-item label="活动规程" :span="2">
            <div class="regulation-detail">
              <div class="regulation-detail-row">
                <span class="detail-sublabel">文本内容：</span>
                <detail-text-cell :text="data.regulationText || '未填写'" :max-length="80" />
              </div>
              <div class="regulation-detail-row">
                <span class="detail-sublabel">附件：</span>
                <div v-if="data.regulationAttachments?.length" class="regulation-file-list">
                  <div
                    v-for="file in data.regulationAttachments"
                    :key="file.id"
                    class="regulation-file-item"
                  >
                    <span class="file-name">{{ file.name }}</span>
                    <el-link type="primary" underline="never" @click="previewRegulation(file)">
                      查看
                    </el-link>
                    <el-divider direction="vertical" />
                    <el-link type="primary" underline="never" @click="downloadRegulation(file)">
                      下载
                    </el-link>
                  </div>
                </div>
                <span v-else class="text-secondary">未上传</span>
              </div>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-block">
        <div class="block-title">组织信息</div>
        <el-descriptions :column="2" size="small" class="desc-plain">
          <el-descriptions-item label="指导单位">
            {{ formatUnits(data.guidingUnits) }}
          </el-descriptions-item>
          <el-descriptions-item label="主办单位">
            {{ formatUnits(data.hostUnits) }}
          </el-descriptions-item>
          <el-descriptions-item label="承办单位">
            {{ formatUnits(data.organizerUnits) }}
          </el-descriptions-item>
          <el-descriptions-item label="协办单位">
            {{ formatUnits(data.coOrganizerUnits) }}
          </el-descriptions-item>
          <el-descriptions-item label="运营服务单位">
            {{ formatUnits(data.operationServiceUnits) }}
          </el-descriptions-item>
          <el-descriptions-item label="支持单位">
            {{ formatUnits(data.supportUnits) }}
          </el-descriptions-item>
          <el-descriptions-item label="大赛总裁判长" :span="2">
            {{ data.chiefReferee || '-' }}
          </el-descriptions-item>
        </el-descriptions>
        <div class="committee-detail-label">赛事组委会名单</div>
        <el-table
          v-if="data.committeeMembers?.length"
          :data="data.committeeMembers"
          border
          size="small"
          class="committee-detail-table"
        >
          <el-table-column prop="name" label="姓名" min-width="100" />
          <el-table-column prop="position" label="职务" min-width="100" />
          <el-table-column prop="organization" label="单位" min-width="160" show-overflow-tooltip />
        </el-table>
        <div v-else class="empty-text">暂无组委会成员</div>
      </div>

      <div class="detail-block">
        <div class="block-title">活动时间</div>
        <el-descriptions :column="2" size="small" class="desc-plain">
          <el-descriptions-item label="活动开始时间">{{ data.startTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="活动结束时间">{{ data.endTime || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-block">
        <div class="block-title">赛段信息</div>
        <el-table :data="data.stages" border size="small">
          <el-table-column prop="stageName" label="赛段名称" min-width="120" />
          <el-table-column label="赛段时间" min-width="180">
            <template #default="{ row }">{{ formatStageDateRange(row) }}</template>
          </el-table-column>
          <el-table-column label="比赛类型" min-width="220">
            <template #default="{ row }">{{ formatStagePublishMatchTypes(row) }}</template>
          </el-table-column>
          <el-table-column label="赛段说明" min-width="120">
            <template #default="{ row }">
              <detail-text-cell :text="row.description" :max-length="20" />
            </template>
          </el-table-column>
          <el-table-column label="启用状态" width="88" align="center">
            <template #default="{ row }">
              <ele-dot
                v-if="row.enabled"
                text="启用"
                type="success"
                size="8px"
                :ripple="false"
              />
              <ele-dot v-else text="禁用" type="info" size="8px" :ripple="false" />
            </template>
          </el-table-column>
          <el-table-column prop="matchCount" label="关联比赛数量" width="110" align="center" />
        </el-table>
      </div>

      <div class="detail-block">
        <div class="block-title">活动设项范围</div>
        <div class="section-tip">以下设项来自设项管理 / 设项库，不在活动管理中维护设项本身。</div>
        <el-table :data="linkedItems" border size="small">
          <el-table-column prop="itemName" label="设项名称" min-width="120" />
          <el-table-column prop="project" label="关联项目" min-width="110" />
          <el-table-column prop="scoreType" label="成绩类型" width="110" align="center" />
          <el-table-column label="计分规则" min-width="120">
            <template #default="{ row }">
              <detail-text-cell :text="row.scoringRule" :max-length="20" />
            </template>
          </el-table-column>
          <el-table-column label="报名设置" min-width="130">
            <template #default="{ row }">
              <detail-text-cell :text="row.registrationSetting" :max-length="22" />
            </template>
          </el-table-column>
          <el-table-column label="参赛要求" min-width="120">
            <template #default="{ row }">
              <detail-text-cell :text="row.qualification" :max-length="20" />
            </template>
          </el-table-column>
          <el-table-column label="适用区域" min-width="120">
            <template #default="{ row }">
              <detail-text-cell :text="row.applicableRegion" :max-length="20" />
            </template>
          </el-table-column>
          <el-table-column label="奖项设置" min-width="140">
            <template #default="{ row }">
              <detail-text-cell :text="row.awardSummary" :max-length="22" />
            </template>
          </el-table-column>
          <el-table-column label="奖项补充说明" min-width="140">
            <template #default="{ row }">
              <detail-text-cell :text="row.awardRemark || '未填写'" :max-length="22" />
            </template>
          </el-table-column>
          <el-table-column label="启用状态" width="88" align="center">
            <template #default="{ row }">
              <ele-dot
                v-if="row.status === 1"
                text="启用"
                type="success"
                size="8px"
                :ripple="false"
              />
              <ele-dot v-else text="停用" type="danger" size="8px" :ripple="false" />
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!linkedItems.length" class="empty-text">未配置活动设项范围</div>
      </div>

      <div class="detail-block">
        <div class="block-title">附件</div>
        <div class="section-tip">
          可上传活动通知、保险说明、补充材料等，不作为系统规则判断依据。
        </div>
        <attachment-table
          title="活动附件"
          :list="data.attachments ?? []"
          readonly
          compact
        />
        <div v-if="!data.attachments?.length" class="empty-text">暂无附件</div>
      </div>

      <div class="detail-block">
        <div class="block-title">下属比赛列表</div>
        <el-table :data="displayMatches" border size="small">
          <el-table-column prop="matchName" label="比赛名称" min-width="180" />
          <el-table-column prop="stageName" label="所属赛段" width="120" />
          <el-table-column label="比赛时间" min-width="200">
            <template #default="{ row }">{{ row.startTime }} 至 {{ row.endTime }}</template>
          </el-table-column>
          <el-table-column prop="matchStatus" label="比赛状态" width="100" align="center" />
          <el-table-column prop="registrationStatus" label="报名状态" width="100" align="center" />
          <el-table-column prop="itemCount" label="设项数量" width="90" align="center" />
          <el-table-column label="报名人数/队伍数" width="130" align="center">
            <template #default="{ row }">{{ row.registrationCount }}</template>
          </el-table-column>
          <el-table-column label="操作" width="110" align="center" fixed="right">
            <template #default="{ row }">
              <el-link type="primary" underline="never" @click="viewMatch(row)">查看比赛详情</el-link>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!displayMatches.length" class="empty-text">暂无下属比赛</div>
        <div v-if="hasMoreMatches" class="match-more-bar">
          <el-link type="primary" underline="never" @click="viewAllMatches">
            查看全部比赛（共 {{ enrichedMatches.length }} 场）
          </el-link>
        </div>
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
        <el-button v-if="canEdit" type="primary" @click="emitAction('edit')">编辑活动</el-button>
        <el-button @click="emitAction('copy')">复制活动</el-button>
        <el-button @click="visible = false">关闭</el-button>
      </div>
    </template>
  </ele-modal>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import AttachmentTable from '@/views/event-item/components/attachment-table.vue';
  import DetailTextCell from './detail-text-cell.vue';
  import {
    enrichMatchesWithStatus,
    findActivity,
    formatActivityTime,
    formatStageDateRange,
    formatStagePublishMatchTypes,
    formatUnits,
    getActivityLinkedItems,
    getActivityStatus,
    getEditMode,
    getMatchStats,
    getStatusTagType
  } from '../data.js';

  const props = defineProps({
    activityId: { type: Number, required: true }
  });
  const emit = defineEmits(['closed', 'edit', 'copy']);

  const router = useRouter();
  const visible = ref(true);
  const data = computed(() => findActivity(props.activityId));
  const status = computed(() => (data.value ? getActivityStatus(data.value) : ''));
  const enrichedMatches = computed(() =>
    enrichMatchesWithStatus(data.value?.matches ?? [], data.value)
  );
  const matchStats = computed(() => getMatchStats(data.value?.matches ?? [], data.value));
  const linkedItems = computed(() => getActivityLinkedItems(data.value?.itemIds ?? []));
  const canEdit = computed(() => data.value && getEditMode(data.value) !== 'readonly');
  const displayMatches = computed(() => enrichedMatches.value.slice(0, 5));
  const hasMoreMatches = computed(() => enrichedMatches.value.length > 5);

  const emitAction = (action) => {
    visible.value = false;
    emit(action, data.value);
  };

  const viewMatch = (row) => {
    visible.value = false;
    emit('closed');
    router.push({ path: '/competition/match', query: { matchId: row.matchId } });
  };

  const viewAllMatches = () => {
    visible.value = false;
    emit('closed');
    router.push({ path: '/competition/match', query: { activityId: data.value?.activityId } });
  };

  const previewRegulation = (file) => {
    EleMessage.info({ message: `预览附件：${file.name}`, plain: true });
  };

  const downloadRegulation = (file) => {
    EleMessage.success({ message: `开始下载附件：${file.name}`, plain: true });
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

  .status-tip {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
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

  .section-tip,
  .empty-text,
  .text-secondary {
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }

  .section-tip {
    margin-bottom: 10px;
  }

  .empty-text {
    margin-top: 10px;
  }

  .regulation-detail-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    line-height: 1.6;

    & + .regulation-detail-row {
      margin-top: 10px;
    }
  }

  .detail-sublabel {
    flex-shrink: 0;
    color: var(--el-text-color-secondary);
  }

  .regulation-file-list {
    flex: 1;
    min-width: 0;
  }

  .regulation-file-item {
    display: flex;
    align-items: center;
    gap: 4px;

    & + .regulation-file-item {
      margin-top: 6px;
    }
  }

  .file-name {
    margin-right: 8px;
    color: var(--el-text-color-regular);
  }

  .org-detail-subtitle {
    margin: 4px 0 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);

    &--committee {
      margin-top: 14px;
    }
  }

  .committee-detail-label {
    margin-bottom: 8px;
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  .committee-detail-table {
    margin-bottom: 4px;
  }

  .coverage-summary {
    padding: 10px 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.6;
  }

  .coverage-summary-main {
    color: var(--el-text-color-primary);
    font-weight: 500;
    margin-bottom: 10px;
  }

  .coverage-detail-table {
    background: var(--el-bg-color);
  }

  .match-more-bar {
    margin-top: 10px;
    text-align: center;
  }

  .detail-footer-bar {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    width: 100%;
  }
</style>
