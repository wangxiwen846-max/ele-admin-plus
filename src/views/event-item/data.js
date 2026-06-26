/**
 * 设项管理 - 前端原型本地 Mock 数据
 */
import { reactive } from 'vue';

export const SOURCE_OPTIONS = ['标准设项', '自定义设项'];
export const MATCH_FORM_OPTIONS = ['个人', '团体'];
export const STATUS_OPTIONS = [
  { value: 1, label: '启用' },
  { value: 0, label: '停用' }
];
export const GENDER_OPTIONS = ['不限', '男', '女'];
export const STAGE_OPTIONS = ['小学', '初中', '高中', '大学'];

/** 体育项目库（可关联选择） */
export const SPORT_PROJECT_CATALOG = [
  { name: '跳绳', projectType: '计数类', unit: '次' },
  { name: '跑步', projectType: '计时类', unit: '秒' },
  { name: '篮球', projectType: '得分类', unit: '分' },
  { name: '仰卧起坐', projectType: '计数类', unit: '个' },
  { name: '俯卧撑', projectType: '计数类', unit: '个' },
  { name: '开合跳', projectType: '计数类', unit: '个' },
  { name: '深蹲', projectType: '计数类', unit: '个' }
];

export const SPORT_OPTIONS = SPORT_PROJECT_CATALOG.map((d) => d.name);

/** 学段 → 年级 联动映射 */
export const STAGE_GRADE_MAP = {
  小学: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
  初中: ['初一', '初二', '初三'],
  高中: ['高一', '高二', '高三'],
  大学: ['大一', '大二', '大三', '大四']
};

export function getGradesByStages(stages = []) {
  const result = [];
  stages.forEach((stage) => {
    (STAGE_GRADE_MAP[stage] ?? []).forEach((g) => {
      if (!result.includes(g)) {
        result.push(g);
      }
    });
  });
  return result;
}

/** 内置成绩表单 */
export const BUILTIN_SCORE_FORMS = [
  '跳绳成绩提交表',
  '跑步计时成绩表',
  '篮球比赛结果提交表',
  '体能项目成绩提交表',
  '达标结果提交表'
];

/** 内置成绩表单字段预览 */
export const BUILTIN_SCORE_FORM_PREVIEWS = {
  跳绳成绩提交表: [
    { sportProject: '跳绳', name: '跳绳次数', type: '数字', required: '是', unit: '次', description: '填写有效跳绳次数' },
    { sportProject: '跳绳', name: '用时', type: '数字', required: '是', unit: '秒', description: '填写完成用时' },
    { sportProject: '', name: '比赛分', type: '数字', required: '否', unit: '分', description: '' }
  ],
  跑步计时成绩表: [
    { sportProject: '跑步', name: '完成用时', type: '数字', required: '是', unit: '秒', description: '' },
    { sportProject: '跑步', name: '是否完赛', type: '单选', required: '是', unit: '-', description: '' }
  ],
  篮球比赛结果提交表: [
    { sportProject: '篮球', name: '本方得分', type: '数字', required: '是', unit: '分', description: '' },
    { sportProject: '篮球', name: '对方得分', type: '数字', required: '是', unit: '分', description: '' },
    { sportProject: '篮球', name: '比赛结果', type: '单选', required: '是', unit: '-', description: '胜/平/负' }
  ],
  体能项目成绩提交表: [
    { sportProject: '', name: '完成个数', type: '数字', required: '是', unit: '个', description: '' },
    { sportProject: '', name: '用时', type: '数字', required: '否', unit: '秒', description: '' }
  ],
  达标结果提交表: [
    { sportProject: '', name: '达标结果', type: '单选', required: '是', unit: '-', description: '' },
    { sportProject: '', name: '备注', type: '文本', required: '否', unit: '-', description: '' }
  ]
};

/** 用户保存的成绩表单模板（动态追加） */
export const scoreFormStore = reactive({
  templates: {}
});

export function getScoreFormOptions() {
  return [...BUILTIN_SCORE_FORMS, ...Object.keys(scoreFormStore.templates)];
}

export function getScoreFormFields(formName) {
  if (!formName) {
    return [];
  }
  if (scoreFormStore.templates[formName]) {
    return clone(scoreFormStore.templates[formName]);
  }
  return clone(BUILTIN_SCORE_FORM_PREVIEWS[formName] ?? []);
}

export function saveScoreFormTemplate(name, fields) {
  scoreFormStore.templates[name] = clone(fields).map((f) => ({
    ...f,
    sportProject: normalizeSportProject(f.sportProject)
  }));
}

/** 所属项目展示：空值显示为 - */
export function formatSportProject(value) {
  const text = normalizeSportProject(value);
  return text || '-';
}

/** 所属项目存储：空、综合 等均归一为空字符串 */
export function normalizeSportProject(value) {
  if (value == null || value === '' || value === '综合') {
    return '';
  }
  return String(value);
}

export function hasScoreFieldNamed(fields, name) {
  return (fields ?? []).some((f) => f.name === name);
}

export const DATA_SOURCE_OPTIONS = ['表单提交'];
export const SCORING_METHOD_OPTIONS = ['手动录入比赛分', '系统自动计算'];
/** 1.0 引用情况赛段 */
export const MATCH_STAGE_OPTIONS = ['校园积分赛', '区域晋级赛', '全国总决赛'];

export const RANK_BASIS_OPTIONS = ['成绩值', '比赛分', '胜负结果', '人工排名'];
export const SORT_OPTIONS = ['数值越大排名越靠前', '数值越小排名越靠前'];
export const TIE_OPTIONS = ['并列排名', '按提交时间排序', '按规则说明处理'];
export const FIELD_TYPE_OPTIONS = ['文本', '数字', '单选', '多选', '日期', '上传'];

export function createMultiSportScoreFields() {
  return [
    {
      fieldId: 1,
      sportProject: '跳绳',
      name: '跳绳次数',
      type: '数字',
      required: true,
      unit: '次',
      description: '填写有效跳绳次数',
      options: []
    },
    {
      fieldId: 2,
      sportProject: '仰卧起坐',
      name: '仰卧起坐个数',
      type: '数字',
      required: true,
      unit: '个',
      description: '填写仰卧起坐个数',
      options: []
    },
    {
      fieldId: 3,
      sportProject: '俯卧撑',
      name: '俯卧撑个数',
      type: '数字',
      required: true,
      unit: '个',
      description: '填写俯卧撑个数',
      options: []
    },
    {
      fieldId: 4,
      sportProject: '',
      name: '比赛分',
      type: '数字',
      required: false,
      unit: '分',
      description: '若计分规则为手动录入比赛分，可填写',
      options: []
    }
  ];
}

export const REGION_OPTIONS = [
  {
    value: '110000',
    label: '北京市',
    children: [
      {
        value: '110100',
        label: '北京市',
        children: [
          { value: '110108', label: '海淀区' },
          { value: '110105', label: '朝阳区' },
          { value: '110102', label: '西城区' }
        ]
      }
    ]
  },
  {
    value: '310000',
    label: '上海市',
    children: [
      {
        value: '310100',
        label: '上海市',
        children: [
          { value: '310115', label: '浦东新区' },
          { value: '310101', label: '黄浦区' }
        ]
      }
    ]
  },
  {
    value: '440000',
    label: '广东省',
    children: [
      {
        value: '440100',
        label: '广州市',
        children: [
          { value: '440106', label: '天河区' },
          { value: '440104', label: '越秀区' }
        ]
      },
      {
        value: '440300',
        label: '深圳市',
        children: [
          { value: '440305', label: '南山区' },
          { value: '440304', label: '福田区' }
        ]
      }
    ]
  }
];

const REGION_CODE_MAP = (() => {
  const map = {};
  const walk = (nodes) => {
    nodes.forEach((node) => {
      map[node.value] = node.label;
      if (node.children) {
        walk(node.children);
      }
    });
  };
  walk(REGION_OPTIONS);
  return map;
})();

export function getRegionPathLabel(path = []) {
  return path.map((code) => REGION_CODE_MAP[code] ?? code).join(' / ');
}

export function getRegionLabelList(paths = []) {
  return paths.map((path) => getRegionPathLabel(path));
}

export const DEFAULT_ATTACHMENTS = [
  {
    id: 'file_rule_1',
    name: '竞赛规程示例.pdf',
    type: 'PDF',
    uploadTime: '2026-08-01 09:30'
  }
];

function baseItem() {
  return {
    itemId: void 0,
    itemName: '',
    description: '',
    source: '标准设项',
    sports: [],
    status: 1,
    matchForm: '个人',
    teamMin: 1,
    teamMax: 3,
    needTeamName: true,
    teamRule: '',
    gender: '不限',
    stages: [],
    grades: [],
    ageStart: void 0,
    ageEnd: void 0,
    qualification: '',
    needMaterial: false,
    materialDescription: '',
    dataSource: '表单提交',
    scoreFormType: 'existing',
    scoreForm: '',
    scoreFields: [],
    saveAsTemplate: false,
    scoreFormTemplateName: '',
    rankingEnabled: true,
    rankBasis: '成绩值',
    sortType: '数值越大排名越靠前',
    tieRule: '并列排名',
    rankDescription: '',
    rankAttachments: [],
    scoringEnabled: true,
    scoringMethod: '手动录入比赛分',
    scoringDescription: '具体计分方式以赛事组委会发布的正式竞赛规程为准。',
    scoringAttachments: [],
    regionType: '全国',
    regions: [],
    includeChildren: true,
    ruleDescription: '',
    ruleAttachments: [],
    isReferenced: false,
    createTime: '',
    updateTime: '',
    operationLogs: []
  };
}

export function createDefaultItem() {
  return {
    ...baseItem(),
    sports: [],
    scoreFormType: 'existing',
    scoreForm: '',
    scoreFields: [],
    saveAsTemplate: false,
    scoreFormTemplateName: ''
  };
}

function sportEntry(name) {
  return SPORT_PROJECT_CATALOG.find((d) => d.name === name) ?? { name, projectType: '-', unit: '-' };
}

function normalizeSports(data) {
  if (data.sports?.length) {
    return data.sports.map((s) => (typeof s === 'string' ? sportEntry(s) : s));
  }
  if (data.sport) {
    return [sportEntry(data.sport)];
  }
  return [];
}

function makeItem(data) {
  const sports = normalizeSports(data);
  return {
    ...baseItem(),
    dataSource: '表单提交',
    scoreFields: [],
    sports,
    createTime: data.createTime ?? '2026-08-01 09:00',
    updateTime: data.updateTime ?? '2026-08-20 10:00',
    operationLogs: [
      {
        time: data.createTime ?? '2026-08-01 09:00',
        operator: '管理员',
        type: '新增',
        content: '创建设项'
      },
      {
        time: data.updateTime ?? '2026-08-20 10:00',
        operator: '管理员',
        type: '编辑',
        content: '维护设项规则配置'
      }
    ],
    ...data,
    sports
  };
}

export const eventItemStore = reactive({
  nextId: 7,
  list: [
    makeItem({
      itemId: 1,
      itemName: '一分钟跳绳达标赛',
      source: '标准设项',
      sports: [sportEntry('跳绳')],
      matchForm: '个人',
      gender: '不限',
      stages: ['小学'],
      grades: ['三年级', '四年级'],
      scoreFormType: 'existing',
      scoreForm: '跳绳成绩提交表',
      scoringEnabled: true,
      status: 1,
      isReferenced: true,
      regionType: '指定地区',
      regions: [['110000', '110100', '110108']],
      includeChildren: false,
      rankAttachments: clone(DEFAULT_ATTACHMENTS),
      ruleAttachments: clone(DEFAULT_ATTACHMENTS),
      description: '用于校园积分赛中学生一分钟跳绳成绩采集与排名。',
      ruleDescription: '一分钟内完成有效跳绳计数，复杂排名和地区差异以附件规程为准。'
    }),
    makeItem({
      itemId: 2,
      itemName: '3 人篮球班班赛',
      source: '标准设项',
      sports: [sportEntry('篮球')],
      matchForm: '团体',
      teamMin: 3,
      teamMax: 5,
      needTeamName: true,
      teamRule: '由教师组织队伍参赛，也可根据比赛规则进行自由组队。',
      gender: '不限',
      stages: ['初中'],
      scoreFormType: 'existing',
      scoreForm: '篮球比赛结果提交表',
      rankBasis: '胜负结果',
      scoringEnabled: true,
      status: 1,
      isReferenced: true,
      description: '用于校园篮球团队比赛结果提交与排名。',
      ruleDescription: '团体队伍不固定等于班级，具体组织方式以赛事通知为准。'
    }),
    makeItem({
      itemId: 3,
      itemName: '50 米跑挑战赛',
      source: '标准设项',
      sports: [sportEntry('跑步')],
      matchForm: '个人',
      gender: '不限',
      stages: ['小学'],
      grades: ['三年级', '四年级', '五年级', '六年级'],
      scoreFormType: 'existing',
      scoreForm: '跑步计时成绩表',
      sortType: '数值越小排名越靠前',
      scoringEnabled: false,
      status: 1,
      isReferenced: false,
      description: '用于 50 米短跑挑战成绩采集。'
    }),
    makeItem({
      itemId: 4,
      itemName: '仰卧起坐达标赛',
      source: '标准设项',
      sports: [sportEntry('仰卧起坐')],
      matchForm: '个人',
      gender: '不限',
      stages: ['初中'],
      scoreFormType: 'existing',
      scoreForm: '体能项目成绩提交表',
      scoringEnabled: true,
      status: 0,
      isReferenced: false
    }),
    makeItem({
      itemId: 5,
      itemName: '俯卧撑挑战赛',
      source: '标准设项',
      sports: [sportEntry('俯卧撑')],
      matchForm: '个人',
      gender: '男',
      stages: ['高中'],
      scoreFormType: 'existing',
      scoreForm: '体能项目成绩提交表',
      scoringEnabled: true,
      status: 1,
      isReferenced: false,
      regionType: '指定地区',
      regions: [['440000', '440300', '440305']],
      includeChildren: true
    }),
    makeItem({
      itemId: 6,
      itemName: '体能训练挑战赛',
      source: '标准设项',
      sports: [
        sportEntry('跳绳'),
        sportEntry('仰卧起坐'),
        sportEntry('俯卧撑'),
        sportEntry('开合跳')
      ],
      matchForm: '个人',
      gender: '不限',
      stages: ['小学', '初中'],
      grades: ['四年级', '五年级', '六年级'],
      scoreFormType: 'custom',
      scoreFields: createMultiSportScoreFields(),
      scoringEnabled: true,
      status: 1,
      isReferenced: false,
      description: '综合体能类设项，支持多项目成绩采集。'
    })
  ]
});

export function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

export function findEventItem(id) {
  return eventItemStore.list.find((d) => d.itemId === Number(id));
}

export function formatSportsDisplay(sports = []) {
  const names = sports.map((s) => (typeof s === 'string' ? s : s.name)).filter(Boolean);
  if (!names.length) {
    return '-';
  }
  if (names.length <= 2) {
    return names.join('、');
  }
  return `${names.slice(0, 2).join('、')}等 ${names.length} 项`;
}

export function formatRequirement(row) {
  return [
    row.stages?.join('、'),
    row.grades?.length ? gradeRangeText(row.grades) : '',
    row.gender
  ]
    .filter(Boolean)
    .join('｜');
}

export function formatNow() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function createReferenceRecords(row) {
  if (!row?.isReferenced) {
    return [];
  }
  return [
    {
      eventName: '学体联全国学生健康第一大赛',
      matchName: '海淀区校园积分赛',
      stage: '校园积分赛',
      matchTime: '2026-09-01 至 2026-12-31',
      status: '进行中',
      referenceTime: '2026-08-20 10:00'
    },
    {
      eventName: '北京市校园体育节',
      matchName: `${row.itemName} 区域赛`,
      stage: '区域晋级赛',
      matchTime: '2026-10-10 至 2026-10-30',
      status: '未开始',
      referenceTime: '2026-08-25 14:30'
    }
  ];
}

export function makeSnapshot(row) {
  const data = clone(row);
  return {
    sports: data.sports,
    matchForm: data.matchForm,
    requirement: {
      gender: data.gender,
      stages: data.stages,
      grades: data.grades,
      ageStart: data.ageStart,
      ageEnd: data.ageEnd,
      qualification: data.qualification
    },
    dataSource: data.dataSource,
    scoreForm: data.scoreForm,
    scoreFields: data.scoreFields,
    rankingRule: {
      enabled: data.rankingEnabled,
      rankBasis: data.rankBasis,
      sortType: data.sortType,
      tieRule: data.tieRule,
      description: data.rankDescription,
      attachments: data.rankAttachments
    },
    scoringRule: {
      enabled: data.scoringEnabled,
      method: data.scoringMethod,
      description: data.scoringDescription,
      attachments: data.scoringAttachments
    },
    ruleDescription: data.ruleDescription,
    ruleAttachments: data.ruleAttachments
  };
}

function gradeRangeText(grades = []) {
  if (grades.length <= 2) {
    return grades.join('、');
  }
  return `${grades[0]}-${grades[grades.length - 1]}`;
}
