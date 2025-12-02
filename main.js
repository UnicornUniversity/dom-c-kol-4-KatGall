//TODO add imports if needed
//TODO doc

// Konstanta pro přepočet věku na milisekundy – 365 dní (podle zadání)
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
 * @returns {object} containing the statistics
 */
export function main(dtoIn) {
  const employees = generateEmployeeData(dtoIn);
  const dtoOut = getEmployeeStatistics(employees);
  return dtoOut;
}

/**
 * Validates input dtoIn and extracts basic values.
 * @param {object} dtoIn contains count and age object {min, max}
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
 * Returns random element from given array.
 * @param {Array} array input array
 * @returns {*} random element
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
      :
