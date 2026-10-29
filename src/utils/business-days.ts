/**
 * Calcula feriados nacionais brasileiros para um determinado ano
 * Inclindo feriados fixos e móveis (baseados na Páscoa)
 */
export function getBrazilianHolidays(year: number): Date[] {
  const holidays: Date[] = [];

  // ===== FERIADOS FIXOS =====
  holidays.push(new Date(year, 0, 1));   // Confraternização Universal (01/01)
  holidays.push(new Date(year, 3, 21));  // Tiradentes (21/04)
  holidays.push(new Date(year, 4, 1));   // Dia do Trabalho (01/05)
  holidays.push(new Date(year, 8, 7));   // Independência do Brasil (07/09)
  holidays.push(new Date(year, 9, 12));  // Nossa Senhora Aparecida (12/10)
  holidays.push(new Date(year, 10, 2));  // Finados (02/11)
  holidays.push(new Date(year, 10, 15)); // Proclamação da República (15/11)
  holidays.push(new Date(year, 11, 25)); // Natal (25/12)

  // ===== FERIADOS MÓVEIS (baseados na Páscoa) =====
  const easter = calculateEaster(year);
  
  // Carnaval: 47 e 48 dias antes da Páscoa (segunda e terça)
  const carnivalMonday = new Date(easter);
  carnivalMonday.setDate(easter.getDate() - 48);
  holidays.push(carnivalMonday);
  
  const carnivalTuesday = new Date(easter);
  carnivalTuesday.setDate(easter.getDate() - 47);
  holidays.push(carnivalTuesday);
  
  // Sexta-feira Santa: 2 dias antes da Páscoa
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  holidays.push(goodFriday);
  
  // Corpus Christi: 60 dias depois da Páscoa
  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 60);
  holidays.push(corpusChristi);

  return holidays;
}

/**
 * Algoritmo de Meeus/Jones/Butcher para calcular a Páscoa
 */
function calculateEaster(year: number): Date {
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

/**
 * Verifica se uma data é dia útil no Brasil
 */
export function isBusinessDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  
  // Sábado (6) ou Domingo (0) não são dias úteis
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;
  
  // Verifica feriados nacionais
  const year = date.getFullYear();
  const holidays = getBrazilianHolidays(year);
  const dateStr = date.toDateString();
  
  return !holidays.some(h => h.toDateString() === dateStr);
}

/**
 * Retorna a próxima data útil a partir de uma data fornecida
 * Se a data já for dia útil, retorna a própria data
 */
export function getNextBusinessDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  
  let maxAttempts = 10; // Evita loop infinito
  while (!isBusinessDay(result) && maxAttempts > 0) {
    result.setDate(result.getDate() + 1);
    maxAttempts--;
  }
  
  return result;
}

/**
 * Formata data para string ISO (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}