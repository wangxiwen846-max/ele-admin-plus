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
        <div class="section-desc">填写设项名称、来源及关联体育项目</div>
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
            <el-select
              v-model="sportPicker"
              multiple
              collapse-tags
              collapse-tags-tooltip
              filterable
              :disabled="coreDisabled"
              placeholder="请选择一个或多个体育项目"
              class="ele-fluid"
              @change="syncSports"
            >
              <el-option
                v-for="item in SPORT_PROJECT_CATALOG"
                :key="item.name"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
            <div class="form-tip">单项设项可只选一个项目；综合类设项可选多个项目。</div>
          </el-form-item>
        </el-col>
        <el-col v-if="form.sports.length" :xs="24">
          <div class="config-block">
            <div class="config-title">已选体育项目</div>
            <el-table :data="form.sports" border size="small" class="config-table">
              <el-table-column prop="name" label="体育项目" min-width="120" />
              <el-table-column prop="projectType" label="项目类型" width="110" align="center" />
              <el-table-column prop="unit" label="单位" width="80" align="center" />
              <el-table-column label="操作" width="80" align="center">
                <template #default="{ row }">
                  <el-link
                    type="danger"
                    underline="never"
                    :disabled="coreDisabled"
                    @click="removeSport(row.name)"
                  >
                    移除
                  </el-link>
                </template>
              </el-table-column>
            </el-table>
          </div>
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
        <div class="section-desc">配置个人或团体比赛形式；团体比赛可按需设置每支队伍的组队规则</div>
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
        <div class="section-title">适用范围</div>
        <div class="section-desc">设置性别、学段、年级等适用范围条件</div>
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
              :placeholder="form.stages.length ? '请选择适用年级' : '请先选择适用学段'"
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
          <el-form-item label="适用范围说明">
            <el-input v-model="form.qualification" :disabled="coreDisabled" type="textarea" :rows="3" :maxlength="300" />
          </el-form-item>
        </el-col>
      </el-row>
      </div>
    </div>

    <div class="form-section">
      <div class="section-head">
        <div class="section-title">报名设置</div>
        <div class="section-desc">配置设项默认报名规则，具体报名时间与名额在发布比赛时配置</div>
      </div>
      <div class="section-body">
        <el-row :gutter="16">
          <el-col :sm="12" :xs="24">
            <el-form-item label="报名方式" prop="registrationMethods">
              <el-select
                v-model="form.registrationMethods"
                multiple
                collapse-tags
                collapse-tags-tooltip
                :disabled="coreDisabled"
                placeholder="请选择报名方式"
                class="ele-fluid"
              >
                <el-option
                  v-for="opt in REGISTRATION_METHOD_OPTIONS"
                  :key="opt"
                  :label="opt"
                  :value="opt"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="默认保险要求" prop="defaultInsuranceRequirement">
              <el-radio-group v-model="form.defaultInsuranceRequirement" :disabled="coreDisabled">
                <el-radio v-for="opt in DEFAULT_INSURANCE_OPTIONS" :key="opt" :value="opt">
                  {{ opt }}
                </el-radio>
              </el-radio-group>
              <div class="form-tip">
                仅配置该设项的默认保险要求，具体保险方案可在赛事活动或发布比赛时配置。
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="form-section">
      <div class="section-head">
        <div class="section-title">成绩配置</div>
        <div class="section-desc">配置成绩采集方式与固定成绩类型；提交成绩时直接填写成绩和名次，不配置自动排名规则</div>
      </div>
      <div class="section-body">
      <el-row :gutter="16">
        <el-col :sm="12" :xs="24">
          <el-form-item label="数据来源">
            <span class="form-static-text">表单提交</span>
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="成绩提交人" prop="scoreSubmitters">
            <el-select
              v-model="form.scoreSubmitters"
              multiple
              collapse-tags
              collapse-tags-tooltip
              :disabled="coreDisabled"
              placeholder="请选择成绩提交人"
              class="ele-fluid"
            >
              <el-option v-for="opt in SCORE_SUBMITTER_OPTIONS" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <div class="form-tip form-tip--emphasis">
              比赛结束后，由体育教师或赛事专员提交比赛成绩和名次。
            </div>
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
              <div>
                <div class="config-title">成绩提交字段配置表</div>
                <div class="config-desc">根据成绩类型生成默认字段，可在表格中调整统计方式与单位</div>
              </div>
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
        <div class="section-desc">团体比赛可配置比赛计分规则</div>
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
        <div class="section-title">设项适用地区</div>
        <div class="section-desc">设置设项可适用的地区范围</div>
      </div>
      <div class="section-body">
      <el-row :gutter="16">
        <el-col :sm="12" :xs="24">
          <el-form-item label="适用地区类型">
            <el-radio-group v-model="form.regionType" :disabled="coreDisabled" @change="handleRegionTypeChange">
              <el-radio value="全国">全国</el-radio>
              <el-radio value="指定地区">指定地区</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col v-if="form.regionType === '指定地区'" :xs="24">
          <el-form-item label="指定地区" prop="regions">
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
        <el-col v-if="form.regionType === '指定地区'" :sm="12" :xs="24">
          <el-form-item label="包含下级地区">
            <el-switch v-model="form.includeChildren" :disabled="coreDisabled" active-text="是" inactive-text="否" />
          </el-form-item>
        </el-col>
      </el-row>
      </div>
    </div>

    <div class="form-section form-section--last">
      <div class="section-head">
        <div class="section-title">设项规则说明</div>
        <div class="section-desc">补充竞赛规程说明及相关附件</div>
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
  import {
    SOURCE_OPTIONS,
    SPORT_PROJECT_CATALOG,
    GENDER_OPTIONS,
    STAGE_OPTIONS,
    SCORE_TYPE_OPTIONS,
    SCORE_SUBMITTER_OPTIONS,
    REGISTRATION_METHOD_OPTIONS,
    DEFAULT_INSURANCE_OPTIONS,
    DURATION_STAT_METHOD_OPTIONS,
    DURATION_UNIT_OPTIONS,
    COUNT_STAT_METHOD_OPTIONS,
    COUNT_UNIT_OPTIONS,
    REGION_OPTIONS,
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
    hasScoreFieldNamed
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
  const sportPicker = ref([]);

  const initForm = () => {
    Object.assign(form, createDefaultItem());
    sportPicker.value = [];
    if (props.data) {
      Object.assign(form, migrateLegacyItem(clone(props.data)));
      sportPicker.value = (form.sports ?? []).map((s) => s.name);
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
    scoreSubmitters: [
      {
        validator: (_, value, callback) => {
          if (!value?.length) {
            callback(new Error('请选择成绩提交人'));
          } else {
            callback();
          }
        },
        trigger: 'change'
      }
    ],
    scoreType: [{ required: true, message: '请选择成绩类型', trigger: 'change' }],
    registrationMethods: [
      {
        validator: (_, value, callback) => {
          if (!value?.length) {
            callback(new Error('请选择报名方式'));
          } else {
            callback();
          }
        },
        trigger: 'change'
      }
    ],
    defaultInsuranceRequirement: [
      { required: true, message: '请选择默认保险要求', trigger: 'change' }
    ],
    regions: [
      {
        validator: (_, value, callback) => {
          if (form.regionType === '指定地区' && (!value || !value.length)) {
            callback(new Error('请选择指定地区'));
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

  const syncSports = () => {
    form.sports = sportPicker.value.map((name) => {
      return SPORT_PROJECT_CATALOG.find((d) => d.name === name) ?? { name, projectType: '-', unit: '-' };
    });
    formRef.value?.validateField?.('sports');
  };

  const removeSport = (name) => {
    sportPicker.value = sportPicker.value.filter((d) => d !== name);
    syncSports();
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
</style>
