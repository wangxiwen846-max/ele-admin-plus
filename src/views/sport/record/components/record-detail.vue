<!-- 运动记录 详情抽屉 -->
<template>
  <ele-drawer
    v-model="visible"
    :size="560"
    :title="data?.sport === 'run' ? '跑步记录详情' : '跳绳记录详情'"
    :body-style="{ padding: '16px 20px 24px' }"
    @closed="handleClosed"
  >
    <template v-if="data">
      <!-- 顶部学生信息 -->
      <div class="detail-header">
        <div class="detail-name">
          {{ data.studentName }}
          <span class="detail-no">学号 {{ data.studentNo }}</span>
        </div>
        <div class="detail-tags">
          <el-tag
            :type="recordTypeTag.type"
            size="small"
            effect="plain"
            :disable-transitions="true"
          >
            {{ recordTypeTag.label }}
          </el-tag>
          <el-tag
            size="small"
            effect="plain"
            :disable-transitions="true"
            style="margin-left: 6px"
          >
            {{ collectTypeLabel }}
          </el-tag>
        </div>
      </div>

      <!-- 学生信息 -->
      <div class="section-title">学生信息</div>
      <el-descriptions :column="2" border size="default">
        <el-descriptions-item label="学生">{{ data.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ data.studentNo }}</el-descriptions-item>
        <el-descriptions-item label="学校">{{ data.school }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ data.grade }} · {{ data.className }}</el-descriptions-item>
      </el-descriptions>

      <!-- 运动信息 -->
      <div class="section-title">运动信息</div>
      <el-descriptions :column="2" border size="default">
        <el-descriptions-item label="运动项目">{{ sportLabel }}</el-descriptions-item>
        <el-descriptions-item label="记录类型">
          <el-tag :type="recordTypeTag.type" size="small" effect="plain" :disable-transitions="true">
            {{ recordTypeTag.label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="采集方式">{{ collectTypeLabel }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ data.finishTime }}</el-descriptions-item>
        <el-descriptions-item label="运动结果">
          <ele-text strong type="primary">{{ data.result }}</ele-text>
        </el-descriptions-item>
        <el-descriptions-item label="运动时长">{{ data.duration }}</el-descriptions-item>
        <template v-if="data.sport === 'run'">
          <el-descriptions-item v-if="data.avgPace" label="平均配速">{{ data.avgPace }}</el-descriptions-item>
          <el-descriptions-item v-if="data.steps" label="步数">{{ data.steps }}</el-descriptions-item>
        </template>
      </el-descriptions>

      <!-- 作业信息 -->
      <template v-if="data.recordType === 'homework'">
        <div class="section-title">作业信息</div>
        <el-descriptions :column="2" border size="default">
          <el-descriptions-item label="作业名称" :span="2">
            {{ data.homeworkName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="作业目标">
            {{ data.homeworkTarget || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="达标状态">
            <el-tag
              :type="passStatusTag.type"
              size="small"
              :disable-transitions="true"
            >
              {{ passStatusTag.label }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </template>

      <!-- 跳绳设备信息 -->
      <template v-if="data.sport === 'rope' && data.deviceName">
        <div class="section-title">设备信息</div>
        <el-descriptions :column="2" border size="default">
          <el-descriptions-item label="设备名称">{{ data.deviceName }}</el-descriptions-item>
          <el-descriptions-item label="设备编号">{{ data.deviceNo }}</el-descriptions-item>
        </el-descriptions>
      </template>

      <!-- 跑步轨迹 -->
      <template v-if="data.sport === 'run'">
        <div class="section-title">轨迹信息</div>
        <div class="track-map">
          <div class="track-map-inner">
            <div class="track-map-pin"></div>
            <span>跑步轨迹地图</span>
            <span class="track-map-tip">原型占位区域</span>
          </div>
        </div>
      </template>
    </template>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </ele-drawer>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import {
    SPORT_OPTIONS,
    COLLECT_TYPE_OPTIONS,
    getLabel
  } from '@/views/sport/data.js';

  const props = defineProps({
    data: { type: Object, default: null }
  });
  const emit = defineEmits(['closed']);

  const visible = ref(true);

  const sportLabel = computed(() => getLabel(SPORT_OPTIONS, props.data?.sport));
  const collectTypeLabel = computed(() =>
    getLabel(COLLECT_TYPE_OPTIONS, props.data?.collectType)
  );

  const recordTypeTag = computed(() => {
    if (props.data?.recordType === 'homework') {
      return { type: 'warning', label: '作业' };
    }
    return { type: 'primary', label: '自主训练' };
  });

  const passStatusTag = computed(() => {
    switch (props.data?.passStatus) {
      case 'pass':
        return { type: 'success', label: '已达标' };
      case 'fail':
        return { type: 'danger', label: '未达标' };
      default:
        return { type: 'info', label: '无需判断' };
    }
  });

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
  .track-map {
    height: 220px;
    background: linear-gradient(135deg, #eef2f7 0%, #e3e9f1 100%);
    border: 1px dashed var(--el-border-color);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.6) 1px, transparent 1px);
    background-size: 24px 24px;
  }
  .track-map-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }
  .track-map-pin {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--el-color-primary);
    box-shadow: 0 0 0 6px rgba(64, 158, 255, 0.18);
    margin-bottom: 4px;
  }
  .track-map-tip {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
</style>
