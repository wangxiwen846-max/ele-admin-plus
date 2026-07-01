<!-- 活动管理列表页 -->
<template>
  <ele-page>
    <activity-search @search="handleSearch" />
    <ele-card :body-style="{ paddingBottom: '4px' }">
      <ele-pro-table
        ref="tableRef"
        row-key="activityId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        :toolbar="{ theme: 'default' }"
        cache-key="CompetitionActivityTable"
      >
        <template #toolbar>
          <el-button type="primary" :icon="PlusOutlined" class="ele-btn-icon" @click="openAdd">
            新建活动
          </el-button>
        </template>

        <template #activityName="{ row }">
          <el-link type="primary" underline="never" @click="openDetail(row)">
            {{ row.activityName }}
          </el-link>
        </template>

        <template #activityTime="{ row }">
          {{ formatActivityTime(row) }}
        </template>

        <template #status="{ row }">
          <el-tag
            :type="getStatusTagType(getActivityStatus(row))"
            size="small"
            effect="plain"
            :disable-transitions="true"
          >
            {{ getActivityStatus(row) }}
          </el-tag>
        </template>

        <template #hostUnits="{ row }">
          {{ formatUnits(row.hostUnits) }}
        </template>

        <template #stageCount="{ row }">
          {{ row.stages?.length ?? 0 }}
        </template>

        <template #action="{ row }">
          <el-link type="primary" underline="never" @click="openDetail(row)">查看详情</el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" underline="never" @click="openEdit(row)">编辑</el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" underline="never" @click="copyActivity(row)">复制</el-link>
        </template>
      </ele-pro-table>
    </ele-card>

    <activity-detail
      v-if="detailVisible"
      :activity-id="detailActivityId"
      @closed="detailVisible = false"
      @edit="openEdit"
      @copy="copyActivity"
    />
  </ele-page>
</template>

<script setup>
  import { reactive, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { EleMessage } from 'ele-admin-plus';
  import { PlusOutlined } from '@/components/icons';
  import { usePageTab } from '@/utils/use-page-tab';
  import ActivitySearch from './components/activity-search.vue';
  import ActivityDetail from './components/activity-detail.vue';
  import {
    activityStore,
    copyActivityData,
    formatActivityTime,
    formatUnits,
    getActivityStatus,
    getEditMode,
    getStatusTagType
  } from './data.js';

  defineOptions({ name: 'CompetitionActivity' });

  const router = useRouter();
  const { addPageTab } = usePageTab();
  const tableRef = ref(null);
  const lastWhere = reactive({});

  const detailVisible = ref(false);
  const detailActivityId = ref(null);

  const columns = ref([
    { type: 'index', columnKey: 'index', width: 60, align: 'center' },
    {
      prop: 'activityName',
      label: '活动名称',
      minWidth: 200,
      slot: 'activityName'
    },
    {
      columnKey: 'activityTime',
      label: '活动时间',
      minWidth: 210,
      slot: 'activityTime'
    },
    { columnKey: 'status', label: '活动状态', width: 100, align: 'center', slot: 'status' },
    {
      columnKey: 'hostUnits',
      label: '主办单位',
      minWidth: 160,
      slot: 'hostUnits'
    },
    {
      columnKey: 'stageCount',
      label: '赛段数量',
      width: 90,
      align: 'center',
      slot: 'stageCount'
    },
    { prop: 'matchCount', label: '关联比赛数量', width: 120, align: 'center' },
    { prop: 'schoolCount', label: '覆盖学校数', width: 110, align: 'center' },
    { prop: 'studentCount', label: '覆盖学生数', width: 110, align: 'center' },
    { prop: 'createBy', label: '创建人', width: 110, align: 'center' },
    { prop: 'createTime', label: '创建时间', width: 170, align: 'center' },
    { prop: 'updateBy', label: '最近更新人', width: 110, align: 'center' },
    { prop: 'updateTime', label: '最近更新时间', width: 170, align: 'center' },
    {
      columnKey: 'action',
      label: '操作',
      width: 220,
      align: 'center',
      slot: 'action',
      fixed: 'right'
    }
  ]);

  const datasource = ({ pages }) => {
    let result = [...activityStore.list];
    const keyword = lastWhere.activityName?.trim();
    if (keyword) {
      result = result.filter((d) => d.activityName.includes(keyword));
    }
    if (lastWhere.status) {
      result = result.filter((d) => getActivityStatus(d) === lastWhere.status);
    }
    if (lastWhere.hostUnit?.trim()) {
      const host = lastWhere.hostUnit.trim();
      result = result.filter((d) =>
        (d.hostUnits ?? []).some((unit) => unit.includes(host))
      );
    }
    if (lastWhere.dateRange?.length === 2) {
      const [start, end] = lastWhere.dateRange;
      result = result.filter((d) => d.startTime <= end && d.endTime >= start);
    }
    result.sort((a, b) => b.createTime.localeCompare(a.createTime));
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
    goFormPage('/competition/activity/add', '新建活动');
  };

  const openEdit = (row) => {
    if (getEditMode(row) === 'readonly') {
      EleMessage.warning({ message: '已结束活动仅允许查看', plain: true });
      detailActivityId.value = row.activityId;
      detailVisible.value = true;
      return;
    }
    detailVisible.value = false;
    const path = `/competition/activity/edit/${row.activityId}`;
    goFormPage(path, `编辑活动[${row.activityName}]`);
  };

  const openDetail = (row) => {
    detailActivityId.value = row.activityId;
    detailVisible.value = true;
  };

  const copyActivity = (row) => {
    detailVisible.value = false;
    router.push({
      path: '/competition/activity/add',
      state: {
        initialData: copyActivityData(row),
        formMode: 'copy'
      }
    });
    addPageTab({ title: '复制活动', key: '/competition/activity/add', closable: true });
  };
</script>
