// Helper function to validate if PV empty for any month
export const validateAnyMonthPV = (form, fieldName) => {
  return () => {
    const record = form.getFieldValue(["ulpTarget", fieldName]) || {};
    const hasAnyValue = [
      record.pv_january,
      record.pv_february,
      record.pv_march,
      record.pv_april,
      record.pv_may,
      record.pv_june,
      record.pv_july,
      record.pv_august,
      record.pv_september,
      record.pv_october,
      record.pv_november,
      record.pv_december
    ].some((val) => val !== undefined && val !== null && val !== "");

    return hasAnyValue
      ? Promise.resolve()
      : Promise.reject(new Error("Please enter PV in at least one month"));
  };
};
