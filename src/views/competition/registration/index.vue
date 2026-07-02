<!-- 比赛管理 / 参赛名单 -->
<template>
  <ele-page class="registration-page">
    <ele-card :body-style="{ paddingBottom: '2px' }">
      <el-form label-width="82px" @keyup.enter="handleSearch" @submit.prevent="">
        <el-row :gutter="8">
          <el-col :lg="8" :md="12" :sm="12" :xs="24">
            <el-form-item label="赛事活动">
              <el-select v-model="query.activityId" clearable filterable placeholder="请选择" class="ele-fluid">
                <el-option
                  v-for="item in activityOptions"
                  :key="item.activityId"
                  :label="item.activityName"
                  :value="item.activityId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :sm="12" :xs="24">
            <el-form-item label="赛段">
              <el-input v-model.trim="query.stageName" clearable placeholder="支持模糊搜索" />
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :sm="12" :xs="24">
            <el-form-item label="比赛类型">
              <match-type-cascader v-model="query.matchType" class="ele-fluid" />
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :sm="12" :xs="24">
            <el-form-item label="比赛名称">
              <el-input v-model.trim="query.matchName" clearable placeholder="支持模糊搜索" />
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :sm="12" :xs="24">
            <el-form-item label="保险状态">
              <el-select v-model="query.insuranceStatus" clearable placeholder="请选择" class="ele-fluid">
                <el-option v-for="opt in INSURANCE_STATUS_OPTIONS" :key="opt" :label="opt" :value="opt" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :sm="12" :xs="24">
            <el-form-item label="学校">
              <el-input v-model.trim="query.school" clearable placeholder="支持模糊搜索" />
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :sm="12" :xs="24">
            <el-form-item label="比赛时间">
              <el-date-picker
                v-model="query.dateRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="ele-fluid"
              />
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :sm="12" :xs="24">
            <el-form-item label-width="16px">
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </ele-card>

    <ele-card :body-style="{ paddingBottom: '4px' }">
      <ele-pro-table
        ref="tableRef"
        row-key="matchId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        :toolbar="{ theme: 'default' }"
        cache-key="CompetitionRegistrationTable"
      >
        <template #toolbar>
          <el-button type="primary" :icon="PlusOutlined" class="ele-btn-icon" @click="openAdd()">
            新增报名
          </el-button>
        </template>
        <template #matchName="{ row }">
          <el-link type="primary" underline="never" @click="openDetail(row)">{{ row.matchName }}</el-link>
        </template>
        <template #teamCount="{ row }">{{ row.teamCount || '-' }}</template>
        <template #insuranceStatus="{ row }">
          <el-tag :type="getInsuranceStatusTag(row.insuranceStatus)" size="small" effect="plain">
            {{ row.insuranceStatus }}
          </el-tag>
        </template>
        <template #action="{ row }">
          <template v-if="isDailyRow(row)">
            <el-link type="primary" underline="never" @click="openDailyRecord(row)">查看参与记录</el-link>
          </template>
          <template v-else>
            <el-link type="primary" underline="never" @click="openDetail(row)">查看详情</el-link>
            <el-divider direction="vertical" />
            <el-link type="primary" underline="never" @click="openAdd(row)">新增报名</el-link>
            <el-divider direction="vertical" />
            <el-link type="primary" underline="never" @click="openImport(row)">导入名单</el-link>
            <el-divider direction="vertical" />
            <el-link type="primary" underline="never" @click="exportList(row)">导出名单</el-link>
            <el-divider direction="vertical" />
            <el-link type="primary" underline="never" @click="openInsurance(row)">查看保险</el-link>
          </template>
        </template>
      </ele-pro-table>
    </ele-card>

    <registration-add-modal
      v-model:visible="addVisible"
      :match-id="addMatchId"
      @done="reloadTable"
    />
    <registration-import-modal
      v-model:visible="importVisible"
      :match-id="importMatchId"
      @done="reloadTable"
    />
    <registration-detail-modal
      v-model:visible="detailVisible"
      :match-id="detailMatchId"
      @done="reloadTable"
      @view-insurance="openInsuranceContext"
    />
    <registration-daily-record-modal
      v-model:visible="dailyVisible"
      :match-id="dailyMatchId"
      @view-insurance="openInsuranceContext"
    />
    <registration-insurance-modal
      v-model:visible="insuranceVisible"
      :context="insuranceContext"
    />
  </ele-page>
</template>

<script setup>
  import { computed, reactive, ref } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import { PlusOutlined } from '@/components/icons';
  import { INSURANCE_STATUS_OPTIONS } from '@/views/competition/insurance/data.js';
  import { isDailyMatch } from '@/views/competition/match/data.js';
  import { matchTypeMatchesLeaf } from '@/views/competition/match-type.js';
  import MatchTypeCascader from '@/views/competition/components/match-type-cascader.vue';
  import RegistrationAddModal from './components/registration-add-modal.vue';
  import RegistrationImportModal from './components/registration-import-modal.vue';
  import RegistrationDetailModal from './components/registration-detail-modal.vue';
  import RegistrationDailyRecordModal from './components/registration-daily-record-modal.vue';
  import RegistrationInsuranceModal from './components/registration-insurance-modal.vue';
  import { getActivityFilterOptions, getAllRegistrationMatches } from './data.js';

  defineOptions({ name: 'CompetitionRegistration' });

  const tableRef = ref(null);
  const addVisible = ref(false);
  const importVisible = ref(false);
  const detailVisible = ref(false);
  const dailyVisible = ref(false);
  const insuranceVisible = ref(false);
  const addMatchId = ref('');
  const importMatchId = ref('');
  const detailMatchId = ref('');
  const dailyMatchId = ref('');
  const insuranceContext = ref({});

  const query = reactive({
    activityId: void 0,
    stageName: '',
    matchType: '',
    matchName: '',
    insuranceStatus: '',
    school: '',
    dateRange: []
  });

  const columns = ref([
    { prop: 'activityName', label: '赛事活动', minWidth: 150 },
    { prop: 'stageName', label: '赛段', minWidth: 110 },
    { prop: 'matchTypeLabel', label: '比赛类型', minWidth: 160, align: 'center' },
    { prop: 'matchName', label: '比赛名称', minWidth: 190, slot: 'matchName', fixed: 'left' },
    { prop: 'itemCount', label: '设项数量', width: 90, align: 'center' },
    { prop: 'participantCount', label: '参赛人数', width: 90, align: 'center' },
    { prop: 'teamCount', label: '团队数', width: 80, align: 'center', slot: 'teamCount' },
    { prop: 'insuranceType', label: '保险类型', width: 120, align: 'center' },
    { prop: 'insurancePlan', label: '保险方案', minWidth: 170 },
    { prop: 'insuranceMethod', label: '保险方式', width: 100, align: 'center' },
    { prop: 'insuranceStatus', label: '保险状态', width: 100, align: 'center', slot: 'insuranceStatus' },
    { prop: 'updateTime', label: '更新时间', width: 150, align: 'center' },
    { columnKey: 'action', label: '操作', width: 340, align: 'center', slot: 'action', fixed: 'right' }
  ]);

  const activityOptions = computed(() => getActivityFilterOptions());

  const datasource = ({ pages }) => {
    let list = getAllRegistrationMatches();
    if (query.activityId) {
      list = list.filter((row) => row.activityId === query.activityId);
    }
    if (query.stageName) {
      list = list.filter((row) => row.stageName.includes(query.stageName));
    }
    if (query.matchType) {
      list = list.filter((row) => matchTypeMatchesLeaf(row.matchType, query.matchType, row.stageName));
    }
    if (query.matchName) {
      list = list.filter((row) => row.matchName.includes(query.matchName));
    }
    if (query.insuranceStatus) {
      list = list.filter((row) => row.insuranceStatus === query.insuranceStatus);
    }
    if (query.dateRange?.length === 2) {
      const [start, end] = query.dateRange;
      list = list.filter((row) => row.startTime?.slice(0, 10) <= end && row.endTime?.slice(0, 10) >= start);
    }
    const { page = 1, limit = 10 } = pages || {};
    return Promise.resolve({
      list: list.slice((page - 1) * limit, page * limit),
      count: list.length
    });
  };

  const getInsuranceStatusTag = (status) => {
    const map = { 已参保: 'success', 部分参保: 'warning', 待参保: 'info', 异常: 'danger' };
    return map[status] || 'info';
  };

  const isDailyRow = (row) => isDailyMatch(row);

  const handleSearch = () => {
    tableRef.value?.reload?.({ page: 1 });
  };

  const resetSearch = () => {
    Object.assign(query, {
      activityId: void 0,
      stageName: '',
      matchType: '',
      matchName: '',
      insuranceStatus: '',
      school: '',
      dateRange: []
    });
    handleSearch();
  };

  const reloadTable = () => {
    tableRef.value?.reload?.();
  };

  const openDetail = (row) => {
    if (isDailyRow(row)) {
      openDailyRecord(row);
      return;
    }
    detailMatchId.value = row.matchId;
    detailVisible.value = true;
  };

  const openAdd = (row) => {
    addMatchId.value = row?.matchId || '';
    addVisible.value = true;
  };

  const openImport = (row) => {
    importMatchId.value = row?.matchId || '';
    importVisible.value = true;
  };

  const openDailyRecord = (row) => {
    dailyMatchId.value = row.matchId;
    dailyVisible.value = true;
  };

  const openInsurance = (row) => {
    insuranceContext.value = { matchId: row.matchId, scope: 'match' };
    insuranceVisible.value = true;
  };

  const openInsuranceContext = (context) => {
    insuranceContext.value = context;
    insuranceVisible.value = true;
  };

  const exportList = (row) => {
    EleMessage.success({ message: `${row.matchName}名单已生成导出任务。`, plain: true });
  };
</script>

<style scoped lang="scss">
  .registration-page {
    position: relative;
    min-height: calc(100vh - 160px);
  }
</style>
