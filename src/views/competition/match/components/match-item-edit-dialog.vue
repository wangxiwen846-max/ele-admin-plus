<!-- 修改比赛设项配置弹窗 -->
<template>
  <ele-modal
    v-model="visible"
    title="修改比赛设项"
    :width="760"
    :body-style="{ overflow: 'auto', maxHeight: '70vh' }"
    @closed="$emit('closed')"
  >
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="以下配置仅影响当前比赛，不回写设项管理。"
      style="margin-bottom: 14px"
    />

    <el-form v-if="editing" label-width="108px" @submit.prevent="">
      <el-form-item label="设项名称">
        <span>{{ itemName }}</span>
      </el-form-item>
      <el-form-item label="成绩规则">
        <el-input
          v-model="editing.scoreRule"
          type="textarea"
          :rows="2"
          placeholder="请输入成绩规则"
        />
      </el-form-item>
      <el-form-item label="计分规则">
        <el-input
          v-model="editing.scoringRule"
          type="textarea"
          :rows="2"
          placeholder="请输入计分规则"
        />
      </el-form-item>
      <el-form-item label="奖项设置">
        <award-setting-list v-model="editing.awards" />
      </el-form-item>
      <el-form-item label="奖项补充说明">
        <el-input v-model="editing.awardRemark" type="textarea" :rows="2" placeholder="非必填" />
      </el-form-item>
      <el-form-item label="参赛要求">
        <el-input
          v-model="editing.qualification"
          type="textarea"
          :rows="3"
          placeholder="请输入参赛要求"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="save">确定</el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import { findEventItem, getAwardCount } from '@/views/event-item/data.js';
  import AwardSettingList from '@/views/event-item/components/award-setting-list.vue';
  import { clone } from '../data.js';

  const props = defineProps({
    itemId: [Number, String],
    metaConfig: { type: Object, default: () => ({}) },
    awardConfig: { type: Object, default: () => ({ awards: [], awardRemark: '' }) }
  });

  const emit = defineEmits(['closed', 'save']);

  const visible = ref(true);
  const editing = ref(null);

  const itemName = computed(() => findEventItem(props.itemId)?.itemName || `设项${props.itemId}`);

  watch(
    () => [props.itemId, props.metaConfig, props.awardConfig],
    () => {
      editing.value = {
        scoreRule: props.metaConfig?.scoreRule ?? '',
        scoringRule: props.metaConfig?.scoringRule ?? '',
        qualification: props.metaConfig?.qualification ?? '',
        awards: clone(props.awardConfig?.awards ?? []),
        awardRemark: props.awardConfig?.awardRemark ?? ''
      };
    },
    { immediate: true }
  );

  const save = () => {
    const awards = editing.value.awards ?? [];
    for (let index = 0; index < awards.length; index += 1) {
      const award = awards[index];
      const prefix = `第 ${index + 1} 条奖项`;
      if (!award.awardName?.trim()) {
        EleMessage.error({ message: `${prefix}请填写奖项名称`, plain: true });
        return;
      }
      if (!award.awardRule?.trim()) {
        EleMessage.error({ message: `${prefix}请填写奖项规则`, plain: true });
        return;
      }
      if (!award.awardTarget) {
        EleMessage.error({ message: `${prefix}请选择获奖对象`, plain: true });
        return;
      }
    }
    emit('save', {
      metaConfig: {
        scoreRule: editing.value.scoreRule,
        scoringRule: editing.value.scoringRule,
        qualification: editing.value.qualification
      },
      awardConfig: {
        awards: clone(editing.value.awards),
        awardRemark: editing.value.awardRemark
      },
      awardSummary: getAwardCount(editing.value.awards)
        ? `已配置奖项 ${getAwardCount(editing.value.awards)} 个`
        : '暂无奖项'
    });
    visible.value = false;
  };
</script>
