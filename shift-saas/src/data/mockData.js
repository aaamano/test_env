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
  12: [SP.X,   SP.X,   SP.X,   SP.O14, SP.X,   SP.X,   SP.X,   SP.O15, SP.O14, SP.X,   SP['1218'],SP.X,SP.X,   SP.X,   SP.X],
  13: [SP['1020'],SP.X,SP['1020'],SP.X,SP.X,    SP.X,   SP.X,   SP['1020'],SP.X,SP['1020'],SP.X,SP.X,   SP.X,   SP['1019'],SP['1020']],
  14: [SP.X,   SP.X,   SP.X,   SP['921'],SP['917'],SP.X,SP['916'],SP.X,SP['921'],SP['916'],SP['9175'],SP['921'],SP.X,SP['918'],SP.X],
  15: [SP['1116'],SP.X,SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP['1116'],SP['1116'],SP.X,SP.X,  SP.X],
  16: [SP.X,   SP['175L'],SP.X,SP['175L'],SP.X,SP['175L'],SP.X,SP['175L'],SP.X,  SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X],
  17: [SP.X,   SP['11L'],SP['11L'],SP.X,SP.X,   SP.X,   SP.X,   SP['14L'],SP['14L'],SP['14L'],SP.X,SP.X,  SP.X,   SP['14L'],SP['14L']],
  18: [SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X,   SP.X],
  19: [SP.X,   SP['1820'],SP.X,SP['1820'],SP['1820'],SP['15L'],SP.X,SP['1820'],SP['1520'],SP.X,SP['1820'],SP.X,SP['15L'],SP['1520'],SP.X],
  20: [SP.X,   SP.X,   SP.X,   SP.X,   SP['17L'],SP.X, SP.X,   SP.X,   SP.X,   SP['17L'],SP['17L'],SP.X,SP['17L'],SP.X,  SP.X],
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

// staffId -> { incompatible: [{staffId, severity}], targetEarnings: number, retentionPriority: 1-10 }
export const staffConstraints = {
  1:  { incompatible: [],                                            targetEarnings: 250000, retentionPriority: 1 },
  2:  { incompatible: [],                                            targetEarnings: 220000, retentionPriority: 2 },
  3:  { incompatible: [{ staffId: 4, severity: 2 }],                targetEarnings: 85000,  retentionPriority: 3 },
  4:  { incompatible: [{ staffId: 3, severity: 2 }],                targetEarnings: 70000,  retentionPriority: 7 },
  5:  { incompatible: [],                                            targetEarnings: 60000,  retentionPriority: 6 },
  6:  { incompatible: [],                                            targetEarnings: 110000, retentionPriority: 2 },
  7:  { incompatible: [{ staffId: 16, severity: 1 }],               targetEarnings: 55000,  retentionPriority: 8 },
  8:  { incompatible: [],                                            targetEarnings: 75000,  retentionPriority: 5 },
  9:  { incompatible: [],                                            targetEarnings: 50000,  retentionPriority: 9 },
  10: { incompatible: [{ staffId: 13, severity: 3 }],               targetEarnings: 80000,  retentionPriority: 4 },
  11: { incompatible: [],                                            targetEarnings: 45000,  retentionPriority: 10 },
  12: { incompatible: [],                                            targetEarnings: 65000,  retentionPriority: 7 },
  13: { incompatible: [{ staffId: 10, severity: 3 }],               targetEarnings: 72000,  retentionPriority: 4 },
  14: { incompatible: [],                                            targetEarnings: 68000,  retentionPriority: 6 },
  15: { incompatible: [],                                            targetEarnings: 58000,  retentionPriority: 8 },
  16: { incompatible: [{ staffId: 7, severity: 1 }],                targetEarnings: 42000,  retentionPriority: 9 },
  17: { incompatible: [],                                            targetEarnings: 55000,  retentionPriority: 7 },
  18: { incompatible: [],                                            targetEarnings: 40000,  retentionPriority: 10 },
  19: { incompatible: [],                                            targetEarnings: 90000,  retentionPriority: 3 },
  20: { incompatible: [],                                            targetEarnings: 60000,  retentionPriority: 8 },
  21: { incompatible: [],                                            targetEarnings: 120000, retentionPriority: 2 },
}
