<!-- 体测方案 列表页 -->
<template>
  <ele-page>
    <plan-search @search="handleSearch" />
    <ele-card :body-style="{ paddingBottom: '4px' }">
      <ele-pro-table
        ref="tableRef"
        row-key="planId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        :toolbar="{ theme: 'default' }"
        cache-key="FitnessPlanTable"
      >
        <template #toolbar>
          <el-button
            type="primary"
            :icon="PlusOutlined"
            class="ele-btn-icon"
            @click="openEdit()"
          >
            新建方案
          </el-button>
        </template>

        <template #planName="{ row }">
          <el-link type="primary" underline="never" @click="openDetail(row)">
            {{ row.planName }}
          </el-link>
          <el-tag
            v-if="row.isDefault"
            type="primary"
            size="small"
            effect="plain"
            :disable-transitions="true"
            style="margin-left: 8px"
          >
            默认
          </el-tag>
        </template>

        <template #stage="{ row }">
          {{ getStageLabel(row.stage) }}
        </template>

        <template #grades="{ row }">
          <span>{{ (row.grades || []).join('、') }}</span>
        </template>

        <template #term="{ row }">
          {{ getTermLabel(row.term) }}
        </template>

        <template #status="{ row }">
          <ele-dot
            v-if="row.status === 1"
            text="启用"
            type="success"
            size="8px"
            :ripple="false"
          />
          <ele-dot
            v-else
            text="停用"
            type="danger"
            size="8px"
            :ripple="false"
          />
        </template>

        <template #action="{ row }">
          <el-link type="primary" underline="never" @click="openDetail(row)">
            查看
          </el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" underline="never" @click="openEdit(row)">
            编辑
          </el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" underline="never" @click="copyPlan(row)">
            复制
          </el-link>
          <el-divider direction="vertical" />
          <el-link
            :type="row.status === 1 ? 'danger' : 'success'"
            underline="never"
            @click="toggleStatus(row)"
          >
            {{ row.status === 1 ? '停用' : '启用' }}
          </el-link>
        </template>
      </ele-pro-table>
    </ele-card>
  </ele-page>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { ElMessageBox } from 'element-plus';
  import { EleMessage, useModal } from 'ele-admin-plus';
  import { PlusOutlined } from '@/components/icons';
  import PlanSearch from './components/plan-search.vue';
  import {
    planStore,
    getStageLabel,
    getTermLabel
  } from '@/views/fitness/data.js';

  defineOptions({ name: 'FitnessPlan' });

  const { openModal } = useModal();

  /** 表格实例 */
  const tableRef = ref(null);

  /** 搜索参数 */
  const lastWhere = reactive({});

  /** 表格列 */
  const columns = ref([
    { type: 'index', columnKey: 'index', width: 60, align: 'center' },
    {
      prop: 'planName',
      label: '方案名称',
      minWidth: 220,
      slot: 'planName'
    },
    {
      prop: 'stage',
      label: '学段',
      width: 90,
      align: 'center',
      slot: 'stage'
    },
    {
      prop: 'grades',
      label: '适用年级',
      minWidth: 180,
      slot: 'grades'
    },
    {
      prop: 'schoolYear',
      label: '学年',
      width: 110,
      align: 'center'
    },
    {
      prop: 'term',
      label: '学期',
      width: 100,
      align: 'center',
      slot: 'term'
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
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
      width: 200,
      align: 'center',
      slot: 'action',
      fixed: 'right'
    }
  ]);

  /** 数据源：本地 mock 过滤 */
  const datasource = ({ pages }) => {
    const keyword = lastWhere.planName?.trim();
    let result = [...planStore.list];
    if (keyword) {
      result = result.filter((d) => d.planName.includes(keyword));
    }
    if (lastWhere.stage) {
      result = result.filter((d) => d.stage === lastWhere.stage);
    }
    if (lastWhere.schoolYear) {
      result = result.filter((d) => d.schoolYear === lastWhere.schoolYear);
    }
    if (lastWhere.term) {
      result = result.filter((d) => d.term === lastWhere.term);
    }
    if (lastWhere.status !== '' && lastWhere.status != null) {
      result = result.filter((d) => d.status === lastWhere.status);
    }
    // 启用状态优先 + 更新时间倒序
    result.sort((a, b) => {
      if (a.status !== b.status) return b.status - a.status;
      return b.updateTime.localeCompare(a.updateTime);
    });
    const total = result.length;
    const { page = 1, limit = 10 } = pages || {};
    const start = (page - 1) * limit;
    const list = result.slice(start, start + limit);
    return Promise.resolve({ list, count: total });
  };

  /** 搜索 */
  const handleSearch = (where) => {
    Object.assign(lastWhere, where);
    tableRef.value?.reload?.({ page: 1 });
  };

  /** 刷新 */
  const reload = () => tableRef.value?.reload?.();

  /** 新建 / 编辑方案弹窗 */
  const openEdit = (row) => {
    openModal({
      custom: true,
      asyncComponent: () => import('./components/plan-edit.vue'),
      componentProps: {
        data: row,
        onDone: reload
      }
    });
  };

  /** 方案详情弹窗 */
  const openDetail = (row) => {
    openModal({
      custom: true,
      asyncComponent: () => import('./components/plan-detail.vue'),
      componentProps: { data: row }
    });
  };

  /** 复制方案 */
  const copyPlan = (row) => {
    ElMessageBox.confirm(
      `确定复制方案“${row.planName}”吗？将创建一份副本并置为停用状态。`,
      '复制方案',
      { type: 'info', draggable: true }
    )
      .then(() => {
        const now = formatNow();
        planStore.list.unshift({
          ...JSON.parse(JSON.stringify(row)),
          planId: planStore.nextId++,
          planName: row.planName + ' - 副本',
          isDefault: false,
          status: 0,
          createTime: now,
          updateTime: now
        });
        EleMessage.success({ message: '复制成功', plain: true });
        reload();
      })
      .catch(() => {});
  };

  /** 启用 / 停用 */
  const toggleStatus = (row) => {
    const next = row.status === 1 ? 0 : 1;
    const title = next === 1 ? '启用方案' : '停用方案';
    ElMessageBox.confirm(
      `确定${next === 1 ? '启用' : '停用'}方案“${row.planName}”吗？`,
      title,
      { type: 'warning', draggable: true }
    )
      .then(() => {
        row.status = next;
        row.updateTime = formatNow();
        EleMessage.success({
          message: `已${next === 1 ? '启用' : '停用'}`,
          plain: true
        });
      })
      .catch(() => {});
  };

  function formatNow() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
</script>
