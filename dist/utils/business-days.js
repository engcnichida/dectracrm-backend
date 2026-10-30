"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrazilianHolidays = getBrazilianHolidays;
exports.isBusinessDay = isBusinessDay;
exports.getNextBusinessDay = getNextBusinessDay;
exports.formatDateISO = formatDateISO;
function getBrazilianHolidays(year) {
    const holidays = [];
    holidays.push(new Date(year, 0, 1));
    holidays.push(new Date(year, 3, 21));
    holidays.push(new Date(year, 4, 1));
    holidays.push(new Date(year, 8, 7));
    holidays.push(new Date(year, 9, 12));
    holidays.push(new Date(year, 10, 2));
    holidays.push(new Date(year, 10, 15));
    holidays.push(new Date(year, 11, 25));
    const easter = calculateEaster(year);
    const carnivalMonday = new Date(easter);
    carnivalMonday.setDate(easter.getDate() - 48);
    holidays.push(carnivalMonday);
    const carnivalTuesday = new Date(easter);
    carnivalTuesday.setDate(easter.getDate() - 47);
    holidays.push(carnivalTuesday);
    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2);
    holidays.push(goodFriday);
    const corpusChristi = new Date(easter);
    corpusChristi.setDate(easter.getDate() + 60);
    holidays.push(corpusChristi);
    return holidays;
}
function calculateEaster(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
}
function isBusinessDay(date) {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6)
        return false;
    const year = date.getFullYear();
    const holidays = getBrazilianHolidays(year);
    const dateStr = date.toDateString();
    return !holidays.some(h => h.toDateString() === dateStr);
}
function getNextBusinessDay(date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    let maxAttempts = 10;
    while (!isBusinessDay(result) && maxAttempts > 0) {
        result.setDate(result.getDate() + 1);
        maxAttempts--;
    }
    return result;
}
function formatDateISO(date) {
    return date.toISOString().split('T')[0];
}
//# sourceMappingURL=business-days.js.map