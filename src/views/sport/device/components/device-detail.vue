<!-- 设备详情抽屉 -->
<template>
  <ele-drawer
    v-model="visible"
    :size="640"
    title="设备详情"
    :body-style="{ padding: '16px 20px 24px' }"
    @closed="handleClosed"
  >
    <template v-if="device">
      <!-- 顶部 -->
      <div class="detail-header">
        <div class="detail-name">
          {{ device.deviceName }}
          <span class="detail-no">{{ device.deviceNo }}</span>
        </div>
        <el-tag
          :type="bindStatus === 'bound' ? 'success' : 'info'"
          size="small"
          :disable-transitions="true"
        >
          {{ bindStatus === 'bound' ? '已绑定' : '已解绑' }}
        </el-tag>
      </div>

      <!-- 设备信息 -->
      <div class="section-title">设备信息</div>
      <el-descriptions :column="2" border size="default">
        <el-descriptions-item label="设备名称">{{ device.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="设备类型">
          {{ getLabel(DEVICE_TYPE_OPTIONS, device.deviceType) }}
        </el-descriptions-item>
        <el-descriptions-item label="设备编号">{{ device.deviceNo }}</el-descriptions-item>
        <el-descriptions-item label="绑定状态">
          <el-tag
            :type="bindStatus === 'bound' ? 'success' : 'info'"
            size="small"
            :disable-transitions="true"
          >
            {{ bindStatus === 'bound' ? '已绑定' : '已解绑' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="绑定学生数">
          {{ device.students?.length || 0 }}人
        </el-descriptions-item>
        <el-descriptions-item label="最近连接时间">
          {{ device.lastConnectTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="最近使用项目" :span="2">
          {{
            device.lastSport ? getLabel(SPORT_OPTIONS, device.lastSport) : '-'
          }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 绑定学生列表 -->
      <div class="section-title">
        绑定学生列表
        <span class="section-count">
          共 {{ device.students?.length || 0 }} 人
        </span>
      </div>
      <el-table
        v-if="device.students && device.students.length"
        :data="device.students"
        size="default"
        border
        stripe
      >
        <el-table-column prop="studentName" label="学生姓名" min-width="90" />
        <el-table-column prop="school" label="学校" min-width="120" />
        <el-table-column label="年级班级" min-width="120">
          <template #default="{ row }">{{ row.grade }} · {{ row.className }}</template>
        </el-table-column>
        <el-table-column prop="bindTime" label="绑定时间" min-width="150" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-link type="danger" underline="never" @click="confirmUnbind(row)">
              解除绑定
            </el-link>
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-else
        :image-size="80"
        description="暂无绑定学生"
        class="empty-block"
      />

      <!-- 使用记录 -->
      <div class="section-title">
        使用记录
        <span class="section-count">
          共 {{ usageRecords.length }} 条
        </span>
      </div>
      <el-table
        v-if="usageRecords.length"
        :data="usageRecords"
        size="default"
        border
        stripe
      >
        <el-table-column prop="studentName" label="使用学生" min-width="90" />
        <el-table-column label="运动项目" min-width="90" align="center">
          <template #default="{ row }">{{ getLabel(SPORT_OPTIONS, row.sport) }}</template>
        </el-table-column>
        <el-table-column label="记录类型" min-width="90" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.recordType === 'homework' ? 'warning' : 'primary'"
              size="small"
              effect="plain"
              :disable-transitions="true"
            >
              {{ row.recordType === 'homework' ? '作业' : '自主训练' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="采集方式" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" effect="plain" :disable-transitions="true">
              {{ getLabel(COLLECT_TYPE_OPTIONS, row.collectType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="result" label="运动结果" min-width="90" align="center" />
        <el-table-column prop="duration" label="运动时长" min-width="90" align="center" />
        <el-table-column prop="finishTime" label="完成时间" min-width="120" />
      </el-table>
      <el-empty
        v-else
        :image-size="80"
        description="暂无使用记录"
        class="empty-block"
      />
    </template>

    <template #footer>
      <el-button v-if="device && bindStatus === 'bound'" type="primary" @click="goRecord">
        查看运动记录
      </el-button>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </ele-drawer>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { ElMessageBox } from 'element-plus';
  import { EleMessage } from 'ele-admin-plus';
  import {
    deviceStore,
    DEVICE_TYPE_OPTIONS,
    SPORT_OPTIONS,
    COLLECT_TYPE_OPTIONS,
    getLabel,
    computeBindStatus
  } from '@/views/sport/data.js';

  const props = defineProps({
    deviceId: { type: [Number, String], default: null }
  });
  const emit = defineEmits(['closed', 'go-record', 'refresh']);

  const visible = ref(true);

  /** 始终从 store 获取最新设备，保证解绑后视图同步 */
  const device = computed(() =>
    deviceStore.list.find((d) => d.deviceId === props.deviceId)
  );

  const bindStatus = computed(() =>
    device.value ? computeBindStatus(device.value) : 'unbound'
  );

  const usageRecords = computed(() => {
    const list = device.value?.usageRecords || [];
    // 倒序展示
    return [...list].sort((a, b) => {
      // mock 中已是倒序，简单按字符串反向比对
      return String(b.finishTime).localeCompare(String(a.finishTime));
    });
  });

  const handleClosed = () => emit('closed');

  /** 解除单个学生绑定 */
  const confirmUnbind = (student) => {
    ElMessageBox.confirm(
      '解除后，该学生需要重新绑定设备后才能使用蓝牙跳绳计数，不影响其他已绑定学生继续使用该设备。',
      '确认解除绑定',
      {
        type: 'warning',
        draggable: true,
        confirmButtonText: '确认解除',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger',
        message: `确认解除学生 “${student.studentName}” 与设备的绑定关系？\n解除后，该学生需要重新绑定设备后才能使用蓝牙跳绳计数，不影响其他已绑定学生继续使用该设备。`
      }
    )
      .then(() => {
        const target = deviceStore.list.find(
          (d) => d.deviceId === props.deviceId
        );
        if (target) {
          target.students = target.students.filter(
            (s) => s.studentNo !== student.studentNo
          );
        }
        EleMessage.success({ message: '解除绑定成功', plain: true });
        emit('refresh');
      })
      .catch(() => {});
  };

  const goRecord = () => {
    if (device.value) emit('go-record', device.value);
    visible.value = false;
  };
</script>

<style lang="scss" scoped>
  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 4px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    margin-bottom: 4px;
  }
  .detail-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  .detail-no {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    font-weight: normal;
    margin-left: 10px;
  }
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 18px 0 12px;
    padding-left: 8px;
    border-left: 3px solid var(--el-color-primary);
    display: flex;
    align-items: center;
  }
  .section-count {
    margin-left: 8px;
    font-size: 12px;
    font-weight: normal;
    color: var(--el-text-color-secondary);
  }
  .empty-block {
    padding: 8px 0 4px;
  }
</style>
