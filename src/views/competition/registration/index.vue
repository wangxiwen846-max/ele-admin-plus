<!-- 比赛管理 / 参赛名单（参赛人员明细） -->
<template>
  <ele-page class="registration-page">
    <ele-card :body-style="{ paddingBottom: '2px' }">
      <el-form label-width="82px" @keyup.enter="handleSearch" @submit.prevent="">
        <el-row :gutter="8">
          <el-col :lg="8" :md="12" :sm="12" :xs="24">
            <el-form-item label="参赛编号">
              <el-input v-model.trim="query.participantNumber" clearable placeholder="精准查询" />
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :sm="12" :xs="24">
            <el-form-item label="学生姓名">
              <el-input v-model.trim="query.studentName" clearable placeholder="支持模糊搜索" />
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :sm="12" :xs="24">
            <el-form-item label="赛事活动">
              <el-select
                v-model="query.activityId"
                clearable
                filterable
                placeholder="请选择"
                class="ele-fluid"
                @change="handleActivityChange"
              >
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
              <el-select
                v-model="query.stageName"
                clearable
                placeholder="请先选择赛事活动"
                class="ele-fluid"
                :disabled="!query.activityId"
                @change="handleStageChange"
              >
                <el-option
                  v-for="item in stageOptions"
                  :key="item.stageId || item.stageName"
                  :label="item.stageName"
                  :value="item.stageName"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :sm="12" :xs="24">
            <el-form-item label="比赛类型">
              <match-type-cascader
                v-model="query.matchType"
                class="ele-fluid"
                :disabled="!query.stageName"
                :allowed-leaf-types="matchTypeLeafOptions"
                placeholder="请先选择赛段"
                @update:model-value="handleMatchTypeChange"
              />
            </el-form-item>
          </el-col>
          <el-col :lg="8" :md="12" :sm="12" :xs="24">
            <el-form-item label="比赛名称">
              <el-select v-model="query.matchName" clearable filterable placeholder="请选择" class="ele-fluid">
                <el-option v-for="name in matchNameOptions" :key="name" :label="name" :value="name" />
              </el-select>
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
        row-key="rowKey"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        :toolbar="{ theme: 'default' }"
        cache-key="CompetitionRegistrationParticipantTable"
      >
        <template #toolbar>
          <el-button type="primary" :icon="PlusOutlined" class="ele-btn-icon" @click="openAdd()">
            新增报名
          </el-button>
          <el-button @click="openImport()">导入名单</el-button>
          <el-button @click="exportAll">导出名单</el-button>
        </template>
        <template #insuranceStatus="{ row }">
          <el-tag :type="getInsuranceStatusTag(row.insuranceStatus)" size="small" effect="plain">
            {{ row.insuranceStatus }}
          </el-tag>
        </template>
        <template #scoreStatus="{ row }">
          <el-tag :type="getScoreStatusTag(row.scoreStatus)" size="small" effect="plain">
            {{ row.scoreStatus }}
          </el-tag>
        </template>
        <template #action="{ row }">
          <el-link type="primary" underline="never" @click="openInsurance(row)">查看保险</el-link>
        </template>
      </ele-pro-table>
    </ele-card>

    <registration-add-modal
      v-model:visible="addVisible"
      :match-id="addMatchId"
      @done="reloadTable"
    />
    <registration-import-modal v-model:visible="importVisible" @done="reloadTable" />
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
  import { matchTypeMatchesLeaf } from '@/views/competition/match-type.js';
  import MatchTypeCascader from '@/views/competition/components/match-type-cascader.vue';
  import RegistrationAddModal from './components/registration-add-modal.vue';
  import RegistrationImportModal from './components/registration-import-modal.vue';
  import RegistrationInsuranceModal from './components/registration-insurance-modal.vue';
  import { exportParticipants } from './registration-import.js';
  import {
    getActivityFilterOptions,
    getAllRegistrationParticipants,
    getMatchNameFilterOptions,
    getMatchTypeLeafOptionsForStage,
    getStageFilterOptions,
    filterParticipantsByAccountScope
  } from './data.js';

  defineOptions({ name: 'CompetitionRegistration' });

  const tableRef = ref(null);
  const addVisible = ref(false);
  const importVisible = ref(false);
  const insuranceVisible = ref(false);
  const addMatchId = ref('');
  const insuranceContext = ref({});

  const query = reactive({
    participantNumber: '',
    studentName: '',
    activityId: void 0,
    stageName: '',
    matchType: '',
    matchName: ''
  });

  const columns = ref([
    { prop: 'participantNumber', label: '参赛编号', width: 110, align: 'center', fixed: 'left' },
    { prop: 'activityName', label: '赛事活动', minWidth: 160 },
    { prop: 'stageName', label: '赛段', minWidth: 110 },
    { prop: 'matchTypeLabel', label: '比赛类型', minWidth: 150, align: 'center' },
    { prop: 'matchName', label: '比赛名称', minWidth: 180 },
    { prop: 'itemName', label: '设项名称', minWidth: 130 },
    { prop: 'project', label: '参赛项目', minWidth: 120 },
    { prop: 'matchForm', label: '比赛形式', width: 90, align: 'center' },
    { prop: 'school', label: '学校', minWidth: 130 },
    { prop: 'grade', label: '年级', width: 90, align: 'center' },
    { prop: 'className', label: '班级', width: 90, align: 'center' },
    { prop: 'classNo', label: '班内序号', width: 90, align: 'center' },
    { prop: 'studentName', label: '学生姓名', width: 100 },
    { prop: 'teamName', label: '队伍名称', minWidth: 120 },
    { prop: 'insuranceStatus', label: '保险状态', width: 100, align: 'center', slot: 'insuranceStatus' },
    { prop: 'scoreStatus', label: '成绩状态', width: 100, align: 'center', slot: 'scoreStatus' },
    { prop: 'reportMethod', label: '报名方式', width: 110, align: 'center' },
    { prop: 'registerTime', label: '报名时间', width: 150, align: 'center' },
    { prop: 'updateTime', label: '更新时间', width: 150, align: 'center' },
    { columnKey: 'action', label: '操作', width: 110, align: 'center', slot: 'action', fixed: 'right' }
  ]);

  const activityOptions = computed(() => getActivityFilterOptions());
  const stageOptions = computed(() => getStageFilterOptions(query.activityId));
  const matchTypeLeafOptions = computed(() =>
    getMatchTypeLeafOptionsForStage(query.activityId, query.stageName)
  );
  const matchNameOptions = computed(() =>
    getMatchNameFilterOptions({
      activityId: query.activityId,
      stageName: query.stageName,
      matchType: query.matchType
    })
  );

  const getFilteredParticipants = () => {
    let list = filterParticipantsByAccountScope(getAllRegistrationParticipants());
    const participantNumber = query.participantNumber.trim().toUpperCase();
    if (participantNumber) {
      list = list.filter((row) => String(row.participantNumber || '').toUpperCase() === participantNumber);
    }
    if (query.studentName) {
      list = list.filter((row) => row.studentName.includes(query.studentName));
    }
    if (query.activityId) {
      list = list.filter((row) => row.activityId === query.activityId);
    }
    if (query.stageName) {
      list = list.filter((row) => row.stageName === query.stageName);
    }
    if (query.matchType) {
      list = list.filter((row) => matchTypeMatchesLeaf(row.matchType, query.matchType, row.stageName));
    }
    if (query.matchName) {
      list = list.filter((row) => row.matchName === query.matchName);
    }
    return list;
  };

  const datasource = ({ pages }) => {
    const list = getFilteredParticipants();
    const { page = 1, limit = 10 } = pages || {};
    return Promise.resolve({
      list: list.slice((page - 1) * limit, page * limit),
      count: list.length
    });
  };

  const getInsuranceStatusTag = (status) => {
    const map = { 已参保: 'success', 待参保: 'info' };
    return map[status] || 'info';
  };

  const getScoreStatusTag = (status) => {
    const map = { 已上传: 'success', 异常: 'danger', 未上传: 'info' };
    return map[status] || 'info';
  };

  const handleActivityChange = () => {
    query.stageName = '';
    query.matchType = '';
    query.matchName = '';
  };

  const handleStageChange = () => {
    query.matchType = '';
    query.matchName = '';
  };

  const handleMatchTypeChange = () => {
    query.matchName = '';
  };

  const handleSearch = () => {
    tableRef.value?.reload?.({ page: 1 });
  };

  const resetSearch = () => {
    Object.assign(query, {
      participantNumber: '',
      studentName: '',
      activityId: void 0,
      stageName: '',
      matchType: '',
      matchName: ''
    });
    handleSearch();
  };

  const reloadTable = () => {
    tableRef.value?.reload?.();
  };

  const openAdd = () => {
    addMatchId.value = '';
    addVisible.value = true;
  };

  const openImport = () => {
    importVisible.value = true;
  };

  const openInsurance = (row) => {
    if (row.rowType === 'member') {
      insuranceContext.value = { matchId: row.matchId, scope: 'member', student: row.raw.member };
    } else {
      insuranceContext.value = { matchId: row.matchId, scope: 'student', student: row.raw };
    }
    insuranceVisible.value = true;
  };

  const exportAll = async () => {
    const list = getFilteredParticipants();
    if (!list.length) {
      EleMessage.warning({ message: '当前筛选结果为空，暂无可导出的参赛名单。', plain: true });
      return;
    }
    try {
      const fileName = await exportParticipants(list);
      EleMessage.success({ message: `${fileName} 已开始下载，共 ${list.length} 条数据。`, plain: true });
    } catch (error) {
      EleMessage.error({ message: error?.message || '导出失败，请稍后重试。', plain: true });
    }
  };
</script>

<style scoped lang="scss">
  .registration-page {
    position: relative;
    min-height: calc(100vh - 160px);
  }
</style>
