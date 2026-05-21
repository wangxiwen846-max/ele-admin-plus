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
      avgPace: "6'55\"/km",
      steps: '1680步',
      hasTrack: true
    },
    {
      recordId: 3,
      studentName: '李四',
      studentNo: 'S0002',
      school: 'XX小学',
      grade: '三年级',
      className: '1班',
      sport: 'rope',
      recordType: 'self',
      collectType: 'bluetooth',
      result: '320次',
      duration: '05:10',
      passStatus: 'none',
      homeworkName: '',
      homeworkTarget: '',
      finishTime: '昨天 19:10',
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
      finishTime: '昨天 17:45'
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
      finishTime: '前天 19:00'
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
      deviceName: '智能跳绳 B012',
      deviceNo: 'BT-ROPE-012'
    }
  ]
});

// ─── 设备绑定数据（一对多） ────────────────────────────
// 一台设备可以绑定多个学生；运动记录归属"使用学生"
export const deviceStore = reactive({
  list: [
    {
      deviceId: 1,
      deviceName: '智能跳绳 A001',
      deviceType: 'rope',
      deviceNo: 'BT-ROPE-001',
      students: [
        {
          studentNo: 'S0001',
          studentName: '张三',
          school: 'XX小学',
          grade: '三年级',
          className: '1班',
          bindTime: '2026-05-20 18:20'
        },
        {
          studentNo: 'S0002',
          studentName: '李四',
          school: 'XX小学',
          grade: '三年级',
          className: '1班',
          bindTime: '2026-05-21 19:10'
        }
      ],
      lastStudentName: '张三',
      lastConnectTime: '今天 18:30',
      lastSport: 'rope',
      usageRecords: [
        {
          studentName: '张三',
          sport: 'rope',
          recordType: 'homework',
          collectType: 'bluetooth',
          result: '286次',
          duration: '04:20',
          finishTime: '今天 18:30'
        },
        {
          studentName: '李四',
          sport: 'rope',
          recordType: 'self',
          collectType: 'bluetooth',
          result: '320次',
          duration: '05:10',
          finishTime: '昨天 19:10'
        }
      ]
    },
    {
      deviceId: 2,
      deviceName: '智能跳绳 B012',
      deviceType: 'rope',
      deviceNo: 'BT-ROPE-012',
      students: [
        {
          studentNo: 'S0008',
          studentName: '郑十',
          school: 'XX小学',
          grade: '三年级',
          className: '2班',
          bindTime: '2026-05-15 09:20'
        }
      ],
      lastStudentName: '郑十',
      lastConnectTime: '昨天 19:00',
      lastSport: 'rope',
      usageRecords: [
        {
          studentName: '郑十',
          sport: 'rope',
          recordType: 'homework',
          collectType: 'bluetooth',
          result: '305次',
          duration: '04:50',
          finishTime: '昨天 19:00'
        }
      ]
    },
    {
      deviceId: 3,
      deviceName: '智能跳绳 C008',
      deviceType: 'rope',
      deviceNo: 'BT-ROPE-008',
      students: [],
      lastStudentName: '',
      lastConnectTime: '',
      lastSport: '',
      usageRecords: []
    },
    {
      deviceId: 4,
      deviceName: '智能跳绳 A002',
      deviceType: 'rope',
      deviceNo: 'BT-ROPE-002',
      students: [
        {
          studentNo: 'S0003',
          studentName: '王五',
          school: 'XX小学',
          grade: '三年级',
          className: '2班',
          bindTime: '2026-04-18 14:30'
        }
      ],
      lastStudentName: '王五',
      lastConnectTime: '今天 19:10',
      lastSport: 'rope',
      usageRecords: [
        {
          studentName: '王五',
          sport: 'rope',
          recordType: 'self',
          collectType: 'bluetooth',
          result: '320次',
          duration: '05:10',
          finishTime: '今天 19:10'
        }
      ]
    },
    {
      deviceId: 5,
      deviceName: '智能跳绳 D003',
      deviceType: 'rope',
      deviceNo: 'BT-ROPE-003',
      students: [
        {
          studentNo: 'S0005',
          studentName: '孙七',
          school: '阳光实验小学',
          grade: '五年级',
          className: '3班',
          bindTime: '2026-04-20 11:00'
        },
        {
          studentNo: 'S0006',
          studentName: '周八',
          school: '阳光实验小学',
          grade: '六年级',
          className: '2班',
          bindTime: '2026-05-02 09:00'
        }
      ],
      lastStudentName: '孙七',
      lastConnectTime: '昨天 16:20',
      lastSport: 'rope',
      usageRecords: [
        {
          studentName: '孙七',
          sport: 'rope',
          recordType: 'homework',
          collectType: 'bluetooth',
          result: '240次',
          duration: '04:00',
          finishTime: '昨天 16:20'
        }
      ]
    }
  ]
});

/** 设备整体绑定状态：只要 students 非空就算"已绑定" */
export const computeBindStatus = (device) =>
  device.students && device.students.length > 0 ? 'bound' : 'unbound';
