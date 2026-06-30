<template>
  <ele-page hide-footer :multi-card="false" class="step-form-view">
    <ele-loading :loading="loading" class="step-form-loading">
      <match-form-page
        v-if="formData"
        :data="formData"
        :match-id="matchId"
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
  import MatchFormPage from '../components/match-form-page.vue';
  import { findMatch } from '../data.js';

  defineOptions({ name: 'CompetitionMatchEdit' });

  const route = useRoute();
  const router = useRouter();
  const { setPageTabTitle } = usePageTab();
  const matchId = route.params.id;
  const loading = ref(true);
  const formData = ref(null);

  onMounted(() => {
    const match =
      findMatch(matchId) ??
      findMatch(Number(matchId)) ??
      null;
    if (!match) {
      EleMessage.error({ message: '比赛不存在或已被删除', plain: true });
      router.replace('/competition/match');
      return;
    }
    formData.value = match;
    setPageTabTitle(`编辑比赛[${match.matchName}]`);
    loading.value = false;
  });
</script>
