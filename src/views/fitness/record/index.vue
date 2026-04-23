<!-- 体测记录 列表页 -->
<template>
  <ele-page>
    <record-search @search="handleSearch" />
    <ele-card :body-style="{ paddingBottom: '4px' }">
      <ele-pro-table
        ref="tableRef"
        row-key="recordId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        :toolbar="{ theme: 'default' }"
        cache-key="FitnessRecordTable"
      >
        <template #toolbar>
          <el-button
            type="primary"
            :icon="PlusOutlined"
            class="ele-btn-icon"
            @click="openEdit()"
          >
            添加体测记录
          </el-button>
          <el-button
            :icon="UploadOutlined"
            class="ele-btn-icon"
            style="margin-left: 12px"
            @click="openImport"
          >
            批量导入
          </el-button>
          <el-button
            :icon="DownloadOutlined"
            class="ele-btn-icon"
            style="margin-left: 12px"
            @click="handleExport"
          >
            导出
          </el-button>
        </template>

        <template #studentName="{ row }">
          <el-link type="primary" underline="never" @click="openDetail(row)">
            {{ row.studentName }}
          </el-link>
        </template>

        <template #gradeClass="{ row }">
          {{ row.grade }} · {{ row.className }}
        </template>

        <template #enteredCount="{ row }">
          <ele-text strong type="primary">{{ countEnteredItems(row) }}</ele-text>
          <ele-text
            type="placeholder"
            style="margin-left: 2px; font-size: 13px"
          >
            / {{ totalItemsOfPlan(row.planId) }}
          </ele-text>
        </template>

        <template #recordType="{ row }">
          <el-tag
            v-if="row.recordType === 'makeup'"
            type="warning"
            size="small"
            effect="plain"
            :disable-transitions="true"
          >
            补测
          </el-tag>
          <el-tag
            v-else
            size="small"
            effect="plain"
            :disable-transitions="true"
          >
            正常
          </el-tag>
        </template>

        <template #status="{ row }">
          <el-tag
            v-if="row.status === 'valid'"
            type="success"
            size="small"
            :disable-transitions="true"
          >
            有效
          </el-tag>
          <el-tag
            v-else
            type="danger"
            size="small"
            :disable-transitions="true"
          >
            已作废
          </el-tag>
        </template>

        <template #action="{ row }">
          <el-link type="primary" underline="never" @click="openDetail(row)">
            查看
          </el-link>
          <el-divider direction="vertical" />
          <el-link
            type="primary"
            underline="never"
            :disabled="row.status === 'invalid'"
            @click="openEdit(row)"
          >
            编辑
          </el-link>
          <el-divider direction="vertical" />
          <el-link
            type="danger"
            underline="never"
            :disabled="row.status === 'invalid'"
            @click="openInvalidate(row)"
          >
            作废
          </el-link>
        </template>
      </ele-pro-table>
    </ele-card>
  </ele-page>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { EleMessage, useModal } from 'ele-admin-plus';
  import {
    PlusOutlined,
    UploadOutlined,
    DownloadOutlined
  } from '@/components/icons';
  import RecordSearch from './components/record-search.vue';
  import {
    recordStore,
    planStore,
    countEnteredItems
  } from '@/views/fitness/data.js';

  defineOptions({ name: 'FitnessRecord' });

  const { openModal } = useModal();

  const tableRef = ref(null);

  /** 默认筛选：当前学年 + 当前学期 */
  const lastWhere = reactive({
    schoolYear: '2025-2026',
    term: 'fall'
  });

  const columns = ref([
    { type: 'index', columnKey: 'index', width: 60, align: 'center' },
    {
      prop: 'studentName',
      label: '学生姓名',
      width: 110,
      slot: 'studentName'
    },
    {
      prop: 'studentNo',
      label: '学号',
      width: 90,
      align: 'center'
    },
    {
      prop: 'sexName',
      label: '性别',
      width: 70,
      align: 'center'
    },
    {
      prop: 'school',
      label: '学校',
      minWidth: 140
    },
    {
      columnKey: 'gradeClass',
      label: '年级班级',
      width: 140,
      slot: 'gradeClass'
    },
    {
      prop: 'planName',
      label: '方案名称',
      minWidth: 180
    },
    {
      prop: 'testDate',
      label: '测试日期',
      width: 120,
      align: 'center',
      sortable: 'custom'
    },
    {
      columnKey: 'enteredCount',
      label: '已录入项目数',
      width: 120,
      align: 'center',
      slot: 'enteredCount'
    },
    {
      prop: 'recordType',
      label: '记录类型',
      width: 100,
      align: 'center',
      slot: 'recordType'
    },
    {
      prop: 'status',
      label: '状态',
      width: 90,
      align: 'center',
      slot: 'status'
    },
    {
      prop: 'updateTime',
      label: '更新时间',
      width: 170,
      align: 'center',
      sortable: 'custom'
    },
    {
      columnKey: 'action',
      label: '操作',
      width: 180,
      align: 'center',
      slot: 'action',
      fixed: 'right'
    }
  ]);

  const totalItemsOfPlan = (planId) => {
    const plan = planStore.list.find((p) => p.planId === planId);
    return (plan?.items || []).filter((d) => d.enabled).length;
  };

  const datasource = ({ pages }) => {
    let result = [...recordStore.list];
    if (lastWhere.schoolYear) {
      result = result.filter((d) => d.schoolYear === lastWhere.schoolYear);
    }
    if (lastWhere.term) {
      result = result.filter((d) => d.term === lastWhere.term);
    }
    if (lastWhere.school) {
      result = result.filter((d) => d.school === lastWhere.school);
    }
    if (lastWhere.stage) {
      result = result.filter((d) => d.stage === lastWhere.stage);
    }
    if (lastWhere.grade) {
      result = result.filter((d) => d.grade === lastWhere.grade);
    }
    if (lastWhere.className) {
      result = result.filter((d) => d.className === lastWhere.className);
    }
    if (lastWhere.planId) {
      result = result.filter((d) => d.planId === lastWhere.planId);
    }
    if (lastWhere.testDate && lastWhere.testDate.length === 2) {
      const [s, e] = lastWhere.testDate;
      if (s) result = result.filter((d) => d.testDate >= s);
      if (e) result = result.filter((d) => d.testDate <= e);
    }
    if (lastWhere.recordType) {
      result = result.filter((d) => d.recordType === lastWhere.recordType);
    }
    if (lastWhere.studentKeyword) {
      const kw = lastWhere.studentKeyword.trim();
      result = result.filter(
        (d) => d.studentName.includes(kw) || String(d.studentNo).includes(kw)
      );
    }
    if (lastWhere.status) {
      result = result.filter((d) => d.status === lastWhere.status);
    }
    // 测试日期倒序、更新时间倒序
    result.sort((a, b) => {
      if (a.testDate !== b.testDate) {
        return b.testDate.localeCompare(a.testDate);
      }
      return b.updateTime.localeCompare(a.updateTime);
    });

    const total = result.length;
    const { page = 1, limit = 10 } = pages || {};
    const start = (page - 1) * limit;
    const list = result.slice(start, start + limit);
    return Promise.resolve({ list, count: total });
  };

  const handleSearch = (where) => {
    // 清空之前筛选，使用新条件覆盖
    Object.keys(lastWhere).forEach((k) => delete lastWhere[k]);
    Object.assign(lastWhere, where);
    tableRef.value?.reload?.({ page: 1 });
  };

  const reload = () => tableRef.value?.reload?.();

  const openEdit = (row) => {
    openModal({
      custom: true,
      asyncComponent: () => import('./components/record-edit.vue'),
      componentProps: { data: row, onDone: reload }
    });
  };

  const openDetail = (row) => {
    openModal({
      custom: true,
      asyncComponent: () => import('./components/record-detail.vue'),
      componentProps: { data: row }
    });
  };

  const openInvalidate = (row) => {
    openModal({
      custom: true,
      asyncComponent: () => import('./components/record-invalidate.vue'),
      componentProps: { data: row, onDone: reload }
    });
  };

  const openImport = () => {
    openModal({
      custom: true,
      asyncComponent: () => import('./components/record-import.vue'),
      componentProps: { onDone: reload }
    });
  };

  const handleExport = () => {
    EleMessage.success({
      message: '导出任务已提交，可在系统下载中心查看',
      plain: true
    });
  };
</script>
