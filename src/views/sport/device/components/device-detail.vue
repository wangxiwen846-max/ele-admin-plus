<!-- 设备详情抽屉 -->
<template>
  <ele-drawer
    v-model="visible"
    :size="540"
    title="设备详情"
    :body-style="{ padding: '16px 20px 24px' }"
    @closed="handleClosed"
  >
    <template v-if="data">
      <div class="detail-header">
        <div class="detail-name">
          {{ data.deviceName }}
          <span class="detail-no">{{ data.deviceNo }}</span>
        </div>
        <el-tag
          :type="data.bindStatus === 'bound' ? 'success' : 'info'"
          size="small"
          :disable-transitions="true"
        >
          {{ data.bindStatus === 'bound' ? '已绑定' : '已解绑' }}
        </el-tag>
      </div>

      <div class="section-title">设备信息</div>
      <el-descriptions :column="2" border size="default">
        <el-descriptions-item label="设备名称">{{ data.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="设备类型">
          {{ getLabel(DEVICE_TYPE_OPTIONS, data.deviceType) }}
        </el-descriptions-item>
        <el-descriptions-item label="设备编号" :span="2">{{ data.deviceNo }}</el-descriptions-item>
      </el-descriptions>

      <div class="section-title">绑定信息</div>
      <el-descriptions :column="2" border size="default">
        <el-descriptions-item label="绑定学生">{{ data.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ data.studentNo }}</el-descriptions-item>
        <el-descriptions-item label="学校">{{ data.school }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ data.grade }} · {{ data.className }}</el-descriptions-item>
        <el-descriptions-item label="绑定状态">
          <el-tag
            :type="data.bindStatus === 'bound' ? 'success' : 'info'"
            size="small"
            :disable-transitions="true"
          >
            {{ data.bindStatus === 'bound' ? '已绑定' : '已解绑' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="绑定时间">{{ data.bindTime }}</el-descriptions-item>
      </el-descriptions>

      <div class="section-title">使用信息</div>
      <el-descriptions :column="2" border size="default">
        <el-descriptions-item label="最近连接时间">{{ data.lastConnectTime }}</el-descriptions-item>
        <el-descriptions-item label="最近使用项目">
          {{ getLabel(SPORT_OPTIONS, data.lastSport) }}
        </el-descriptions-item>
        <el-descriptions-item label="最近运动记录" :span="2">
          {{ data.lastRecord || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </template>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </ele-drawer>
</template>

<script setup>
  import { ref } from 'vue';
  import {
    DEVICE_TYPE_OPTIONS,
    SPORT_OPTIONS,
    getLabel
  } from '@/views/sport/data.js';

  defineProps({
    data: { type: Object, default: null }
  });
  const emit = defineEmits(['closed']);

  const visible = ref(true);
  const handleClosed = () => emit('closed');
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
  }
</style>
