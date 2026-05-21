<!-- 设备绑定管理 列表页 -->
<template>
  <ele-page>
    <device-search @search="handleSearch" />
    <ele-card :body-style="{ paddingBottom: '4px' }">
      <ele-pro-table
        ref="tableRef"
        row-key="deviceId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        :toolbar="false"
        cache-key="SportDeviceTable"
      >
        <template #deviceName="{ row }">
          <el-link type="primary" underline="never" @click="openDetail(row)">
            {{ row.deviceName }}
          </el-link>
        </template>

        <template #deviceType="{ row }">
          {{ getLabel(DEVICE_TYPE_OPTIONS, row.deviceType) }}
        </template>

        <template #gradeClass="{ row }">
          {{ row.grade }} · {{ row.className }}
        </template>

        <template #bindStatus="{ row }">
          <el-tag
            :type="row.bindStatus === 'bound' ? 'success' : 'info'"
            size="small"
            :disable-transitions="true"
          >
            {{ row.bindStatus === 'bound' ? '已绑定' : '已解绑' }}
          </el-tag>
        </template>

        <template #lastSport="{ row }">
          {{ getLabel(SPORT_OPTIONS, row.lastSport) }}
        </template>

        <template #action="{ row }">
          <el-link type="primary" underline="never" @click="openDetail(row)">
            查看详情
          </el-link>
          <el-divider direction="vertical" />
          <el-link
            type="danger"
            underline="never"
            :disabled="row.bindStatus !== 'bound'"
            @click="confirmUnbind(row)"
          >
            解绑设备
          </el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" underline="never" @click="goRecord(row)">
            查看运动记录
          </el-link>
        </template>
      </ele-pro-table>
    </ele-card>

    <!-- 详情抽屉 -->
    <device-detail
      v-if="detailVisible"
      :data="currentRow"
      @closed="detailVisible = false"
    />
  </ele-page>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessageBox } from 'element-plus';
  import { EleMessage } from 'ele-admin-plus';
  import DeviceSearch from './components/device-search.vue';
  import DeviceDetail from './components/device-detail.vue';
  import {
    deviceStore,
    DEVICE_TYPE_OPTIONS,
    SPORT_OPTIONS,
    getLabel
  } from '@/views/sport/data.js';

  defineOptions({ name: 'SportDevice' });

  const { push } = useRouter();
  const tableRef = ref(null);
  const lastWhere = reactive({});

  const detailVisible = ref(false);
  const currentRow = ref(null);

  const columns = ref([
    { type: 'index', columnKey: 'index', width: 60, align: 'center' },
    { prop: 'deviceName', label: '设备名称', width: 150, slot: 'deviceName' },
    { prop: 'deviceType', label: '设备类型', width: 110, align: 'center', slot: 'deviceType' },
    { prop: 'deviceNo', label: '设备编号', width: 150 },
    { prop: 'studentName', label: '绑定学生', width: 100 },
    { prop: 'school', label: '学校', width: 130 },
    { columnKey: 'gradeClass', label: '年级班级', width: 130, slot: 'gradeClass' },
    { prop: 'bindStatus', label: '绑定状态', width: 100, align: 'center', slot: 'bindStatus' },
    { prop: 'lastConnectTime', label: '最近连接时间', width: 150, align: 'center' },
    { prop: 'lastSport', label: '最近使用项目', width: 110, align: 'center', slot: 'lastSport' },
    {
      columnKey: 'action',
      label: '操作',
      width: 240,
      align: 'center',
      slot: 'action',
      fixed: 'right'
    }
  ]);

  const datasource = ({ pages }) => {
    let result = [...deviceStore.list];
    const w = lastWhere;
    if (w.deviceType) result = result.filter((d) => d.deviceType === w.deviceType);
    if (w.school) result = result.filter((d) => d.school === w.school);
    if (w.grade) result = result.filter((d) => d.grade === w.grade);
    if (w.className) result = result.filter((d) => d.className === w.className);
    if (w.bindStatus) result = result.filter((d) => d.bindStatus === w.bindStatus);
    if (w.deviceKeyword) {
      const kw = w.deviceKeyword.trim();
      result = result.filter(
        (d) => d.deviceName.includes(kw) || d.deviceNo.includes(kw)
      );
    }
    if (w.studentKeyword) {
      const kw = w.studentKeyword.trim();
      result = result.filter((d) => d.studentName.includes(kw));
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

  const confirmUnbind = (row) => {
    ElMessageBox.confirm(
      '解绑后，学生需要重新绑定设备后才能使用蓝牙跳绳计数。',
      '确认解绑该设备？',
      {
        type: 'warning',
        draggable: true,
        confirmButtonText: '确认解绑',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger'
      }
    )
      .then(() => {
        // 原型仅前端模拟解绑
        const target = deviceStore.list.find((d) => d.deviceId === row.deviceId);
        if (target) target.bindStatus = 'unbound';
        EleMessage.success({ message: '解绑成功', plain: true });
        tableRef.value?.reload?.();
      })
      .catch(() => {});
  };

  const goRecord = (row) => {
    push({ path: '/sport/record', query: { deviceNo: row.deviceNo } });
  };
</script>
