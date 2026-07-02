<!-- 比赛管理列表页 -->
<template>
  <ele-page class="match-page">
    <match-search @search="handleSearch" />
    <ele-card :body-style="{ paddingBottom: '4px' }">
      <ele-pro-table
        ref="tableRef"
        row-key="matchId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        :toolbar="{ theme: 'default' }"
        cache-key="CompetitionMatchTable"
      >
        <template #toolbar>
          <el-button type="primary" :icon="PlusOutlined" class="ele-btn-icon" @click="openAdd">
            发布比赛
          </el-button>
        </template>

        <template #matchName="{ row }">
          <el-tooltip :content="row.matchName" placement="top" :show-after="300">
            <el-link
              type="primary"
              underline="never"
              class="match-name-link"
              @click="openDetail(row)"
            >
              {{ row.matchName }}
            </el-link>
          </el-tooltip>
        </template>

        <template #matchTime="{ row }">
          <el-tooltip :content="formatMatchTimeTooltip(row)" placement="top">
            <span class="ellipsis-text">{{ formatMatchTimeShort(row) }}</span>
          </el-tooltip>
        </template>

        <template #registrationInfo="{ row }">
          <div class="registration-cell">
            <div class="registration-time">{{ getRegistrationDisplay(row).timeText }}</div>
            <el-tag
              :type="getRegistrationStatusTagType(getRegistrationDisplay(row).status)"
              size="small"
              effect="plain"
              :disable-transitions="true"
            >
              {{ getRegistrationDisplay(row).status }}
            </el-tag>
          </div>
        </template>

        <template #matchContent="{ row }">
          <el-tooltip :content="formatMatchContentTooltip(row)" placement="top">
            <div class="content-cell">
              <div>{{ formatMatchContentPrimary(row) }}</div>
              <div class="content-cell-sub">{{ formatMatchContentSecondary(row) }}</div>
            </div>
          </el-tooltip>
        </template>

        <template #registrationOverview="{ row }">
          {{ formatRegistrationOverview(row) }}
        </template>

        <template #matchStatus="{ row }">
          <el-tag
            :type="getStatusTagType(row.matchStatus)"
            size="small"
            effect="plain"
            :disable-transitions="true"
          >
            {{ row.matchStatus }}
          </el-tag>
        </template>

        <template #createTime="{ row }">
          <el-tooltip v-if="row.createTime" :content="row.createTime" placement="top">
            <span>{{ formatListDateTime(row.createTime) }}</span>
          </el-tooltip>
          <span v-else>-</span>
        </template>

        <template #action="{ row }">
          <el-link type="primary" underline="never" @click="openDetail(row)">查看详情</el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" underline="never" @click="openEdit(row)">编辑</el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" underline="never" @click="copyMatch(row)">复制</el-link>
          <el-divider direction="vertical" />
          <template v-if="isDailyMatch(row)">
            <el-link type="primary" underline="never" @click="viewDailyRecord(row)">查看参与记录</el-link>
          </template>
          <template v-else>
            <el-link type="primary" underline="never" @click="viewRegistration(row)">查看参赛名单</el-link>
          </template>
        </template>
      </ele-pro-table>
    </ele-card>

    <match-detail
      v-if="detailVisible"
      :match-id="detailMatchId"
      @closed="detailVisible = false"
      @edit="openEdit"
      @copy="copyMatch"
      @view-registration="viewRegistration"
    />

    <daily-participant-list-modal
      v-if="participantVisible && participantMatch"
      :match="participantMatch"
      @closed="participantVisible = false"
    />

    <registration-roster-list-modal
      v-model:visible="rosterVisible"
      :match-id="rosterMatchId"
    />
  </ele-page>
</template>

<script setup>
  import { onMounted, reactive, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { EleMessage } from 'ele-admin-plus';
  import { PlusOutlined } from '@/components/icons';
  import { usePageTab } from '@/utils/use-page-tab';
  import MatchSearch from './components/match-search.vue';
  import MatchDetail from './components/match-detail.vue';
  import DailyParticipantListModal from './components/daily-participant-list-modal.vue';
  import RegistrationRosterListModal from '@/views/competition/registration/components/registration-roster-list-modal.vue';
  import {
    copyMatchData,
    formatListDateTime,
    formatMatchContentPrimary,
    formatMatchContentSecondary,
    formatMatchContentTooltip,
    formatMatchTimeShort,
    formatMatchTimeTooltip,
    formatRegistrationListDisplay,
    formatRegistrationOverview,
    getAllMatches,
    getRegistrationStatusTagType,
    getStatusTagType,
    isDailyMatch
  } from './data.js';

  defineOptions({ name: 'CompetitionMatch' });

  const route = useRoute();
  const router = useRouter();
  const { addPageTab } = usePageTab();
  const tableRef = ref(null);
  const lastWhere = reactive({});

  const detailVisible = ref(false);
  const detailMatchId = ref('');
  const participantVisible = ref(false);
  const participantMatch = ref(null);
  const rosterVisible = ref(false);
  const rosterMatchId = ref('');

  const columns = ref([
    {
      prop: 'matchName',
      label: '比赛名称',
      minWidth: 220,
      slot: 'matchName',
      fixed: 'left'
    },
    { prop: 'matchType', label: '比赛类型', width: 110, align: 'center' },
    { columnKey: 'matchTime', label: '比赛时间', minWidth: 170, slot: 'matchTime' },
    {
      columnKey: 'registrationInfo',
      label: '报名时间',
      minWidth: 170,
      slot: 'registrationInfo'
    },
    { columnKey: 'matchContent', label: '比赛内容', minWidth: 150, slot: 'matchContent' },
    {
      columnKey: 'registrationOverview',
      label: '报名概况',
      width: 110,
      align: 'center',
      slot: 'registrationOverview'
    },
    { columnKey: 'matchStatus', label: '比赛状态', width: 100, align: 'center', slot: 'matchStatus' },
    { prop: 'createBy', label: '创建人', width: 100, align: 'center' },
    { columnKey: 'createTime', label: '创建时间', width: 150, align: 'center', slot: 'createTime' },
    {
      columnKey: 'action',
      label: '操作',
      width: 360,
      align: 'center',
      slot: 'action',
      fixed: 'right'
    }
  ]);

  const getRegistrationDisplay = (row) => formatRegistrationListDisplay(row);

  const datasource = ({ pages }) => {
    let result = getAllMatches();
    const keyword = lastWhere.matchName?.trim();
    if (keyword) {
      result = result.filter((d) => d.matchName.includes(keyword));
    }
    if (lastWhere.activityId) {
      result = result.filter((d) => d.activityId === Number(lastWhere.activityId));
    }
    if (lastWhere.stageId) {
      result = result.filter((d) => d.stageId === lastWhere.stageId);
    }
    if (lastWhere.registrationStatus) {
      result = result.filter((d) => d.registrationStatus === lastWhere.registrationStatus);
    }
    if (lastWhere.matchStatus) {
      result = result.filter((d) => d.matchStatus === lastWhere.matchStatus);
    }
    if (lastWhere.dateRange?.length === 2) {
      const [start, end] = lastWhere.dateRange;
      result = result.filter((d) => {
        const matchStart = (d.startTime || '').slice(0, 10);
        const matchEnd = (d.endTime || '').slice(0, 10);
        return matchStart <= end && matchEnd >= start;
      });
    }
    result.sort((a, b) => (b.createTime || '').localeCompare(a.createTime || ''));
    const total = result.length;
    const { page = 1, limit = 10 } = pages || {};
    const startIndex = (page - 1) * limit;
    return Promise.resolve({
      list: result.slice(startIndex, startIndex + limit),
      count: total
    });
  };

  const handleSearch = (where) => {
    Object.keys(lastWhere).forEach((key) => delete lastWhere[key]);
    Object.assign(lastWhere, where);
    tableRef.value?.reload?.({ page: 1 });
  };

  const reload = () => {
    tableRef.value?.reload?.();
  };

  const goFormPage = (path, title) => {
    addPageTab({ title, key: path, closable: true });
    router.push(path);
  };

  const openAdd = () => {
    goFormPage('/competition/match/add', '发布比赛');
  };

  const openEdit = (row) => {
    detailVisible.value = false;
    const path = `/competition/match/edit/${row.matchId}`;
    goFormPage(path, `编辑比赛[${row.matchName}]`);
  };

  const openDetail = (row) => {
    detailMatchId.value = row.matchId;
    detailVisible.value = true;
  };

  const copyMatch = (row) => {
    detailVisible.value = false;
    router.push({
      path: '/competition/match/add',
      state: {
        initialData: copyMatchData(row),
        formMode: 'copy'
      }
    });
    addPageTab({ title: '复制比赛', key: '/competition/match/add', closable: true });
  };

  const viewRegistration = (row) => {
    if (isDailyMatch(row)) {
      viewDailyRecord(row);
      return;
    }
    rosterMatchId.value = row.matchId;
    rosterVisible.value = true;
  };

  const viewDailyRecord = (row) => {
    participantMatch.value = row;
    participantVisible.value = true;
  };

  onMounted(() => {
    const { matchId, activityId } = route.query;
    if (matchId) {
      detailMatchId.value = String(matchId);
      detailVisible.value = true;
    }
    if (activityId) {
      lastWhere.activityId = Number(activityId);
      tableRef.value?.reload?.({ page: 1 });
    }
    if (matchId || activityId) {
      router.replace({ path: route.path, query: {} });
    }
  });
</script>

<style scoped lang="scss">
  .match-page {
    position: relative;
    min-height: calc(100vh - 160px);
  }

  .match-name-link {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    line-height: 1.4;
    max-height: 2.8em;
    word-break: break-all;
    white-space: normal;
    vertical-align: top;
  }

  .ellipsis-text {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .registration-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }

  .registration-time {
    font-size: 13px;
    color: var(--el-text-color-primary);
    line-height: 1.4;
  }

  .content-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
    line-height: 1.4;
  }

  .content-cell-sub {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
