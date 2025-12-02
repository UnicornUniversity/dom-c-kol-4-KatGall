//TODO add imports if needed
//TODO doc

// Konstanta pro přepočet věku na milisekundy – 365 dní (podle pokynů z hodiny)
const MS_IN_YEAR = 365 * 24 * 60 * 60 * 1000;

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
 * The main function which calls the application.
 * 1) Generates random employees based on dtoIn.
 * 2) Computes statistics over the generated employees.
 * @param {object} dtoIn contains count of employees, age limit of employees {min, max}
 * @returns {object} dtoOut containing the statistics
 */
export function main(dtoIn) {
  const employees = generateEmployeeData(dtoIn);
  const dtoOut = getEmployeeStatistics(employees);
  return dtoOut;
}

/**
 * Validates input dtoIn and extracts basic values.
 * @param {object} dtoIn contains count and age object {min, max}
 * @returns {{count:number, minAge:number, maxAge:number}} parsed values from dtoIn
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
 * Returns random element from given array.
 * @param {Array} array input array
 * @returns {*} random element from array
 */
function getRandomFromArray(array) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

/**
 * Generates single random employee.
 * @param {number} minAge minimal age
 * @param {number} maxAge maximal age
 * @param {Date} today reference date for age calculation
 * @returns {object} employee object
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

  // věk jako desetinné číslo v intervalu <minAge, maxAge>
  const ageVal = Math.random() * (maxAge - minAge) + minAge;
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
 * Generates a list of random employees based on count and age interval.
 * (Navazuje na řešení z Homework 3 – generování seznamu zaměstnanců.)
 * @param {object} dtoIn contains count of employees, age limit of employees {min, max}
 * @returns {Array} dtoOut list of employees with structure { gender, birthdate, name, surname, workload }
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
 * Returns age in years (as decimal number) based on birthdate.
 * @param {string} birthdate date in ISO format
 * @param {Date} today reference date
 * @returns {number} age in years as decimal number
 */
function getAgeFromBirthdate(birthdate, today) {
  const birth = new Date(birthdate);
  const ageMs = today.getTime() - birth.getTime();
  return ageMs / MS_IN_YEAR;
}

/**
 * Rounds number to one decimal place.
 * @param {number} value input value
 * @returns {number} value rounded to one decimal place
 */
function roundToOneDecimal(value) {
  return Number(value.toFixed(1));
}

/**
 * Aggregates base statistics from employees (ages, workloads, counters).
 * @param {Array} employees list of employees
 * @returns {object} aggregated data for further statistics
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
    if (emp.workload === 10) workload10++;
    if (emp.workload === 20) workload20++;
    if (emp.workload === 30) workload30++;
    if (emp.workload === 40) workload40++;

    workloads.push(emp.workload);

    if (emp.gender === "female") {
      womenWorkloads.push(emp.workload);
    }

    // věk jako reálné číslo zaokrouhlené na 1 desetinu
    const ageExact = getAgeFromBirthdate(emp.birthdate, today);
    const age = roundToOneDecimal(ageExact);
    ages.push(age);
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
 * Calculates median from array of numbers.
 * @param {number[]} numbers array of numbers
 * @returns {number} median value or 0 for empty array
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
 * Computes statistics from the list of employees.
 * @param {Array} employees containing all the mocked employee data
 * @returns {object} dtoOut statistics of the employees
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

  let averageAge = 0;
  let minAge = 0;
  let maxAge = 0;
  let medianAge = 0;

  if (ages.length > 0) {
    const sumAges = ages.reduce((sum, x) => sum + x, 0);
    const avg = sumAges / ages.length;
    // průměrný věk – 1 desetinné místo
    averageAge = roundToOneDecimal(avg);

    const minRaw = Math.min(...ages);
    const maxRaw = Math.max(...ages);
    const medianRaw = getMedian(ages);

    // min/max/median věku – celá čísla směrem dolů
    minAge = Math.floor(minRaw);
    maxAge = Math.floor(maxRaw);
    medianAge = Math.floor(medianRaw);
  }

  // medián úvazku – celé číslo
  const medianWorkloadRaw = getMedian(workloads);
  const medianWorkload = Math.round(medianWorkloadRaw);

  // průměrný úvazek žen – 1 desetinné místo
  let averageWomenWorkload = 0;
  if (womenWorkloads.length > 0) {
    const sumWomen = womenWorkloads.reduce((sum, x) => sum + x, 0);
    const avgWomen = sumWomen / womenWorkloads.length;
    averageWomenWorkload = roundToOneDecimal(avgWomen);
  }

  // seřazení podle úvazku vzestupně
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
