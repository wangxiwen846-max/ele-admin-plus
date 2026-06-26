<!-- 设项管理列表页 -->
<template>
  <ele-page>
    <item-search @search="handleSearch" />
    <ele-card :body-style="{ paddingBottom: '4px' }">
      <ele-pro-table
        ref="tableRef"
        row-key="itemId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        :toolbar="{ theme: 'default' }"
        cache-key="EventItemTable"
      >
        <template #toolbar>
          <el-button type="primary" :icon="PlusOutlined" class="ele-btn-icon" @click="openAdd">
            新增设项
          </el-button>
        </template>

        <template #itemName="{ row }">
          <el-link type="primary" underline="never" @click="openDetail(row)">
            {{ row.itemName }}
          </el-link>
        </template>

        <template #source="{ row }">
          <el-tag
            :type="row.source === '标准设项' ? 'primary' : 'warning'"
            size="small"
            effect="plain"
            :disable-transitions="true"
          >
            {{ row.source }}
          </el-tag>
        </template>

        <template #sports="{ row }">
          {{ formatSportsDisplay(row.sports) }}
        </template>

        <template #matchForm="{ row }">
          <el-tag
            :type="row.matchForm === '团体' ? 'success' : 'primary'"
            size="small"
            effect="plain"
            :disable-transitions="true"
          >
            {{ row.matchForm }}
          </el-tag>
        </template>

        <template #requirement="{ row }">
          {{ formatRequirement(row) || '-' }}
        </template>

        <template #scoringEnabled="{ row }">
          {{ row.scoringEnabled ? '是' : '否' }}
        </template>

        <template #status="{ row }">
          <ele-dot
            v-if="row.status === 1"
            text="启用"
            type="success"
            size="8px"
            :ripple="false"
          />
          <ele-dot v-else text="停用" type="danger" size="8px" :ripple="false" />
        </template>

        <template #action="{ row }">
          <el-link type="primary" underline="never" @click="openDetail(row)">查看</el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" underline="never" @click="openEdit(row)">编辑</el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" underline="never" @click="copyItem(row)">复制</el-link>
          <el-divider direction="vertical" />
          <el-link
            :type="row.status === 1 ? 'danger' : 'success'"
            underline="never"
            @click="toggleStatus(row)"
          >
            {{ row.status === 1 ? '停用' : '启用' }}
          </el-link>
          <el-divider direction="vertical" />
          <el-link type="danger" underline="never" @click="remove(row)">删除</el-link>
        </template>
      </ele-pro-table>
    </ele-card>

    <item-detail
      v-if="detailVisible"
      :item-id="detailItemId"
      @closed="detailVisible = false"
      @edit="openEdit"
      @copy="copyItem"
      @toggle="toggleStatus"
      @remove="remove"
    />
  </ele-page>
</template>

<script setup>
  import { reactive, ref } from 'vue';
  import { ElMessageBox } from 'element-plus';
  import { EleMessage, useModal } from 'ele-admin-plus';
  import { PlusOutlined } from '@/components/icons';
  import ItemSearch from './components/item-search.vue';
  import ItemDetail from './components/item-detail.vue';
  import {
    eventItemStore,
    formatRequirement,
    formatSportsDisplay,
    formatNow
  } from '@/views/event-item/data.js';

  defineOptions({ name: 'EventItem' });

  const { openModal } = useModal();
  const tableRef = ref(null);
  const lastWhere = reactive({});

  const detailVisible = ref(false);
  const detailItemId = ref(null);

  const columns = ref([
    { type: 'index', columnKey: 'index', width: 60, align: 'center' },
    { prop: 'itemName', label: '设项名称', minWidth: 180, slot: 'itemName' },
    { prop: 'source', label: '设项来源', width: 110, align: 'center', slot: 'source' },
    {
      columnKey: 'sports',
      label: '关联体育项目',
      minWidth: 160,
      slot: 'sports'
    },
    { prop: 'matchForm', label: '比赛形式', width: 100, align: 'center', slot: 'matchForm' },
    { columnKey: 'requirement', label: '参赛要求', minWidth: 200, slot: 'requirement' },
    { prop: 'dataSource', label: '数据来源', width: 110, align: 'center' },
    {
      prop: 'scoringEnabled',
      label: '是否计分',
      width: 100,
      align: 'center',
      slot: 'scoringEnabled'
    },
    { prop: 'status', label: '启用状态', width: 100, align: 'center', slot: 'status' },
    { prop: 'updateTime', label: '更新时间', width: 170, align: 'center' },
    {
      columnKey: 'action',
      label: '操作',
      width: 260,
      align: 'center',
      slot: 'action',
      fixed: 'right'
    }
  ]);

  const datasource = ({ pages }) => {
    let result = [...eventItemStore.list];
    const keyword = lastWhere.itemName?.trim();
    if (keyword) {
      result = result.filter((d) => d.itemName.includes(keyword));
    }
    if (lastWhere.source) {
      result = result.filter((d) => d.source === lastWhere.source);
    }
    if (lastWhere.sport) {
      result = result.filter((d) =>
        (d.sports ?? []).some((s) => s.name === lastWhere.sport)
      );
    }
    if (lastWhere.matchForm) {
      result = result.filter((d) => d.matchForm === lastWhere.matchForm);
    }
    if (lastWhere.status !== '' && lastWhere.status != null) {
      result = result.filter((d) => d.status === lastWhere.status);
    }
    result.sort((a, b) => b.updateTime.localeCompare(a.updateTime));
    const total = result.length;
    const { page = 1, limit = 10 } = pages || {};
    const start = (page - 1) * limit;
    return Promise.resolve({ list: result.slice(start, start + limit), count: total });
  };

  const handleSearch = (where) => {
    Object.keys(lastWhere).forEach((key) => delete lastWhere[key]);
    Object.assign(lastWhere, where);
    tableRef.value?.reload?.({ page: 1 });
  };

  const reload = () => {
    tableRef.value?.reload?.();
  };

  const openModalForm = (props) => {
    openModal({
      custom: true,
      asyncComponent: () => import('./components/item-edit-modal.vue'),
      componentProps: { ...props, onDone: reload }
    });
  };

  const openAdd = () => {
    openModalForm({ mode: 'add' });
  };

  const openEdit = (row) => {
    if (row.isReferenced) {
      EleMessage.warning({
        message: '该设项已被比赛引用，编辑弹窗将锁定核心字段。',
        plain: true
      });
    }
    detailVisible.value = false;
    openModalForm({ data: row, mode: 'edit' });
  };

  const openDetail = (row) => {
    detailItemId.value = row.itemId;
    detailVisible.value = true;
  };

  const copyItem = (row) => {
    detailVisible.value = false;
    openModalForm({ data: row, mode: 'copy' });
  };

  const toggleStatus = (row) => {
    const next = row.status === 1 ? 0 : 1;
    ElMessageBox.confirm(
      `确定${next === 1 ? '启用' : '停用'}设项“${row.itemName}”吗？`,
      next === 1 ? '启用设项' : '停用设项',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        row.status = next;
        row.updateTime = formatNow();
        row.operationLogs.unshift({
          time: row.updateTime,
          operator: '管理员',
          type: next === 1 ? '启用' : '停用',
          content:
            next === 1
              ? '启用后可被发布比赛选择'
              : '停用后不可被新比赛选择，不影响历史引用'
        });
        EleMessage.success({ message: `已${next === 1 ? '启用' : '停用'}`, plain: true });
        reload();
      })
      .catch(() => {});
  };

  const remove = (row) => {
    if (row.isReferenced) {
      EleMessage.error({
        message: '该设项已被比赛引用，无法删除。如不再使用，可将其停用。',
        plain: true
      });
      return;
    }
    ElMessageBox.confirm(`确定删除设项“${row.itemName}”吗？`, '删除设项', {
      type: 'warning',
      draggable: true
    })
      .then(() => {
        const index = eventItemStore.list.findIndex((d) => d.itemId === row.itemId);
        if (index !== -1) {
          eventItemStore.list.splice(index, 1);
        }
        detailVisible.value = false;
        EleMessage.success({ message: '删除成功', plain: true });
        reload();
      })
      .catch(() => {});
  };
</script>
