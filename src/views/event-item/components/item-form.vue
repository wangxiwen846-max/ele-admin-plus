<!-- 设项表单（供大弹窗内嵌） -->
<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="132px"
    class="item-form"
    @submit.prevent=""
  >
    <el-alert
      v-if="coreDisabled"
      title="该设项已被比赛引用，1.0 仅允许修改设项说明、规则说明、附件和启用状态。"
      type="warning"
      show-icon
      :closable="false"
      style="margin-bottom: 14px"
    />

    <div class="form-section">
      <div class="section-head">
        <div class="section-title">基本信息</div>
      </div>
      <div class="section-body">
      <el-row :gutter="16">
        <el-col :sm="12" :xs="24">
          <el-form-item label="设项名称" prop="itemName">
            <el-input
              v-model.trim="form.itemName"
              :disabled="coreDisabled"
              :maxlength="50"
              placeholder="例如：一分钟跳绳、3v3篮球、男子1000米"
            />
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="设项来源" prop="source">
            <el-radio-group v-model="form.source" :disabled="coreDisabled">
              <el-radio v-for="opt in SOURCE_OPTIONS" :key="opt" :value="opt">{{ opt }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :xs="24">
          <el-form-item label="关联体育项目" prop="sports">
            <sport-project-select
              v-model="form.sports"
              :disabled="coreDisabled"
              @update:model-value="handleSportsChange"
            />
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="启用状态">
            <el-switch
              v-model="form.status"
              :active-value="1"
              :inactive-value="0"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24">
          <el-form-item label="设项说明">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              :maxlength="300"
              placeholder="例如：用于校园积分赛中学生一分钟跳绳成绩采集与排名。"
            />
          </el-form-item>
        </el-col>
      </el-row>
      </div>
    </div>

    <div class="form-section">
      <div class="section-head">
        <div class="section-title">比赛形式</div>
      </div>
      <div class="section-body">
      <el-row :gutter="16">
        <el-col :xs="24">
          <el-form-item label="比赛形式" prop="matchForm">
            <el-radio-group v-model="form.matchForm" :disabled="coreDisabled" @change="handleMatchFormChange">
              <el-radio value="个人">个人</el-radio>
              <el-radio value="团体">团体</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <template v-if="form.matchForm === '团体'">
          <el-col :xs="24">
            <el-form-item label="是否配置队伍人数" class="team-form-item">
              <el-switch
                v-model="form.enableTeamMemberLimit"
                :disabled="coreDisabled"
                @change="handleTeamMemberLimitChange"
              />
            </el-form-item>
          </el-col>
          <template v-if="form.enableTeamMemberLimit">
            <el-col :sm="12" :xs="24">
              <el-form-item label="每队最少人数" prop="teamMin" class="team-form-item team-form-item--top">
                <el-input-number v-model="form.teamMin" :disabled="coreDisabled" :min="1" class="ele-fluid" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="每队最多人数" prop="teamMax" class="team-form-item team-form-item--top">
                <el-input-number v-model="form.teamMax" :disabled="coreDisabled" :min="1" class="ele-fluid" />
              </el-form-item>
            </el-col>
          </template>
          <el-col :xs="24">
            <el-form-item label="是否需要队伍名称" class="team-form-item">
              <el-switch v-model="form.needTeamName" :disabled="coreDisabled" />
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="组队规则说明" class="team-form-item team-form-item--top">
              <el-input
                v-model="form.teamRule"
                :disabled="coreDisabled"
                type="textarea"
                :rows="3"
                :maxlength="300"
              />
            </el-form-item>
          </el-col>
        </template>
      </el-row>
      </div>
    </div>

    <div class="form-section">
      <div class="section-head">
        <div class="section-title">成绩配置</div>
      </div>
      <div class="section-body">
      <el-row :gutter="16">
        <el-col :sm="12" :xs="24">
          <el-form-item label="数据来源">
            <span class="form-static-text">表单提交</span>
          </el-form-item>
        </el-col>
        <el-col :xs="24">
          <el-form-item label="成绩类型" prop="scoreType">
            <el-radio-group v-model="form.scoreType" :disabled="coreDisabled" @change="handleScoreTypeChange">
              <el-radio v-for="opt in SCORE_TYPE_OPTIONS" :key="opt" :value="opt">{{ opt }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :xs="24">
          <div class="config-block">
            <div class="config-toolbar">
              <div class="config-title">成绩提交字段配置表</div>
            </div>
            <el-table :data="form.scoreFieldConfig" border size="small" class="config-table">
              <el-table-column prop="name" label="字段名称" min-width="100" />
              <el-table-column prop="type" label="字段类型" width="88" align="center" />
              <el-table-column label="是否必填" width="96" align="center">
                <template #default="{ row }">
                  <el-select
                    v-if="!coreDisabled"
                    v-model="row.required"
                    size="small"
                    class="cell-select"
                  >
                    <el-option :value="true" label="是" />
                    <el-option :value="false" label="否" />
                  </el-select>
                  <span v-else>{{ row.required ? '是' : '否' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="成绩统计方式" min-width="120" align="center">
                <template #default="{ row }">
                  <el-select
                    v-if="isStatMethodEditable(row)"
                    v-model="row.statMethod"
                    :disabled="coreDisabled"
                    size="small"
                    class="cell-select"
                    @change="handleStatMethodChange(row)"
                  >
                    <el-option
                      v-for="opt in statMethodOptions"
                      :key="opt"
                      :label="opt"
                      :value="opt"
                    />
                  </el-select>
                  <span v-else class="cell-text">{{ row.statMethod || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="单位/选项" min-width="100" align="center">
                <template #default="{ row }">
                  <el-select
                    v-if="isUnitEditable(row)"
                    v-model="row.unit"
                    :disabled="coreDisabled"
                    size="small"
                    class="cell-select"
                  >
                    <el-option v-for="opt in unitOptionsForRow(row)" :key="opt" :label="opt" :value="opt" />
                  </el-select>
                  <span v-else class="cell-text">{{ formatUnitOrOptions(row) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="说明" min-width="120" show-overflow-tooltip />
            </el-table>
          </div>
        </el-col>
      </el-row>
      </div>
    </div>

    <div v-if="form.matchForm === '团体'" class="form-section">
      <div class="section-head">
        <div class="section-title">比赛计分规则</div>
      </div>
      <div class="section-body">
        <el-row :gutter="16">
          <el-col :sm="12" :xs="24">
            <el-form-item label="是否启用">
              <el-switch v-model="form.scoringEnabled" :disabled="coreDisabled" @change="handleScoringEnabledChange" />
            </el-form-item>
          </el-col>
          <template v-if="form.scoringEnabled">
            <el-col :sm="12" :xs="24">
              <el-form-item label="计分处理方式">
                <el-radio-group
                  v-model="form.scoringMethod"
                  :disabled="coreDisabled"
                  @change="syncMatchScoreField"
                >
                  <el-radio value="手动录入比赛分">手动录入比赛分</el-radio>
                  <el-radio value="系统自动计算" disabled>系统自动计算（后续支持）</el-radio>
                </el-radio-group>
                <div v-if="form.scoringMethod === '手动录入比赛分'" class="form-tip">
                  请确保成绩提交字段配置表中包含「比赛分」字段。
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24">
              <el-form-item label="计分规则说明">
                <el-input v-model="form.scoringDescription" :disabled="coreDisabled" type="textarea" :rows="3" />
              </el-form-item>
            </el-col>
            <el-col :xs="24">
              <attachment-table
                title="计分规则附件"
                :list="form.scoringAttachments"
                :disabled="coreDisabled"
                compact
                @add="(file) => handleAttachmentAdd('scoringAttachments', file)"
                @remove="(row) => handleAttachmentRemove('scoringAttachments', row)"
              />
            </el-col>
          </template>
        </el-row>
      </div>
    </div>

    <div class="form-section">
      <div class="section-head">
        <div class="section-title">奖项设置</div>
      </div>
      <div class="section-body">
        <award-setting-list v-model="form.awardSettings" :disabled="coreDisabled" />
        <el-form-item label="奖项补充说明" class="award-remark-item">
          <el-input
            v-model="form.awardRemark"
            type="textarea"
            :rows="3"
            :maxlength="500"
            :disabled="coreDisabled"
            placeholder="可补充说明并列名次、参赛人数不足、奖项调整、重复获奖、团体奖统计口径等特殊规则"
          />
        </el-form-item>
      </div>
    </div>

    <div class="form-section">
      <div class="section-head">
        <div class="section-title">参赛要求</div>
      </div>
      <div class="section-body">
      <el-row :gutter="16">
        <el-col :sm="12" :xs="24">
          <el-form-item label="性别要求" prop="gender">
            <el-radio-group v-model="form.gender" :disabled="coreDisabled">
              <el-radio v-for="opt in GENDER_OPTIONS" :key="opt" :value="opt">{{ opt }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="适用学段">
            <el-select
              v-model="form.stages"
              multiple
              collapse-tags
              collapse-tags-tooltip
              :disabled="coreDisabled"
              placeholder="请选择适用学段"
              class="ele-fluid"
              @change="handleStageChange"
            >
              <el-option v-for="opt in STAGE_OPTIONS" :key="opt" :label="opt" :value="opt" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="适用年级">
            <el-select
              v-model="form.grades"
              multiple
              collapse-tags
              collapse-tags-tooltip
              :disabled="coreDisabled || !form.stages.length"
              :placeholder="form.stages.length ? '请选择适用年级' : '请选择适用学段'"
              class="ele-fluid"
            >
              <el-option v-for="opt in gradeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="年龄范围">
            <div class="range-line">
              <el-input-number v-model="form.ageStart" :disabled="coreDisabled" :min="1" placeholder="起始年龄" />
              <span class="range-separator">至</span>
              <el-input-number v-model="form.ageEnd" :disabled="coreDisabled" :min="1" placeholder="结束年龄" />
            </div>
          </el-form-item>
        </el-col>
        <el-col :xs="24">
          <el-form-item label="其他参赛条件说明">
            <el-input
              v-model="form.qualification"
              :disabled="coreDisabled"
              type="textarea"
              :rows="3"
              :maxlength="300"
              placeholder="可补充说明其他参赛条件，例如：面向小学三至四年级学生"
            />
          </el-form-item>
        </el-col>
      </el-row>
      </div>
    </div>

    <div class="form-section">
      <div class="section-head">
        <div class="section-title">适用区域</div>
      </div>
      <div class="section-body">
      <el-row :gutter="16">
        <el-col :sm="12" :xs="24">
          <el-form-item label="适用区域">
            <el-radio-group v-model="form.regionType" :disabled="coreDisabled" @change="handleRegionTypeChange">
              <el-radio value="全国">全国</el-radio>
              <el-radio value="指定地区">指定区域</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col v-if="form.regionType === '指定地区'" :xs="24">
          <el-form-item label="指定区域" prop="regions">
            <el-cascader
              v-model="form.regions"
              :options="REGION_OPTIONS"
              :props="cascaderProps"
              :disabled="coreDisabled"
              placeholder="请选择省 / 市 / 区县"
              clearable
              filterable
              collapse-tags
              collapse-tags-tooltip
              class="ele-fluid"
            />
          </el-form-item>
        </el-col>
      </el-row>
      </div>
    </div>

    <div class="form-section form-section--last">
      <div class="section-head">
        <div class="section-title">设项规则说明</div>
      </div>
      <div class="section-body">
      <el-form-item label="规则说明">
        <el-input v-model="form.ruleDescription" type="textarea" :rows="5" />
      </el-form-item>
      <attachment-table
        title="规则附件"
        :list="form.ruleAttachments"
        compact
        @add="(file) => handleAttachmentAdd('ruleAttachments', file)"
        @remove="(row) => handleAttachmentRemove('ruleAttachments', row)"
      />
      </div>
    </div>
  </el-form>
</template>

<script setup>
  import { computed, reactive, ref } from 'vue';
  import { EleMessage } from 'ele-admin-plus';
  import AttachmentTable from './attachment-table.vue';
  import AwardSettingList from './award-setting-list.vue';
  import SportProjectSelect from './sport-project-select.vue';
  import {
    SOURCE_OPTIONS,
    GENDER_OPTIONS,
    STAGE_OPTIONS,
    SCORE_TYPE_OPTIONS,
    REGION_OPTIONS,
    DURATION_STAT_METHOD_OPTIONS,
    DURATION_UNIT_OPTIONS,
    COUNT_STAT_METHOD_OPTIONS,
    COUNT_UNIT_OPTIONS,
    getGradesByStages,
    applyScoreTypeDefaults,
    syncScoreMetaFromFieldConfig,
    syncScoreConfigFromForm,
    syncStructuredFieldsFromForm,
    ensureMatchScoreField,
    removeMatchScoreField,
    defaultUnitForCountStat,
    migrateLegacyItem,
    clone,
    createDefaultItem,
    eventItemStore,
    formatNow,
    hasScoreFieldNamed,
    validateAwardSettings,
    normalizeAwardSettings,
    normalizeSportEntry
  } from '@/views/event-item/data.js';

  const props = defineProps({
    data: Object,
    mode: { type: String, default: 'add' }
  });
  const emit = defineEmits(['done', 'fail']);

  const formRef = ref(null);
  const isUpdate = computed(() => props.mode === 'edit');
  const coreDisabled = computed(() => isUpdate.value && props.data?.isReferenced);

  const form = reactive(createDefaultItem());

  const initForm = () => {
    Object.assign(form, createDefaultItem());
    if (props.data) {
      Object.assign(form, migrateLegacyItem(clone(props.data)));
      form.sports = (form.sports ?? []).map((s) => normalizeSportEntry(s));
      if (props.mode === 'copy') {
        form.itemId = void 0;
        form.itemName = `${props.data.itemName}-副本`;
        form.status = 0;
        form.isReferenced = false;
        form.createTime = '';
        form.updateTime = '';
        form.operationLogs = [];
      }
      syncMatchScoreField();
    } else {
      applyScoreTypeDefaults(form);
    }
  };
  initForm();

  const rules = reactive({
    itemName: [{ required: true, message: '请输入设项名称', trigger: 'blur' }],
    source: [{ required: true, message: '请选择设项来源', trigger: 'change' }],
    sports: [
      {
        validator: (_, __, callback) => {
          if (!form.sports?.length) {
            callback(new Error('请至少关联一个体育项目'));
          } else {
            callback();
          }
        },
        trigger: 'change'
      }
    ],
    matchForm: [{ required: true, message: '请选择比赛形式', trigger: 'change' }],
    gender: [{ required: true, message: '请选择性别要求', trigger: 'change' }],
    scoreType: [{ required: true, message: '请选择成绩类型', trigger: 'change' }],
    regions: [
      {
        validator: (_, value, callback) => {
          if (form.regionType === '指定地区' && (!value || !value.length)) {
            callback(new Error('请选择指定区域'));
          } else {
            callback();
          }
        },
        trigger: 'change'
      }
    ],
    teamMin: [
      {
        validator: (_, value, callback) => {
          if (form.matchForm === '团体' && form.enableTeamMemberLimit && (!value || value <= 0)) {
            callback(new Error('每队最少人数必须大于 0'));
          } else {
            callback();
          }
        },
        trigger: 'change'
      }
    ],
    teamMax: [
      {
        validator: (_, value, callback) => {
          if (
            form.matchForm === '团体' &&
            form.enableTeamMemberLimit &&
            value != null &&
            form.teamMin != null &&
            value < form.teamMin
          ) {
            callback(new Error('每队最多人数必须大于等于最少人数'));
          } else {
            callback();
          }
        },
        trigger: 'change'
      }
    ]
  });


  const cascaderProps = {
    multiple: true,
    checkStrictly: true,
    emitPath: true,
    value: 'value',
    label: 'label',
    children: 'children'
  };

  const gradeOptions = computed(() => getGradesByStages(form.stages));

  const statMethodOptions = computed(() => {
    if (form.scoreType === '时长/用时类') {
      return DURATION_STAT_METHOD_OPTIONS;
    }
    if (form.scoreType === '个数/距离类') {
      return COUNT_STAT_METHOD_OPTIONS;
    }
    return [];
  });

  const isStatMethodEditable = (row) =>
    row.name === '成绩数值' && form.scoreType !== '胜负类';

  const isUnitEditable = (row) =>
    row.name === '成绩数值' && form.scoreType !== '胜负类';

  const unitOptionsForRow = () => {
    if (form.scoreType === '时长/用时类') {
      return DURATION_UNIT_OPTIONS;
    }
    if (form.scoreType === '个数/距离类') {
      return COUNT_UNIT_OPTIONS;
    }
    return [];
  };

  const formatUnitOrOptions = (row) => {
    if (row.name === '比赛结果') {
      return row.options || '胜、负、平';
    }
    if (row.unit && row.unit !== '-') {
      return row.unit;
    }
    return '-';
  };

  const syncMatchScoreField = () => {
    if (
      form.matchForm === '团体' &&
      form.scoringEnabled &&
      form.scoringMethod === '手动录入比赛分'
    ) {
      form.scoreFieldConfig = ensureMatchScoreField(form.scoreFieldConfig ?? []);
    } else {
      form.scoreFieldConfig = removeMatchScoreField(form.scoreFieldConfig ?? []);
    }
  };

  const handleSportsChange = () => {
    formRef.value?.validateField?.('sports');
  };

  const handleStageChange = () => {
    const allowed = gradeOptions.value;
    form.grades = (form.grades ?? []).filter((g) => allowed.includes(g));
  };

  const handleRegionTypeChange = (val) => {
    if (val === '全国') {
      form.regions = [];
      form.includeChildren = true;
    }
  };

  const handleMatchFormChange = (val) => {
    if (val === '个人') {
      form.enableTeamMemberLimit = false;
      form.teamMin = null;
      form.teamMax = null;
      form.scoringEnabled = false;
      form.scoringMethod = '';
      form.scoringDescription = '';
      form.scoringAttachments = [];
    }
    syncMatchScoreField();
  };

  const handleTeamMemberLimitChange = (val) => {
    if (!val) {
      form.teamMin = null;
      form.teamMax = null;
    } else if (!form.teamMin) {
      form.teamMin = 1;
      form.teamMax = 3;
    }
  };

  const handleScoreTypeChange = () => {
    applyScoreTypeDefaults(form);
    syncMatchScoreField();
  };

  const handleStatMethodChange = (row) => {
    if (form.scoreType === '个数/距离类' && row.name === '成绩数值') {
      row.unit = defaultUnitForCountStat(row.statMethod);
    }
    syncScoreMetaFromFieldConfig(form);
    syncScoreConfigFromForm(form);
  };

  const handleScoringEnabledChange = (val) => {
    if (val && !form.scoringMethod) {
      form.scoringMethod = '手动录入比赛分';
    }
    syncMatchScoreField();
    syncScoreConfigFromForm(form);
  };

  const handleAttachmentAdd = (field, file) => {
    form[field].push(file);
    EleMessage.success({ message: '附件已添加（mock）', plain: true });
  };

  const handleAttachmentRemove = (field, row) => {
    const index = form[field].findIndex((d) => d.id === row.id);
    if (index !== -1) {
      form[field].splice(index, 1);
    }
    EleMessage.success({ message: '已删除', plain: true });
  };

  const buildPayload = () => {
    syncMatchScoreField();
    syncStructuredFieldsFromForm(form);
    const payload = clone(form);
    payload.dataSource = '表单提交';
    if (payload.matchForm === '个人') {
      payload.teamRule = '';
      payload.enableTeamMemberLimit = false;
      payload.teamMin = null;
      payload.teamMax = null;
      payload.scoringEnabled = false;
      payload.scoringMethod = '';
      payload.scoringDescription = '';
      payload.scoringAttachments = [];
    }
    if (!payload.enableTeamMemberLimit) {
      payload.teamMin = null;
      payload.teamMax = null;
    }
    payload.rankingEnabled = false;
    payload.rankBasis = '';
    payload.sortType = '';
    payload.tieRule = '';
    payload.rankDescription = '';
    payload.rankAttachments = [];
    if (payload.matchForm !== '团体' || !payload.scoringEnabled) {
      payload.scoringMethod = '';
      payload.scoringDescription = '';
      payload.scoringAttachments = [];
    }
    if (payload.regionType === '全国') {
      payload.regions = [];
    }
    payload.awardSettings = normalizeAwardSettings(payload.awardSettings ?? []);
    payload.awardRemark = payload.awardRemark?.trim() ?? '';
    payload.qualification = payload.qualification?.trim() ?? '';
    payload.sports = (payload.sports ?? []).map((s) => normalizeSportEntry(s));
    delete payload.registrationSetting;
    delete payload.insuranceSetting;
    delete payload.scoreSubmitters;
    delete payload.itemRequirement;
    syncStructuredFieldsFromForm(payload);
    return payload;
  };

  const validateBusinessRules = () => {
    if (
      form.matchForm === '团体' &&
      form.scoringEnabled &&
      form.scoringMethod === '手动录入比赛分'
    ) {
      const fields = form.scoreFieldConfig ?? [];
      if (!hasScoreFieldNamed(fields, '比赛分')) {
        EleMessage.error({
          message: '当前计分方式为手动录入比赛分，请在成绩字段中添加「比赛分」字段。',
          plain: true
        });
        return false;
      }
    }
    const awardErrors = validateAwardSettings(form.awardSettings);
    if (awardErrors.length) {
      EleMessage.error({ message: awardErrors[0], plain: true });
      return false;
    }
    return true;
  };

  const submit = () => {
    formRef.value?.validate?.((valid) => {
      if (!valid) {
        emit('fail');
        return;
      }
      if (!validateBusinessRules()) {
        emit('fail');
        return;
      }
      const now = formatNow();
      const payload = buildPayload();

      if (isUpdate.value) {
        const target = eventItemStore.list.find((d) => d.itemId === payload.itemId);
        if (target) {
          Object.assign(target, payload, { updateTime: now });
          target.operationLogs.unshift({
            time: now,
            operator: '管理员',
            type: '编辑',
            content: coreDisabled.value ? '修改说明、附件或启用状态' : '修改设项配置'
          });
        }
        EleMessage.success({ message: '保存成功', plain: true });
      } else {
        const newItem = {
          ...payload,
          itemId: eventItemStore.nextId++,
          isReferenced: false,
          createBy: '管理员',
          createTime: now,
          updateTime: now,
          operationLogs: [
            {
              time: now,
              operator: '管理员',
              type: props.mode === 'copy' ? '复制' : '新增',
              content: props.mode === 'copy' ? '复制生成设项' : '新增设项'
            }
          ]
        };
        eventItemStore.list.unshift(newItem);
        EleMessage.success({
          message: props.mode === 'copy' ? '复制保存成功' : '新增成功',
          plain: true
        });
      }
      emit('done');
    });
  };

  defineExpose({ submit });
</script>

<style lang="scss" scoped>
  .item-form {
    :deep(.el-form-item) {
      margin-bottom: 12px;
    }

    :deep(.el-form-item__label) {
      color: var(--el-text-color-regular);
    }

    :deep(.el-radio-group),
    :deep(.el-switch) {
      line-height: 32px;
    }
  }

  .form-section {
    margin-bottom: 10px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;

    &--last {
      margin-bottom: 0;
    }
  }

  .section-head {
    padding: 12px 16px 0;
    background: transparent;
  }

  .award-remark-item {
    margin-top: 12px;
    margin-bottom: 0;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1.4;
    padding-left: 8px;
    border-left: 3px solid var(--el-color-primary);
  }

  .section-desc {
    margin: 4px 0 0 11px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
  }

  .section-body {
    padding: 10px 16px 4px;
    border-top: 1px solid var(--el-border-color-extra-light);
    margin-top: 10px;
  }

  .section-divider {
    margin: 2px 0 12px;
    border-color: var(--el-border-color-extra-light);
  }

  .form-subsection {
    margin-bottom: 10px;
    padding: 10px 12px 2px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .subsection-head {
    margin-bottom: 4px;
  }

  .subsection-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .form-tip {
    width: 100%;
    margin-top: 4px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 1.5;

    &--emphasis {
      margin-top: 6px;
      color: var(--el-text-color-regular);
    }
  }

  .form-static-text {
    color: var(--el-text-color-primary);
    font-size: 14px;
    line-height: 32px;
  }

  :deep(.team-form-item--top.el-form-item) {
    align-items: flex-start;

    .el-form-item__label {
      line-height: 32px;
    }
  }

  .range-line {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .range-separator {
    color: var(--el-text-color-secondary);
  }

  .config-block {
    margin: 0 0 6px 132px;
    padding: 8px 10px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
  }

  .config-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
    gap: 12px;
  }

  .config-title {
    color: var(--el-text-color-primary);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.4;
  }

  .config-desc {
    margin-top: 2px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
  }

  .config-table {
    :deep(.el-table__cell) {
      padding: 6px 0;
    }
  }

  .cell-select {
    width: 100%;
  }

  .cell-text {
    color: var(--el-text-color-regular);
    font-size: 13px;
  }

  @media (max-width: 768px) {
    .config-block {
      margin-left: 0;
    }
  }

  .readonly-text {
    font-size: 13px;
    color: var(--el-text-color-regular);
    line-height: 32px;
  }
</style>
