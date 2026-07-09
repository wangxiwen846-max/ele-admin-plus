/**
 * 参赛名单 - 前端原型本地 Mock 数据
 */
import { reactive } from 'vue';
import {
  findMatch,
  formatRegistrationMethods,
  getAllMatches,
  getActivityOptions,
  getMatchLinkedItems,
  getMatchTypeOptionsForStage,
  getStageOptions,
  isDailyMatch
} from '@/views/competition/match/data.js';
import {
  INSURANCE_TYPE_SEMESTER,
  findInsurancePlan,
  findSemesterPlanByDate,
  formatPlanSchoolYearSemester,
  getInsurancePlanName,
  getInsurancePlanOptions,
  getInsuranceTypeByMatchType
} from '@/views/competition/insurance/data.js';
import { formatMatchTypeLabel, matchTypeMatchesLeaf } from '@/views/competition/match-type.js';

export const SCORE_STATUS_OPTIONS = ['未上传', '已上传', '异常'];
export const INSURANCE_METHOD_OPTIONS = ['统一购买', '自行购买'];
export const DAILY_POINT_SOURCES = ['体育课', '大课间', '体育作业', '校外培训', '赛事', 'AI运动', '设备采集'];

/**
 * 学校 -> 地区缩写映射（参赛编号地区缩写来源）
 */
export const SCHOOL_REGION_ABBR = {
  第一实验小学: 'HD',
  第二实验小学: 'XC',
  第三实验小学: 'CY'
};

export const DEFAULT_REGION_ABBR = 'BJ';

export function getRegionAbbrBySchool(school) {
  return SCHOOL_REGION_ABBR[String(school || '').trim()] || DEFAULT_REGION_ABBR;
}

export function getStudentRegionAbbr(studentId) {
  const student = STUDENT_OPTIONS.find((item) => item.studentId === studentId);
  return getRegionAbbrBySchool(student?.school);
}

export const STUDENT_OPTIONS = [
  { studentId: 'stu_001', classNo: '1', name: '王小明', gender: '男', idNo: '110101********1234', school: '第一实验小学', grade: '五年级', className: '3 班', gradeClass: '五年级 3 班', phone: '138****1234' },
  { studentId: 'stu_002', classNo: '2', name: '李思雨', gender: '女', idNo: '110101********2356', school: '第一实验小学', grade: '五年级', className: '3 班', gradeClass: '五年级 3 班', phone: '138****2356' },
  { studentId: 'stu_003', classNo: '1', name: '赵一诺', gender: '女', idNo: '110101********7788', school: '第二实验小学', grade: '四年级', className: '1 班', gradeClass: '四年级 1 班', phone: '138****7788' },
  { studentId: 'stu_004', classNo: '1', name: '陈子涵', gender: '男', idNo: '110101********8899', school: '第二实验小学', grade: '四年级', className: '2 班', gradeClass: '四年级 2 班', phone: '138****8899' },
  { studentId: 'stu_005', classNo: '1', name: '周可欣', gender: '女', idNo: '110101********6677', school: '第三实验小学', grade: '六年级', className: '1 班', gradeClass: '六年级 1 班', phone: '138****6677' },
  { studentId: 'stu_006', classNo: '1', name: '孙浩然', gender: '男', idNo: '110101********3311', school: '第一实验小学', grade: '五年级', className: '1 班', gradeClass: '五年级 1 班', phone: '138****3311' },
  { studentId: 'stu_007', classNo: '2', name: '吴雅静', gender: '女', idNo: '110101********4422', school: '第三实验小学', grade: '六年级', className: '1 班', gradeClass: '六年级 1 班', phone: '138****4422' },
  { studentId: 'stu_008', classNo: '2', name: '郑明轩', gender: '男', idNo: '110101********5533', school: '第二实验小学', grade: '四年级', className: '1 班', gradeClass: '四年级 1 班', phone: '138****5533' }
];

export function getStudentOptions(filters = {}) {
  return STUDENT_OPTIONS.filter((student) => {
    if (filters.name && !student.name.includes(filters.name)) {
      return false;
    }
    if (filters.school && student.school !== filters.school) {
      return false;
    }
    if (filters.grade && student.grade !== filters.grade) {
      return false;
    }
    if (filters.className && student.className !== filters.className) {
      return false;
    }
    return true;
  });
}

export function getStudentSchoolOptions() {
  return [...new Set(STUDENT_OPTIONS.map((item) => item.school))];
}

export function getStudentGradeOptions() {
  return [...new Set(STUDENT_OPTIONS.map((item) => item.grade))];
}

export const registrationStore = reactive({
  personalEntries: [],
  teamEntries: [],
  /** 按比赛记录下一个待分配的参赛编号序号（从 1 递增，删除不回收） */
  matchParticipantSeq: {},
  importLogs: [
    {
      logId: 'log_001',
      importTime: '2026-06-28 14:30',
      operator: '赛事专员',
      itemName: '一分钟跳绳',
      importType: '个人报名',
      totalCount: 86,
      successCount: 84,
      errorCount: 2,
      status: '部分成功'
    }
  ]
});

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function currentTimestamp() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

// 参赛编号格式：地区缩写（2-3 位大写字母） + 五位数字，例如 HD00001
const PARTICIPANT_NUMBER_PATTERN = /^([A-Z]{2,3})(\d{5})$/;

export function formatParticipantSeq(seq) {
  return String(seq).padStart(5, '0');
}

export function buildParticipantNumber(regionAbbr, seq) {
  return `${regionAbbr}${formatParticipantSeq(seq)}`;
}

export function formatParticipantNumberDisplay(value) {
  const normalized = String(value ?? '').trim().toUpperCase();
  return normalized ? normalized : '-';
}

function parseParticipantNumber(value) {
  const normalized = String(value ?? '').trim().toUpperCase();
  const matched = normalized.match(PARTICIPANT_NUMBER_PATTERN);
  if (!matched) {
    return null;
  }
  return { regionAbbr: matched[1], seq: Number(matched[2]), value: normalized };
}

function seqKey(matchId, regionAbbr) {
  return `${matchId}::${regionAbbr}`;
}

function collectMatchParticipantNumbers(matchId) {
  const numbers = [];
  registrationStore.personalEntries
    .filter((entry) => entry.matchId === matchId && entry.participantNumber)
    .forEach((entry) => numbers.push(entry.participantNumber));
  registrationStore.teamEntries
    .filter((entry) => entry.matchId === matchId)
    .forEach((entry) => {
      (entry.members ?? []).forEach((member) => {
        if (member.participantNumber) {
          numbers.push(member.participantNumber);
        }
      });
    });
  return numbers;
}

// 编号按当前比赛 + 地区维度递增
function syncMatchParticipantSeq(matchId, regionAbbr) {
  const max = collectMatchParticipantNumbers(matchId).reduce((current, item) => {
    const parsed = parseParticipantNumber(item);
    if (parsed && parsed.regionAbbr === regionAbbr) {
      return Math.max(current, parsed.seq);
    }
    return current;
  }, 0);
  const key = seqKey(matchId, regionAbbr);
  const next = registrationStore.matchParticipantSeq[key] ?? 1;
  registrationStore.matchParticipantSeq[key] = Math.max(next, max + 1);
}

function allocateParticipantNumber(matchId, regionAbbr) {
  syncMatchParticipantSeq(matchId, regionAbbr);
  const key = seqKey(matchId, regionAbbr);
  const next = registrationStore.matchParticipantSeq[key];
  registrationStore.matchParticipantSeq[key] = next + 1;
  return buildParticipantNumber(regionAbbr, next);
}

export function getStudentParticipantNumberInMatch(matchId, studentId) {
  seedEntries();
  return findStudentParticipantNumberInMatch(matchId, studentId);
}

function findStudentParticipantNumberInMatch(matchId, studentId) {
  const personalEntry = registrationStore.personalEntries.find(
    (item) => item.matchId === matchId && item.studentId === studentId && item.participantNumber
  );
  if (personalEntry?.participantNumber) {
    return personalEntry.participantNumber;
  }
  for (const team of registrationStore.teamEntries) {
    if (team.matchId !== matchId) {
      continue;
    }
    const member = (team.members ?? []).find(
      (item) => item.studentId === studentId && item.participantNumber
    );
    if (member?.participantNumber) {
      return member.participantNumber;
    }
  }
  return null;
}

function isParticipantNumberUsedByOther(matchId, participantNumber, exclude = {}) {
  const personalConflict = registrationStore.personalEntries.some(
    (entry) =>
      entry.matchId === matchId &&
      entry.participantNumber === participantNumber &&
      entry.studentId !== exclude.studentId
  );
  if (personalConflict) {
    return true;
  }
  return registrationStore.teamEntries.some((team) =>
    (team.members ?? []).some(
      (member) =>
        team.matchId === matchId &&
        member.participantNumber === participantNumber &&
        member.studentId !== exclude.studentId
    )
  );
}

export function assignStudentParticipantNumber(matchId, studentId, preferredNumber = null) {
  // 同一学生在同一比赛已有编号则直接复用
  const existing = findStudentParticipantNumberInMatch(matchId, studentId);
  if (existing) {
    return existing;
  }
  const regionAbbr = getStudentRegionAbbr(studentId);
  if (preferredNumber != null && String(preferredNumber).trim() !== '') {
    const parsed = parseParticipantNumber(preferredNumber);
    // 地区缩写需与学生所属地区一致
    if (!parsed || parsed.regionAbbr !== regionAbbr) {
      return null;
    }
    if (isParticipantNumberUsedByOther(matchId, parsed.value, { studentId })) {
      return null;
    }
    syncMatchParticipantSeq(matchId, regionAbbr);
    const key = seqKey(matchId, regionAbbr);
    if (parsed.seq >= registrationStore.matchParticipantSeq[key]) {
      registrationStore.matchParticipantSeq[key] = parsed.seq + 1;
    }
    return parsed.value;
  }
  return allocateParticipantNumber(matchId, regionAbbr);
}

export function validateParticipantNumberInput(matchId, participantNumber, context = {}) {
  const parsed = parseParticipantNumber(participantNumber);
  if (!parsed) {
    return { valid: false, reason: '参赛编号格式应为“地区缩写 + 五位数字”，例如 HD00001' };
  }
  const { studentId } = context;
  if (studentId) {
    const regionAbbr = getStudentRegionAbbr(studentId);
    if (parsed.regionAbbr !== regionAbbr) {
      return { valid: false, reason: `参赛编号地区缩写应为「${regionAbbr}」，与学生所属地区不一致` };
    }
    const existing = findStudentParticipantNumberInMatch(matchId, studentId);
    if (existing && existing !== parsed.value) {
      return { valid: false, reason: '参赛编号与当前比赛下已有编号不一致，需沿用已有编号' };
    }
  }
  if (isParticipantNumberUsedByOther(matchId, parsed.value, { studentId })) {
    return { valid: false, reason: '参赛编号在当前比赛内重复' };
  }
  return { valid: true, value: parsed.value };
}

export function getStudentPickerRows(matchId, filters = {}) {
  let list = filterStudentsByAccountScope().filter((student) => {
    if (filters.school && student.school !== filters.school) {
      return false;
    }
    if (filters.grade && student.grade !== filters.grade) {
      return false;
    }
    if (filters.className && student.className !== filters.className) {
      return false;
    }
    if (filters.name && !student.name.includes(String(filters.name).trim())) {
      return false;
    }
    return true;
  });
  if (matchId && filters.participantNumber) {
    const exact = String(filters.participantNumber).trim().toUpperCase();
    if (exact) {
      list = list.filter(
        (student) =>
          String(getStudentParticipantNumberInMatch(matchId, student.studentId) || '').toUpperCase() === exact
      );
    }
  }
  return list.map((student) => ({
    ...student,
    participantNumber: matchId
      ? formatParticipantNumberDisplay(getStudentParticipantNumberInMatch(matchId, student.studentId))
      : '-'
  }));
}

export function filterRosterRowsByParticipantNumber(rows = [], participantNumber = '') {
  const exact = String(participantNumber || '').trim();
  if (!exact) {
    return rows;
  }
  return rows.filter((row) => row.participantNumber === exact);
}

function seedEntries() {
  if (registrationStore.personalEntries.length || registrationStore.teamEntries.length) {
    return;
  }
  const matches = getAllMatches().filter((match) => !isDailyMatch(match));
  matches.forEach((match, matchIndex) => {
    const items = getMatchLinkedItems(match);
    const personalItem = items.find((item) => item.matchForm === '个人') ?? items[0];
    const teamItem = items.find((item) => item.matchForm === '团体');
    const studentNumberMap = new Map();
    const registerTime = match.regStartTime || match.startTime || match.createTime || '2026-06-20 09:00';
    if (personalItem) {
      STUDENT_OPTIONS.slice(0, 3).forEach((student, index) => {
        let participantNumber = studentNumberMap.get(student.studentId);
        if (!participantNumber) {
          participantNumber = allocateParticipantNumber(match.matchId, getStudentRegionAbbr(student.studentId));
          studentNumberMap.set(student.studentId, participantNumber);
        }
        const entry = {
          entryId: `p_${match.matchId}_${personalItem.itemId}_${student.studentId}`,
          matchId: match.matchId,
          itemId: personalItem.itemId,
          itemName: personalItem.itemName,
          matchForm: '个人',
          studentId: student.studentId,
          studentName: student.name,
          idNo: student.idNo,
          gender: student.gender,
          school: student.school,
          grade: student.grade,
          className: student.className,
          classNo: student.classNo,
          gradeClass: student.gradeClass,
          phone: index === 0 ? '138****1234' : '',
          insuranceStatus: index === 0 ? '已参保' : '待参保',
          exceptionReason: '',
          scoreStatus: index === 0 ? '已上传' : '未上传',
          remark: '',
          registerTime,
          participantNumber
        };
        registrationStore.personalEntries.push(entry);
      });
    }
    if (teamItem) {
      const teamName = matchIndex % 2 ? '飞跃少年队' : '阳光冲刺队';
      const teamEntry = {
        teamId: `t_${match.matchId}_${teamItem.itemId}_1`,
        matchId: match.matchId,
        itemId: teamItem.itemId,
        itemName: teamItem.itemName,
        matchForm: '团体',
        teamName,
        school: '第一实验小学',
        registerTime,
        members: STUDENT_OPTIONS.slice(1, 5).map((student, index) => {
          let participantNumber = studentNumberMap.get(student.studentId);
          if (!participantNumber) {
            participantNumber = allocateParticipantNumber(match.matchId, getStudentRegionAbbr(student.studentId));
            studentNumberMap.set(student.studentId, participantNumber);
          }
          return {
            ...student,
            participantNumber,
            insuranceStatus: index < 2 ? '已参保' : '待参保',
            exceptionReason: ''
          };
        }),
        scoreStatus: '未上传',
        remark: ''
      };
      registrationStore.teamEntries.push(teamEntry);
    }
  });
}

function resolveInsuranceSetting(match) {
  return (isDailyMatch(match) ? match.dailyInsurance : match.matchInsurance) || {};
}

function resolvePlanId(match) {
  const setting = resolveInsuranceSetting(match);
  if (setting?.planId) {
    return setting.planId;
  }
  return getInsurancePlanOptions(getInsuranceTypeByMatchType(match.matchType))[0]?.planId ?? '';
}

export function getMatchInsuranceMethod(match) {
  const method = resolveInsuranceSetting(match)?.method;
  return INSURANCE_METHOD_OPTIONS.includes(method) ? method : '统一购买';
}

export function getMatchReportMethod(match) {
  return formatRegistrationMethods(match?.matchRegistration?.methods) || '教师报名';
}

export function getRegisterableMatches() {
  return getAllMatches().filter((match) => !isDailyMatch(match));
}

export function getAllRegistrationMatches() {
  seedEntries();
  return getAllMatches().map((match) => buildMatchRegistrationRow(match));
}

export function normalizeInsuranceDisplayStatus(status) {
  return status === '已参保' ? '已参保' : '待参保';
}

export const REGISTRATION_INSURANCE_STATUS_OPTIONS = ['待参保', '已参保'];

export function buildMatchRegistrationRow(match) {
  seedEntries();
  const personal = registrationStore.personalEntries.filter((entry) => entry.matchId === match.matchId);
  const teams = registrationStore.teamEntries.filter((entry) => entry.matchId === match.matchId);
  const studentIds = new Set([
    ...personal.map((entry) => entry.studentId),
    ...teams.flatMap((team) => team.members.map((member) => member.studentId))
  ]);
  const statuses = [
    ...personal.map((entry) => entry.insuranceStatus),
    ...teams.flatMap((team) => team.members.map((member) => member.insuranceStatus))
  ];
  const insuranceType = getInsuranceTypeByMatchType(match.matchType);
  const planId = resolvePlanId(match);
  return {
    ...match,
    matchTypeLabel: formatMatchTypeLabel(match.matchType, match.stageName),
    itemCount: isDailyMatch(match) ? 0 : (match.itemIds ?? []).length,
    participantCount: isDailyMatch(match) ? match.personCount || 0 : studentIds.size,
    teamCount: isDailyMatch(match) ? 0 : teams.length,
    insuranceType,
    insurancePlanId: planId,
    insurancePlan: getInsurancePlanName(planId),
    insuranceMethod: getMatchInsuranceMethod(match),
    reportMethod: getMatchReportMethod(match),
    insuranceStatus: summarizeInsuranceStatus(statuses, isDailyMatch(match) ? '已参保' : '待参保'),
    updateTime: match.updateTime || match.createTime || '-'
  };
}

export function summarizeInsuranceStatus(statuses = [], emptyStatus = '待参保') {
  if (!statuses.length) {
    return emptyStatus;
  }
  const normalized = statuses.map(normalizeInsuranceDisplayStatus);
  if (normalized.every((status) => status === '已参保')) {
    return '已参保';
  }
  return '待参保';
}

export function getRegistrationDetail(matchId) {
  const match = findMatch(matchId);
  if (!match) {
    return null;
  }
  const row = buildMatchRegistrationRow(match);
  const personal = registrationStore.personalEntries.filter((entry) => entry.matchId === matchId);
  const teams = registrationStore.teamEntries.filter((entry) => entry.matchId === matchId);
  const members = teams.flatMap((team) => team.members);
  return {
    ...row,
    insuredCount: [...personal, ...members].filter((entry) => entry.insuranceStatus === '已参保').length,
    pendingCount: [...personal, ...members].filter((entry) => entry.insuranceStatus === '待参保').length,
    exceptionCount: 0,
    itemStats: getItemStats(match),
    personalEntries: personal,
    teamEntries: teams,
    importLogs: registrationStore.importLogs
  };
}

export function getItemStats(match) {
  seedEntries();
  return getMatchLinkedItems(match).map((item) => {
    const personal = registrationStore.personalEntries.filter(
      (entry) => entry.matchId === match.matchId && entry.itemId === item.itemId
    );
    const teams = registrationStore.teamEntries.filter(
      (entry) => entry.matchId === match.matchId && entry.itemId === item.itemId
    );
    const memberStatuses = teams.flatMap((team) => team.members.map((member) => member.insuranceStatus));
    const statuses = [...personal.map((entry) => entry.insuranceStatus), ...memberStatuses];
    return {
      itemId: item.itemId,
      itemName: item.itemName,
      project: item.project,
      matchForm: item.matchForm,
      participantCount: item.matchForm === '个人' ? personal.length : teams.length,
      teamCount: item.matchForm === '团体' ? teams.length : 0,
      memberCount: item.matchForm === '团体' ? teams.reduce((sum, team) => sum + team.members.length, 0) : personal.length,
      insuredCount: statuses.filter((status) => status === '已参保').length,
      insuranceStatus: summarizeInsuranceStatus(statuses),
      scoreStatus: [...personal, ...teams].some((entry) => entry.scoreStatus === '已上传') ? '已上传' : '未上传'
    };
  });
}

export function getActivityFilterOptions() {
  return getActivityOptions();
}

/**
 * 登录人身份数据权限范围（前端原型 Mock）
 * type: education（教育部门）| school（学校）| teacher（教师）| specialist（赛事专员）
 * 默认教育部门账号且 schools 为空表示可查看全部范围。
 */
export const REGISTRATION_ACCOUNT_SCOPE = {
  type: 'education',
  schools: [],
  school: '',
  grade: '',
  classNames: [],
  activityIds: []
};

export function filterParticipantsByAccountScope(rows) {
  const scope = REGISTRATION_ACCOUNT_SCOPE;
  return rows.filter((row) => {
    switch (scope.type) {
      case 'school':
        return row.school === scope.school;
      case 'teacher':
        if (row.school !== scope.school) {
          return false;
        }
        if (scope.grade && row.grade !== scope.grade) {
          return false;
        }
        if (scope.classNames?.length && !scope.classNames.includes(row.className)) {
          return false;
        }
        return true;
      case 'specialist':
        if (scope.activityIds?.length && !scope.activityIds.includes(row.activityId)) {
          return false;
        }
        if (scope.schools?.length && !scope.schools.includes(row.school)) {
          return false;
        }
        return true;
      case 'education':
      default:
        if (scope.schools?.length && !scope.schools.includes(row.school)) {
          return false;
        }
        return true;
    }
  });
}

/** 按登录人身份过滤可报名学生（学校 / 年级 / 班级维度） */
export function filterStudentsByAccountScope(students = STUDENT_OPTIONS) {
  const scope = REGISTRATION_ACCOUNT_SCOPE;
  return students.filter((student) => {
    switch (scope.type) {
      case 'school':
        return student.school === scope.school;
      case 'teacher':
        if (student.school !== scope.school) {
          return false;
        }
        if (scope.grade && student.grade !== scope.grade) {
          return false;
        }
        if (scope.classNames?.length && !scope.classNames.includes(student.className)) {
          return false;
        }
        return true;
      case 'specialist':
      case 'education':
      default:
        if (scope.schools?.length && !scope.schools.includes(student.school)) {
          return false;
        }
        return true;
    }
  });
}

/** 报名 / 导入范围可选学校（受登录人权限约束） */
export function getScopeSchoolOptions() {
  return [...new Set(filterStudentsByAccountScope().map((item) => item.school))];
}

/** 报名 / 导入范围可选年级（按学校联动，受权限约束） */
export function getScopeGradeOptions(school) {
  return [
    ...new Set(
      filterStudentsByAccountScope()
        .filter((item) => !school || item.school === school)
        .map((item) => item.grade)
    )
  ];
}

/** 报名 / 导入范围可选班级（按学校 + 年级联动，受权限约束） */
export function getScopeClassOptions(school, grade) {
  return [
    ...new Set(
      filterStudentsByAccountScope()
        .filter((item) => (!school || item.school === school) && (!grade || item.grade === grade))
        .map((item) => item.className)
    )
  ];
}

/** 选择比赛后自动带出的比赛信息 */
export function getMatchAutoInfo(matchId) {
  const match = findMatch(matchId);
  if (!match) {
    return null;
  }
  const time =
    match.startTime && match.endTime
      ? `${match.startTime} ~ ${match.endTime}`
      : match.startTime || match.endTime || '-';
  return {
    activityName: match.activityName || '-',
    stageName: match.stageName || '-',
    matchTypeLabel: formatMatchTypeLabel(match.matchType, match.stageName),
    matchName: match.matchName || '-',
    matchTime: time
  };
}

/** 选择设项后自动带出的设项信息 */
export function getItemAutoInfo(matchId, itemId) {
  const item = getItemOptionsByMatch(matchId).find((row) => String(row.itemId) === String(itemId));
  if (!item) {
    return null;
  }
  return {
    itemName: item.itemName || '-',
    project: item.project || '-',
    matchForm: item.matchForm || '-'
  };
}

/** 导出名单列（与参赛名单主列表字段保持一致） */
export const PARTICIPANT_EXPORT_COLUMNS = [
  { label: '参赛编号', prop: 'participantNumber' },
  { label: '赛事活动', prop: 'activityName' },
  { label: '赛段', prop: 'stageName' },
  { label: '比赛类型', prop: 'matchTypeLabel' },
  { label: '比赛名称', prop: 'matchName' },
  { label: '设项名称', prop: 'itemName' },
  { label: '参赛项目', prop: 'project' },
  { label: '比赛形式', prop: 'matchForm' },
  { label: '学生姓名', prop: 'studentName' },
  { label: '学校', prop: 'school' },
  { label: '年级', prop: 'grade' },
  { label: '班级', prop: 'className' },
  { label: '班内序号', prop: 'classNo' },
  { label: '队伍名称', prop: 'teamName' },
  { label: '保险状态', prop: 'insuranceStatus' },
  { label: '成绩状态', prop: 'scoreStatus' },
  { label: '报名方式', prop: 'reportMethod' },
  { label: '报名时间', prop: 'registerTime' },
  { label: '更新时间', prop: 'updateTime' }
];

function buildParticipantRow({ rowKey, entry, match, item, student, teamName, matchForm, raw, rowType, teamId }) {
  return {
    rowKey,
    rowType,
    teamId,
    matchId: match.matchId,
    activityId: match.activityId,
    participantNumber: formatParticipantNumberDisplay(entry.participantNumber),
    activityName: match.activityName || '-',
    stageName: match.stageName || '-',
    matchType: match.matchType,
    matchTypeLabel: formatMatchTypeLabel(match.matchType, match.stageName),
    matchName: match.matchName || '-',
    itemName: entry.itemName || item.itemName || '-',
    project: item.project || '-',
    matchForm,
    school: student.school || entry.school || '-',
    grade: student.grade || entry.grade || '-',
    className: student.className || entry.className || '-',
    classNo: student.classNo || entry.classNo || '-',
    studentId: entry.studentId || student.studentId,
    studentName: entry.studentName || student.name || '-',
    teamName: teamName || '-',
    insuranceStatus: normalizeInsuranceDisplayStatus(entry.insuranceStatus || '待参保'),
    scoreStatus: entry.scoreStatus || '未上传',
    reportMethod: getMatchReportMethod(match),
    registerTime: entry.registerTime || '-',
    updateTime: match.updateTime || match.createTime || entry.registerTime || '-',
    raw
  };
}

/**
 * 参赛人员明细（个人逐人一行；团队按成员逐人一行，展示所属队伍名称）
 */
export function getAllRegistrationParticipants() {
  seedEntries();
  const rows = [];
  const matchCache = new Map();
  const resolveMatch = (matchId) => {
    if (!matchCache.has(matchId)) {
      const match = findMatch(matchId);
      matchCache.set(
        matchId,
        match
          ? {
              match,
              itemMap: Object.fromEntries(
                getMatchLinkedItems(match).map((item) => [String(item.itemId), item])
              )
            }
          : null
      );
    }
    return matchCache.get(matchId);
  };

  registrationStore.personalEntries.forEach((entry) => {
    const info = resolveMatch(entry.matchId);
    if (!info) {
      return;
    }
    const item = info.itemMap[String(entry.itemId)] || {};
    const student = STUDENT_OPTIONS.find((s) => s.studentId === entry.studentId) || {};
    rows.push(
      buildParticipantRow({
        rowKey: entry.entryId,
        entry,
        match: info.match,
        item,
        student,
        teamName: '-',
        matchForm: '个人',
        raw: entry,
        rowType: 'personal'
      })
    );
  });

  registrationStore.teamEntries.forEach((team) => {
    const info = resolveMatch(team.matchId);
    if (!info) {
      return;
    }
    const item = info.itemMap[String(team.itemId)] || {};
    (team.members ?? []).forEach((member) => {
      const student = STUDENT_OPTIONS.find((s) => s.studentId === member.studentId) || member;
      rows.push(
        buildParticipantRow({
          rowKey: `${team.teamId}_${member.studentId}`,
          entry: {
            ...member,
            studentName: member.name || member.studentName,
            itemName: team.itemName,
            scoreStatus: team.scoreStatus,
            registerTime: team.registerTime
          },
          match: info.match,
          item,
          student,
          teamName: team.teamName,
          matchForm: '团体',
          raw: { team, member },
          rowType: 'member',
          teamId: team.teamId
        })
      );
    });
  });

  return rows;
}

/** 赛段筛选项（按赛事活动联动） */
export function getStageFilterOptions(activityId) {
  if (!activityId) {
    return [];
  }
  return getStageOptions(activityId);
}

/** 比赛类型筛选可选叶子类型（按赛事活动 + 赛段联动） */
export function getMatchTypeLeafOptionsForStage(activityId, stageName) {
  if (!activityId || !stageName) {
    return [];
  }
  const stage = getStageOptions(activityId).find((item) => item.stageName === stageName);
  return stage ? getMatchTypeOptionsForStage(stage) : [];
}

/** 比赛名称筛选项（按赛事活动 / 赛段 / 比赛类型联动过滤） */
export function getMatchNameFilterOptions({ activityId, stageName, matchType } = {}) {
  let list = getAllMatches();
  if (activityId) {
    list = list.filter((match) => match.activityId === activityId);
  }
  if (stageName) {
    list = list.filter((match) => match.stageName === stageName);
  }
  if (matchType) {
    list = list.filter((match) => matchTypeMatchesLeaf(match.matchType, matchType, match.stageName));
  }
  return [...new Set(list.map((match) => match.matchName).filter(Boolean))];
}

export function getItemOptionsByMatch(matchId) {
  const match = findMatch(matchId);
  return match ? getMatchLinkedItems(match) : [];
}

/** ��据比赛设项比赛形式判断统计表布局：personal-only | team-only | mixed */
export function getMatchItemFormLayout(matchOrId) {
  const match = typeof matchOrId === 'object' ? matchOrId : findMatch(matchOrId);
  if (!match) {
    return 'personal-only';
  }
  const items = getMatchLinkedItems(match);
  if (!items.length) {
    return 'personal-only';
  }
  const hasPersonal = items.some((item) => item.matchForm === '个人');
  const hasTeam = items.some((item) => item.matchForm === '团体');
  if (hasPersonal && hasTeam) {
    return 'mixed';
  }
  if (hasTeam) {
    return 'team-only';
  }
  return 'personal-only';
}

export function addPersonalEntry(payload) {
  const student = STUDENT_OPTIONS.find((item) => item.studentId === payload.studentId);
  if (!student) {
    return null;
  }
  const item = getItemOptionsByMatch(payload.matchId).find((row) => row.itemId === payload.itemId);
  const entry = {
    entryId: `p_${Date.now()}`,
    matchId: payload.matchId,
    itemId: payload.itemId,
    itemName: item?.itemName ?? '',
    matchForm: '个人',
    studentId: student.studentId,
    studentName: student.name,
    idNo: student.idNo,
    gender: student.gender,
    school: student.school,
    grade: student.grade,
    className: student.className,
    classNo: student.classNo,
    gradeClass: student.gradeClass,
    phone: payload.phone || '',
    insuranceStatus: '待参保',
    exceptionReason: '',
    scoreStatus: '未上传',
    remark: payload.remark || '',
    registerTime: currentTimestamp()
  };
  entry.participantNumber = assignStudentParticipantNumber(
    payload.matchId,
    student.studentId,
    payload.participantNumber
  );
  registrationStore.personalEntries.unshift(entry);
  return entry;
}

export function addTeamEntry(payload) {
  const item = getItemOptionsByMatch(payload.matchId).find((row) => row.itemId === payload.itemId);
  const memberParticipantNumbers = payload.memberParticipantNumbers ?? {};
  const members = (payload.memberIds ?? [])
    .map((id) => STUDENT_OPTIONS.find((student) => student.studentId === id))
    .filter(Boolean)
    .map((student) => ({
      ...student,
      insuranceStatus: '待参保',
      exceptionReason: '',
      participantNumber: assignStudentParticipantNumber(
        payload.matchId,
        student.studentId,
        memberParticipantNumbers[student.studentId]
      )
    }));
  const entry = {
    teamId: `t_${Date.now()}`,
    matchId: payload.matchId,
    itemId: payload.itemId,
    itemName: item?.itemName ?? '',
    matchForm: '团体',
    teamName: payload.teamName,
    school: payload.school,
    members,
    scoreStatus: '未上传',
    remark: payload.remark || '',
    registerTime: currentTimestamp()
  };
  registrationStore.teamEntries.unshift(entry);
  return entry;
}

export function isStudentRegistered(matchId, itemId, studentId) {
  seedEntries();
  return registrationStore.personalEntries.some(
    (entry) =>
      entry.matchId === matchId &&
      String(entry.itemId) === String(itemId) &&
      entry.studentId === studentId
  );
}

/** 学生是否已在该比赛设项报名（含个人与团体成员） */
export function isStudentRegisteredInItem(matchId, itemId, studentId) {
  seedEntries();
  if (isStudentRegistered(matchId, itemId, studentId)) {
    return true;
  }
  return registrationStore.teamEntries.some(
    (team) =>
      team.matchId === matchId &&
      String(team.itemId) === String(itemId) &&
      team.members.some((member) => member.studentId === studentId)
  );
}

/** 同一比赛、同一设项下队伍名称是否已存在 */
export function isTeamNameRegisteredInItem(matchId, itemId, teamName) {
  seedEntries();
  const name = String(teamName || '').trim();
  if (!name) {
    return false;
  }
  return registrationStore.teamEntries.some(
    (team) =>
      team.matchId === matchId &&
      String(team.itemId) === String(itemId) &&
      String(team.teamName || '').trim() === name
  );
}

/**
 * 批量为个人设项报名，返回 { added, duplicated }
 */
export function addPersonalEntries(payload) {
  const { matchId, itemId, studentIds = [], remark = '' } = payload;
  const item = getItemOptionsByMatch(matchId).find((row) => String(row.itemId) === String(itemId));
  const added = [];
  const duplicated = [];
  studentIds.forEach((studentId) => {
    const student = STUDENT_OPTIONS.find((row) => row.studentId === studentId);
    if (!student) {
      return;
    }
    if (isStudentRegistered(matchId, itemId, studentId)) {
      duplicated.push(student.name);
      return;
    }
    const entry = {
      entryId: `p_${Date.now()}_${studentId}`,
      matchId,
      itemId,
      itemName: item?.itemName ?? '',
      matchForm: '个人',
      studentId: student.studentId,
      studentName: student.name,
      gender: student.gender,
      idNo: student.idNo,
      school: student.school,
      grade: student.grade,
      className: student.className,
      classNo: student.classNo,
      gradeClass: student.gradeClass,
      phone: student.phone || '',
      insuranceStatus: '待参保',
      exceptionReason: '',
      scoreStatus: '未上传',
      remark,
      registerTime: currentTimestamp()
    };
    entry.participantNumber = assignStudentParticipantNumber(matchId, student.studentId);
    registrationStore.personalEntries.unshift(entry);
    added.push(entry);
  });
  return { added, duplicated };
}

export function removePersonalEntry(entryId) {
  const index = registrationStore.personalEntries.findIndex((entry) => entry.entryId === entryId);
  if (index >= 0) {
    registrationStore.personalEntries.splice(index, 1);
    return true;
  }
  return false;
}

export function removeTeamEntry(teamId) {
  const index = registrationStore.teamEntries.findIndex((entry) => entry.teamId === teamId);
  if (index >= 0) {
    registrationStore.teamEntries.splice(index, 1);
    return true;
  }
  return false;
}

export function updateTeamMembers(teamId, memberIds = []) {
  const team = registrationStore.teamEntries.find((entry) => entry.teamId === teamId);
  if (!team) {
    return null;
  }
  team.members = memberIds
    .map((id) => STUDENT_OPTIONS.find((student) => student.studentId === id))
    .filter(Boolean)
    .map((student) => {
      const exist = team.members.find((member) => member.studentId === student.studentId);
      if (exist) {
        return exist;
      }
      return {
        ...student,
        insuranceStatus: '待参保',
        exceptionReason: '',
        participantNumber: assignStudentParticipantNumber(team.matchId, student.studentId)
      };
    });
  return team;
}

export function getPersonalEntriesByItem(matchId, itemId) {
  seedEntries();
  return registrationStore.personalEntries
    .filter((entry) => entry.matchId === matchId && String(entry.itemId) === String(itemId))
    .map((entry) => ({
      ...entry,
      insuranceStatus: normalizeInsuranceDisplayStatus(entry.insuranceStatus),
      exceptionReason: ''
    }));
}

export function getTeamEntriesByItem(matchId, itemId) {
  seedEntries();
  return registrationStore.teamEntries
    .filter((entry) => entry.matchId === matchId && String(entry.itemId) === String(itemId))
    .map((team) => {
      const members = (team.members ?? []).map((member) => ({
        ...member,
        insuranceStatus: normalizeInsuranceDisplayStatus(member.insuranceStatus),
        exceptionReason: ''
      }));
      return {
        ...team,
        members,
        memberCount: members.length,
        insuredCount: members.filter((member) => member.insuranceStatus === '已参保').length,
        insuranceStatus: summarizeInsuranceStatus(members.map((member) => member.insuranceStatus))
      };
    });
}

/** 比赛参赛名单简要信息（弹窗顶部） */
export function getMatchRosterBrief(matchId) {
  const match = findMatch(matchId);
  if (!match) {
    return null;
  }
  const row = buildMatchRegistrationRow(match);
  return {
    matchId: match.matchId,
    matchName: match.matchName,
    matchTypeLabel: row.matchTypeLabel,
    startTime: match.startTime,
    endTime: match.endTime,
    insuranceType: row.insuranceType,
    insurancePlan: row.insurancePlan,
    insuranceMethod: row.insuranceMethod
  };
}

/** 统一参赛名单行（个人 + 团体） */
export function getMatchRosterRows(matchId) {
  seedEntries();
  const match = findMatch(matchId);
  if (!match) {
    return [];
  }
  const itemMap = Object.fromEntries(
    getMatchLinkedItems(match).map((item) => [String(item.itemId), item])
  );
  const rows = [];
  registrationStore.personalEntries
    .filter((entry) => entry.matchId === matchId)
    .forEach((entry) => {
      const item = itemMap[String(entry.itemId)] || {};
      rows.push({
        rowKey: entry.entryId,
        rowType: 'personal',
        entryId: entry.entryId,
        itemId: entry.itemId,
        itemName: entry.itemName || item.itemName || '-',
        project: item.project || '-',
        matchForm: '个人',
        participantNumber: formatParticipantNumberDisplay(entry.participantNumber),
        targetName: entry.studentName,
        school: entry.school,
        gradeClassOrMemberCount: entry.gradeClass,
        insuredCount: entry.insuranceStatus === '已参保' ? 1 : 0,
        insuranceStatus: normalizeInsuranceDisplayStatus(entry.insuranceStatus),
        scoreStatus: entry.scoreStatus,
        raw: entry
      });
    });
  registrationStore.teamEntries
    .filter((entry) => entry.matchId === matchId)
    .forEach((team) => {
      const item = itemMap[String(team.itemId)] || {};
      const insuredCount = team.members.filter((member) => member.insuranceStatus === '已参保').length;
      rows.push({
        rowKey: team.teamId,
        rowType: 'team',
        teamId: team.teamId,
        itemId: team.itemId,
        itemName: team.itemName || item.itemName || '-',
        project: item.project || '-',
        matchForm: '团体',
        participantNumber: '-',
        targetName: team.teamName,
        school: team.school,
        gradeClassOrMemberCount: String(team.members.length),
        insuredCount,
        insuranceStatus: summarizeInsuranceStatus(team.members.map((member) => member.insuranceStatus)),
        scoreStatus: team.scoreStatus,
        raw: team
      });
    });
  return rows;
}

export function filterMatchRosterRows(rows = [], filters = {}) {
  return rows.filter((row) => {
    if (filters.itemId && String(row.itemId) !== String(filters.itemId)) {
      return false;
    }
    if (filters.school && row.school !== filters.school) {
      return false;
    }
    if (filters.gradeClassPath?.length) {
      const [grade, clazz] = filters.gradeClassPath;
      if (row.rowType === 'personal') {
        if (!row.raw.gradeClass?.includes(grade)) {
          return false;
        }
        if (clazz && !row.raw.gradeClass?.includes(clazz)) {
          return false;
        }
      } else if (
        !row.raw.members?.some(
          (member) => member.gradeClass?.includes(grade) && (!clazz || member.gradeClass?.includes(clazz))
        )
      ) {
        return false;
      }
    }
    if (filters.targetName && !row.targetName.includes(filters.targetName)) {
      return false;
    }
    if (filters.participantNumber) {
      const exact = String(filters.participantNumber).trim().toUpperCase();
      if (exact) {
        if (row.rowType === 'personal') {
          if (String(row.participantNumber || '').toUpperCase() !== exact) {
            return false;
          }
        } else if (
          !(row.raw.members ?? []).some(
            (member) => String(member.participantNumber || '').toUpperCase() === exact
          )
        ) {
          return false;
        }
      }
    }
    if (filters.insuranceStatus && row.insuranceStatus !== filters.insuranceStatus) {
      return false;
    }
    if (filters.scoreStatus && row.scoreStatus !== filters.scoreStatus) {
      return false;
    }
    return true;
  });
}

export function removeTeamMember(teamId, studentId) {
  const team = registrationStore.teamEntries.find((entry) => entry.teamId === teamId);
  if (!team) {
    return false;
  }
  const index = team.members.findIndex((member) => member.studentId === studentId);
  if (index < 0) {
    return false;
  }
  team.members.splice(index, 1);
  return true;
}

export function getGradeClassCascaderOptions() {
  const map = new Map();
  STUDENT_OPTIONS.forEach((student) => {
    if (!map.has(student.grade)) {
      map.set(student.grade, new Set());
    }
    map.get(student.grade).add(student.className);
  });
  return [...map.entries()].map(([grade, classes]) => ({
    value: grade,
    label: grade,
    children: [...classes].map((className) => ({ value: className, label: className }))
  }));
}

/* ---------------- 保险详情 ---------------- */

function resolveRelationScope(match, insuranceType) {
  if (insuranceType === INSURANCE_TYPE_SEMESTER) {
    const plan = findInsurancePlan(resolvePlanId(match));
    const scope = formatPlanSchoolYearSemester(plan);
    if (scope && scope !== '-') {
      return scope;
    }
    const matched = findSemesterPlanByDate(match.startTime);
    return matched ? formatPlanSchoolYearSemester(matched) : '-';
  }
  return match.matchName || '-';
}

function buildInsuranceStudentRow(match, participant, insuranceType, planName, method) {
  const grade = participant.grade || '-';
  const className = participant.className || '-';
  const participantNumber =
    participant.participantNumber ||
    (participant.studentId ? getStudentParticipantNumberInMatch(match.matchId, participant.studentId) : null);
  return {
    studentId: participant.studentId,
    participantNumber: formatParticipantNumberDisplay(participantNumber),
    studentName: participant.studentName || participant.name,
    idNo: participant.idNo,
    school: participant.school,
    grade,
    className,
    gradeClass: participant.gradeClass || (grade !== '-' && className !== '-' ? `${grade} ${className}` : '-'),
    insuranceType,
    insurancePlan: planName,
    insuranceMethod: method,
    relationScope: resolveRelationScope(match, insuranceType),
    insuranceStatus: normalizeInsuranceDisplayStatus(participant.insuranceStatus || '待参保'),
    exceptionReason: '-'
  };
}

function summarizeInsuranceDetail(match, participants, { dedupe = false } = {}) {
  const insuranceType = getInsuranceTypeByMatchType(match.matchType);
  const planName = getInsurancePlanName(resolvePlanId(match));
  const method = getMatchInsuranceMethod(match);
  let list = participants.map((participant) =>
    buildInsuranceStudentRow(match, participant, insuranceType, planName, method)
  );
  if (dedupe) {
    const seen = new Map();
    list.forEach((row) => {
      if (!seen.has(row.studentId)) {
        seen.set(row.studentId, row);
      }
    });
    list = [...seen.values()];
  }
  const statuses = list.map((row) => row.insuranceStatus);
  return {
    summary: {
      insuranceType,
      insurancePlan: planName,
      insuranceMethod: method,
      requiredCount: list.length,
      insuredCount: statuses.filter((s) => s === '已参保').length,
      pendingCount: statuses.filter((s) => s === '待参保').length,
      exceptionCount: 0,
      insuranceStatus: summarizeInsuranceStatus(statuses)
    },
    students: list
  };
}

/**
 * 统一的保险详情入口
 * context: { matchId, scope, itemId, teamId, student }
 * scope: match | item | student | team | member | daily
 */
export function getInsuranceDetail(context = {}) {
  seedEntries();
  const match = findMatch(context.matchId);
  if (!match) {
    return { title: '保险详情', summary: {}, students: [] };
  }
  let participants = [];
  let title = '保险详情';
  const personal = registrationStore.personalEntries.filter((e) => e.matchId === match.matchId);
  const teams = registrationStore.teamEntries.filter((e) => e.matchId === match.matchId);
  if (context.scope === 'student' && context.student) {
    participants = [context.student];
    title = `保险详情 - ${context.student.studentName || context.student.name}`;
  } else if (context.scope === 'member' && context.student) {
    participants = [context.student];
    title = `保险详情 - ${context.student.name || context.student.studentName}`;
  } else if (context.scope === 'team' && context.teamId) {
    const team = teams.find((t) => t.teamId === context.teamId);
    participants = team ? team.members : [];
    title = `保险详情 - ${team?.teamName ?? '团队'}`;
  } else if (context.scope === 'item' && context.itemId) {
    const itemPersonal = personal.filter((e) => String(e.itemId) === String(context.itemId));
    const itemTeams = teams.filter((e) => String(e.itemId) === String(context.itemId));
    participants = [...itemPersonal, ...itemTeams.flatMap((t) => t.members)];
    title = '保险详情 - 设项';
  } else if (context.scope === 'daily' || (isDailyMatch(match) && context.scope === 'match')) {
    const dailyDetail = getDailyRecordDetail(match.matchId);
    participants = dailyDetail?.students || [];
    title = `保险详情 - ${match.matchName}`;
  } else {
    participants = [...personal, ...teams.flatMap((t) => t.members)];
    title = `保险详情 - ${match.matchName}`;
  }
  const dedupe =
    context.scope === 'match' ||
    context.scope === 'daily' ||
    (isDailyMatch(match) && context.scope === 'match') ||
    !context.scope;
  return { title, ...summarizeInsuranceDetail(match, participants, { dedupe }) };
}

/** 每日积分赛参与记录 - 数据权限范围（原型 Mock） */
export const DAILY_RECORD_ACCOUNT_SCOPE = {
  type: 'education',
  school: '第一实验小学',
  grade: '五年级',
  classNames: ['3 班', '1 班']
};

function getDailyParticipatingStudents(matchId) {
  const detail = getDailyRecordDetail(matchId);
  return detail?.students || [];
}

export function getDailyRecordSchoolOptions(matchId) {
  const scope = DAILY_RECORD_ACCOUNT_SCOPE;
  let schools = [...new Set(getDailyParticipatingStudents(matchId).map((item) => item.school))];
  if (scope.type === 'school' || scope.type === 'teacher') {
    schools = schools.filter((item) => item === scope.school);
  }
  return schools;
}

export function getDailyRecordGradeOptions(matchId, school = '') {
  const scope = DAILY_RECORD_ACCOUNT_SCOPE;
  let students = getDailyParticipatingStudents(matchId);
  if (school) {
    students = students.filter((item) => item.school === school);
  }
  let grades = [...new Set(students.map((item) => item.grade))];
  if (scope.type === 'teacher' && (!school || school === scope.school)) {
    grades = grades.filter((item) => item === scope.grade);
  }
  return grades;
}

export function getDailyRecordClassOptions(matchId, school = '', grade = '') {
  const scope = DAILY_RECORD_ACCOUNT_SCOPE;
  let students = getDailyParticipatingStudents(matchId);
  if (school) {
    students = students.filter((item) => item.school === school);
  }
  if (grade) {
    students = students.filter((item) => item.grade === grade);
  }
  let classes = [...new Set(students.map((item) => item.className))];
  if (scope.type === 'teacher' && (!school || school === scope.school) && (!grade || grade === scope.grade)) {
    classes = classes.filter((item) => scope.classNames.includes(item));
  }
  return classes;
}

/* ---------------- 每日积分赛参与记录 ---------------- */

export function getDailyMatches() {
  return getAllMatches().filter((match) => isDailyMatch(match));
}

const DAILY_POINT_DETAIL_SAMPLE = [
  { time: '2026-06-28 08:20', source: '体育课', points: 5, relation: '一年级体育课记录', remark: '课堂表现优秀' },
  { time: '2026-06-27 10:05', source: '大课间', points: 3, relation: '大课间跳绳', remark: '-' },
  { time: '2026-06-26 16:40', source: 'AI运动', points: 4, relation: 'AI运动-开合跳', remark: '设备采集' },
  { time: '2026-06-25 09:15', source: '体育作业', points: 2, relation: '体育作业打卡', remark: '-' }
];

export function getDailyRecordDetail(matchId) {
  seedEntries();
  const match = findMatch(matchId);
  if (!match) {
    return null;
  }
  const insuranceType = getInsuranceTypeByMatchType(match.matchType);
  const planName = getInsurancePlanName(resolvePlanId(match));
  const method = getMatchInsuranceMethod(match);
  const students = STUDENT_OPTIONS.slice(0, 5).map((student, index) => {
    const details = DAILY_POINT_DETAIL_SAMPLE.map((row, i) => ({
      ...row,
      points: row.points + ((index + i) % 3)
    }));
    const total = details.reduce((sum, row) => sum + row.points, 0);
    const insuranceStatus = index === 3 ? '待参保' : '已参保';
    return {
      studentId: student.studentId,
      studentName: student.name,
      school: student.school,
      grade: student.grade,
      className: student.className,
      gradeClass: student.gradeClass,
      idNo: student.idNo,
      totalPoints: total,
      latestPoints: details[0].points,
      latestTime: details[0].time,
      insuranceStatus,
      exceptionReason: '',
      details
    };
  });
  const schools = new Set(students.map((s) => s.school));
  const statuses = students.map((s) => s.insuranceStatus);
  return {
    matchId: match.matchId,
    activityName: match.activityName,
    stageName: match.stageName,
    matchTypeLabel: formatMatchTypeLabel(match.matchType, match.stageName),
    matchName: match.matchName,
    period: `${match.startTime || ''} 至 ${match.endTime || ''}`,
    insuranceType,
    insurancePlan: planName,
    insuranceMethod: method,
    stats: {
      studentCount: students.length,
      schoolCount: schools.size,
      recordCount: students.reduce((sum, s) => sum + s.details.length, 0),
      totalPoints: students.reduce((sum, s) => sum + s.totalPoints, 0),
      insuredCount: statuses.filter((s) => s === '已参保').length,
      pendingCount: statuses.filter((s) => s === '待参保').length,
      exceptionCount: 0
    },
    students
  };
}

export const PERSONAL_IMPORT_FIELDS = [
  '学校',
  '年级',
  '班级',
  '班内序号',
  '学生姓名',
  '参赛编号',
  '性别',
  '联系电话',
  '备注'
];

export const TEAM_IMPORT_FIELDS = [
  '学校',
  '年级',
  '班级',
  '班内序号',
  '团队名称',
  '成员姓名',
  '成员参赛编号',
  '联系电话',
  '备注'
];
