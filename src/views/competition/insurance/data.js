/**
 * 保险管理 - 前端原型本地 Mock 数据
 */
import { reactive } from 'vue';
import { SCHOOL_OPTIONS } from '@/views/competition/activity/scope-utils.js';
import {
  formatMatchTypeLabel,
  formatMatchTypesList,
  isCampusLeafType,
  normalizeMatchTypeLeaf,
  normalizeMatchTypeLeaves,
  MATCH_TYPE_DAILY,
  MATCH_TYPE_CLASS,
  MATCH_TYPE_FINAL,
  MATCH_TYPE_REGION
} from '@/views/competition/match-type.js';

export {
  MATCH_TYPE_LEAF_OPTIONS,
  formatMatchTypesList
} from '@/views/competition/match-type.js';

export const INSURANCE_TYPE_SEMESTER = '学期保险';
export const INSURANCE_TYPE_MATCH = '单场比赛保险';
export const CHARGE_METHOD_SEMESTER = '按学期';
export const CHARGE_METHOD_MATCH = '按比赛';
export const INSURANCE_STATUS_OPTIONS = ['待参保', '部分参保', '已参保', '异常'];
export const INSURANCE_EXCEPTION_REASON_PAID = '已支付但状态未及时变更';
export const INSURANCE_EXCEPTION_TYPE_PAID = 'paid_status_delay';
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
      matchTypes: [MATCH_TYPE_DAILY, MATCH_TYPE_CLASS],
      chargeMethod: CHARGE_METHOD_SEMESTER,
      schoolYear: '2026-2027',
      semester: '第一学期',
      startDate: '2026-09-01',
      endDate: '2027-01-31',
      coverageTypes: [MATCH_TYPE_DAILY, MATCH_TYPE_CLASS],
      premium: 12,
      insuredAmount: 100000,
      description: '覆盖校园行赛段学期内校园赛相关赛事与日常积分活动。',
      attachmentName: '校园行学期保障条款.pdf',
      status: '启用',
      updateTime: '2026-06-26 10:12'
    },
    {
      planId: 'plan_match_1',
      planName: '区域赛单场保障方案',
      company: '太平洋保险',
      stages: ['校园行'],
      matchTypes: [MATCH_TYPE_REGION],
      chargeMethod: CHARGE_METHOD_MATCH,
      premium: 8,
      insuredAmount: 80000,
      description: '按比赛为区域赛参赛学生生成保险记录。',
      attachmentName: '区域赛保障条款.pdf',
      status: '启用',
      updateTime: '2026-06-25 16:40'
    },
    {
      planId: 'plan_match_2',
      planName: '全国总决赛综合保障方案',
      company: '人保财险',
      stages: ['全国总决赛'],
      matchTypes: [MATCH_TYPE_FINAL],
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
      studentNo: '20250001',
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
      studentNo: '20250002',
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
      studentNo: '20250003',
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
      exceptionType: INSURANCE_EXCEPTION_TYPE_PAID,
      exceptionReason: INSURANCE_EXCEPTION_REASON_PAID,
      handleStatus: '待处理',
      handleRemark: '',
      handleBy: '',
      handleTime: ''
    }
  ]
});

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function normalizeMatchTypeLabel(type = '') {
  return formatMatchTypeLabel(type);
}

export function getInsuranceTypeByMatchType(matchType = '') {
  const leaf = normalizeMatchTypeLeaf(matchType);
  if (isCampusLeafType(leaf)) {
    return INSURANCE_TYPE_SEMESTER;
  }
  if ([MATCH_TYPE_REGION, MATCH_TYPE_FINAL].includes(leaf)) {
    return INSURANCE_TYPE_MATCH;
  }
  return '';
}

export function planMatchesMatchType(plan, matchType = '') {
  if (!plan?.matchTypes?.length) {
    return false;
  }
  const leaf = normalizeMatchTypeLeaf(matchType);
  return normalizeMatchTypeLeaves(plan.matchTypes).includes(leaf);
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
  next.matchTypes = normalizeMatchTypeLeaves(next.matchTypes ?? []);
  if (next.chargeMethod === CHARGE_METHOD_MATCH) {
    delete next.schoolYear;
    delete next.semester;
    delete next.startDate;
    delete next.endDate;
  }
  delete next.coverageTypes;
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

export function canHandleInsuranceException(record) {
  return (
    record?.status === '异常' &&
    record?.exceptionType === INSURANCE_EXCEPTION_TYPE_PAID &&
    record?.exceptionReason === INSURANCE_EXCEPTION_REASON_PAID
  );
}

export function handleInsuranceException(recordId, payload = {}) {
  const record = insuranceStore.records.find((item) => item.recordId === recordId);
  if (!record || !canHandleInsuranceException(record)) {
    return null;
  }
  const { result, remark = '' } = payload;
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
  record.handleRemark = remark;
  record.handleBy = '体测管理员';
  record.handleTime = now;
  if (result === '已参保') {
    record.status = '已参保';
    record.handleStatus = '已处理';
    record.exceptionReason = '';
    record.exceptionType = '';
  } else {
    record.handleStatus = '暂不处理';
  }
  return record;
}
