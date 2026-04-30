/**
 * 体测数据采集 - 原型本地 Mock 数据
 *
 * 使用 reactive 让数据在页面切换之间保持内存状态，
 * 新增 / 修改 / 作废等操作会直接反映在列表上，实现可点击的原型效果。
 */
import { reactive } from 'vue';

/** 体测项目全集（code / name / unit / gender） */
export const FITNESS_ITEMS = [
  { code: 'height', name: '身高', unit: 'cm', gender: 'all' },
  { code: 'weight', name: '体重', unit: 'kg', gender: 'all' },
  { code: 'vitalCapacity', name: '肺活量', unit: 'ml', gender: 'all' },
  { code: 'sprint50', name: '50米跑', unit: '秒', gender: 'all' },
  { code: 'sitAndReach', name: '坐位体前屈', unit: 'cm', gender: 'all' },
  { code: 'ropeSkipping1Min', name: '1分钟跳绳', unit: '次', gender: 'all' },
  { code: 'sitUp1Min', name: '1分钟仰卧起坐', unit: '次', gender: 'all' },
  { code: 'shuttleRun50x8', name: '50米×8往返跑', unit: '秒', gender: 'all' },
  { code: 'longJump', name: '立定跳远', unit: 'cm', gender: 'all' },
  { code: 'pullUp', name: '引体向上', unit: '次', gender: 'male' },
  { code: 'run800', name: '800米跑', unit: '秒', gender: 'female' },
  { code: 'run1000', name: '1000米跑', unit: '秒', gender: 'male' }
];

/** 学段选项 */
export const STAGE_OPTIONS = [
  { value: 'primary', label: '小学' },
  { value: 'junior', label: '初中' },
  { value: 'senior', label: '高中' },
  { value: 'college', label: '大学' }
];

/** 年级选项（按学段分组） */
export const GRADE_OPTIONS = {
  primary: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
  junior: ['初一', '初二', '初三'],
  senior: ['高一', '高二', '高三'],
  college: ['大一', '大二', '大三', '大四']
};

/** 学年选项 */
export const SCHOOL_YEAR_OPTIONS = [
  '2025-2026',
  '2024-2025',
  '2023-2024'
];

/** 学期选项 */
export const TERM_OPTIONS = [
  { value: 'fall', label: '第一学期' },
  { value: 'spring', label: '第二学期' }
];

/** 学校选项 */
export const SCHOOL_OPTIONS = [
  '阳光实验小学',
  '育才中学',
  '第一高级中学',
  '建华大学'
];

/** 班级选项（示例） */
export const CLASS_OPTIONS = ['1班', '2班', '3班', '4班', '5班'];

/** 记录类型 */
export const RECORD_TYPE_OPTIONS = [
  { value: 'normal', label: '正常' },
  { value: 'makeup', label: '补测' }
];

/** 记录状态 */
export const RECORD_STATUS_OPTIONS = [
  { value: 'valid', label: '有效' },
  { value: 'invalid', label: '已作废' }
];

/** 根据项目 code 得到项目对象 */
export function getItem(code) {
  return FITNESS_ITEMS.find((d) => d.code === code);
}

/** 根据学段获取年级列表 */
export function getGrades(stage) {
  return GRADE_OPTIONS[stage] ?? [];
}

/** 构造项目配置（默认启用所有、必填、顺序按当前） */
function buildItemConfig(codes) {
  return codes.map((code, idx) => {
    const item = getItem(code);
    return {
      code,
      name: item?.name,
      unit: item?.unit,
      enabled: true,
      required: true,
      gender: item?.gender ?? 'all',
      sort: idx + 1
    };
  });
}

/** 预置方案数据 */
export const planStore = reactive({
  list: [
    {
      planId: 1,
      planName: '小学1-2年级体测方案',
      stage: 'primary',
      grades: ['一年级', '二年级'],
      schoolYear: '2025-2026',
      term: 'fall',
      isDefault: true,
      status: 1,
      remark: '适用于小学低年级基础体测',
      updateTime: '2025-09-10 10:32:15',
      createTime: '2025-08-20 09:00:00',
      items: buildItemConfig([
        'height',
        'weight',
        'vitalCapacity',
        'sprint50',
        'sitAndReach',
        'ropeSkipping1Min'
      ])
    },
    {
      planId: 2,
      planName: '小学3-4年级体测方案',
      stage: 'primary',
      grades: ['三年级', '四年级'],
      schoolYear: '2025-2026',
      term: 'fall',
      isDefault: false,
      status: 1,
      remark: '',
      updateTime: '2025-09-12 14:21:08',
      createTime: '2025-08-21 09:10:00',
      items: buildItemConfig([
        'height',
        'weight',
        'vitalCapacity',
        'sprint50',
        'sitAndReach',
        'ropeSkipping1Min',
        'sitUp1Min'
      ])
    },
    {
      planId: 3,
      planName: '小学5-6年级体测方案',
      stage: 'primary',
      grades: ['五年级', '六年级'],
      schoolYear: '2025-2026',
      term: 'fall',
      isDefault: false,
      status: 1,
      remark: '高年级增加往返跑',
      updateTime: '2025-09-15 11:02:30',
      createTime: '2025-08-22 09:20:00',
      items: buildItemConfig([
        'height',
        'weight',
        'vitalCapacity',
        'sprint50',
        'sitAndReach',
        'ropeSkipping1Min',
        'sitUp1Min',
        'shuttleRun50x8'
      ])
    },
    {
      planId: 4,
      planName: '初中体测方案',
      stage: 'junior',
      grades: ['初一', '初二', '初三'],
      schoolYear: '2025-2026',
      term: 'fall',
      isDefault: true,
      status: 1,
      remark: '含男生引体向上 / 女生仰卧起坐、男生1000米 / 女生800米',
      updateTime: '2025-09-18 16:45:50',
      createTime: '2025-08-23 09:30:00',
      items: buildItemConfig([
        'height',
        'weight',
        'vitalCapacity',
        'sprint50',
        'sitAndReach',
        'longJump',
        'pullUp',
        'sitUp1Min',
        'run1000',
        'run800'
      ])
    },
    {
      planId: 5,
      planName: '高中体测方案',
      stage: 'senior',
      grades: ['高一', '高二', '高三'],
      schoolYear: '2025-2026',
      term: 'fall',
      isDefault: true,
      status: 1,
      remark: '',
      updateTime: '2025-09-20 09:18:24',
      createTime: '2025-08-24 09:40:00',
      items: buildItemConfig([
        'height',
        'weight',
        'vitalCapacity',
        'sprint50',
        'sitAndReach',
        'longJump',
        'pullUp',
        'sitUp1Min',
        'run1000',
        'run800'
      ])
    },
    {
      planId: 6,
      planName: '大学体测方案',
      stage: 'college',
      grades: ['大一', '大二', '大三', '大四'],
      schoolYear: '2025-2026',
      term: 'fall',
      isDefault: true,
      status: 1,
      remark: '',
      updateTime: '2025-09-22 15:03:11',
      createTime: '2025-08-25 09:50:00',
      items: buildItemConfig([
        'height',
        'weight',
        'vitalCapacity',
        'sprint50',
        'sitAndReach',
        'longJump',
        'pullUp',
        'sitUp1Min',
        'run1000',
        'run800'
      ])
    },
    {
      planId: 7,
      planName: '2024-2025 小学1-2年级（历史）',
      stage: 'primary',
      grades: ['一年级', '二年级'],
      schoolYear: '2024-2025',
      term: 'spring',
      isDefault: false,
      status: 0,
      remark: '已停用，保留历史数据',
      updateTime: '2025-03-15 10:00:00',
      createTime: '2024-08-20 09:00:00',
      items: buildItemConfig([
        'height',
        'weight',
        'vitalCapacity',
        'sprint50',
        'sitAndReach',
        'ropeSkipping1Min'
      ])
    }
  ],
  nextId: 8
});

/** 生成示例体测成绩 */
function mockScores(plan, sex) {
  const scores = {};
  plan.items.forEach((it) => {
    if (!it.enabled) return;
    if (it.gender === 'male' && sex !== 'male') return;
    if (it.gender === 'female' && sex !== 'female') return;
    switch (it.code) {
      case 'height':
        scores[it.code] = (140 + Math.floor(Math.random() * 40)).toFixed(1);
        break;
      case 'weight':
        scores[it.code] = (35 + Math.floor(Math.random() * 30)).toFixed(1);
        break;
      case 'vitalCapacity':
        scores[it.code] = 1800 + Math.floor(Math.random() * 1800);
        break;
      case 'sprint50':
        scores[it.code] = (8 + Math.random() * 3).toFixed(1);
        break;
      case 'sitAndReach':
        scores[it.code] = (5 + Math.random() * 12).toFixed(1);
        break;
      case 'ropeSkipping1Min':
        scores[it.code] = 80 + Math.floor(Math.random() * 80);
        break;
      case 'sitUp1Min':
        scores[it.code] = 20 + Math.floor(Math.random() * 30);
        break;
      case 'shuttleRun50x8':
        scores[it.code] = (90 + Math.random() * 30).toFixed(1);
        break;
      case 'longJump':
        scores[it.code] = 140 + Math.floor(Math.random() * 60);
        break;
      case 'pullUp':
        scores[it.code] = Math.floor(Math.random() * 15);
        break;
      case 'run800':
        scores[it.code] = (210 + Math.random() * 60).toFixed(0);
        break;
      case 'run1000':
        scores[it.code] = (240 + Math.random() * 60).toFixed(0);
        break;
      default:
        scores[it.code] = '';
    }
  });
  return scores;
}

function calcBMI(h, w) {
  const hNum = parseFloat(h);
  const wNum = parseFloat(w);
  if (!hNum || !wNum) return '';
  return (wNum / Math.pow(hNum / 100, 2)).toFixed(1);
}

/** 构造示例记录 */
function buildRecord(id, opts) {
  const plan = planStore.list.find((p) => p.planId === opts.planId);
  const scores = mockScores(plan, opts.sex);
  return {
    recordId: id,
    studentName: opts.studentName,
    studentNo: opts.studentNo,
    sex: opts.sex,
    sexName: opts.sex === 'male' ? '男' : '女',
    age: opts.age,
    school: opts.school,
    stage: plan.stage,
    grade: opts.grade,
    className: opts.className,
    planId: plan.planId,
    planName: plan.planName,
    testDate: opts.testDate,
    schoolYear: plan.schoolYear,
    term: plan.term,
    recordType: opts.recordType ?? 'normal',
    status: opts.status ?? 'valid',
    remark: opts.remark ?? '',
    scores,
    bmi: calcBMI(scores.height, scores.weight),
    totalScore: '',
    grade_level: '',
    createBy: '体测管理员',
    createTime: opts.testDate + ' 09:00:00',
    updateBy: '体测管理员',
    updateTime: opts.testDate + ' 09:10:00',
    invalidReason: ''
  };
}

/** 体测记录数据 */
export const recordStore = reactive({
  list: [
    buildRecord(1, {
      studentName: '张子涵',
      studentNo: 1,
      sex: 'male',
      age: 7,
      school: '阳光实验小学',
      grade: '一年级',
      className: '1班',
      planId: 1,
      testDate: '2025-10-18'
    }),
    buildRecord(2, {
      studentName: '李思琪',
      studentNo: 2,
      sex: 'female',
      age: 7,
      school: '阳光实验小学',
      grade: '一年级',
      className: '1班',
      planId: 1,
      testDate: '2025-10-18'
    }),
    buildRecord(3, {
      studentName: '王梓睿',
      studentNo: 3,
      sex: 'male',
      age: 8,
      school: '阳光实验小学',
      grade: '二年级',
      className: '2班',
      planId: 1,
      testDate: '2025-10-19',
      recordType: 'makeup',
      remark: '缺席当日补测'
    }),
    buildRecord(4, {
      studentName: '陈雨欣',
      studentNo: 12,
      sex: 'female',
      age: 9,
      school: '阳光实验小学',
      grade: '三年级',
      className: '3班',
      planId: 2,
      testDate: '2025-10-20'
    }),
    buildRecord(5, {
      studentName: '刘浩然',
      studentNo: 15,
      sex: 'male',
      age: 10,
      school: '阳光实验小学',
      grade: '四年级',
      className: '2班',
      planId: 2,
      testDate: '2025-10-20',
      status: 'invalid',
      remark: '数据异常',
      invalidReason: '跳绳计数设备故障，数据不准确'
    }),
    buildRecord(6, {
      studentName: '赵欣悦',
      studentNo: 22,
      sex: 'female',
      age: 11,
      school: '阳光实验小学',
      grade: '五年级',
      className: '1班',
      planId: 3,
      testDate: '2025-10-21'
    }),
    buildRecord(7, {
      studentName: '黄俊杰',
      studentNo: 25,
      sex: 'male',
      age: 12,
      school: '阳光实验小学',
      grade: '六年级',
      className: '3班',
      planId: 3,
      testDate: '2025-10-21'
    }),
    buildRecord(8, {
      studentName: '孙晓彤',
      studentNo: 36,
      sex: 'female',
      age: 13,
      school: '育才中学',
      grade: '初一',
      className: '4班',
      planId: 4,
      testDate: '2025-10-22'
    }),
    buildRecord(9, {
      studentName: '周立文',
      studentNo: 42,
      sex: 'male',
      age: 14,
      school: '育才中学',
      grade: '初二',
      className: '2班',
      planId: 4,
      testDate: '2025-10-22',
      recordType: 'makeup'
    }),
    buildRecord(10, {
      studentName: '吴雅琴',
      studentNo: 48,
      sex: 'female',
      age: 16,
      school: '第一高级中学',
      grade: '高一',
      className: '5班',
      planId: 5,
      testDate: '2025-10-23'
    }),
    buildRecord(11, {
      studentName: '郑明哲',
      studentNo: 55,
      sex: 'male',
      age: 17,
      school: '第一高级中学',
      grade: '高二',
      className: '3班',
      planId: 5,
      testDate: '2025-10-23'
    }),
    buildRecord(12, {
      studentName: '何美琳',
      studentNo: 60,
      sex: 'female',
      age: 19,
      school: '建华大学',
      grade: '大一',
      className: '2班',
      planId: 6,
      testDate: '2025-10-24'
    }),
    buildRecord(13, {
      studentName: '徐志远',
      studentNo: 66,
      sex: 'male',
      age: 20,
      school: '建华大学',
      grade: '大二',
      className: '1班',
      planId: 6,
      testDate: '2025-10-24'
    }),
    buildRecord(14, {
      studentName: '马晓慧',
      studentNo: 72,
      sex: 'female',
      age: 10,
      school: '阳光实验小学',
      grade: '四年级',
      className: '4班',
      planId: 2,
      testDate: '2025-10-15'
    }),
    buildRecord(15, {
      studentName: '朱小龙',
      studentNo: 85,
      sex: 'male',
      age: 9,
      school: '阳光实验小学',
      grade: '三年级',
      className: '2班',
      planId: 2,
      testDate: '2025-10-15'
    }),
    buildRecord(16, {
      studentName: '林嘉怡',
      studentNo: 91,
      sex: 'female',
      age: 8,
      school: '阳光实验小学',
      grade: '二年级',
      className: '3班',
      planId: 1,
      testDate: '2025-10-14'
    }),
    buildRecord(17, {
      studentName: '罗天宇',
      studentNo: 99,
      sex: 'male',
      age: 15,
      school: '育才中学',
      grade: '初三',
      className: '1班',
      planId: 4,
      testDate: '2025-10-13'
    })
  ],
  nextId: 18
});

/** 计算已录入项目数 */
export function countEnteredItems(record) {
  if (!record?.scores) return 0;
  return Object.values(record.scores).filter((v) => v !== '' && v != null)
    .length;
}

/** 获取学段显示名 */
export function getStageLabel(value) {
  return STAGE_OPTIONS.find((d) => d.value === value)?.label ?? value;
}

/** 获取学期显示名 */
export function getTermLabel(value) {
  return TERM_OPTIONS.find((d) => d.value === value)?.label ?? value;
}

/** 获取记录类型显示名 */
export function getRecordTypeLabel(value) {
  return RECORD_TYPE_OPTIONS.find((d) => d.value === value)?.label ?? value;
}
