/**
 * 活动管理 - 前端原型本地 Mock 数据
 */
import { reactive } from 'vue';
import {
  findEventItem,
  formatNow,
  formatRequirement,
  formatSportsDisplay,
  eventItemStore,
  clone
} from '@/views/event-item/data.js';
import {
  CLASS_OPTIONS,
  SCHOOL_OPTIONS,
  createDefaultScope,
  createDefaultStageScope,
  createEmptyScope,
  formatCoverageClasses,
  formatCoverageRegions,
  formatCoverageSchools,
  formatScopeBriefSummary,
  formatScopeDetailText,
  formatScopeDisplaySummary,
  formatScopeSummary,
  getScopeDetailRows,
  getScopeDimensionLabels,
  migrateLegacyScope,
  normalizeScope,
  validateScopeConfig,
  validateStageScopeWithinCoverage
} from './scope-utils.js';

export { clone };
export {
  CLASS_OPTIONS,
  SCHOOL_OPTIONS,
  createDefaultScope,
  createDefaultStageScope,
  createEmptyScope,
  formatCoverageClasses,
  formatCoverageRegions,
  formatCoverageSchools,
  formatScopeBriefSummary,
  formatScopeDetailText,
  formatScopeDisplaySummary,
  formatScopeSummary,
  getScopeDetailRows,
  getScopeDimensionLabels,
  normalizeScope,
  validateScopeConfig,
  validateStageScopeWithinCoverage
};
export { REGION_OPTIONS, STAGE_OPTIONS, STAGE_GRADE_MAP } from './scope-utils.js';

export const ACTIVITY_STATUS_OPTIONS = ['未开始', '进行中', '已结束'];

/** 活动 1.0：保存即生效，无草稿/审核/发布流程；状态仅由活动时间自动计算 */
export const MOCK_OPERATOR = '赛事管理员';

let stageSeq = 100;
let committeeSeq = 100;

export function createStageId() {
  stageSeq += 1;
  return `stage_${stageSeq}`;
}

export function createDefaultStage(partial = {}) {
  return {
    stageId: createStageId(),
    stageName: '',
    startTime: '',
    endTime: '',
    scope: createDefaultStageScope(),
    threshold: '',
    chiefReferee: '',
    description: '',
    enabled: true,
    matchCount: 0,
    ...partial
  };
}

export function createDefaultStages() {
  return [
    createDefaultStage({
      stageName: '校园积分赛',
      description: '面向全校学生开展的基础积分赛事阶段。'
    }),
    createDefaultStage({
      stageName: '区域晋级赛',
      description: '区域范围内优胜代表参与的晋级阶段。'
    }),
    createDefaultStage({
      stageName: '全国总决赛',
      description: '全国范围最终决赛阶段。'
    })
  ];
}

export function createCommitteeMember(partial = {}) {
  committeeSeq += 1;
  return {
    id: partial.id ?? `cm_${committeeSeq}`,
    name: '',
    position: '',
    organization: '',
    ...partial
  };
}

function normalizeCommitteeMember(member) {
  if (typeof member === 'string') {
    const text = member.trim();
    if (!text) {
      return createCommitteeMember();
    }
    const parts = text.split(/\s+/);
    return createCommitteeMember({
      name: parts[0] || '',
      position: parts[1] || '',
      organization: parts.slice(2).join(' ') || ''
    });
  }
  return createCommitteeMember(member);
}

function normalizeCommitteeMembers(members = []) {
  return (members ?? []).map((item) => normalizeCommitteeMember(item));
}

function baseActivity() {
  return {
    activityId: void 0,
    activityName: '',
    cover: '',
    introduction: '',
    regulationText: '',
    regulationAttachments: [],
    attachments: [],
    guidingUnits: [],
    hostUnits: [],
    organizerUnits: [],
    coOrganizerUnits: [],
    supportUnits: [],
    chiefReferee: '',
    committeeMembers: [],
    startTime: '',
    endTime: '',
    stages: createDefaultStages(),
    itemIds: [],
    coverage: createDefaultScope(),
    matchCount: 0,
    schoolCount: 0,
    studentCount: 0,
    createBy: '',
    createTime: '',
    updateBy: '',
    updateTime: '',
    matches: []
  };
}

export function createDefaultActivity() {
  return clone(baseActivity());
}

export function formatScoreRuleSummary(item) {
  if (!item) {
    return '-';
  }
  if (item.ruleDescription) {
    return item.ruleDescription.length > 36
      ? `${item.ruleDescription.slice(0, 36)}...`
      : item.ruleDescription;
  }
  return item.scoreType ? `按${item.scoreType}提交成绩` : '-';
}

/** 计分规则摘要，与设项管理配置保持一致 */
export function formatScoringRuleSummary(item) {
  if (!item || item.matchForm === '个人' || !item.scoringEnabled) {
    return '未启用';
  }
  if (item.scoringDescription?.trim()) {
    const text = item.scoringDescription.trim();
    return text.length > 36 ? `${text.slice(0, 36)}...` : text;
  }
  return item.scoringMethod || '已配置';
}

export function formatRegistrationSummary(item) {
  const methods = item?.registrationMethods?.join('、') || '-';
  const insurance = item?.defaultInsuranceRequirement;
  return insurance ? `${methods}；${insurance}` : methods;
}

export function formatQualificationSummary(item) {
  return formatRequirement(item) || item?.qualification || '-';
}

export function mapEventItemForActivity(item) {
  if (!item) {
    return null;
  }
  return {
    itemId: item.itemId,
    itemName: item.itemName,
    project: formatSportsDisplay(item.sports),
    scoreType: item.scoreType || '-',
    scoreRule: formatScoreRuleSummary(item),
    scoringRule: formatScoringRuleSummary(item),
    registrationSetting: formatRegistrationSummary(item),
    qualification: formatQualificationSummary(item),
    status: item.status
  };
}

/** 从设项管理读取可选择的设项 */
export function getSelectableEventItems() {
  return eventItemStore.list
    .filter((d) => d.status === 1)
    .map((item) => mapEventItemForActivity(item))
    .filter(Boolean);
}

export function getActivityLinkedItems(itemIds = []) {
  return itemIds
    .map((id) => mapEventItemForActivity(findEventItem(id)))
    .filter(Boolean);
}

export function formatStageDateRange(stage) {
  if (!stage?.startTime || !stage?.endTime) {
    return '未设置';
  }
  return `${stage.startTime} 至 ${stage.endTime}`;
}

export function getActivityStatus(row) {
  if (!row?.startTime || !row?.endTime) {
    return '未开始';
  }
  const now = new Date();
  const start = new Date(`${row.startTime}T00:00:00`);
  const end = new Date(`${row.endTime}T23:59:59`);
  if (now < start) {
    return '未开始';
  }
  if (now > end) {
    return '已结束';
  }
  return '进行中';
}

export function getStatusTagType(status) {
  if (status === '进行中') {
    return 'success';
  }
  if (status === '已结束') {
    return 'info';
  }
  return 'warning';
}

export function formatActivityTime(row) {
  if (!row?.startTime || !row?.endTime) {
    return '-';
  }
  return `${row.startTime} 至 ${row.endTime}`;
}

export function formatUnits(units = []) {
  if (!units?.length) {
    return '-';
  }
  return units.join('、');
}

export function getEditMode(activity) {
  const status = getActivityStatus(activity);
  const hasMatches = (activity?.matchCount ?? 0) > 0;
  if (status === '已结束') {
    return 'readonly';
  }
  if (status === '进行中') {
    return 'limited';
  }
  if (hasMatches) {
    return 'cautious';
  }
  return 'full';
}

export function validateActivityForm(form, context = {}) {
  const errors = [];
  if (!form.activityName?.trim()) {
    errors.push('请填写活动名称');
  }
  if (!form.startTime) {
    errors.push('请选择活动开始时间');
  }
  if (!form.endTime) {
    errors.push('请选择活动结束时间');
  }
  if (form.startTime && form.endTime && form.endTime <= form.startTime) {
    errors.push('活动结束时间必须晚于活动开始时间');
  }
  if (!form.stages?.length) {
    errors.push('至少保留一个赛段');
  }
  errors.push(...validateScopeConfig(form.coverage, { labelPrefix: '覆盖' }));
  form.stages?.forEach((stage, index) => {
    const label = stage.stageName || `第${index + 1}个赛段`;
    if (!stage.stageName?.trim()) {
      errors.push(`${label}：请填写赛段名称`);
    }
    if (!stage.startTime) {
      errors.push(`${label}：请选择比赛开始日期`);
    }
    if (!stage.endTime) {
      errors.push(`${label}：请选择比赛结束日期`);
    }
    if (stage.startTime && stage.endTime && stage.endTime <= stage.startTime) {
      errors.push(`${label}：赛段比赛结束日期必须晚于比赛开始日期`);
    }
    if (form.startTime && stage.startTime && stage.startTime < form.startTime) {
      errors.push(`${label}：赛段比赛开始日期不能早于活动开始时间`);
    }
    if (form.endTime && stage.endTime && stage.endTime > form.endTime) {
      errors.push(`${label}：赛段比赛结束日期不能晚于活动结束时间`);
    }
    errors.push(...validateStageScopeWithinCoverage(stage.scope, form.coverage));
    if (!stage.scope?.inherit) {
      errors.push(
        ...validateScopeConfig(stage.scope, { isStage: true, labelPrefix: '参赛' })
      );
    }
  });
  errors.push(...validateActivityItemScope(form, context));
  return errors;
}

/** 已被下属比赛使用的设项不可从活动设项范围移除 */
export function validateActivityItemScope(form, context = {}) {
  const usedIds = getUsedItemIds({
    itemIds: form.itemIds,
    matchCount: context.matchCount,
    matches: context.matches
  });
  const removed = usedIds.filter((id) => !(form.itemIds ?? []).includes(id));
  if (removed.length) {
    return ['已被下属比赛使用的设项不允许从活动设项范围中移除'];
  }
  return [];
}

function makeStages(stages) {
  return (stages ?? createDefaultStages()).map((stage) =>
    createDefaultStage({
      ...stage,
      stageId: stage.stageId || createStageId(),
      scope: migrateLegacyScope(stage.scope, { isStage: true })
    })
  );
}

function makeMatches(matches) {
  return clone(matches);
}

function makeActivity(data) {
  return {
    ...baseActivity(),
    ...data,
    regulationText: data.regulationText ?? '',
    regulationAttachments: clone(data.regulationAttachments ?? []),
    committeeMembers: normalizeCommitteeMembers(data.committeeMembers ?? []),
    stages: makeStages(data.stages ?? createDefaultStages()),
    itemIds: [...(data.itemIds ?? [])],
    coverage: migrateLegacyScope(data.coverage),
    matches: makeMatches(data.matches ?? [])
  };
}

export const activityStore = reactive({
  nextId: 2,
  list: [
    makeActivity({
      activityId: 1,
      activityName: '学体联全国学生健康第一大赛',
      cover: '',
      introduction:
        '面向全国中小学生开展的健康促进系列赛事活动，涵盖校园积分、区域晋级和全国总决赛三个阶段，旨在推动学生体质健康水平全面提升。',
      regulationText:
        '本规程适用于学体联全国学生健康第一大赛。赛事分为校园积分赛、区域晋级赛和全国总决赛三个阶段，各阶段比赛时间、参赛范围及晋级规则以本规程及补充通知为准。',
      regulationAttachments: [
        {
          id: 'reg_1',
          name: '学体联全国学生健康第一大赛活动规程.pdf',
          type: 'PDF',
          uploadTime: '2026-01-08 10:00:00'
        }
      ],
      attachments: [
        {
          id: 'att_1',
          name: '赛事保险说明.pdf',
          type: 'PDF',
          uploadTime: '2026-01-08 10:30:00'
        },
        {
          id: 'att_2',
          name: '赛事通知.docx',
          type: 'Word',
          uploadTime: '2026-01-09 09:00:00'
        }
      ],
      guidingUnits: ['教育部体育卫生与艺术教育司'],
      hostUnits: ['中国学生体育联合会'],
      organizerUnits: ['北京市海淀区教育委员会'],
      coOrganizerUnits: ['北京市学生体育协会'],
      supportUnits: ['智慧体育平台'],
      chiefReferee: '王建国',
      committeeMembers: [
        { id: 'cm_1', name: '李明', position: '主任', organization: '中国学生体育联合会' },
        { id: 'cm_2', name: '张华', position: '副主任', organization: '北京市学生体育协会' }
      ],
      startTime: '2026-03-01',
      endTime: '2027-08-31',
      stages: [
        {
          stageId: 'stage_1',
          stageName: '校园积分赛',
          startTime: '2026-03-01',
          endTime: '2027-03-31',
          scope: {
            inherit: false,
            regionMode: 'specified',
            regions: [['110000', '110100', '110108']],
            schoolMode: 'specified',
            schools: ['school_1', 'school_2'],
            stageMode: 'specified',
            stages: ['小学', '初中'],
            gradeMode: 'specified',
            grades: ['三年级', '四年级', '五年级'],
            classMode: 'all',
            classes: [],
            remark: ''
          },
          threshold: '全校学生均可参与校园积分赛。',
          chiefReferee: '刘志强',
          description: '校园内开展的基础积分赛事。',
          enabled: true,
          matchCount: 3
        },
        {
          stageId: 'stage_2',
          stageName: '区域晋级赛',
          startTime: '2027-04-01',
          endTime: '2027-06-30',
          scope: {
            inherit: false,
            regionMode: 'specified',
            regions: [['110000', '110100', '110108']],
            schoolMode: 'all',
            schools: [],
            stageMode: 'specified',
            stages: ['小学', '初中'],
            gradeMode: 'all',
            grades: [],
            classMode: 'all',
            classes: [],
            remark: ''
          },
          threshold: '校园积分赛积分达标或排名晋级。',
          chiefReferee: '赵敏',
          description: '区域范围内优胜代表参与的晋级阶段。',
          enabled: true,
          matchCount: 2
        },
        {
          stageId: 'stage_3',
          stageName: '全国总决赛',
          startTime: '2027-07-01',
          endTime: '2027-08-31',
          scope: {
            inherit: true,
            regionMode: 'all',
            regions: [],
            schoolMode: 'all',
            schools: [],
            stageMode: 'all',
            stages: [],
            gradeMode: 'all',
            grades: [],
            classMode: 'all',
            classes: [],
            remark: ''
          },
          threshold: '区域晋级赛优胜代表队。',
          chiefReferee: '陈刚',
          description: '全国范围最终决赛阶段。',
          enabled: true,
          matchCount: 0
        }
      ],
      itemIds: [1, 2, 7],
      coverage: {
        regionMode: 'specified',
        regions: [
          ['110000', '110100', '110108'],
          ['110000', '110100', '110105']
        ],
        schoolMode: 'specified',
        schools: ['school_1', 'school_2', 'school_3'],
        stageMode: 'specified',
        stages: ['小学', '初中'],
        gradeMode: 'specified',
        grades: ['三年级', '四年级', '五年级', '初一', '初二'],
        classMode: 'specified',
        classes: ['class_1', 'class_2', 'class_3'],
        remark: '面向北京市海淀区、朝阳区指定学校开展。'
      },
      matchCount: 5,
      schoolCount: 186,
      studentCount: 8200,
      createBy: '赛事管理员',
      createTime: '2026-01-10 09:00:00',
      updateBy: '赛事管理员',
      updateTime: '2026-03-15 16:20:00',
      matches: [
        {
          matchId: 'm1',
          matchName: '海淀区校园跳绳积分赛',
          stageName: '校园积分赛',
          startTime: '2026-03-15',
          endTime: '2026-12-30',
          matchStatus: '进行中',
          registrationStatus: '报名中',
          itemCount: 2,
          itemIds: [1],
          registrationCount: 1280
        },
        {
          matchId: 'm2',
          matchName: '3v3篮球班级对抗赛',
          stageName: '校园积分赛',
          startTime: '2026-04-01',
          endTime: '2026-08-31',
          matchStatus: '进行中',
          registrationStatus: '报名中',
          itemCount: 1,
          itemIds: [2],
          registrationCount: 48
        },
        {
          matchId: 'm3',
          matchName: '朝阳区校园积分赛',
          stageName: '校园积分赛',
          startTime: '2026-03-01',
          endTime: '2027-03-31',
          matchStatus: '进行中',
          registrationStatus: '已截止',
          itemCount: 3,
          itemIds: [1, 7],
          registrationCount: 960
        },
        {
          matchId: 'm4',
          matchName: '海淀区区域晋级赛',
          stageName: '区域晋级赛',
          startTime: '2027-04-10',
          endTime: '2027-05-20',
          matchStatus: '未开始',
          registrationStatus: '未开始',
          itemCount: 2,
          itemIds: [1, 2],
          registrationCount: 0
        },
        {
          matchId: 'm5',
          matchName: '北京市区域跳绳挑战赛',
          stageName: '区域晋级赛',
          startTime: '2027-05-01',
          endTime: '2027-06-15',
          matchStatus: '未开始',
          registrationStatus: '未开始',
          itemCount: 1,
          itemIds: [1],
          registrationCount: 0
        }
      ]
    })
  ]
});

export function findActivity(id) {
  return activityStore.list.find((d) => d.activityId === Number(id));
}

export function saveActivity(form, activityId) {
  const payload = makeActivity(form);
  const now = formatNow();
  if (activityId) {
    const index = activityStore.list.findIndex((d) => d.activityId === Number(activityId));
    if (index === -1) {
      return null;
    }
    const prev = activityStore.list[index];
    payload.activityId = prev.activityId;
    payload.createBy = prev.createBy || MOCK_OPERATOR;
    payload.createTime = prev.createTime;
    payload.updateBy = MOCK_OPERATOR;
    payload.updateTime = now;
    payload.matchCount = prev.matchCount;
    payload.schoolCount = prev.schoolCount;
    payload.studentCount = prev.studentCount;
    payload.matches = prev.matches;
    activityStore.list.splice(index, 1, payload);
    return payload;
  }
  payload.activityId = activityStore.nextId++;
  payload.createBy = MOCK_OPERATOR;
  payload.createTime = now;
  payload.updateBy = MOCK_OPERATOR;
  payload.updateTime = now;
  if (!payload.schoolCount) {
    payload.schoolCount = Math.floor(Math.random() * 20);
  }
  if (!payload.studentCount) {
    payload.studentCount = Math.floor(Math.random() * 500);
  }
  activityStore.list.unshift(payload);
  return payload;
}

export function computeMatchStatus(match, activity) {
  const activityStatus = getActivityStatus(activity);
  if (activityStatus === '未开始') {
    return '未开始';
  }
  if (activityStatus === '已结束') {
    return '已结束';
  }
  if (!match?.startTime || !match?.endTime) {
    return '未开始';
  }
  const now = new Date();
  const start = new Date(`${match.startTime}T00:00:00`);
  const end = new Date(`${match.endTime}T23:59:59`);
  if (now < start) {
    return '未开始';
  }
  if (now > end) {
    return '已结束';
  }
  return '进行中';
}

export function enrichMatchesWithStatus(matches = [], activity) {
  return (matches ?? []).map((match) => ({
    ...match,
    matchStatus: computeMatchStatus(match, activity)
  }));
}

export function getMatchStats(matches = [], activity = null) {
  const list = activity ? enrichMatchesWithStatus(matches, activity) : matches;
  return {
    notStarted: list.filter((d) => d.matchStatus === '未开始').length,
    inProgress: list.filter((d) => d.matchStatus === '进行中').length,
    ended: list.filter((d) => d.matchStatus === '已结束').length
  };
}

export function getUsedItemIds(activity) {
  const used = new Set();
  (activity?.matches ?? []).forEach((match) => {
    (match.itemIds ?? []).forEach((id) => used.add(Number(id)));
  });
  return [...used];
}

/** 发布比赛时可选择的活动列表（保存即生效，无草稿/审核） */
export function getSelectableActivities() {
  return activityStore.list.map((item) => ({
    activityId: item.activityId,
    activityName: item.activityName,
    status: getActivityStatus(item),
    startTime: item.startTime,
    endTime: item.endTime,
    itemIds: item.itemIds ?? []
  }));
}

export function copyActivityData(source) {
  const data = clone(source);
  delete data.activityId;
  delete data.createBy;
  delete data.createTime;
  delete data.updateBy;
  delete data.updateTime;
  delete data.matchCount;
  delete data.schoolCount;
  delete data.studentCount;
  delete data.matches;
  data.activityName = `${data.activityName}-副本`;
  data.regulationText = '';
  data.regulationAttachments = [];
  data.attachments = [];
  data.startTime = '';
  data.endTime = '';
  data.stages = (data.stages ?? []).map((stage) =>
    createDefaultStage({
      ...stage,
      stageId: createStageId(),
      startTime: '',
      endTime: '',
      matchCount: 0
    })
  );
  return data;
}
