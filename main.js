//TODO add imports if needed
//TODO doc

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
 * Generates a list of random employees based on count and age interval.
 * @param {object} dtoIn contains count of employees, age limit of employees {min, max}
 * @returns {Array} of employees with structure { gender, birthdate, name, surname, workload }
 */
export function generateEmployeeData(dtoIn) {
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

  const employees = [];
  const today = new Date();

  // prettier-ignore
  const maleNames = ["Jan","Petr","Tomáš","Lukáš","Jakub","Adam","Matěj","Michal","Filip","David"];
  // prettier-ignore
  const femaleNames = ["Anna","Eliška","Adéla","Tereza","Karolína","Lucie","Kristýna","Marie","Veronika","Kateřina"];
  // prettier-ignore
  const maleSurnames = ["Vomáčka","Svoboda","Dvořák","Černý","Procházka","Kučera","Horák","Beneš","Fiala","Sedláček"];
  // prettier-ignore
  const femaleSurnames = ["Nováková","Svobodová","Dvořáková","Černá","Procházková","Kučerová","Horáková","Benešová","Fialová","Sedláčková"];

  const workloads = [10, 20, 30, 40];
  const genders = ["male", "female"];
  const MS_IN_YEAR = 365.25 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const gender = genders[Math.floor(Math.random() * genders.length)];

    const name =
      gender === "male"
        ? maleNames[Math.floor(Math.random() * maleNames.length)]
        : femaleNames[Math.floor(Math.random() * femaleNames.length)];

    const surname =
      gender === "male"
        ? maleSurnames[Math.floor(Math.random() * maleSurnames.length)]
        : femaleSurnames[Math.floor(Math.random() * femaleSurnames.length)];

    const workload = workloads[Math.floor(Math.random() * workloads.length)];

    // věk jako desetinné číslo v intervalu <minAge, maxAge>
    const ageVal = Math.random() * (maxAge - minAge) + minAge;

    const birthTimestamp = today.getTime() - ageVal * MS_IN_YEAR;
    const birthdate = new Date(birthTimestamp).toISOString();

    const employee = {
      gender,
      birthdate,
      name,
      surname,
      workload,
    };

    employees.push(employee);
  }

  return employees;
}

/**
 * Computes statistics from the list of employees.
 * @param {Array} employees containing all the mocked employee data
 * @returns {object} statistics of the employees
 */
export function getEmployeeStatistics(employees) {
  const total = employees.length;

  // counts by workload
  let workload10 = 0;
  let workload20 = 0;
  let workload30 = 0;
  let workload40 = 0;

  const workloads = [];
  const womenWorkloads = [];

  const ages = [];
  const today = new Date();
  const MS_IN_YEAR = 365.25 * 24 * 60 * 60 * 1000;

  for (const emp of employees) {
    // workload counts
    if (emp.workload === 10) workload10++;
    if (emp.workload === 20) workload20++;
    if (emp.workload === 30) workload30++;
    if (emp.workload === 40) workload40++;

    workloads.push(emp.workload);

    if (emp.gender === "female") {
      womenWorkloads.push(emp.workload);
    }

    // age as decimal number from birthdate
    const birth = new Date(emp.birthdate);
    const ageMs = today.getTime() - birth.getTime();
    const age = ageMs / MS_IN_YEAR;
    ages.push(age);
  }

  // helper functions
  function getMedian(numbers) {
    if (numbers.length === 0) return 0;
    const arr = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    if (arr.length % 2 === 1) {
      return arr[mid];
    } else {
      return (arr[mid - 1] + arr[mid]) / 2;
    }
  }

  function roundToOneDecimal(value) {
    return Number(value.toFixed(1));
  }

  // age statistics
  let averageAge = 0;
  let minAge = 0;
  let maxAge = 0;
  let medianAge = 0;

  if (ages.length > 0) {
    const sumAges = ages.reduce((sum, x) => sum + x, 0);
    const avg = sumAges / ages.length;
    averageAge = roundToOneDecimal(avg); // 1 decimal place

    const minRaw = Math.min(...ages);
    const maxRaw = Math.max(...ages);
    const medianRaw = getMedian(ages);

    minAge = Math.round(minRaw); // integers
    maxAge = Math.round(maxRaw);
    medianAge = Math.round(medianRaw);
  }

  // median workload (rounded to integer as required)
  const medianWorkloadRaw = getMedian(workloads);
  const medianWorkload = Math.round(medianWorkloadRaw);

  // average women workload
  let averageWomenWorkload = 0;
  if (womenWorkloads.length > 0) {
    const sumWomen = womenWorkloads.reduce((sum, x) => sum + x, 0);
    const avgWomen = sumWomen / womenWorkloads.length;
    // allowed whole number or 1 decimal – we use 1 decimal
    averageWomenWorkload = roundToOneDecimal(avgWomen);
  }

  // sorted employees by workload ascending
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
