/**
 * 保险管理 - 前端原型本地 Mock 数据
 */
import { reactive } from 'vue';
import { SCHOOL_OPTIONS } from '@/views/competition/activity/scope-utils.js';

export const INSURANCE_TYPE_SEMESTER = '学期保险';
export const INSURANCE_TYPE_MATCH = '单场比赛保险';
export const CHARGE_METHOD_SEMESTER = '按学期';
export const CHARGE_METHOD_MATCH = '按比赛';
export const INSURANCE_STATUS_OPTIONS = ['待参保', '部分参保', '已参保', '异常'];
export const INSURANCE_PLAN_STATUS_OPTIONS = ['启用', '停用'];
export const SEMESTER_OPTIONS = ['第一学期', '第二学期'];

export const GRADE_CLASS_CASCADER_OPTIONS = [
  {
    value: '五年级',
    label: '五年级',
    children: [
      { value: '3 班', label: '3 班' },
      { value: '1 班', label: '1 班' }
    ]
  },
  {
    value: '四年级',
    label: '四年级',
    children: [
      { value: '1 班', label: '1 班' },
      { value: '2 班', label: '2 班' }
    ]
  },
  {
    value: '六年级',
    label: '六年级',
    children: [{ value: '1 班', label: '1 班' }]
  }
];

export const insuranceStore = reactive({
  plans: [
    {
      planId: 'plan_semester_1',
      planName: '校园行学期基础保障方案',
      company: '平安保险',
      stages: ['校园行'],
      matchTypes: ['每日积分赛', '校内赛/班班赛'],
      chargeMethod: CHARGE_METHOD_SEMESTER,
      schoolYear: '2026-2027',
      semester: '第一学期',
      startDate: '2026-09-01',
      endDate: '2027-01-31',
      coverageTypes: ['每日积分赛', '校内赛/班班赛'],
      premium: 12,
      insuredAmount: 100000,
      description: '覆盖校园行赛段学期内赛事与日常积分活动。',
      attachmentName: '校园行学期保障条款.pdf',
      status: '启用',
      updateTime: '2026-06-26 10:12'
    },
    {
      planId: 'plan_match_1',
      planName: '区域晋级赛单场保障方案',
      company: '太平洋保险',
      stages: ['校园行'],
      matchTypes: ['区域晋级赛'],
      chargeMethod: CHARGE_METHOD_MATCH,
      premium: 8,
      insuredAmount: 80000,
      description: '按比赛为区域晋级赛参赛学生生成保险记录。',
      attachmentName: '区域赛保障条款.pdf',
      status: '启用',
      updateTime: '2026-06-25 16:40'
    },
    {
      planId: 'plan_match_2',
      planName: '全国总决赛综合保障方案',
      company: '人保财险',
      stages: ['全国总决赛'],
      matchTypes: ['全国总决赛'],
      chargeMethod: CHARGE_METHOD_MATCH,
      premium: 18,
      insuredAmount: 200000,
      description: '适用于全国总决赛阶段单场比赛。',
      attachmentName: '',
      status: '启用',
      updateTime: '2026-06-24 09:18'
    }
  ],
  records: [
    {
      recordId: 'ins_001',
      studentName: '王小明',
      gender: '男',
      idNo: '110101********1234',
      school: '第一实验小学',
      gradeClass: '五年级 3 班',
      insuranceType: INSURANCE_TYPE_SEMESTER,
      planId: 'plan_semester_1',
      insuranceMethod: '统一购买',
      relationScope: '2026-2027 第一学期',
      matchName: '',
      schoolYearSemester: '2026-2027 第一学期',
      premium: 12,
      status: '已参保',
      exceptionReason: '',
      handleStatus: '-'
    },
    {
      recordId: 'ins_002',
      studentName: '李思雨',
      gender: '女',
      idNo: '110101********2356',
      school: '第一实验小学',
      gradeClass: '五年级 3 班',
      insuranceType: INSURANCE_TYPE_MATCH,
      planId: 'plan_match_1',
      insuranceMethod: '统一购买',
      relationScope: '区级 3v3 篮球晋级赛',
      matchName: '区级 3v3 篮球晋级赛',
      schoolYearSemester: '',
      premium: 8,
      status: '待参保',
      exceptionReason: '',
      handleStatus: '-'
    },
    {
      recordId: 'ins_003',
      studentName: '赵一诺',
      gender: '女',
      idNo: '110101********7788',
      school: '第二实验小学',
      gradeClass: '四年级 1 班',
      insuranceType: INSURANCE_TYPE_MATCH,
      planId: 'plan_match_1',
      insuranceMethod: '自行购买',
      relationScope: '区级 3v3 篮球晋级赛',
      matchName: '区级 3v3 篮球晋级赛',
      schoolYearSemester: '',
      premium: 8,
      status: '异常',
      exceptionReason: '证件号与学生库不一致',
      handleStatus: '待处理'
    }
  ]
});

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function normalizeMatchTypeLabel(type = '') {
  if (type === '区域赛') {
    return '区域晋级赛';
  }
  if (type === '校内赛') {
    return '校内赛/班班赛';
  }
  return type;
}

export function getInsuranceTypeByMatchType(matchType = '') {
  const normalized = normalizeMatchTypeLabel(matchType);
  if (['每日积分赛', '校内赛/班班赛'].includes(normalized)) {
    return INSURANCE_TYPE_SEMESTER;
  }
  if (['区域晋级赛', '全国总决赛'].includes(normalized)) {
    return INSURANCE_TYPE_MATCH;
  }
  return '';
}

export function getChargeMethodByInsuranceType(insuranceType = '') {
  return insuranceType === INSURANCE_TYPE_SEMESTER ? CHARGE_METHOD_SEMESTER : CHARGE_METHOD_MATCH;
}

export function formatPlanSchoolYearSemester(plan) {
  if (!plan || plan.chargeMethod !== CHARGE_METHOD_SEMESTER) {
    return '-';
  }
  if (!plan.schoolYear || !plan.semester) {
    return '-';
  }
  return `${plan.schoolYear} ${plan.semester}`;
}

export function isSemesterPlanActive(plan, dateValue = '') {
  if (!plan || plan.chargeMethod !== CHARGE_METHOD_SEMESTER || plan.status !== '启用') {
    return false;
  }
  const date = dateValue.slice(0, 10);
  if (!date || !plan.startDate || !plan.endDate) {
    return false;
  }
  return plan.startDate <= date && plan.endDate >= date;
}

/** @deprecated 使用 findSemesterPlanByDate */
export function findSemesterBatchByDate(dateValue = '') {
  return findSemesterPlanByDate(dateValue);
}

export function findSemesterPlanByDate(dateValue = '') {
  const date = dateValue.slice(0, 10);
  if (!date) {
    return null;
  }
  return (
    insuranceStore.plans.find(
      (plan) => plan.chargeMethod === CHARGE_METHOD_SEMESTER && isSemesterPlanActive(plan, date)
    ) ?? null
  );
}

export function isPlanCoveringDate(plan, dateValue = '') {
  if (!plan) {
    return false;
  }
  if (plan.chargeMethod === CHARGE_METHOD_MATCH) {
    return plan.status === '启用';
  }
  return isSemesterPlanActive(plan, dateValue);
}

export function getInsurancePlans(where = {}) {
  return insuranceStore.plans.filter((plan) => {
    if (where.status && plan.status !== where.status) {
      return false;
    }
    if (where.chargeMethod && plan.chargeMethod !== where.chargeMethod) {
      return false;
    }
    if (where.keyword && !plan.planName.includes(where.keyword)) {
      return false;
    }
    return true;
  });
}

export function getInsurancePlanOptions(insuranceType = '', dateValue = '') {
  const chargeMethod = getChargeMethodByInsuranceType(insuranceType);
  return insuranceStore.plans.filter((plan) => {
    if (plan.status !== '启用' || plan.chargeMethod !== chargeMethod) {
      return false;
    }
    if (chargeMethod === CHARGE_METHOD_SEMESTER && dateValue) {
      return isSemesterPlanActive(plan, dateValue);
    }
    return true;
  });
}

export function findInsurancePlan(planId) {
  return insuranceStore.plans.find((plan) => plan.planId === planId) ?? null;
}

export function getInsurancePlanName(planId) {
  return findInsurancePlan(planId)?.planName || '-';
}

export function formatInsuranceSummary(setting = {}, matchType = '') {
  const insuranceType = setting.insuranceType || getInsuranceTypeByMatchType(matchType);
  const planName = getInsurancePlanName(setting.planId);
  if (!insuranceType) {
    return '未配置';
  }
  return setting.planId ? `${insuranceType}；${planName}` : `${insuranceType}；未选择保险方案`;
}

export function getSchoolFilterOptions() {
  const schools = new Set([
    ...SCHOOL_OPTIONS.map((item) => item.label),
    ...insuranceStore.records.map((item) => item.school)
  ]);
  return [...schools].filter(Boolean);
}

export function saveInsurancePlan(data) {
  const next = clone(data);
  if (next.chargeMethod === CHARGE_METHOD_MATCH) {
    delete next.schoolYear;
    delete next.semester;
    delete next.startDate;
    delete next.endDate;
    delete next.coverageTypes;
  }
  if (next.chargeMethod === CHARGE_METHOD_SEMESTER && !next.coverageTypes?.length) {
    next.coverageTypes = ['每日积分赛', '校内赛/班班赛'];
  }
  if (!next.planId) {
    next.planId = `plan_${Date.now()}`;
    next.updateTime = '刚刚';
    insuranceStore.plans.unshift(next);
    return next;
  }
  const index = insuranceStore.plans.findIndex((plan) => plan.planId === next.planId);
  if (index >= 0) {
    next.updateTime = '刚刚';
    insuranceStore.plans.splice(index, 1, next);
  }
  return next;
}
