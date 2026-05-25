<!-- 运动记录管理 列表页 -->
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
        cache-key="SportRecordTable"
      >
        <template #toolbar>
          <el-button :icon="DownloadOutlined" class="ele-btn-icon" @click="handleExport">
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

        <template #sport="{ row }">
          {{ getLabel(SPORT_OPTIONS, row.sport) }}
        </template>

        <template #recordType="{ row }">
          <el-tag
            v-if="row.recordType === 'homework'"
            type="warning"
            size="small"
            effect="plain"
            :disable-transitions="true"
          >
            作业
          </el-tag>
          <el-tag
            v-else
            type="primary"
            size="small"
            effect="plain"
            :disable-transitions="true"
          >
            自主训练
          </el-tag>
        </template>

        <template #collectType="{ row }">
          <el-tag size="small" effect="plain" :disable-transitions="true">
            {{ getLabel(COLLECT_TYPE_OPTIONS, row.collectType) }}
          </el-tag>
        </template>

        <template #result="{ row }">
          <ele-text strong type="primary">{{ row.result }}</ele-text>
        </template>

        <template #passStatus="{ row }">
          <template v-if="row.recordType === 'self' || row.passStatus === 'none'">
            <span style="color: var(--el-text-color-placeholder)">无需判断</span>
          </template>
          <el-tag
            v-else-if="row.passStatus === 'pass'"
            type="success"
            size="small"
            :disable-transitions="true"
          >
            已达标
          </el-tag>
          <el-tag
            v-else-if="row.passStatus === 'fail'"
            type="danger"
            size="small"
            :disable-transitions="true"
          >
            未达标
          </el-tag>
        </template>

        <template #homeworkName="{ row }">
          <span v-if="row.homeworkName">{{ row.homeworkName }}</span>
          <span v-else style="color: var(--el-text-color-placeholder)">-</span>
        </template>

        <template #action="{ row }">
          <el-link type="primary" underline="never" @click="openDetail(row)">
            查看详情
          </el-link>
        </template>
      </ele-pro-table>
    </ele-card>

    <!-- 详情抽屉 -->
    <record-detail
      v-if="detailVisible"
      :data="currentRow"
      @closed="detailVisible = false"
    />
  </ele-page>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import { DownloadOutlined } from '@/components/icons';
  import RecordSearch from './components/record-search.vue';
  import RecordDetail from './components/record-detail.vue';
  import {
    recordStore,
    SPORT_OPTIONS,
    COLLECT_TYPE_OPTIONS,
    getLabel
  } from '@/views/sport/data.js';

  defineOptions({ name: 'SportRecord' });

  const tableRef = ref(null);
  const lastWhere = reactive({});

  /** 详情抽屉 */
  const detailVisible = ref(false);
  const currentRow = ref(null);

  const columns = ref([
    { type: 'index', columnKey: 'index', width: 60, align: 'center' },
    { prop: 'studentName', label: '学生姓名', width: 100, slot: 'studentName' },
    { prop: 'school', label: '学校', width: 120 },
    { columnKey: 'gradeClass', label: '年级班级', width: 130, slot: 'gradeClass' },
    { columnKey: 'sport', label: '运动项目', width: 90, align: 'center', slot: 'sport' },
    { prop: 'recordType', label: '记录类型', width: 100, align: 'center', slot: 'recordType' },
    { prop: 'collectType', label: '采集方式', width: 110, align: 'center', slot: 'collectType' },
    { prop: 'result', label: '运动结果', width: 110, align: 'center', slot: 'result' },
    { prop: 'duration', label: '运动时长', width: 100, align: 'center' },
    { prop: 'passStatus', label: '达标状态', width: 100, align: 'center', slot: 'passStatus' },
    { prop: 'homeworkName', label: '关联作业', width: 140, slot: 'homeworkName' },
    { prop: 'finishTime', label: '完成时间', width: 140, align: 'center' },
    { columnKey: 'action', label: '操作', width: 100, align: 'center', slot: 'action', fixed: 'right' }
  ]);

  const datasource = ({ pages }) => {
    let result = [...recordStore.list];
    const w = lastWhere;
    if (w.school) result = result.filter((d) => d.school === w.school);
    if (w.grade) result = result.filter((d) => d.grade === w.grade);
    if (w.className) result = result.filter((d) => d.className === w.className);
    if (w.sport) result = result.filter((d) => d.sport === w.sport);
    if (w.recordType) result = result.filter((d) => d.recordType === w.recordType);
    if (w.collectType) result = result.filter((d) => d.collectType === w.collectType);
    if (w.passStatus) result = result.filter((d) => d.passStatus === w.passStatus);
    if (w.studentKeyword) {
      const kw = w.studentKeyword.trim();
      result = result.filter(
        (d) => d.studentName.includes(kw) || String(d.studentNo).includes(kw)
      );
    }
    const total = result.length;
    const { page = 1, limit = 10 } = pages || {};
    const start = (page - 1) * limit;
    return Promise.resolve({ list: result.slice(start, start + limit), count: total });
  };

  const handleSearch = (where) => {
    Object.keys(lastWhere).forEach((k) => delete lastWhere[k]);
    Object.assign(lastWhere, where);
    tableRef.value?.reload?.({ page: 1 });
  };

  const openDetail = (row) => {
    currentRow.value = row;
    detailVisible.value = true;
  };

  const handleExport = () => {
    EleMessage.success({ message: '导出原型，仅作展示', plain: true });
  };
</script>
