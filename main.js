//TODO add imports if needed
//TODO doc

/**
 * Hlavní funkce aplikace.
 * 1) Vygeneruje náhodné zaměstnance podle dtoIn.
 * 2) Spočítá statistiky nad seznamem zaměstnanců.
 *
 * @param {object} dtoIn obsahuje:
 *  - count: počet zaměstnanců
 *  - age: objekt s hranicemi věku { min, max }
 * @returns {object} dtoOut obsahující požadované statistiky
 */
export function main(dtoIn) {
  const employees = generateEmployeeData(dtoIn);
  const dtoOut = getEmployeeStatistics(employees);
  return dtoOut;
}

// Konstanta pro přepočet věku na milisekundy – 365 dní v roce
const MS_IN_YEAR = 365 * 24 * 60 * 60 * 1000;

// Seznamy jmen a příjmení (stejné jako v úkolu 3)
// prettier-ignore
const MALE_NAMES = ["Jan","Petr","Tomáš","Lukáš","Jakub","Adam","Matěj","Michal","Filip","David"];
// prettier-ignore
const FEMALE_NAMES = ["Anna","Eliška","Adéla","Tereza","Karolína","Lucie","Kristýna","Marie","Veronika","Kateřina"];
// prettier-ignore
const MALE_SURNAMES = ["Vomáčka","Svoboda","Dvořák","Černý","Procházka","Kučera","Horák","Beneš","Fiala","Sedláček"];
// prettier-ignore
const FEMALE_SURNAMES = ["Nováková","Svobodová","Dvořáková","Černá","Procházková","Kučerová","Horáková","Benešová","Fialová","Sedláčková"];

const WORKLOADS = [10, 20, 30, 40];
const GENDERS = ["male", "female"];

/**
 * Pomocná funkce: validuje dtoIn a vrátí základní hodnoty.
 *
 * @param {object} dtoIn vstup podle zadání
 * @returns {{count:number, minAge:number, maxAge:number}}
 */
function parseDtoIn(dtoIn) {
  if (!dtoIn || typeof dtoIn !== "object") {
    throw new Error("Vstup dtoIn musí být objekt.");
  }

  const count = dtoIn.count;
  const age = dtoIn.age;

  if (!Number.isInteger(count) || count <= 0) {
    throw new Error("Počet zaměstnanců musí být kladné celé číslo.");
  }

  if (!age || typeof age.min !== "number" || typeof age.max !== "number") {
    throw new Error("Vstup dtoIn.age musí obsahovat číselné min a max.");
  }

  const minAge = age.min;
  const maxAge = age.max;

  if (minAge < 0 || maxAge < minAge) {
    throw new Error("Zadaný věkový interval není platný.");
  }

  return { count, minAge, maxAge };
}

/**
 * Vrátí náhodný prvek z daného pole.
 *
 * @param {Array} array vstupní pole
 * @returns {*} náhodný prvek
 */
function getRandomFromArray(array) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

/**
 * Vygeneruje jednoho náhodného zaměstnance.
 *
 * @param {number} minAge minimální věk
 * @param {number} maxAge maximální věk
 * @param {Date} today referenční datum (dnešek)
 * @returns {{gender:string, birthdate:string, name:string, surname:string, workload:number}}
 */
function generateSingleEmployee(minAge, maxAge, today) {
  const gender = getRandomFromArray(GENDERS);

  const name =
    gender === "male"
      ? getRandomFromArray(MALE_NAMES)
      : getRandomFromArray(FEMALE_NAMES);

  const surname =
    gender === "male"
      ? getRandomFromArray(MALE_SURNAMES)
      : getRandomFromArray(FEMALE_SURNAMES);

  const workload = getRandomFromArray(WORKLOADS);

  // věk jako reálné číslo v intervalu <minAge, maxAge>
  const ageVal = Math.random() * (maxAge - minAge) + minAge;

  // výpočet data narození z věku
  const birthTimestamp = today.getTime() - ageVal * MS_IN_YEAR;
  const birthdate = new Date(birthTimestamp).toISOString();

  return {
    gender,
    birthdate,
    name,
    surname,
    workload,
  };
}

/**
 * Generuje seznam náhodných zaměstnanců podle počtu a věkového intervalu.
 * (Navazuje na úkol 3 – generování zaměstnanců.)
 *
 * @param {object} dtoIn obsahuje count (počet zaměstnanců) a age objekt {min, max}
 * @returns {Array} pole zaměstnanců se strukturou { gender, birthdate, name, surname, workload }
 */
export function generateEmployeeData(dtoIn) {
  const { count, minAge, maxAge } = parseDtoIn(dtoIn);

  const employees = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const employee = generateSingleEmployee(minAge, maxAge, today);
    employees.push(employee);
  }

  return employees;
}

/**
 * Spočítá věk v letech (jako reálné číslo) z data narození.
 *
 * @param {string} birthdate datum narození v ISO formátu
 * @param {Date} today referenční datum (dnešek)
 * @returns {number} věk v letech jako reálné číslo
 */
function getAgeFromBirthdate(birthdate, today) {
  const birth = new Date(birthdate);
  const ageMs = today.getTime() - birth.getTime();
  return ageMs / MS_IN_YEAR;
}

/**
 * Zaokrouhlí číslo na jedno desetinné místo.
 *
 * @param {number} value vstupní hodnota
 * @returns {number} zaokrouhlená hodnota
 */
function roundToOneDecimal(value) {
  return Number(value.toFixed(1));
}

/**
 * Pomocná funkce, která projde všechny zaměstnance a nasbírá
 * data pro další výpočty (věky, úvazky, počty…).
 *
 * @param {Array} employees pole zaměstnanců
 * @returns {object} agregovaná data
 */
function aggregateEmployeeData(employees) {
  let workload10 = 0;
  let workload20 = 0;
  let workload30 = 0;
  let workload40 = 0;

  const workloads = [];
  const womenWorkloads = [];
  const ages = [];

  const today = new Date();

  for (const emp of employees) {
    // počty podle úvazku
    if (emp.workload === 10) workload10++;
    if (emp.workload === 20) workload20++;
    if (emp.workload === 30) workload30++;
    if (emp.workload === 40) workload40++;

    workloads.push(emp.workload);

    if (emp.gender === "female") {
      womenWorkloads.push(emp.workload);
    }

    // věk jako reálné číslo (bez předchozího zaokrouhlení)
    const ageExact = getAgeFromBirthdate(emp.birthdate, today);
    ages.push(ageExact);
  }

  return {
    workload10,
    workload20,
    workload30,
    workload40,
    workloads,
    womenWorkloads,
    ages,
  };
}

/**
 * Výpočet mediánu z pole čísel.
 *
 * @param {number[]} numbers pole čísel
 * @returns {number} medián nebo 0 pro prázdné pole
 */
function getMedian(numbers) {
  if (numbers.length === 0) return 0;
  const arr = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(arr.length / 2);

  if (arr.length % 2 === 1) {
    return arr[mid];
  }

  return (arr[mid - 1] + arr[mid]) / 2;
}

/**
 * Spočítá statistiky ze seznamu zaměstnanců.
 *
 * @param {Array} employees pole zaměstnanců
 * @returns {object} dtoOut se statistikami dle zadání
 */
export function getEmployeeStatistics(employees) {
  const total = employees.length;

  const {
    workload10,
    workload20,
    workload30,
    workload40,
    workloads,
    womenWorkloads,
    ages,
  } = aggregateEmployeeData(employees);

  // ---- věkové statistiky ----
  let averageAge = 0;
  let minAge = 0;
  let maxAge = 0;
  let medianAge = 0;

  if (ages.length > 0) {
    const sumAges = ages.reduce((sum, x) => sum + x, 0);
    const avg = sumAges / ages.length;

    // průměrný věk – zaokrouhlený na 1 desetinu
    averageAge = roundToOneDecimal(avg);

    const minRaw = Math.min(...ages);
    const maxRaw = Math.max(...ages);
    const medianRaw = getMedian(ages);

    // min, max, medián věku – celé roky směrem dolů
    minAge = Math.floor(minRaw);
    maxAge = Math.floor(maxRaw);
    medianAge = Math.floor(medianRaw);
  }

  // ---- medián úvazku (čisté číslo) ----
  const medianWorkloadRaw = getMedian(workloads);
  const medianWorkload = Math.round(medianWorkloadRaw);

  // ---- průměrná výše úvazku v rámci žen ----
  let averageWomenWorkload = 0;
  if (womenWorkloads.length > 0) {
    const sumWomen = womenWorkloads.reduce((sum, x) => sum + x, 0);
    const avgWomen = sumWomen / womenWorkloads.length;
    // může být celé číslo nebo 1 desetina – volíme 1 desetinu
    averageWomenWorkload = roundToOneDecimal(avgWomen);
  }

  // ---- seřazení zaměstnanců dle workload od nejmenšího po největší ----
  const sortedByWorkload = [...employees].sort(
    (a, b) => a.workload - b.workload
  );

  const dtoOut = {
    total,
    workload10,
    workload20,
    workload30,
    workload40,
    averageAge,
    minAge,
    maxAge,
    medianAge,
    medianWorkload,
    averageWomenWorkload,
    sortedByWorkload,
  };

  return dtoOut;
}
