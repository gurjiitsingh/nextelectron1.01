const TERMINAL_CODE = 'P2';

function getFinancialYearCode(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  let startYear;
  let endYear;

  if (month >= 4) {
    startYear = year;
    endYear = year + 1;
  } else {
    startYear = year - 1;
    endYear = year;
  }

  return `${startYear % 100}${endYear % 100}`;
}

module.exports = {
  TERMINAL_CODE,
  getFinancialYearCode,
};