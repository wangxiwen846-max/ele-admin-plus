<!-- 体测记录 - 新增 / 编辑弹窗 -->
<template>
  <ele-modal
    form
    :width="920"
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
      <el-divider content-position="left" class="section-divider">
        基础信息
      </el-divider>
      <el-row :gutter="16">
        <el-col :sm="12" :xs="24">
          <el-form-item label="学校" prop="school">
            <el-select
              v-model="form.school"
              placeholder="请选择学校"
              class="ele-fluid"
            >
              <el-option
                v-for="opt in SCHOOL_OPTIONS"
                :key="opt"
                :label="opt"
                :value="opt"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="学段" prop="stage">
            <el-select
              v-model="form.stage"
              placeholder="请选择学段"
              class="ele-fluid"
              @change="handleStageChange"
            >
              <el-option
                v-for="opt in STAGE_OPTIONS"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="年级" prop="grade">
            <el-select
              v-model="form.grade"
              placeholder="请选择年级"
              class="ele-fluid"
              :disabled="!form.stage"
            >
              <el-option
                v-for="g in gradeOptions"
                :key="g"
                :label="g"
                :value="g"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="班级" prop="className">
            <el-select
              v-model="form.className"
              placeholder="请选择班级"
              class="ele-fluid"
            >
              <el-option
                v-for="c in CLASS_OPTIONS"
                :key="c"
                :label="c"
                :value="c"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="体测方案" prop="planId">
            <el-select
              v-model="form.planId"
              placeholder="请选择体测方案"
              class="ele-fluid"
              @change="handlePlanChange"
            >
              <el-option
                v-for="p in availablePlans"
                :key="p.planId"
                :label="p.planName"
                :value="p.planId"
              />
            </el-select>
          </el-form-item>
        </el-col>
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
        <el-col :sm="12" :xs="24">
          <el-form-item label="记录类型" prop="recordType">
            <el-radio-group v-model="form.recordType">
              <el-radio value="normal">正常</el-radio>
              <el-radio value="makeup">补测</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="学生姓名" prop="studentName">
            <el-input
              v-model.trim="form.studentName"
              placeholder="请输入学生姓名"
              :maxlength="20"
            />
          </el-form-item>
        </el-col>
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
        <el-col :sm="12" :xs="24">
          <el-form-item label="性别" prop="sex">
            <el-radio-group v-model="form.sex">
              <el-radio value="male">男</el-radio>
              <el-radio value="female">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
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

      <el-divider content-position="left" class="section-divider">
        体测项目
        <span v-if="applicableItems.length" class="section-extra">
          共 {{ applicableItems.length }} 项
        </span>
      </el-divider>

      <el-empty
        v-if="!form.planId"
        description="请先选择体测方案以加载测试项目"
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

        <el-divider content-position="left" class="section-divider">
          自动计算
        </el-divider>
        <el-row :gutter="16">
          <el-col :sm="8" :xs="24">
            <el-form-item label="BMI">
              <el-input
                :model-value="autoBMI"
                placeholder="自动计算"
                readonly
              >
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
      <el-button type="primary" :loading="loading" @click="save">
        提交
      </el-button>
    </template>
  </ele-modal>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue';
  import { EleMessage, useModal } from 'ele-admin-plus';
  import {
    STAGE_OPTIONS,
    SCHOOL_OPTIONS,
    CLASS_OPTIONS,
    GRADE_OPTIONS,
    planStore,
    recordStore
  } from '@/views/fitness/data.js';

  const props = defineProps({ data: Object });
  const emit = defineEmits(['done']);

  const { modalProps, closeModal } = useModal();

  const isUpdate = ref(!!props.data);
  const loading = ref(false);
  const formRef = ref(null);

  const form = reactive({
    recordId: void 0,
    school: '',
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

  const rules = reactive({
    school: [{ required: true, message: '请选择学校', trigger: 'change' }],
    stage: [{ required: true, message: '请选择学段', trigger: 'change' }],
    grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
    className: [
      { required: true, message: '请选择班级', trigger: 'change' }
    ],
    planId: [
      { required: true, message: '请选择体测方案', trigger: 'change' }
    ],
    testDate: [
      { required: true, message: '请选择测试日期', trigger: 'change' }
    ],
    recordType: [
      { required: true, message: '请选择记录类型', trigger: 'change' }
    ],
    studentName: [
      { required: true, message: '请输入学生姓名', trigger: 'blur' }
    ],
    studentNo: [
      {
        required: true,
        type: 'number',
        message: '请输入学号（1-99）',
        trigger: 'blur'
      }
    ],
    sex: [{ required: true, message: '请选择性别', trigger: 'change' }]
  });

  const gradeOptions = computed(() => GRADE_OPTIONS[form.stage] ?? []);

  /** 按学段过滤方案 */
  const availablePlans = computed(() => {
    if (!form.stage) return planStore.list.filter((d) => d.status === 1);
    return planStore.list.filter(
      (d) => d.status === 1 && d.stage === form.stage
    );
  });

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

  const handleStageChange = () => {
    form.grade = '';
    form.planId = '';
  };

  const handlePlanChange = (planId) => {
    const plan = planStore.list.find((p) => p.planId === planId);
    if (!plan) return;
    if (!form.stage) form.stage = plan.stage;
    // 初始化 scores
    const nextScores = {};
    plan.items.forEach((it) => {
      if (it.enabled) nextScores[it.code] = form.scores[it.code] ?? '';
    });
    form.scores = nextScores;
  };

  /** 修改赋值 */
  if (props.data) {
    const src = JSON.parse(JSON.stringify(props.data));
    Object.assign(form, {
      recordId: src.recordId,
      school: src.school,
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
          const target = recordStore.list.find(
            (d) => d.recordId === payload.recordId
          );
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
  /* 项目 label 必填：用红色星号代替“必填”标签，避免宽度溢出折行 */
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
