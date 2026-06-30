<template>
  <ele-page hide-footer :multi-card="false" class="step-form-view">
    <ele-loading :loading="loading" class="step-form-loading">
      <activity-form-page
        v-if="formData"
        :data="formData"
        :activity-id="activityId"
        mode="edit"
      />
    </ele-loading>
  </ele-page>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { EleMessage } from 'ele-admin-plus';
  import { usePageTab } from '@/utils/use-page-tab';
  import ActivityFormPage from '../components/activity-form-page.vue';
  import { findActivity, clone } from '../data.js';

  defineOptions({ name: 'CompetitionActivityEdit' });

  const route = useRoute();
  const router = useRouter();
  const { setPageTabTitle } = usePageTab();
  const activityId = Number(route.params.id);
  const loading = ref(true);
  const formData = ref(null);

  onMounted(() => {
    const activity = findActivity(activityId);
    if (!activity) {
      EleMessage.error({ message: '活动不存在或已被删除', plain: true });
      router.replace('/competition/activity');
      return;
    }
    formData.value = clone(activity);
    setPageTabTitle(`编辑活动[${activity.activityName}]`);
    loading.value = false;
  });
</script>

