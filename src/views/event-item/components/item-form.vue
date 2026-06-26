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
              placeholder="请输入设项名称"
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
        <div class="section-desc">配置个人赛或团体赛及组队规则</div>
      </div>
      <div class="section-body">
      <el-row :gutter="16">
        <el-col :xs="24">
          <el-form-item label="比赛形式" prop="matchForm">
            <el-radio-group v-model="form.matchForm" :disabled="coreDisabled">
              <el-radio value="个人">个人</el-radio>
              <el-radio value="团体">团体</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <template v-if="form.matchForm === '团体'">
          <el-col :sm="12" :xs="24">
            <el-form-item label="每队最少人数" prop="teamMin">
              <el-input-number v-model="form.teamMin" :disabled="coreDisabled" :min="1" class="ele-fluid" />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="每队最多人数" prop="teamMax">
              <el-input-number v-model="form.teamMax" :disabled="coreDisabled" :min="1" class="ele-fluid" />
            </el-form-item>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="需要队伍名称">
              <el-switch v-model="form.needTeamName" :disabled="coreDisabled" active-text="是" inactive-text="否" />
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="组队规则说明">
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
        <div class="section-title">参赛要求</div>
        <div class="section-desc">设置性别、学段、年级等参赛限制条件</div>
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
          <el-form-item label="参赛资格说明">
            <el-input v-model="form.qualification" :disabled="coreDisabled" type="textarea" :rows="3" :maxlength="300" />
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="需要报名材料">
            <el-switch v-model="form.needMaterial" :disabled="coreDisabled" active-text="是" inactive-text="否" />
          </el-form-item>
        </el-col>
        <el-col v-if="form.needMaterial" :xs="24">
          <el-form-item label="报名材料说明">
            <el-input v-model="form.materialDescription" :disabled="coreDisabled" type="textarea" :rows="3" :maxlength="300" />
          </el-form-item>
        </el-col>
      </el-row>
      </div>
    </div>

    <div class="form-section">
      <div class="section-head">
        <div class="section-title">成绩配置</div>
        <div class="section-desc">配置成绩采集方式、排名与计分规则</div>
      </div>
      <div class="section-body">
      <el-row :gutter="16">
        <el-col :sm="12" :xs="24">
          <el-form-item label="数据来源">
            <span class="form-static-text">表单提交</span>
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="成绩提交表单">
            <el-radio-group v-model="form.scoreFormType" :disabled="coreDisabled">
              <el-radio value="existing">选择已有成绩表单</el-radio>
              <el-radio value="custom">配置成绩字段</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <template v-if="form.scoreFormType === 'existing'">
          <el-col :sm="12" :xs="24">
            <el-form-item label="选择成绩表单" prop="scoreForm">
              <el-select
                v-model="form.scoreForm"
                :disabled="coreDisabled"
                placeholder="请选择成绩提交表单"
                class="ele-fluid"
              >
                <el-option v-for="opt in scoreFormOptions" :key="opt" :label="opt" :value="opt" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <div class="config-block">
              <div class="config-toolbar">
                <div>
                  <div class="config-title">表单字段预览</div>
                  <div class="config-desc">选择成绩表单后可预览字段结构</div>
                </div>
              </div>
              <el-table :data="formPreview" border size="small" class="config-table" empty-text="请选择成绩表单后查看字段预览">
                <el-table-column label="所属项目" width="100" align="center">
                  <template #default="{ row }">{{ formatSportProject(row.sportProject) }}</template>
                </el-table-column>
                <el-table-column prop="name" label="字段名称" min-width="120" />
                <el-table-column prop="type" label="字段类型" width="100" align="center" />
                <el-table-column prop="required" label="是否必填" width="90" align="center" />
                <el-table-column prop="unit" label="单位" width="80" align="center" />
                <el-table-column prop="description" label="说明" min-width="140" show-overflow-tooltip />
              </el-table>
            </div>
          </el-col>
        </template>

        <template v-else>
          <el-col :xs="24">
            <div class="config-block">
              <div class="config-toolbar">
                <div>
                  <div class="config-title">成绩字段配置</div>
                  <div class="config-desc">配置该设项提交成绩时需要填写的字段</div>
                </div>
                <el-button type="primary" size="small" :disabled="coreDisabled" @click="openFieldDialog()">
                  新增字段
                </el-button>
              </div>
              <el-table :data="form.scoreFields" border size="small" class="config-table" empty-text="暂无字段，请点击「新增字段」进行配置">
                <el-table-column label="所属项目" width="100" align="center">
                  <template #default="{ row }">{{ formatSportProject(row.sportProject) }}</template>
                </el-table-column>
                <el-table-column prop="name" label="字段名称" min-width="120" />
                <el-table-column prop="type" label="字段类型" width="100" align="center" />
                <el-table-column label="是否必填" width="90" align="center">
                  <template #default="{ row }">{{ row.required ? '是' : '否' }}</template>
                </el-table-column>
                <el-table-column prop="unit" label="单位" width="80" align="center" />
                <el-table-column prop="description" label="说明" min-width="120" show-overflow-tooltip />
                <el-table-column label="操作" width="120" align="center" fixed="right">
                  <template #default="{ row, $index }">
                    <el-link type="primary" underline="never" :disabled="coreDisabled" @click="openFieldDialog(row, $index)">
                      编辑
                    </el-link>
                    <el-divider direction="vertical" />
                    <el-link type="danger" underline="never" :disabled="coreDisabled" @click="removeField($index)">
                      删除
                    </el-link>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-col>
          <el-col :sm="12" :xs="24">
            <el-form-item label="保存为模板">
              <el-switch
                v-model="form.saveAsTemplate"
                :disabled="coreDisabled"
                active-text="是"
                inactive-text="否"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="form.saveAsTemplate" :sm="12" :xs="24">
            <el-form-item label="模板名称" prop="scoreFormTemplateName">
              <el-input
                v-model.trim="form.scoreFormTemplateName"
                :disabled="coreDisabled"
                placeholder="如：综合体能成绩提交表"
              />
            </el-form-item>
          </el-col>
        </template>
      </el-row>

      <el-divider class="section-divider" />

      <div class="form-subsection">
        <div class="subsection-head">
          <span class="subsection-title">排名规则</span>
        </div>
        <el-row :gutter="16">
          <el-col :sm="12" :xs="24">
            <el-form-item label="是否生成排名">
              <el-switch v-model="form.rankingEnabled" :disabled="coreDisabled" active-text="开启" inactive-text="关闭" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.rankingEnabled" :sm="12" :xs="24">
            <el-form-item label="排名依据" prop="rankBasis">
              <el-select v-model="form.rankBasis" :disabled="coreDisabled" placeholder="请选择排名依据" class="ele-fluid">
                <el-option v-for="opt in RANK_BASIS_OPTIONS" :key="opt" :label="opt" :value="opt" />
              </el-select>
            </el-form-item>
          </el-col>
          <template v-if="form.rankingEnabled">
            <el-col v-if="needSortType" :sm="12" :xs="24">
              <el-form-item label="排序方式" prop="sortType">
                <el-radio-group v-model="form.sortType" :disabled="coreDisabled">
                  <el-radio v-for="opt in SORT_OPTIONS" :key="opt" :value="opt">{{ opt }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="同分处理">
                <el-radio-group v-model="form.tieRule" :disabled="coreDisabled">
                  <el-radio v-for="opt in TIE_OPTIONS" :key="opt" :value="opt">{{ opt }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :xs="24">
              <el-form-item label="排名规则说明">
                <el-input v-model="form.rankDescription" :disabled="coreDisabled" type="textarea" :rows="3" />
              </el-form-item>
            </el-col>
            <el-col :xs="24">
              <attachment-table
                title="排名规则附件"
                :list="form.rankAttachments"
                :disabled="coreDisabled"
                compact
                @add="(file) => handleAttachmentAdd('rankAttachments', file)"
                @remove="(row) => handleAttachmentRemove('rankAttachments', row)"
              />
            </el-col>
          </template>
        </el-row>
      </div>

      <div class="form-subsection">
        <div class="subsection-head">
          <span class="subsection-title">计分规则</span>
        </div>
        <el-row :gutter="16">
          <el-col :sm="12" :xs="24">
            <el-form-item label="是否启用计分">
              <el-switch v-model="form.scoringEnabled" :disabled="coreDisabled" active-text="是" inactive-text="否" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.scoringEnabled" :sm="12" :xs="24">
            <el-form-item label="计分处理方式">
              <el-radio-group v-model="form.scoringMethod" :disabled="coreDisabled">
                <el-radio value="手动录入比赛分">手动录入比赛分</el-radio>
                <el-radio value="系统自动计算" disabled>系统自动计算（后续支持）</el-radio>
              </el-radio-group>
              <div v-if="form.scoringMethod === '手动录入比赛分'" class="form-tip">
                请确保成绩提交表单中包含“比赛分”字段（所属项目可为空）。
              </div>
            </el-form-item>
          </el-col>
          <template v-if="form.scoringEnabled">
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

  <el-dialog
    v-model="fieldDialogVisible"
    :title="fieldEditIndex === -1 ? '新增字段' : '编辑字段'"
    width="520px"
    append-to-body
    destroy-on-close
  >
    <el-form ref="fieldFormRef" :model="fieldForm" :rules="fieldRules" label-width="90px" @submit.prevent="">
      <el-form-item label="所属项目">
        <el-select
          v-model="fieldForm.sportProject"
          clearable
          placeholder="可选，不选表示不归属于具体项目"
          class="ele-fluid"
        >
          <el-option v-for="opt in sportProjectOptions" :key="opt" :label="opt" :value="opt" />
        </el-select>
      </el-form-item>
      <el-form-item label="字段名称" prop="name">
        <el-input v-model.trim="fieldForm.name" :maxlength="30" placeholder="请输入字段名称" />
      </el-form-item>
      <el-form-item label="字段类型" prop="type">
        <el-select v-model="fieldForm.type" placeholder="请选择字段类型" class="ele-fluid">
          <el-option v-for="opt in FIELD_TYPE_OPTIONS" :key="opt" :label="opt" :value="opt" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否必填">
        <el-switch v-model="fieldForm.required" active-text="是" inactive-text="否" />
      </el-form-item>
      <el-form-item label="单位">
        <el-input v-model.trim="fieldForm.unit" :maxlength="10" placeholder="如：次、秒、分" />
      </el-form-item>
      <el-form-item v-if="needOptions" label="选项配置" prop="options">
        <el-select
          v-model="fieldForm.options"
          multiple
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          placeholder="输入选项后回车"
          class="ele-fluid"
        />
      </el-form-item>
      <el-form-item label="说明">
        <el-input v-model="fieldForm.description" type="textarea" :rows="2" :maxlength="100" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="fieldDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="saveField">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
  import { computed, reactive, ref } from 'vue';
  import { ElMessageBox } from 'element-plus';
  import { EleMessage } from 'ele-admin-plus';
  import AttachmentTable from './attachment-table.vue';
  import {
    SOURCE_OPTIONS,
    SPORT_PROJECT_CATALOG,
    GENDER_OPTIONS,
    STAGE_OPTIONS,
    RANK_BASIS_OPTIONS,
    SORT_OPTIONS,
    TIE_OPTIONS,
    FIELD_TYPE_OPTIONS,
    REGION_OPTIONS,
    getGradesByStages,
    getScoreFormOptions,
    getScoreFormFields,
    saveScoreFormTemplate,
    clone,
    createDefaultItem,
    eventItemStore,
    formatNow,
    formatSportProject,
    hasScoreFieldNamed,
    normalizeSportProject
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
      Object.assign(form, clone(props.data));
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
      form.scoreFields = (form.scoreFields ?? []).map((f) => ({
        ...f,
        sportProject: normalizeSportProject(f.sportProject)
      }));
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
    scoreForm: [
      {
        validator: (_, value, callback) => {
          if (form.scoreFormType === 'existing' && !value) {
            callback(new Error('请选择成绩提交表单'));
          } else {
            callback();
          }
        },
        trigger: 'change'
      }
    ],
    scoreFormTemplateName: [
      {
        validator: (_, value, callback) => {
          if (form.scoreFormType === 'custom' && form.saveAsTemplate && !value?.trim()) {
            callback(new Error('请输入成绩表单模板名称'));
          } else {
            callback();
          }
        },
        trigger: 'blur'
      }
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
          if (form.matchForm === '团体' && (!value || value <= 0)) {
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
          if (form.matchForm === '团体' && value < form.teamMin) {
            callback(new Error('每队最多人数必须大于等于最少人数'));
          } else {
            callback();
          }
        },
        trigger: 'change'
      }
    ],
    rankBasis: [
      {
        validator: (_, value, callback) => {
          if (form.rankingEnabled && !value) {
            callback(new Error('请选择排名依据'));
          } else {
            callback();
          }
        },
        trigger: 'change'
      }
    ],
    sortType: [
      {
        validator: (_, value, callback) => {
          if (form.rankingEnabled && needSortType.value && !value) {
            callback(new Error('请选择排序方式'));
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

  const needSortType = computed(() => ['成绩值', '比赛分'].includes(form.rankBasis));
  const gradeOptions = computed(() => getGradesByStages(form.stages));
  const scoreFormOptions = computed(() => getScoreFormOptions());
  const formPreview = computed(() => {
    const fields = getScoreFormFields(form.scoreForm);
    return fields.map((d) => ({
      ...d,
      sportProject: formatSportProject(d.sportProject),
      required: typeof d.required === 'boolean' ? (d.required ? '是' : '否') : d.required
    }));
  });
  const sportProjectOptions = computed(() => (form.sports ?? []).map((s) => s.name));

  const confirmRemoveSportFields = (name) => {
    const related = form.scoreFields.filter((f) => normalizeSportProject(f.sportProject) === name);
    if (!related.length) {
      return Promise.resolve(true);
    }
    return ElMessageBox.confirm(
      '该项目下已配置成绩字段，移除后相关字段将被删除，是否继续？',
      '移除体育项目',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        form.scoreFields = form.scoreFields.filter(
          (f) => normalizeSportProject(f.sportProject) !== name
        );
        return true;
      })
      .catch(() => false);
  };

  const syncSports = async () => {
    const prevNames = (form.sports ?? []).map((s) => s.name);
    const nextNames = [...sportPicker.value];
    const removedNames = prevNames.filter((n) => !nextNames.includes(n));

    for (const name of removedNames) {
      const ok = await confirmRemoveSportFields(name);
      if (!ok) {
        sportPicker.value = [...prevNames];
        return;
      }
    }

    form.sports = nextNames.map((name) => {
      return SPORT_PROJECT_CATALOG.find((d) => d.name === name) ?? { name, projectType: '-', unit: '-' };
    });
    formRef.value?.validateField?.('sports');
  };

  const removeSport = async (name) => {
    const ok = await confirmRemoveSportFields(name);
    if (!ok) {
      return;
    }
    sportPicker.value = sportPicker.value.filter((d) => d !== name);
    form.sports = sportPicker.value.map((sportName) => {
      return (
        SPORT_PROJECT_CATALOG.find((d) => d.name === sportName) ?? {
          name: sportName,
          projectType: '-',
          unit: '-'
        }
      );
    });
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

  const fieldDialogVisible = ref(false);
  const fieldEditIndex = ref(-1);
  const fieldFormRef = ref(null);
  const fieldForm = reactive({
    sportProject: '',
    name: '',
    type: '数字',
    required: true,
    unit: '',
    description: '',
    options: []
  });

  const needOptions = computed(() => ['单选', '多选'].includes(fieldForm.type));
  const fieldRules = reactive({
    name: [{ required: true, message: '请输入字段名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择字段类型', trigger: 'change' }],
    options: [
      {
        validator: (_, value, callback) => {
          if (needOptions.value && (!value || !value.length)) {
            callback(new Error('请配置选项'));
          } else {
            callback();
          }
        },
        trigger: 'change'
      }
    ]
  });

  const openFieldDialog = (row, index = -1) => {
    fieldEditIndex.value = index;
    if (row) {
      Object.assign(fieldForm, clone(row));
      fieldForm.sportProject = normalizeSportProject(fieldForm.sportProject);
      fieldForm.options = fieldForm.options ?? [];
    } else {
      Object.assign(fieldForm, {
        sportProject: '',
        name: '',
        type: '数字',
        required: true,
        unit: '',
        description: '',
        options: []
      });
    }
    fieldDialogVisible.value = true;
  };

  const saveField = () => {
    fieldFormRef.value?.validate?.((valid) => {
      if (!valid) {
        return;
      }
      const payload = clone(fieldForm);
      payload.sportProject = normalizeSportProject(payload.sportProject);
      if (!needOptions.value) {
        payload.options = [];
      }
      if (fieldEditIndex.value === -1) {
        payload.fieldId = Date.now();
        form.scoreFields.push(payload);
      } else {
        payload.fieldId = form.scoreFields[fieldEditIndex.value]?.fieldId ?? Date.now();
        form.scoreFields[fieldEditIndex.value] = payload;
      }
      fieldDialogVisible.value = false;
    });
  };

  const removeField = (index) => {
    ElMessageBox.confirm('确定删除该成绩字段吗？', '删除字段', { type: 'warning', draggable: true })
      .then(() => form.scoreFields.splice(index, 1))
      .catch(() => {});
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
    const payload = clone(form);
    payload.dataSource = '表单提交';
    if (payload.matchForm === '个人') {
      payload.teamRule = '';
    }
    if (!payload.needMaterial) {
      payload.materialDescription = '';
    }
    if (payload.scoreFormType === 'custom') {
      payload.scoreForm = '';
      payload.scoreFields = (payload.scoreFields ?? []).map((f) => ({
        ...f,
        sportProject: normalizeSportProject(f.sportProject)
      }));
      if (payload.saveAsTemplate && payload.scoreFormTemplateName?.trim()) {
        saveScoreFormTemplate(payload.scoreFormTemplateName.trim(), payload.scoreFields);
      }
    } else {
      payload.scoreFields = [];
      payload.saveAsTemplate = false;
      payload.scoreFormTemplateName = '';
    }
    if (!payload.rankingEnabled) {
      payload.rankBasis = '';
      payload.sortType = '';
      payload.tieRule = '';
    }
    if (!payload.scoringEnabled) {
      payload.scoringMethod = '';
      payload.scoringDescription = '';
      payload.scoringAttachments = [];
    }
    if (payload.regionType === '全国') {
      payload.regions = [];
    }
    return payload;
  };

  const validateBusinessRules = () => {
    if (form.rankingEnabled && form.rankBasis === '比赛分' && !form.scoringEnabled) {
      EleMessage.error({ message: '排名依据为比赛分时，需要启用计分规则。', plain: true });
      return false;
    }
    if (form.scoringEnabled && form.scoringMethod === '手动录入比赛分') {
      const fields =
        form.scoreFormType === 'custom'
          ? form.scoreFields
          : getScoreFormFields(form.scoreForm);
      if (!hasScoreFieldNamed(fields, '比赛分')) {
        EleMessage.error({
          message: '当前计分方式为手动录入比赛分，请在成绩字段中添加“比赛分”字段。',
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
      if (form.scoreFormType === 'custom' && !form.scoreFields.length) {
        EleMessage.error({ message: '请至少配置一个成绩字段', plain: true });
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
  }

  .form-static-text {
    color: var(--el-text-color-primary);
    font-size: 14px;
    line-height: 32px;
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

  @media (max-width: 768px) {
    .config-block {
      margin-left: 0;
    }
  }
</style>
