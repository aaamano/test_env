export const STORE_NAME = 'Segafredo ZANETTI 新宿三丁目店'
export const YEAR_MONTH = '2026年4月'

export const staff = [
  { id: 1,  name: '金子 光男',       type: 'F',    role: 'マネージャー', skills: ['barista', 'cashier', 'floor'], hourlyOrders: 12, wage: 1250 },
  { id: 2,  name: '澤井 詩議',       type: 'F',    role: 'サブマネージャー', skills: ['barista', 'cashier'], hourlyOrders: 11, wage: 1200 },
  { id: 3,  name: '吉田 郁美',       type: 'P',    role: 'スタッフ',     skills: ['barista', 'cashier', 'floor'], hourlyOrders: 9,  wage: 1050 },
  { id: 4,  name: '岩間 康尚',       type: 'P',    role: 'スタッフ',     skills: ['cashier', 'floor'],             hourlyOrders: 8,  wage: 1050 },
  { id: 5,  name: '杉崎 浩枝',       type: 'P',    role: 'スタッフ',     skills: ['cashier'],                      hourlyOrders: 7,  wage: 1050 },
  { id: 6,  name: 'スクアルチナ マルコ', type: 'P', role: 'バリスタ',   skills: ['barista', 'cashier', 'floor'], hourlyOrders: 13, wage: 1100 },
  { id: 7,  name: '二関 大地',       type: 'P',    role: 'スタッフ',     skills: ['floor'],                        hourlyOrders: 7,  wage: 1050 },
  { id: 8,  name: '松井 華乃',       type: 'P',    role: 'スタッフ',     skills: ['cashier', 'floor'],             hourlyOrders: 8,  wage: 1050 },
  { id: 9,  name: '堀内 省吾',       type: 'P',    role: 'スタッフ',     skills: ['floor'],                        hourlyOrders: 6,  wage: 1030 },
  { id: 10, name: '崔 恩雄',         type: 'P',    role: 'スタッフ',     skills: ['barista', 'floor'],             hourlyOrders: 9,  wage: 1050 },
  { id: 11, name: 'クイ',            type: 'P',    role: 'スタッフ',     skills: ['floor'],                        hourlyOrders: 6,  wage: 1030 },
  { id: 12, name: '吉冨 寛大',       type: 'P',    role: 'スタッフ',     skills: ['cashier', 'floor'],             hourlyOrders: 7,  wage: 1050 },
  { id: 13, name: '譚木 りさ',       type: 'P',    role: 'スタッフ',     skills: ['barista', 'cashier'],           hourlyOrders: 8,  wage: 1050 },
  { id: 14, name: '飯田 奈洋美',     type: 'P',    role: 'スタッフ',     skills: ['cashier', 'floor'],             hourlyOrders: 8,  wage: 1050 },
  { id: 15, name: '若林 百央',       type: 'P',    role: 'スタッフ',     skills: ['barista'],                      hourlyOrders: 7,  wage: 1050 },
  { id: 16, name: '吉野 友吾',       type: 'P',    role: 'スタッフ',     skills: ['floor'],                        hourlyOrders: 6,  wage: 1030 },
  { id: 17, name: 'サラ',            type: 'P',    role: 'スタッフ',     skills: ['cashier', 'floor'],             hourlyOrders: 7,  wage: 1050 },
  { id: 18, name: 'アイリーン',      type: 'P',    role: 'スタッフ',     skills: ['floor'],                        hourlyOrders: 6,  wage: 1030 },
  { id: 19, name: 'エミリー',        type: 'P',    role: 'バリスタ',     skills: ['barista', 'cashier'],           hourlyOrders: 10, wage: 1080 },
  { id: 20, name: '薬方 咲',         type: 'P',    role: 'スタッフ',     skills: ['cashier', 'floor'],             hourlyOrders: 7,  wage: 1050 },
  { id: 21, name: '佐藤 慧',         type: 'F',    role: 'スタッフ',     skills: ['barista', 'cashier', 'floor'], hourlyOrders: 9,  wage: 1080 },
]

const DAYS_IN_MONTH = 15 // 前半シフト
const DOW = ['水','木','金','土','日','月','火','水','木','金','土','日','月','火','水']

export const daysConfig = Array.from({ length: DAYS_IN_MONTH }, (_, i) => ({
  day: i + 1,
  dow: DOW[i],
  isWeekend: ['土','日'].includes(DOW[i]),
}))

// Shift patterns per staff (simplified)
const SP = {
  F: 'F', X: 'X', O16: 'O-16', O14: 'O-14', O18: 'O-18',
  '918': '9-18', '1018': '10-18', '1020': '10-20', '1116': '11-16',
  '1318': '13-18', '13L': '13-L', '11L': '11-L', '14L': '14-L',
  '175L': '17.5-L', '1820': '18-L', '1116b': '11-16', '1519': '15-19',
  '913': '9-13',
}

export const shiftData = {
  1:  [SP.F,   SP.F,   SP.F,   SP.F,   SP.X,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F],
  2:  [SP.F,   SP.X,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F],
  3:  [SP.X,   SP['918'],SP.X, SP.X,   SP.X,   SP['918'],SP.X,  SP['918'],SP['913'],SP.X, SP.X,   SP.X,   SP['918'],SP['918'],SP['918']],
  4:  [SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X],
  5:  [SP.X,   SP.X,   SP['13L'],SP['13L'],SP.X,SP.X,   SP.X,   SP.X,   SP.X,   SP['13L'],SP['13L'],SP.X, SP.X,   SP.X,   SP.X],
  6:  [SP.O16, SP.O16, SP.X,   SP.O18, SP.O18, SP.X,   SP.O16, SP.O16, SP.O16, SP.X,   SP.O18, SP.O18, SP.X,   SP.O16, SP.X],
  7:  [SP.X,   SP.X,   SP.X,   SP['13L'],SP['14L'],SP['14L'],SP.X,SP.X, SP.X,   SP.X,   SP['13L'],SP['14L'],SP['14L'],SP.X, SP.X],
  8:  [SP.O16, SP.O16, SP.O14, SP.O14, SP.X,   SP.X,   SP.O16, SP.O16, SP.O16, SP.X,   SP.X,   SP.X,   SP.O16, SP.X,   SP.O16],
  9:  [SP.X,   SP['13L'],SP['13L'],SP['11L'],SP['14L'],SP.X,   SP.X,   SP['13L'],SP['13L'],SP['13L'],SP['11L'],SP['11L'],SP.X,SP.X,SP['13L']],
  10: [SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X],
  11: [SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X],
  12: [SP.X,   SP.X,   SP.X,   SP.O14, SP.X,   SP.X,   SP.X,   SP.O16, SP.O14, SP.X,   SP['1116'],SP.X,SP.X,   SP.X,   SP.X],
  13: [SP['1020'],SP.X,SP['1020'],SP.X,SP.X,    SP.X,   SP.X,   SP['1020'],SP.X,SP['1020'],SP.X,SP.X,   SP.X,   SP['1116'],SP['1020']],
  14: [SP.X,   SP.X,   SP.X,   SP['913'],SP['918'],SP.X,SP['918'],SP.X,SP['913'],SP['918'],SP['1116'],SP['913'],SP.X,SP['918'],SP.X],
  15: [SP['1116'],SP.X,SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP['1116'],SP['1116'],SP.X,SP.X,  SP.X],
  16: [SP.X,   SP['175L'],SP.X,SP['175L'],SP.X,SP['175L'],SP.X,SP['175L'],SP.X,  SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X],
  17: [SP.X,   SP['11L'],SP['11L'],SP.X,SP.X,   SP.X,   SP.X,   SP['14L'],SP['14L'],SP['14L'],SP.X,SP.X,  SP.X,   SP['14L'],SP['14L']],
  18: [SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X],
  19: [SP.X,   SP['1820'],SP.X,SP['1820'],SP['1820'],SP['13L'],SP.X,SP['1820'],SP['1519'],SP.X,SP['1820'],SP.X,SP['13L'],SP['1519'],SP.X],
  20: [SP.X,   SP.X,   SP.X,   SP.X,   SP['14L'],SP.X, SP.X,   SP.X,   SP.X,   SP['14L'],SP['14L'],SP.X,SP['14L'],SP.X,  SP.X],
  21: [SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.F,   SP.X,   SP.F,   SP.F,   SP.F],
}

export const dailyTargets = [
  { day: 1,  dow: '水', sales: 420, customers: 140, avgSpend: 3000, orders: 210 },
  { day: 2,  dow: '木', sales: 410, customers: 137, avgSpend: 2993, orders: 205 },
  { day: 3,  dow: '金', sales: 480, customers: 160, avgSpend: 3000, orders: 240 },
  { day: 4,  dow: '土', sales: 620, customers: 206, avgSpend: 3010, orders: 310 },
  { day: 5,  dow: '日', sales: 590, customers: 196, avgSpend: 3010, orders: 295 },
  { day: 6,  dow: '月', sales: 380, customers: 126, avgSpend: 3016, orders: 190 },
  { day: 7,  dow: '火', sales: 370, customers: 123, avgSpend: 3008, orders: 185 },
  { day: 8,  dow: '水', sales: 415, customers: 138, avgSpend: 3007, orders: 207 },
  { day: 9,  dow: '木', sales: 405, customers: 135, avgSpend: 3000, orders: 202 },
  { day: 10, dow: '金', sales: 475, customers: 158, avgSpend: 3006, orders: 237 },
  { day: 11, dow: '土', sales: 650, customers: 216, avgSpend: 3009, orders: 325 },
  { day: 12, dow: '日', sales: 610, customers: 203, avgSpend: 3004, orders: 305 },
  { day: 13, dow: '月', sales: 360, customers: 120, avgSpend: 3000, orders: 180 },
  { day: 14, dow: '火', sales: 355, customers: 118, avgSpend: 3008, orders: 177 },
  { day: 15, dow: '水', sales: 425, customers: 141, avgSpend: 3014, orders: 212 },
]

// For the shift decision screen – staff availability per time slot
export const timeSlots = ['9:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00']

export const assignedShifts = {
  // day -> { slot -> [staffId, ...] }
  1: {
    '9:00':  [1, 2, 3],
    '10:00': [1, 2, 3, 6],
    '11:00': [1, 2, 3, 6, 8],
    '12:00': [1, 2, 3, 6, 8, 9],
    '13:00': [1, 2, 6, 8, 7, 14],
    '14:00': [2, 6, 8, 7, 14, 17],
    '15:00': [2, 6, 7, 14, 17, 19],
    '16:00': [2, 7, 14, 17, 19],
    '17:00': [2, 14, 17, 19, 20],
    '18:00': [2, 14, 17, 19],
    '19:00': [2, 17, 19],
    '20:00': [2, 19],
    '21:00': [2],
  },
}

export const availableForSlot = (day, slot) => {
  // Returns staff who are working that day and cover that time
  return staff.filter(s => {
    const sd = shiftData[s.id]
    if (!sd) return false
    const code = sd[day - 1]
    if (!code || code === 'X') return false
    return true
  })
}

export const skillLabels = {
  barista: 'バリスタ',
  cashier: 'レジ',
  floor:   'フロア',
}

// ─── New additions ──────────────────────────────────────────────────────────

export const storeConfig = {
  openHour: 9,
  closeHour: 23,
  slotInterval: 15, // minutes
  avgProductivity: 8, // orders processed per staff per hour
  specialTasks: [
    { id: 1, name: '搬入',  startTime: '9:00',  endTime: '9:45',  requiredStaff: 2, colorKey: 'orange', enabled: true },
    { id: 2, name: '掃除',  startTime: '22:00', endTime: '22:45', requiredStaff: 2, colorKey: 'purple', enabled: true },
  ],
}

export const staffConstraints = {
  1:  { incompatible: [], targetEarnings: 0, retentionPriority: 1 },
  2:  { incompatible: [], targetEarnings: 0, retentionPriority: 2 },
  3:  { incompatible: [{ staffId: 7, severity: 3 }], targetEarnings: 120000, retentionPriority: 3 },
  4:  { incompatible: [], targetEarnings: 80000, retentionPriority: 5 },
  5:  { incompatible: [{ staffId: 9, severity: 1 }], targetEarnings: 60000, retentionPriority: 8 },
  6:  { incompatible: [], targetEarnings: 100000, retentionPriority: 3 },
  7:  { incompatible: [{ staffId: 3, severity: 3 }, { staffId: 12, severity: 2 }], targetEarnings: 70000, retentionPriority: 7 },
  8:  { incompatible: [], targetEarnings: 80000, retentionPriority: 6 },
  9:  { incompatible: [{ staffId: 5, severity: 1 }], targetEarnings: 50000, retentionPriority: 9 },
  10: { incompatible: [], targetEarnings: 90000, retentionPriority: 4 },
  11: { incompatible: [], targetEarnings: 60000, retentionPriority: 10 },
  12: { incompatible: [{ staffId: 7, severity: 2 }], targetEarnings: 75000, retentionPriority: 7 },
  13: { incompatible: [], targetEarnings: 100000, retentionPriority: 4 },
  14: { incompatible: [], targetEarnings: 80000, retentionPriority: 6 },
  15: { incompatible: [], targetEarnings: 70000, retentionPriority: 8 },
  16: { incompatible: [], targetEarnings: 65000, retentionPriority: 9 },
  17: { incompatible: [], targetEarnings: 70000, retentionPriority: 7 },
  18: { incompatible: [], targetEarnings: 60000, retentionPriority: 10 },
  19: { incompatible: [], targetEarnings: 90000, retentionPriority: 5 },
  20: { incompatible: [], targetEarnings: 75000, retentionPriority: 8 },
  21: { incompatible: [], targetEarnings: 0, retentionPriority: 2 },
}

// Fraction of daily orders occurring each hour (9-22, values sum to 1.0)
export const ORDER_DISTRIBUTION = {
  9:  0.05,
  10: 0.07,
  11: 0.09,
  12: 0.13,
  13: 0.12,
  14: 0.08,
  15: 0.07,
  16: 0.07,
  17: 0.08,
  18: 0.09,
  19: 0.08,
  20: 0.05,
  21: 0.02,
  22: 0.00,
}

export const allStores = [
  { id: 1, name: '新宿三丁目店', status: 'active' },
  { id: 2, name: '渋谷店',       status: 'soon' },
  { id: 3, name: '原宿店',       status: 'soon' },
]

/**
 * Generate time slot labels for a given interval (minutes) and hour range.
 * Returns array like ['9:00', '9:30', '10:00', ...]
 */
export function generateSlots(interval = 60, startHour = 9, endHour = 23) {
  const slots = []
  const totalMinutes = (endHour - startHour) * 60
  const steps = totalMinutes / interval
  for (let i = 0; i < steps; i++) {
    const totalMins = startHour * 60 + i * interval
    const h = Math.floor(totalMins / 60)
    const m = totalMins % 60
    slots.push(`${h}:${m === 0 ? '00' : m < 10 ? '0' + m : m}`)
  }
  return slots
}

/**
 * Parse a shift code like '9-18', '13-L', 'O-16', 'F' into {start, end} hours.
 * Returns null for 'X' or unknown codes.
 */
export function parseShiftTimes(code) {
  if (!code || code === 'X') return null
  if (code === 'F') return { start: 9, end: 23 }
  // Open shifts like O-16, O-18, O-14 → start at 9, end at the number
  const openMatch = code.match(/^O-(\d+(?:\.\d+)?)$/)
  if (openMatch) return { start: 9, end: parseFloat(openMatch[1]) }
  // Time range like '9-18', '13-L', '17.5-L', '11-16'
  const rangeMatch = code.match(/^(\d+(?:\.\d+)?)[.-](\d+(?:\.\d+)?|L)$/)
  if (rangeMatch) {
    return {
      start: parseFloat(rangeMatch[1]),
      end: rangeMatch[2] === 'L' ? 23 : parseFloat(rangeMatch[2]),
    }
  }
  return { start: 9, end: 18 }
}

/**
 * Calculate required staff count for a given hour slot.
 * @param {number} dailyOrders - total orders for the day
 * @param {number} hour - hour of day (e.g. 12 for 12:00)
 * @param {number} avgProductivity - orders per staff per hour
 * @param {number} extraStaff - additional staff from special tasks
 */
export function calcRequiredStaff(dailyOrders, hour, avgProductivity = 8, extraStaff = 0) {
  const fraction = ORDER_DISTRIBUTION[hour] ?? 0
  const ordersThisHour = dailyOrders * fraction
  const base = Math.ceil(ordersThisHour / avgProductivity)
  return Math.max(1, base) + extraStaff
}

export const shiftSubmissions = [
  {
    id: 1,
    period: '2026年4月 前半',
    submittedAt: '2026-03-25 14:32',
    lastEditedAt: '2026-03-25 14:32',
    status: 'confirmed',
    shiftRow: [...shiftData[1]],
  },
  {
    id: 2,
    period: '2026年4月 後半',
    submittedAt: '2026-04-05 09:15',
    lastEditedAt: '2026-04-05 09:15',
    status: 'submitted',
    shiftRow: [...shiftData[2]],
  },
  {
    id: 3,
    period: '2026年5月 前半',
    submittedAt: null,
    lastEditedAt: '2026-04-18 22:01',
    status: 'draft',
    shiftRow: Array.from({ length: 15 }, () => 'X'),
  },
]

export const managerNotifications = [
  { id: 1, type: 'submit',  text: '金子 光男 さんからシフト提出がありました',              sub: '2026年5月 前半',    time: '5分前',        read: false },
  { id: 2, type: 'alert',   text: 'シフト確定前日です。シフト確定がまだ完了していません。', sub: '4月前半シフト',     time: '1時間前',      read: false },
  { id: 3, type: 'warning', text: '必要工数が不足している日があります（4/8, 4/12）',        sub: '4月前半シフト',     time: '本日 9:00',    read: false },
  { id: 4, type: 'submit',  text: '山田 太郎 さんからシフト提出がありました',              sub: '2026年5月 前半',    time: '昨日 18:32',   read: true  },
  { id: 5, type: 'info',    text: '2026年5月 前半のシフト提出期限が3日後です',             sub: '期限: 4月23日',     time: '昨日 10:00',   read: true  },
]

export const employeeNotifications = [
  { id: 1, type: 'reminder',   text: 'シフト確定前日です。シフト提出がまだです。',  sub: '2026年5月 前半',              time: '2時間前',     read: false },
  { id: 2, type: 'confirmed',  text: '2026年4月 前半のシフトが確定しました',      sub: 'マネージャーが確定しました',   time: '昨日 14:30',  read: false },
  { id: 3, type: 'info',       text: '2026年5月 前半のシフト提出期限は4月23日です', sub: 'あと3日',                    time: '3日前',       read: true  },
]
