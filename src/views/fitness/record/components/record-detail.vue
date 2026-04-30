<!-- 体测记录 详情弹窗 -->
<template>
  <ele-modal
    :width="820"
    title="体测记录详情"
    :footer="false"
    v-bind="modalProps"
  >
    <div class="detail-header">
      <div class="detail-name">
        {{ data.studentName }}
        <span class="detail-no">学号 {{ data.studentNo }}</span>
      </div>
      <div class="detail-tags">
        <el-tag
          v-if="data.status === 'valid'"
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
        <el-tag
          v-if="data.recordType === 'makeup'"
          type="warning"
          size="small"
          effect="plain"
          :disable-transitions="true"
          style="margin-left: 8px"
        >
          补测
        </el-tag>
      </div>
    </div>

    <div class="section-title">基础信息</div>
    <el-descriptions :column="2" border size="default">
      <el-descriptions-item label="性别">
        {{ data.sexName }}
      </el-descriptions-item>
      <el-descriptions-item v-if="data.age" label="年龄">
        {{ data.age }} 岁
      </el-descriptions-item>
      <el-descriptions-item label="学校">
        {{ data.school }}
      </el-descriptions-item>
      <el-descriptions-item label="年级班级">
        {{ data.grade }} · {{ data.className }}
      </el-descriptions-item>
      <el-descriptions-item label="方案名称">
        {{ data.planName }}
      </el-descriptions-item>
      <el-descriptions-item label="测试日期">
        {{ data.testDate }}
      </el-descriptions-item>
      <el-descriptions-item label="记录类型">
        {{ data.recordType === 'makeup' ? '补测' : '正常' }}
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        {{ data.status === 'valid' ? '有效' : '已作废' }}
      </el-descriptions-item>
      <el-descriptions-item v-if="data.remark" label="备注" :span="2">
        {{ data.remark }}
      </el-descriptions-item>
      <el-descriptions-item
        v-if="data.status === 'invalid' && data.invalidReason"
        label="作废原因"
        :span="2"
      >
        {{ data.invalidReason }}
      </el-descriptions-item>
    </el-descriptions>

    <div class="section-title">体测成绩</div>
    <el-table :data="scoreRows" border size="default">
      <el-table-column label="#" type="index" width="56" align="center" />
      <el-table-column prop="name" label="项目名称" min-width="160" />
      <el-table-column prop="value" label="成绩" width="160" align="center">
        <template #default="{ row }">
          <span v-if="row.value != null && row.value !== ''">
            {{ row.value }}
          </span>
          <el-tag
            v-else
            type="info"
            size="small"
            effect="plain"
            :disable-transitions="true"
          >
            未录入
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="unit" label="单位" width="100" align="center" />
    </el-table>

    <div class="section-title">结果信息</div>
    <el-descriptions :column="3" border size="default">
      <el-descriptions-item label="BMI">
        {{ data.bmi || '-' }}
        <span
          v-if="data.bmi"
          style="color: var(--el-text-color-secondary); margin-left: 2px"
        >
          kg/m²
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="总分">
        <span style="color: var(--el-text-color-placeholder)">预留</span>
      </el-descriptions-item>
      <el-descriptions-item label="等级">
        <span style="color: var(--el-text-color-placeholder)">预留</span>
      </el-descriptions-item>
    </el-descriptions>

    <div class="section-title">日志信息</div>
    <el-descriptions :column="2" border size="default">
      <el-descriptions-item label="创建人">
        {{ data.createBy }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ data.createTime }}
      </el-descriptions-item>
      <el-descriptions-item label="修改人">
        {{ data.updateBy }}
      </el-descriptions-item>
      <el-descriptions-item label="修改时间">
        {{ data.updateTime }}
      </el-descriptions-item>
    </el-descriptions>
  </ele-modal>
</template>

<script setup>
  import { computed } from 'vue';
  import { useModal } from 'ele-admin-plus';
  import { planStore } from '@/views/fitness/data.js';

  const props = defineProps({ data: { type: Object, required: true } });
  const { modalProps } = useModal();

  const scoreRows = computed(() => {
    const plan = planStore.list.find((p) => p.planId === props.data.planId);
    if (!plan) return [];
    return (plan.items || [])
      .filter((d) => d.enabled)
      .filter((d) => {
        if (d.gender === 'all') return true;
        return d.gender === props.data.sex;
      })
      .slice()
      .sort((a, b) => a.sort - b.sort)
      .map((it) => ({
        name: it.name,
        unit: it.unit,
        value: props.data.scores?.[it.code]
      }));
  });
</script>

<style lang="scss" scoped>
  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    margin-bottom: 16px;
  }
  .detail-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  .detail-no {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    font-weight: normal;
    margin-left: 12px;
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
