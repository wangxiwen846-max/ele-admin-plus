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

        <template #bindStudentCount="{ row }">
          <span :class="{ 'count-zero': row.bindStudentCount === 0 }">
            {{ row.bindStudentCount }}人
          </span>
        </template>

        <template #lastStudentName="{ row }">
          <span v-if="row.lastStudentName">{{ row.lastStudentName }}</span>
          <span v-else class="text-placeholder">-</span>
        </template>

        <template #lastConnectTime="{ row }">
          <span v-if="row.lastConnectTime">{{ row.lastConnectTime }}</span>
          <span v-else class="text-placeholder">-</span>
        </template>

        <template #lastSport="{ row }">
          <span v-if="row.lastSport">{{ getLabel(SPORT_OPTIONS, row.lastSport) }}</span>
          <span v-else class="text-placeholder">-</span>
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

        <template #action="{ row }">
          <el-link type="primary" underline="never" @click="openDetail(row)">
            查看详情
          </el-link>
          <template v-if="row.bindStatus === 'bound'">
            <el-divider direction="vertical" />
            <el-link type="primary" underline="never" @click="goRecord(row)">
              查看运动记录
            </el-link>
          </template>
        </template>
      </ele-pro-table>
    </ele-card>

    <!-- 详情抽屉 -->
    <device-detail
      v-if="detailVisible"
      :device-id="currentDeviceId"
      @closed="detailVisible = false"
      @go-record="goRecord"
      @refresh="refresh"
    />
  </ele-page>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import DeviceSearch from './components/device-search.vue';
  import DeviceDetail from './components/device-detail.vue';
  import {
    deviceStore,
    DEVICE_TYPE_OPTIONS,
    SPORT_OPTIONS,
    getLabel,
    computeBindStatus
  } from '@/views/sport/data.js';

  defineOptions({ name: 'SportDevice' });

  const { push } = useRouter();
  const tableRef = ref(null);
  const lastWhere = reactive({});

  const detailVisible = ref(false);
  const currentDeviceId = ref(null);

  const columns = ref([
    { type: 'index', columnKey: 'index', width: 60, align: 'center' },
    { prop: 'deviceName', label: '设备名称', width: 150, slot: 'deviceName' },
    { prop: 'deviceType', label: '设备类型', width: 100, align: 'center', slot: 'deviceType' },
    { prop: 'deviceNo', label: '设备编号', width: 150 },
    { prop: 'bindStudentCount', label: '绑定学生数', width: 110, align: 'center', slot: 'bindStudentCount' },
    { prop: 'lastStudentName', label: '最近使用学生', width: 120, align: 'center', slot: 'lastStudentName' },
    { prop: 'lastConnectTime', label: '最近连接时间', width: 150, align: 'center', slot: 'lastConnectTime' },
    { prop: 'lastSport', label: '最近使用项目', width: 110, align: 'center', slot: 'lastSport' },
    { prop: 'bindStatus', label: '绑定状态', width: 100, align: 'center', slot: 'bindStatus' },
    {
      columnKey: 'action',
      label: '操作',
      width: 200,
      align: 'center',
      slot: 'action',
      fixed: 'right'
    }
  ]);

  /** 计算列表行数据：派生绑定学生数和绑定状态 */
  const flatList = computed(() =>
    deviceStore.list.map((d) => ({
      ...d,
      bindStudentCount: d.students?.length || 0,
      bindStatus: computeBindStatus(d)
    }))
  );

  const datasource = ({ pages }) => {
    let result = [...flatList.value];
    const w = lastWhere;
    if (w.deviceType) result = result.filter((d) => d.deviceType === w.deviceType);
    if (w.bindStatus) result = result.filter((d) => d.bindStatus === w.bindStatus);
    if (w.school) {
      result = result.filter((d) => d.students?.some((s) => s.school === w.school));
    }
    if (w.grade) {
      result = result.filter((d) => d.students?.some((s) => s.grade === w.grade));
    }
    if (w.className) {
      result = result.filter((d) => d.students?.some((s) => s.className === w.className));
    }
    if (w.deviceKeyword) {
      const kw = w.deviceKeyword.trim();
      result = result.filter(
        (d) => d.deviceName.includes(kw) || d.deviceNo.includes(kw)
      );
    }
    if (w.studentKeyword) {
      const kw = w.studentKeyword.trim();
      result = result.filter((d) =>
        d.students?.some((s) => s.studentName.includes(kw))
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
    currentDeviceId.value = row.deviceId;
    detailVisible.value = true;
  };

  const refresh = () => {
    tableRef.value?.reload?.();
  };

  const goRecord = (row) => {
    push({ path: '/sport/record', query: { deviceNo: row.deviceNo } });
  };
</script>

<style lang="scss" scoped>
  .text-placeholder {
    color: var(--el-text-color-placeholder);
  }
  .count-zero {
    color: var(--el-text-color-placeholder);
  }
</style>
