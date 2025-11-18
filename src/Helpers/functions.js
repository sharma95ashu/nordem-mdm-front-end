//Function to check if a value is not numeric
export const isNotNumeric = (str) => {
  return !/^\d+$/.test(str);
};

export const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};

export const booleanCheck = (val) => {
  if (typeof val === "string") {
    if (val === "0") return false;
    if (val === "1") return true;
  }

  return false;
};

export const toBoolean = (val) => {
  if (typeof val === "string" && (val === "0" || val === "1")) {
    return true;
  }
  return false;
};

export const isValidFutureDate = (dateStr) => {
  // Match d/m/yyyy or dd/mm/yyyy format (with optional leading zeros)
  const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = dateStr.match(dateRegex);

  if (!match) return false; // Invalid format

  // eslint-disable-next-line no-unused-vars
  const [_, dd, mm, yyyy] = match;

  // Pad day and month with leading zeros if needed
  const paddedDD = dd.padStart(2, "0");
  const paddedMM = mm.padStart(2, "0");

  // Create a date object (JS months are 0-based)
  const dateObj = new Date(`${yyyy}-${paddedMM}-${paddedDD}`);

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) return false;

  // Ensure day/month/year still match after parsing
  if (
    dateObj.getDate() !== Number(dd) ||
    dateObj.getMonth() + 1 !== Number(mm) ||
    dateObj.getFullYear() !== Number(yyyy)
  ) {
    return false;
  }

  // Get today's date without time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);

  return dateObj >= today;
};

export const getTodayDateDDMMYYYY = () => {
  const today = new Date();

  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const yyyy = today.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
};

export function getFullImageUrl(imgPath) {
  if (!imgPath) return "";
  return imgPath.startsWith("http") ? imgPath : `${process.env.REACT_APP_IMAGE_URL}${imgPath}`;
}
