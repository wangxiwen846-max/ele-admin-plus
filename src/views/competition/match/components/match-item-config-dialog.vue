<!-- 比赛设项默认配置查看 -->
<template>
  <ele-modal
    v-model="visible"
    title="查看默认配置"
    :width="800"
    @closed="$emit('closed')"
  >
    <template v-if="item">
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="config-tip"
        title="以下内容为设项管理中的默认配置，仅供查看。本场比赛的最终执行配置请在发布比赛页面下方对应模块中调整。"
      />

      <div class="section-block">
        <div class="section-title">设项基础信息</div>
        <el-descriptions :column="2" size="small" border class="item-desc">
          <el-descriptions-item label="设项名称">{{ item.itemName }}</el-descriptions-item>
          <el-descriptions-item label="关联项目">{{ item.project }}</el-descriptions-item>
          <el-descriptions-item label="比赛形式">{{ item.matchForm }}</el-descriptions-item>
          <el-descriptions-item label="成绩类型">{{ item.scoreType }}</el-descriptions-item>
          <el-descriptions-item label="适用区域">{{ item.applicableRegion || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="section-block">
        <div class="section-title">默认配置</div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="成绩规则">{{ innerMeta.scoreRule || '-' }}</el-descriptions-item>
          <el-descriptions-item label="计分规则">{{ innerMeta.scoringRule || '未启用' }}</el-descriptions-item>
          <el-descriptions-item label="默认奖项设置">{{ awardSummary }}</el-descriptions-item>
          <el-descriptions-item label="默认参赛要求">{{ innerMeta.qualification || '-' }}</el-descriptions-item>
        </el-descriptions>
        <div class="form-tip">
          报名设置、保险设置、成绩提交人等比赛执行配置请在发布比赛页面中单独配置。
        </div>
      </div>
    </template>

    <template #footer>
      <el-button type="primary" @click="visible = false">关闭</el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';
  import {
    cloneItemMetaFromItem,
    mapMatchItemRow,
    clone
  } from '../data.js';
  import { findEventItem, getAwardCount } from '@/views/event-item/data.js';
  import { cloneAwardConfigForMatch } from '@/views/competition/activity/data.js';

  const props = defineProps({
    itemId: [Number, String],
    metaConfig: Object,
    awardConfig: Object
  });

  defineEmits(['closed']);

  const visible = ref(true);
  const innerMeta = ref({ scoreRule: '', scoringRule: '', qualification: '' });
  const innerAward = ref({ awards: [], awardRemark: '' });
  const awardSummary = computed(() => {
    const count = getAwardCount(innerAward.value.awards ?? []);
    return count ? `已配置奖项 ${count} 个` : '暂无奖项';
  });

  const item = computed(() => {
    if (!props.itemId) {
      return null;
    }
    const eventItem = findEventItem(props.itemId);
    const row = mapMatchItemRow(
      {
        itemMetaConfig: { [props.itemId]: innerMeta.value },
        itemAwardConfig: { [props.itemId]: innerAward.value }
      },
      props.itemId
    );
    return {
      ...row,
      itemName: eventItem?.itemName ?? row?.itemName,
      project: row?.project,
      matchForm: eventItem?.matchForm ?? row?.matchForm ?? '个人',
      scoreType: eventItem?.scoreType ?? row?.scoreType
    };
  });

  const initFromProps = () => {
    const eventItem = findEventItem(props.itemId);
    innerMeta.value = clone(
      props.metaConfig ?? cloneItemMetaFromItem(eventItem)
    );
    innerAward.value = clone(
      props.awardConfig ?? cloneAwardConfigForMatch(props.itemId)
    );
  };

  watch(
    () => props.itemId,
    () => initFromProps(),
    { immediate: true }
  );

</script>

<style scoped lang="scss">
  .config-tip {
    margin-bottom: 14px;
  }

  .section-block {
    margin-bottom: 16px;
  }

  .section-title {
    margin-bottom: 10px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .item-desc {
    margin-bottom: 0;
  }

  .form-tip {
    margin-top: 10px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }
</style>
