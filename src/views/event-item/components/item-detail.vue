<!-- 设项详情 大弹窗 -->
<template>
  <ele-modal
    v-model="visible"
    :width="'80%'"
    title="设项详情"
    :body-style="{ padding: '0' }"
    class="item-detail-modal"
    @closed="$emit('closed')"
  >
    <div v-if="data" class="detail-scroll">
      <!-- 基本信息 -->
      <div class="detail-block">
        <div class="block-title">基本信息</div>
        <el-descriptions :column="2" size="small" class="desc-plain">
          <el-descriptions-item label="设项名称">{{ data.itemName }}</el-descriptions-item>
          <el-descriptions-item label="设项来源">{{ data.source }}</el-descriptions-item>
          <el-descriptions-item label="启用状态">
            <el-tag
              :type="data.status === 1 ? 'success' : 'info'"
              size="small"
              effect="light"
              :disable-transitions="true"
              class="inline-tag"
            >
              {{ data.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="数据来源">表单提交</el-descriptions-item>
          <el-descriptions-item label="关联体育项目" :span="2">
            <el-tag
              v-for="sport in data.sports"
              :key="getSportCatalogKey(sport)"
              size="small"
              effect="light"
              :disable-transitions="true"
              class="inline-tag"
            >
              {{ formatSportEntryDetailDisplay(sport) }}
            </el-tag>
            <span v-if="!data.sports?.length" class="text-secondary">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="设项说明" :span="2">{{ data.description || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ data.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ data.updateTime }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 比赛形式 -->
      <div class="detail-block">
        <div class="block-title">比赛形式</div>
        <el-descriptions :column="2" size="small" class="desc-plain">
          <el-descriptions-item label="比赛形式">
            <el-tag
              :type="data.matchForm === '团体' ? 'success' : 'primary'"
              size="small"
              effect="light"
              :disable-transitions="true"
              class="inline-tag"
            >
              {{ data.matchForm }}
            </el-tag>
          </el-descriptions-item>
          <template v-if="data.matchForm === '团体'">
            <el-descriptions-item label="是否配置队伍人数" :span="2">
              {{ data.enableTeamMemberLimit ? '是' : '否' }}
            </el-descriptions-item>
            <template v-if="data.enableTeamMemberLimit">
              <el-descriptions-item label="每队最少人数">{{ data.teamMin ?? '-' }}</el-descriptions-item>
              <el-descriptions-item label="每队最多人数">{{ data.teamMax ?? '-' }}</el-descriptions-item>
            </template>
            <el-descriptions-item label="是否需要队伍名称" :span="2">
              {{ data.needTeamName ? '是' : '否' }}
            </el-descriptions-item>
            <el-descriptions-item label="组队规则说明" :span="2">{{ data.teamRule || '-' }}</el-descriptions-item>
          </template>
        </el-descriptions>
      </div>

      <!-- 成绩配置 -->
      <div class="detail-block">
        <div class="block-title">成绩配置</div>
        <el-descriptions :column="2" size="small" class="desc-plain">
          <el-descriptions-item label="数据来源">表单提交</el-descriptions-item>
          <el-descriptions-item label="成绩类型" :span="2">{{ data.scoreType || '-' }}</el-descriptions-item>
        </el-descriptions>
        <div class="score-config-hint">
          成绩提交人、提交时间等比赛执行配置请在发布比赛时设置；设项管理不配置自动排名规则。
        </div>

        <div class="inner-card">
          <div class="inner-card-head">
            <div class="inner-label">成绩字段配置表</div>
            <div class="inner-desc">保存后的成绩字段配置</div>
          </div>
          <el-table :data="scoreTemplateRows" border size="small" class="inner-table score-template-table">
            <el-table-column label="基本信息" align="center">
              <el-table-column prop="school" label="学校" min-width="110" align="center" />
              <el-table-column prop="grade" label="年级" min-width="90" align="center" />
              <el-table-column prop="className" label="班级" min-width="90" align="center" />
              <el-table-column
                v-if="data.matchForm === '个人'"
                prop="studentName"
                label="学生姓名"
                min-width="110"
                align="center"
              />
              <el-table-column
                v-if="data.matchForm === '个人'"
                prop="studentNo"
                label="学号"
                min-width="110"
                align="center"
              />
              <el-table-column
                v-else
                prop="teamName"
                label="团队名称"
                min-width="120"
                align="center"
              />
            </el-table-column>
            <el-table-column label="成绩" align="center">
              <template v-if="data.scoreType === '胜负类'">
                <el-table-column prop="matchResult" label="比赛结果" min-width="110" align="center" />
                <el-table-column prop="scoreText" label="比分" min-width="110" align="center" />
              </template>
              <template v-else>
                <el-table-column prop="scoreValue" label="成绩" min-width="110" align="center" />
                <el-table-column label="单位" min-width="110" align="center">
                  <template #default>{{ scoreUnit }}</template>
                </el-table-column>
              </template>
            </el-table-column>
          </el-table>
          <div class="additional-fields">
            <div class="additional-fields-options">
              <el-checkbox
                v-for="item in additionalFieldDisplay"
                :key="item.value"
                :model-value="item.checked"
                disabled
              >
                {{ item.label }}
              </el-checkbox>
            </div>
          </div>
        </div>
      </div>

      <!-- 比赛计分规则 -->
      <div v-if="data.matchForm === '团体'" class="detail-block">
        <div class="block-title">比赛计分规则</div>
        <template v-if="data.scoringEnabled">
          <el-descriptions :column="2" size="small" class="desc-plain">
            <el-descriptions-item label="比赛计分规则">已配置</el-descriptions-item>
            <el-descriptions-item label="计分处理方式">{{ data.scoringMethod || '-' }}</el-descriptions-item>
            <el-descriptions-item label="计分规则说明" :span="2">
              {{ data.scoringDescription || '-' }}
            </el-descriptions-item>
          </el-descriptions>
          <attachment-table
            title="计分规则附件"
            :list="data.scoringAttachments"
            readonly
            compact
          />
        </template>
        <div v-else class="rule-disabled-hint">未配置</div>
      </div>

      <!-- 奖项设置 -->
      <div class="detail-block">
        <div class="block-title">奖项设置</div>
        <div class="award-summary-text">{{ awardSummary }}</div>
        <el-table
          v-if="data.awardSettings?.length"
          :data="data.awardSettings"
          border
          size="small"
          class="inner-table"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="awardName" label="奖项名称" min-width="120" />
          <el-table-column prop="awardRule" label="奖项规则" min-width="140" show-overflow-tooltip />
          <el-table-column label="获奖对象" width="100" align="center">
            <template #default="{ row }">
              {{ data.matchForm === '个人' ? '个人' : row.awardTarget }}
            </template>
          </el-table-column>
        </el-table>
        <el-descriptions :column="1" size="small" class="desc-plain award-remark-desc">
          <el-descriptions-item label="奖项补充说明">
            {{ data.awardRemark?.trim() || '未填写' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 参赛要求 -->
      <div class="detail-block">
        <div class="block-title">参赛要求</div>
        <el-descriptions :column="2" size="small" class="desc-plain">
          <el-descriptions-item label="性别要求">{{ data.gender }}</el-descriptions-item>
          <el-descriptions-item label="适用学段">{{ joinText(data.stages) }}</el-descriptions-item>
          <el-descriptions-item label="年龄范围">{{ formatAge(data) }}</el-descriptions-item>
          <el-descriptions-item label="其他参赛条件说明" :span="2">{{ data.qualification || '未填写' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 适用区域 -->
      <div class="detail-block detail-block--compact">
        <div class="block-title">适用区域</div>
        <el-descriptions :column="1" size="small" class="desc-plain">
          <el-descriptions-item label="适用区域">{{ applicableRegionSummary }}</el-descriptions-item>
        </el-descriptions>
        <div class="score-config-hint">
          适用区域用于限制该设项可在哪些地区或区域下被活动或比赛选择，不代表具体比赛的参赛范围。
        </div>
      </div>

      <!-- 规则说明 -->
      <div class="detail-block">
        <div class="block-title">规则说明</div>
        <div class="rule-text-panel">
          <div class="pre-line">{{ data.ruleDescription || '暂无规则说明' }}</div>
        </div>
        <attachment-table title="规则附件" :list="data.ruleAttachments" readonly compact />
      </div>

      <!-- 引用情况 -->
      <div class="detail-block">
        <div class="block-title">引用情况</div>
        <el-table :data="referenceRecords" border size="small" class="block-content">
          <el-table-column prop="eventName" label="赛事活动名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="matchName" label="比赛名称" min-width="160" show-overflow-tooltip />
          <el-table-column prop="stage" label="赛段" width="120" align="center" />
          <el-table-column prop="matchTime" label="比赛时间" min-width="200" align="center" />
          <el-table-column prop="status" label="比赛状态" width="90" align="center" />
          <el-table-column prop="referenceTime" label="引用时间" width="160" align="center" />
          <template #empty>
            <span class="table-empty-hint">暂无引用记录</span>
          </template>
        </el-table>
      </div>

      <!-- 操作记录 -->
      <div class="detail-block detail-block--last">
        <div class="block-title">操作记录</div>
        <el-table :data="data.operationLogs" border size="small" class="block-content">
          <el-table-column prop="time" label="操作时间" width="170" align="center" />
          <el-table-column prop="operator" label="操作人" width="110" align="center" />
          <el-table-column prop="type" label="操作类型" width="100" align="center" />
          <el-table-column prop="content" label="操作内容" min-width="200" show-overflow-tooltip />
          <template #empty>
            <span class="table-empty-hint">暂无操作记录</span>
          </template>
        </el-table>
      </div>
    </div>

    <template #footer>
      <div class="detail-footer-bar">
        <el-button @click="emitAction('edit')">编辑</el-button>
        <el-button @click="emitAction('copy')">复制</el-button>
        <el-button
          :type="data?.status === 1 ? 'warning' : 'success'"
          plain
          @click="emitAction('toggle')"
        >
          {{ data?.status === 1 ? '停用' : '启用' }}
        </el-button>
        <el-button type="danger" plain @click="emitAction('remove')">删除</el-button>
        <el-button @click="visible = false">关闭</el-button>
      </div>
    </template>
  </ele-modal>
</template>

<script setup>
  import { computed, ref } from 'vue';
  import {
    createReferenceRecords,
    findEventItem,
    formatAwardSettingSummary,
    formatSportEntryDetailDisplay,
    getSportCatalogKey,
    formatApplicableRegionSummary
  } from '@/views/event-item/data.js';
  import AttachmentTable from './attachment-table.vue';

  const props = defineProps({
    itemId: { type: Number, required: true }
  });
  const emit = defineEmits(['closed', 'edit', 'copy', 'toggle', 'remove']);

  const visible = ref(true);
  const data = computed(() => findEventItem(props.itemId));
  const referenceRecords = computed(() => createReferenceRecords(data.value));
  const awardSummary = computed(() => formatAwardSettingSummary(data.value?.awardSettings));
  const applicableRegionSummary = computed(() => formatApplicableRegionSummary(data.value));

  const scoreTemplateRows = computed(() => [
    {
      school: '',
      grade: '',
      className: '',
      studentName: '',
      studentNo: '',
      teamName: '',
      scoreValue: '',
      matchResult: '',
      scoreText: ''
    }
  ]);

  const scoreUnit = computed(() => {
    const scoreValue = (data.value?.scoreFieldConfig ?? []).find(
      (field) => field.name === '成绩数值'
    );
    return scoreValue?.unit && scoreValue.unit !== '-' ? scoreValue.unit : '秒';
  });

  const additionalFieldDisplay = computed(() => {
    const fields = data.value?.scoreFieldConfig ?? [];
    return [
      { label: '上传成绩证明', value: '成绩证明' },
      { label: '备注', value: '备注' }
    ].map((item) => ({
      ...item,
      checked: fields.some((field) => field.name === item.value)
    }));
  });

  const emitAction = (action) => {
    visible.value = false;
    if (data.value) {
      emit(action, data.value);
    }
  };

  function joinText(list) {
    return list?.length ? list.join('、') : '-';
  }

  function formatAge(row) {
    if (row?.ageStart && row?.ageEnd) {
      return `${row.ageStart} - ${row.ageEnd} 岁`;
    }
    return '-';
  }
</script>

<style lang="scss" scoped>
  .detail-scroll {
    max-height: calc(68vh - 8px);
    overflow-y: auto;
    padding: 16px 20px 8px;
  }

  .detail-block {
    margin-bottom: 10px;
    padding: 12px 16px 10px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;

    &--compact {
      padding-bottom: 8px;
    }

    &--last {
      margin-bottom: 0;
    }
  }

  .block-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 10px;
    padding: 0 0 8px 8px;
    border-left: 3px solid var(--el-color-primary);
    border-bottom: 1px solid var(--el-border-color-extra-light);
    line-height: 1.4;
  }

  .desc-plain {
    :deep(.el-descriptions__label) {
      width: 108px;
      font-weight: normal;
      color: var(--el-text-color-secondary);
      background: transparent;
    }

    :deep(.el-descriptions__content) {
      color: var(--el-text-color-primary);
    }

    :deep(.el-descriptions__cell) {
      padding-bottom: 6px;
      vertical-align: top;
    }

    :deep(.el-tag) {
      width: auto;
      max-width: fit-content;
    }
  }

  .block-content {
    :deep(.el-table__cell) {
      padding: 6px 0;
    }
  }

  .inline-tag {
    margin-right: 6px;
  }

  .score-config-hint {
    margin: 4px 0 8px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }

  .award-summary-text {
    margin-bottom: 10px;
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  .award-remark-desc {
    margin-top: 10px;
  }

  .inner-card {
    margin-top: 8px;
    padding: 8px 10px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
  }

  .inner-card-head {
    margin-bottom: 6px;
  }

  .inner-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1.4;
  }

  .inner-desc {
    margin-top: 2px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
  }

  .inner-table {
    :deep(.el-table__cell) {
      padding: 6px 0;
    }
  }

  .score-template-table {
    :deep(.el-table__body .cell) {
      min-height: 24px;
    }
  }

  .additional-fields {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--el-border-color-extra-light);
  }

  .additional-fields-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 18px;
  }

  .rule-disabled-hint {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    padding: 4px 0 2px;
  }

  .region-path-text {
    color: var(--el-text-color-primary);
    font-size: 13px;
    line-height: 1.6;
  }

  .rule-text-panel {
    padding: 8px 10px;
    margin-bottom: 8px;
    background: var(--el-fill-color-blank);
    border-radius: 4px;
    border: 1px solid var(--el-border-color-lighter);
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
  }

  .pre-line {
    white-space: pre-wrap;
  }

  .table-empty-hint {
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }

  .detail-footer-bar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
    padding-top: 12px;
    margin-top: -4px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .text-secondary {
    color: var(--el-text-color-secondary);
  }
</style>
