<!-- 体测方案 详情弹窗 -->
<template>
  <ele-modal
    :width="760"
    title="方案详情"
    :footer="false"
    v-bind="modalProps"
  >
    <el-descriptions
      :column="2"
      border
      size="default"
      class="detail-descriptions"
    >
      <el-descriptions-item label="方案名称" :span="2">
        {{ data.planName }}
        <el-tag
          v-if="data.isDefault"
          type="primary"
          size="small"
          effect="plain"
          :disable-transitions="true"
          style="margin-left: 8px"
        >
          默认
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="学段">
        {{ getStageLabel(data.stage) }}
      </el-descriptions-item>
      <el-descriptions-item label="适用年级">
        {{ (data.grades || []).join('、') }}
      </el-descriptions-item>
      <el-descriptions-item label="学年">
        {{ data.schoolYear }}
      </el-descriptions-item>
      <el-descriptions-item label="学期">
        {{ getTermLabel(data.term) }}
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <ele-dot
          v-if="data.status === 1"
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
      </el-descriptions-item>
      <el-descriptions-item label="更新时间">
        {{ data.updateTime }}
      </el-descriptions-item>
      <el-descriptions-item v-if="data.remark" label="备注" :span="2">
        {{ data.remark }}
      </el-descriptions-item>
    </el-descriptions>

    <div class="section-title">项目明细</div>
    <el-table
      :data="enabledItems"
      border
      size="default"
      class="item-table"
    >
      <el-table-column label="#" width="56" align="center" type="index" />
      <el-table-column prop="name" label="项目名称" min-width="160" />
      <el-table-column prop="unit" label="单位" width="90" align="center" />
      <el-table-column label="是否必填" width="100" align="center">
        <template #default="{ row }">
          <el-tag
            :type="row.required ? 'danger' : 'info'"
            size="small"
            :disable-transitions="true"
            effect="plain"
          >
            {{ row.required ? '必填' : '选填' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="适用性别" width="100" align="center">
        <template #default="{ row }">
          {{
            row.gender === 'all'
              ? '全部'
              : row.gender === 'male'
                ? '仅男'
                : '仅女'
          }}
        </template>
      </el-table-column>
      <el-table-column label="顺序" width="80" align="center" prop="sort" />
    </el-table>
  </ele-modal>
</template>

<script setup>
  import { computed } from 'vue';
  import { useModal } from 'ele-admin-plus';
  import { getStageLabel, getTermLabel } from '@/views/fitness/data.js';

  const props = defineProps({ data: { type: Object, required: true } });
  const { modalProps } = useModal();

  const enabledItems = computed(() =>
    (props.data.items || [])
      .filter((d) => d.enabled)
      .slice()
      .sort((a, b) => a.sort - b.sort)
  );
</script>

<style lang="scss" scoped>
  .detail-descriptions {
    margin-bottom: 16px;
    :deep(.el-descriptions__label) {
      width: 110px;
    }
  }
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 20px 0 12px;
    padding-left: 8px;
    border-left: 3px solid var(--el-color-primary);
  }
  .item-table {
    margin-bottom: 4px;
  }
</style>
