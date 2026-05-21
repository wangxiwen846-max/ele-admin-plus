/**
 * 运动数据 - 原型本地 Mock 数据
 */
import { reactive } from 'vue';

/** 学校选项 */
export const SCHOOL_OPTIONS = [
  { value: 'XX小学', label: 'XX小学' },
  { value: '阳光实验小学', label: '阳光实验小学' },
  { value: '育才中学', label: '育才中学' }
];

/** 年级选项 */
export const GRADE_OPTIONS = [
  '一年级', '二年级', '三年级', '四年级', '五年级', '六年级'
];

/** 班级选项 */
export const CLASS_OPTIONS = ['1班', '2班', '3班', '4班'];

/** 运动项目 */
export const SPORT_OPTIONS = [
  { value: 'rope', label: '跳绳' },
  { value: 'run', label: '跑步' }
];

/** 记录类型 */
export const RECORD_TYPE_OPTIONS = [
  { value: 'self', label: '自主训练' },
  { value: 'homework', label: '作业' }
];

/** 采集方式 */
export const COLLECT_TYPE_OPTIONS = [
  { value: 'bluetooth', label: '蓝牙跳绳' },
  { value: 'phone', label: '手机记录' },
  { value: 'ai', label: 'AI识别' },
  { value: 'form', label: '表单提交' }
];

/** 达标状态 */
export const PASS_STATUS_OPTIONS = [
  { value: 'pass', label: '已达标' },
  { value: 'fail', label: '未达标' },
  { value: 'none', label: '无需判断' }
];

/** 数据状态 */
export const DATA_STATUS_OPTIONS = [
  { value: 'normal', label: '正常' },
  { value: 'abnormal', label: '异常' }
];

/** 设备类型 */
export const DEVICE_TYPE_OPTIONS = [
  { value: 'rope', label: '智能跳绳' }
];

/** 绑定状态 */
export const BIND_STATUS_OPTIONS = [
  { value: 'bound', label: '已绑定' },
  { value: 'unbound', label: '已解绑' }
];

// ─── 工具函数 ────────────────────────────────────────────
export const getLabel = (opts, value) =>
  opts.find((d) => d.value === value)?.label ?? value;

// ─── 运动记录数据 ────────────────────────────────────────
export const recordStore = reactive({
  list: [
    {
      recordId: 1,
      studentName: '张三',
      studentNo: 'S0001',
      school: 'XX小学',
      grade: '三年级',
      className: '1班',
      sport: 'rope',
      recordType: 'homework',
      collectType: 'bluetooth',
      result: '286次',
      duration: '04:20',
      passStatus: 'fail',
      homeworkName: '跳绳训练作业',
      homeworkTarget: '300次',
      finishTime: '今天 18:30',
      dataStatus: 'normal',
      deviceName: '智能跳绳 A001',
      deviceNo: 'BT-ROPE-001',
      avgPace: '',
      steps: '',
      hasTrack: false
    },
    {
      recordId: 2,
      studentName: '李四',
      studentNo: 'S0002',
      school: 'XX小学',
      grade: '三年级',
      className: '1班',
      sport: 'run',
      recordType: 'homework',
      collectType: 'phone',
      result: '1.20km',
      duration: '08:20',
      passStatus: 'pass',
      homeworkName: '跑步训练作业',
      homeworkTarget: '1公里',
      finishTime: '今天 08:30',
      dataStatus: 'normal',
      avgPace: "6'55\"/km",
      steps: '1680步',
      hasTrack: true
    },
    {
      recordId: 3,
      studentName: '王五',
      studentNo: 'S0003',
      school: 'XX小学',
      grade: '三年级',
      className: '2班',
      sport: 'rope',
      recordType: 'self',
      collectType: 'bluetooth',
      result: '320次',
      duration: '05:10',
      passStatus: 'none',
      homeworkName: '',
      homeworkTarget: '',
      finishTime: '今天 19:10',
      dataStatus: 'normal',
      deviceName: '智能跳绳 A001',
      deviceNo: 'BT-ROPE-001'
    },
    {
      recordId: 4,
      studentName: '赵六',
      studentNo: 'S0004',
      school: 'XX小学',
      grade: '四年级',
      className: '1班',
      sport: 'rope',
      recordType: 'self',
      collectType: 'ai',
      result: '210次',
      duration: '03:30',
      passStatus: 'none',
      homeworkName: '',
      homeworkTarget: '',
      finishTime: '昨天 17:45',
      dataStatus: 'normal'
    },
    {
      recordId: 5,
      studentName: '孙七',
      studentNo: 'S0005',
      school: '阳光实验小学',
      grade: '五年级',
      className: '3班',
      sport: 'run',
      recordType: 'homework',
      collectType: 'form',
      result: '0.80km',
      duration: '07:40',
      passStatus: 'fail',
      homeworkName: '跑步训练作业',
      homeworkTarget: '1公里',
      finishTime: '昨天 16:20',
      dataStatus: 'abnormal',
      avgPace: "9'35\"/km",
      steps: '1120步',
      hasTrack: false
    },
    {
      recordId: 6,
      studentName: '周八',
      studentNo: 'S0006',
      school: '阳光实验小学',
      grade: '六年级',
      className: '2班',
      sport: 'rope',
      recordType: 'homework',
      collectType: 'form',
      result: '180次',
      duration: '03:00',
      passStatus: 'fail',
      homeworkName: '跳绳训练作业',
      homeworkTarget: '200次',
      finishTime: '前天 19:00',
      dataStatus: 'normal'
    },
    {
      recordId: 7,
      studentName: '吴九',
      studentNo: 'S0007',
      school: '育才中学',
      grade: '初一',
      className: '4班',
      sport: 'run',
      recordType: 'self',
      collectType: 'phone',
      result: '2.50km',
      duration: '14:30',
      passStatus: 'none',
      homeworkName: '',
      homeworkTarget: '',
      finishTime: '前天 17:30',
      dataStatus: 'normal',
      avgPace: "5'48\"/km",
      steps: '3260步',
      hasTrack: true
    },
    {
      recordId: 8,
      studentName: '郑十',
      studentNo: 'S0008',
      school: 'XX小学',
      grade: '三年级',
      className: '2班',
      sport: 'rope',
      recordType: 'homework',
      collectType: 'bluetooth',
      result: '305次',
      duration: '04:50',
      passStatus: 'pass',
      homeworkName: '跳绳训练作业',
      homeworkTarget: '300次',
      finishTime: '今天 18:50',
      dataStatus: 'normal',
      deviceName: '智能跳绳 B012',
      deviceNo: 'BT-ROPE-012'
    }
  ]
});

// ─── 设备绑定数据 ────────────────────────────────────────
export const deviceStore = reactive({
  list: [
    {
      deviceId: 1,
      deviceName: '智能跳绳 A001',
      deviceType: 'rope',
      deviceNo: 'BT-ROPE-001',
      studentName: '张三',
      studentNo: 'S0001',
      school: 'XX小学',
      grade: '三年级',
      className: '1班',
      bindStatus: 'bound',
      bindTime: '2025-09-12 09:20:00',
      lastConnectTime: '今天 18:30',
      lastSport: 'rope',
      lastRecord: '跳绳 286次 · 04:20'
    },
    {
      deviceId: 2,
      deviceName: '智能跳绳 B012',
      deviceType: 'rope',
      deviceNo: 'BT-ROPE-012',
      studentName: '李四',
      studentNo: 'S0002',
      school: 'XX小学',
      grade: '三年级',
      className: '2班',
      bindStatus: 'unbound',
      bindTime: '2025-08-20 10:00:00',
      lastConnectTime: '昨天 19:00',
      lastSport: 'rope',
      lastRecord: '跳绳 305次 · 04:50'
    },
    {
      deviceId: 3,
      deviceName: '智能跳绳 A002',
      deviceType: 'rope',
      deviceNo: 'BT-ROPE-002',
      studentName: '王五',
      studentNo: 'S0003',
      school: 'XX小学',
      grade: '三年级',
      className: '2班',
      bindStatus: 'bound',
      bindTime: '2025-09-15 14:30:00',
      lastConnectTime: '今天 19:10',
      lastSport: 'rope',
      lastRecord: '跳绳 320次 · 05:10'
    },
    {
      deviceId: 4,
      deviceName: '智能跳绳 C003',
      deviceType: 'rope',
      deviceNo: 'BT-ROPE-003',
      studentName: '孙七',
      studentNo: 'S0005',
      school: '阳光实验小学',
      grade: '五年级',
      className: '3班',
      bindStatus: 'bound',
      bindTime: '2025-09-18 11:00:00',
      lastConnectTime: '昨天 16:20',
      lastSport: 'rope',
      lastRecord: '跳绳 240次 · 04:00'
    },
    {
      deviceId: 5,
      deviceName: '智能跳绳 D008',
      deviceType: 'rope',
      deviceNo: 'BT-ROPE-008',
      studentName: '周八',
      studentNo: 'S0006',
      school: '阳光实验小学',
      grade: '六年级',
      className: '2班',
      bindStatus: 'unbound',
      bindTime: '2025-08-05 09:00:00',
      lastConnectTime: '上周 19:00',
      lastSport: 'rope',
      lastRecord: '跳绳 180次 · 03:00'
    }
  ]
});
