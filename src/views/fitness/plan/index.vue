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

        <template #scopeType="{ row }">
          <el-tag
            :type="row.scopeType === 'region' ? 'warning' : 'info'"
            size="small"
            effect="plain"
            :disable-transitions="true"
          >
            {{ getScopeLabel(row.scopeType) }}
          </el-tag>
        </template>

        <template #regions="{ row }">
          <span v-if="row.scopeType === 'general'" class="text-secondary">
            通用
          </span>
          <template v-else>
            <span v-if="!row.regions || row.regions.length === 0" class="text-secondary">—</span>
            <span v-else>
              <span
                v-for="(r, idx) in row.regions.slice(0, 2)"
                :key="r"
              >
                <span>{{ getRegionLabel(r) }}</span>
                <span v-if="idx < Math.min(row.regions.length, 2) - 1">、</span>
              </span>
              <el-tag
                v-if="row.regions.length > 2"
                size="small"
                type="info"
                effect="plain"
                :disable-transitions="true"
                style="margin-left: 4px"
              >
                +{{ row.regions.length - 2 }}
              </el-tag>
            </span>
          </template>
        </template>

        <template #stage="{ row }">
          {{ getStageLabel(row.stage) }}
        </template>

        <template #grades="{ row }">
          <span>{{ (row.grades || []).join('、') }}</span>
        </template>

        <template #schoolYearTerm="{ row }">
          {{ row.schoolYear }} {{ getTermLabel(row.term) }}
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
    getTermLabel,
    getScopeLabel,
    getRegionLabel
  } from '@/views/fitness/data.js';

  defineOptions({ name: 'FitnessPlan' });

  const { openModal } = useModal();

  const tableRef = ref(null);
  const lastWhere = reactive({});

  const columns = ref([
    { type: 'index', columnKey: 'index', width: 60, align: 'center' },
    {
      prop: 'planName',
      label: '方案名称',
      minWidth: 200,
      slot: 'planName'
    },
    {
      prop: 'scopeType',
      label: '适用范围',
      width: 100,
      align: 'center',
      slot: 'scopeType'
    },
    {
      prop: 'regions',
      label: '适用地区',
      minWidth: 160,
      slot: 'regions'
    },
    {
      prop: 'stage',
      label: '学段',
      width: 80,
      align: 'center',
      slot: 'stage'
    },
    {
      prop: 'grades',
      label: '适用年级',
      minWidth: 160,
      slot: 'grades'
    },
    {
      columnKey: 'schoolYearTerm',
      label: '学年学期',
      width: 160,
      align: 'center',
      slot: 'schoolYearTerm'
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
      width: 200,
      align: 'center',
      slot: 'action',
      fixed: 'right'
    }
  ]);

  const datasource = ({ pages }) => {
    const keyword = lastWhere.planName?.trim();
    let result = [...planStore.list];
    if (keyword) result = result.filter((d) => d.planName.includes(keyword));
    if (lastWhere.scopeType) result = result.filter((d) => d.scopeType === lastWhere.scopeType);
    if (lastWhere.region) result = result.filter((d) => (d.regions || []).includes(lastWhere.region));
    if (lastWhere.stage) result = result.filter((d) => d.stage === lastWhere.stage);
    if (lastWhere.schoolYear) result = result.filter((d) => d.schoolYear === lastWhere.schoolYear);
    if (lastWhere.term) result = result.filter((d) => d.term === lastWhere.term);
    if (lastWhere.status !== '' && lastWhere.status != null) {
      result = result.filter((d) => d.status === lastWhere.status);
    }
    result.sort((a, b) => {
      if (a.status !== b.status) return b.status - a.status;
      return b.updateTime.localeCompare(a.updateTime);
    });
    const total = result.length;
    const { page = 1, limit = 10 } = pages || {};
    const start = (page - 1) * limit;
    return Promise.resolve({ list: result.slice(start, start + limit), count: total });
  };

  const handleSearch = (where) => {
    Object.assign(lastWhere, where);
    tableRef.value?.reload?.({ page: 1 });
  };

  const reload = () => tableRef.value?.reload?.();

  const openEdit = (row) => {
    openModal({
      custom: true,
      asyncComponent: () => import('./components/plan-edit.vue'),
      componentProps: { data: row, onDone: reload }
    });
  };

  const openDetail = (row) => {
    openModal({
      custom: true,
      asyncComponent: () => import('./components/plan-detail.vue'),
      componentProps: { data: row }
    });
  };

  const copyPlan = (row) => {
    ElMessageBox.confirm(
      `确定复制方案"${row.planName}"吗？将创建一份副本并置为停用状态。`,
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

  const toggleStatus = (row) => {
    const next = row.status === 1 ? 0 : 1;
    ElMessageBox.confirm(
      `确定${next === 1 ? '启用' : '停用'}方案"${row.planName}"吗？`,
      next === 1 ? '启用方案' : '停用方案',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        row.status = next;
        row.updateTime = formatNow();
        EleMessage.success({ message: `已${next === 1 ? '启用' : '停用'}`, plain: true });
      })
      .catch(() => {});
  };

  function formatNow() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
</script>

<style scoped>
  .text-secondary {
    color: var(--el-text-color-secondary);
  }
</style>
