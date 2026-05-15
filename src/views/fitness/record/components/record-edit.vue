<!-- 体测记录 - 新增 / 编辑弹窗（按登录角色展示不同字段） -->
<template>
  <ele-modal
    form
    :width="940"
    :title="isUpdate ? '编辑体测记录' : '添加体测记录'"
    :loading="loading"
    v-bind="modalProps"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="110px"
      @submit.prevent=""
    >
      <!-- 角色切换（仅原型演示用） -->
      <el-alert
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 16px"
      >
        <template #title>
          <span>演示角色：</span>
          <el-radio-group v-model="role" size="small" style="margin-left: 8px" @change="handleRoleChange">
            <el-radio-button v-for="r in ROLE_OPTIONS" :key="r.value" :value="r.value">
              {{ r.label }}
            </el-radio-button>
          </el-radio-group>
        </template>
      </el-alert>

      <el-divider content-position="left" class="section-divider">基础信息</el-divider>

      <el-row :gutter="16">
        <!-- 平台/区域管理员：所在单位（可选） -->
        <el-col v-if="role === 'admin'" :sm="12" :xs="24">
          <el-form-item label="所在单位">
            <el-select
              v-model="form.unit"
              placeholder="请选择所在单位"
              clearable
              class="ele-fluid"
              @change="handleUnitChange"
            >
              <el-option
                v-for="opt in UNIT_OPTIONS"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 学校管理员/平台管理员：学校 -->
        <el-col v-if="role !== 'teacher'" :sm="12" :xs="24">
          <el-form-item label="学校" prop="school">
            <el-select
              v-model="form.school"
              placeholder="请选择学校"
              class="ele-fluid"
              @change="handleSchoolChange"
            >
              <el-option
                v-for="opt in filteredSchoolOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 学段（只读，自动带出） -->
        <el-col :sm="12" :xs="24">
          <el-form-item label="学段">
            <el-input
              :model-value="stageLabel || ''"
              placeholder="根据年级自动带出"
              readonly
            />
          </el-form-item>
        </el-col>

        <!-- 学校管理员/平台管理员：年级 -->
        <el-col v-if="role !== 'teacher'" :sm="12" :xs="24">
          <el-form-item label="年级" prop="grade">
            <el-select
              v-model="form.grade"
              placeholder="请选择年级"
              class="ele-fluid"
              @change="handleGradeChange"
            >
              <el-option v-for="g in ALL_GRADES" :key="g" :label="g" :value="g" />
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 班级 -->
        <el-col :sm="12" :xs="24">
          <el-form-item label="班级" prop="className">
            <el-select
              v-model="form.className"
              placeholder="请选择班级"
              class="ele-fluid"
            >
              <el-option v-for="c in CLASS_OPTIONS" :key="c" :label="c" :value="c" />
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 学号 -->
        <el-col :sm="12" :xs="24">
          <el-form-item label="学号" prop="studentNo">
            <el-input-number
              v-model="form.studentNo"
              :min="1"
              :max="99"
              :controls="false"
              placeholder="请输入学号（1-99）"
              class="ele-fluid"
            />
          </el-form-item>
        </el-col>

        <!-- 学生姓名 -->
        <el-col :sm="12" :xs="24">
          <el-form-item label="学生姓名" prop="studentName">
            <el-input
              v-model.trim="form.studentName"
              placeholder="请输入学生姓名"
              :maxlength="20"
            />
          </el-form-item>
        </el-col>

        <!-- 性别（普通教师只读；其他角色可选） -->
        <el-col :sm="12" :xs="24">
          <el-form-item label="性别" prop="sex">
            <el-radio-group v-model="form.sex" :disabled="role === 'teacher'">
              <el-radio value="male">男</el-radio>
              <el-radio value="female">女</el-radio>
            </el-radio-group>
            <span
              v-if="role === 'teacher'"
              class="auto-tag"
            >自动带出</span>
          </el-form-item>
        </el-col>

        <!-- 体测方案（只读，自动匹配） -->
        <el-col :sm="12" :xs="24">
          <el-form-item label="体测方案" prop="planId">
            <el-select
              v-model="form.planId"
              placeholder="根据班级/年级/地区自动匹配"
              class="ele-fluid"
              :disabled="autoMatchPlan"
              @change="handlePlanChange"
            >
              <el-option
                v-for="p in availablePlans"
                :key="p.planId"
                :label="p.planName"
                :value="p.planId"
              />
            </el-select>
            <span v-if="autoMatchPlan && form.planId" class="auto-tag">自动匹配</span>
            <div v-if="noPlansAvailable" class="no-plan-tip">
              暂无可用体测方案，请先配置方案
            </div>
          </el-form-item>
        </el-col>

        <!-- 测试日期 -->
        <el-col :sm="12" :xs="24">
          <el-form-item label="测试日期" prop="testDate">
            <el-date-picker
              v-model="form.testDate"
              value-format="YYYY-MM-DD"
              placeholder="请选择测试日期"
              class="ele-fluid"
            />
          </el-form-item>
        </el-col>

        <!-- 记录类型 -->
        <el-col :sm="12" :xs="24">
          <el-form-item label="记录类型" prop="recordType">
            <el-radio-group v-model="form.recordType">
              <el-radio value="normal">正常</el-radio>
              <el-radio value="makeup">补测</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <!-- 备注 -->
        <el-col :xs="24">
          <el-form-item label="备注">
            <el-input
              type="textarea"
              :rows="2"
              :maxlength="200"
              v-model="form.remark"
              placeholder="请输入备注（选填）"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 体测项目成绩 -->
      <el-divider content-position="left" class="section-divider">
        体测项目
        <span v-if="applicableItems.length" class="section-extra">
          共 {{ applicableItems.length }} 项
        </span>
      </el-divider>

      <el-empty
        v-if="!form.planId"
        description="请先选择/确认体测方案以加载测试项目"
        :image-size="88"
        style="padding: 24px 0"
      />
      <template v-else>
        <el-row :gutter="16">
          <el-col
            v-for="item in applicableItems"
            :key="item.code"
            :sm="12"
            :xs="24"
          >
            <el-form-item
              :label="item.name"
              :class="['item-field', { 'is-required': item.required }]"
            >
              <el-input
                v-model="form.scores[item.code]"
                :placeholder="`请输入 ${item.name}`"
              >
                <template #append>{{ item.unit }}</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left" class="section-divider">自动计算</el-divider>
        <el-row :gutter="16">
          <el-col :sm="8" :xs="24">
            <el-form-item label="BMI">
              <el-input :model-value="autoBMI" placeholder="自动计算" readonly>
                <template #append>kg/m²</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :sm="8" :xs="24">
            <el-form-item label="总分">
              <el-input value="" readonly placeholder="（预留）" />
            </el-form-item>
          </el-col>
          <el-col :sm="8" :xs="24">
            <el-form-item label="等级">
              <el-input value="" readonly placeholder="（预留）" />
            </el-form-item>
          </el-col>
        </el-row>
      </template>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="save">提交</el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { ref, reactive, computed, watch } from 'vue';
  import { EleMessage, useModal } from 'ele-admin-plus';
  import {
    ROLE_OPTIONS,
    UNIT_OPTIONS,
    SCHOOL_OPTIONS,
    CLASS_OPTIONS,
    GRADE_OPTIONS,
    planStore,
    recordStore,
    getSchoolInfo,
    getStageLabel,
    matchPlans,
    currentRole
  } from '@/views/fitness/data.js';

  const props = defineProps({ data: Object });
  const emit = defineEmits(['done']);

  const { modalProps, closeModal } = useModal();

  const isUpdate = ref(!!props.data);
  const loading = ref(false);
  const formRef = ref(null);

  /** 当前模拟角色（演示切换） */
  const role = ref(currentRole.value);

  /** 所有年级平铺 */
  const ALL_GRADES = Object.values(GRADE_OPTIONS).flat();

  /**
   * 根据年级推断学段
   * 也可以在 GRADE_OPTIONS 中反向查找
   */
  function inferStageFromGrade(grade) {
    for (const [stage, grades] of Object.entries(GRADE_OPTIONS)) {
      if (grades.includes(grade)) return stage;
    }
    return '';
  }

  const form = reactive({
    recordId: void 0,
    unit: '',
    school: '',
    schoolRegion: '',
    schoolRegionLabel: '',
    stage: '',
    grade: '',
    className: '',
    planId: '',
    testDate: '',
    recordType: 'normal',
    studentName: '',
    studentNo: void 0,
    sex: 'male',
    remark: '',
    scores: {}
  });

  /** 已填学段 label */
  const stageLabel = computed(() => getStageLabel(form.stage) || '');

  /** 学校列表：admin 时可按 unit 过滤 */
  const filteredSchoolOptions = computed(() => {
    if (role.value === 'admin' && form.unit) {
      return SCHOOL_OPTIONS.filter((s) => s.unit === form.unit);
    }
    return SCHOOL_OPTIONS;
  });

  /** 普通教师：体测方案自动匹配，不允许手动改 */
  const autoMatchPlan = computed(() => role.value === 'teacher');

  /** 按地区、学段、年级匹配方案 */
  const availablePlans = computed(() => {
    const { prioritized } = matchPlans({
      region: form.schoolRegion || undefined,
      stage: form.stage || undefined,
      grade: form.grade || undefined
    });
    return prioritized;
  });

  const noPlansAvailable = computed(
    () => availablePlans.value.length === 0 && !!form.stage
  );

  /** 自动选中最优方案（teacher 强制，其他角色默认选第一个） */
  watch(availablePlans, (plans) => {
    if (!plans.length) return;
    if (!form.planId || !plans.find((p) => p.planId === form.planId)) {
      form.planId = plans[0].planId;
      syncPlanScores();
    }
  }, { immediate: false });

  /** 当前方案适用该性别的项目 */
  const applicableItems = computed(() => {
    const plan = planStore.list.find((p) => p.planId === form.planId);
    if (!plan) return [];
    return (plan.items || [])
      .filter((d) => d.enabled)
      .filter((d) => {
        if (d.gender === 'all') return true;
        return d.gender === form.sex;
      })
      .slice()
      .sort((a, b) => a.sort - b.sort);
  });

  const autoBMI = computed(() => {
    const h = parseFloat(form.scores.height);
    const w = parseFloat(form.scores.weight);
    if (!h || !w) return '';
    return (w / Math.pow(h / 100, 2)).toFixed(1);
  });

  function syncPlanScores() {
    const plan = planStore.list.find((p) => p.planId === form.planId);
    if (!plan) return;
    const next = {};
    plan.items.forEach((it) => {
      if (it.enabled) next[it.code] = form.scores[it.code] ?? '';
    });
    form.scores = next;
  }

  const handleUnitChange = () => {
    form.school = '';
    form.schoolRegion = '';
    form.schoolRegionLabel = '';
    form.planId = '';
    form.scores = {};
  };

  const handleSchoolChange = (schoolName) => {
    const info = getSchoolInfo(schoolName);
    form.schoolRegion = info?.region ?? '';
    form.schoolRegionLabel = info?.regionLabel ?? '';
    form.planId = '';
    form.scores = {};
  };

  const handleGradeChange = (grade) => {
    form.stage = inferStageFromGrade(grade);
    form.planId = '';
    form.scores = {};
  };

  const handlePlanChange = () => {
    syncPlanScores();
  };

  const handleRoleChange = () => {
    // 切换角色时重置与权限相关的字段
    form.unit = '';
    form.school = '';
    form.schoolRegion = '';
    form.schoolRegionLabel = '';
    form.stage = '';
    form.grade = '';
    form.planId = '';
    form.scores = {};
  };

  const rules = reactive({
    school: [
      {
        required: true,
        validator: (_, __, cb) => {
          if (role.value !== 'teacher' && !form.school) {
            cb(new Error('请选择学校'));
          } else cb();
        },
        trigger: 'change'
      }
    ],
    grade: [
      {
        required: true,
        validator: (_, __, cb) => {
          if (role.value !== 'teacher' && !form.grade) {
            cb(new Error('请选择年级'));
          } else cb();
        },
        trigger: 'change'
      }
    ],
    className: [{ required: true, message: '请选择班级', trigger: 'change' }],
    planId: [{ required: true, message: '请选择体测方案', trigger: 'change' }],
    testDate: [{ required: true, message: '请选择测试日期', trigger: 'change' }],
    recordType: [{ required: true, message: '请选择记录类型', trigger: 'change' }],
    studentName: [{ required: true, message: '请输入学生姓名', trigger: 'blur' }],
    studentNo: [
      {
        required: true,
        type: 'number',
        message: '请输入学号（1-99）',
        trigger: 'blur'
      }
    ]
  });

  /** 编辑时赋值 */
  if (props.data) {
    const src = JSON.parse(JSON.stringify(props.data));
    const schoolInfo = getSchoolInfo(src.school);
    Object.assign(form, {
      recordId: src.recordId,
      school: src.school,
      schoolRegion: schoolInfo?.region ?? '',
      schoolRegionLabel: schoolInfo?.regionLabel ?? '',
      stage: src.stage,
      grade: src.grade,
      className: src.className,
      planId: src.planId,
      testDate: src.testDate,
      recordType: src.recordType,
      studentName: src.studentName,
      studentNo: src.studentNo,
      sex: src.sex,
      remark: src.remark,
      scores: { ...src.scores }
    });
  }

  const handleCancel = () => closeModal();

  const save = () => {
    formRef.value?.validate?.((valid) => {
      if (!valid) return;
      loading.value = true;
      setTimeout(() => {
        const now = formatNow();
        const plan = planStore.list.find((p) => p.planId === form.planId);
        const payload = {
          ...form,
          sexName: form.sex === 'male' ? '男' : '女',
          planName: plan?.planName,
          schoolYear: plan?.schoolYear,
          term: plan?.term,
          status: 'valid',
          bmi: autoBMI.value,
          totalScore: '',
          grade_level: '',
          updateBy: '体测管理员',
          updateTime: now
        };
        if (isUpdate.value) {
          const target = recordStore.list.find((d) => d.recordId === payload.recordId);
          if (target) Object.assign(target, payload);
          EleMessage.success({ message: '修改成功', plain: true });
        } else {
          recordStore.list.unshift({
            ...payload,
            recordId: recordStore.nextId++,
            createBy: '体测管理员',
            createTime: now
          });
          EleMessage.success({ message: '添加成功', plain: true });
        }
        loading.value = false;
        emit('done');
        closeModal();
      }, 300);
    });
  };

  function formatNow() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
</script>

<style lang="scss" scoped>
  .section-divider {
    margin-top: 4px;
    margin-bottom: 20px;
    :deep(.el-divider__text) {
      font-weight: 600;
      background: var(--el-bg-color);
    }
  }
  .section-extra {
    color: var(--el-text-color-secondary);
    font-size: 13px;
    margin-left: 8px;
    font-weight: normal;
  }
  .no-plan-tip {
    font-size: 12px;
    color: var(--el-color-warning);
    margin-top: 4px;
    line-height: 1.4;
  }
  .auto-tag {
    font-size: 12px;
    color: var(--el-color-info);
    margin-left: 8px;
    background: var(--el-fill-color-light);
    padding: 1px 6px;
    border-radius: 4px;
  }
  .item-field.is-required :deep(.el-form-item__label)::before {
    content: '*';
    color: var(--el-color-danger);
    margin-right: 4px;
    font-family: SimSun, sans-serif;
  }
  .item-field :deep(.el-form-item__label) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
