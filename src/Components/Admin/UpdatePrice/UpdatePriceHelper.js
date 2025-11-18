import { booleanCheck, isValidFutureDate, toBoolean } from "Helpers/functions";
import { isEmpty } from "lodash";

export const validateHierarchy = (masterRecords, statewiseRecords) => {
  let isValid = true;
  let nodes = [];
  let sapCodes = [];

  for (let i = 0; i < masterRecords.length; i++) {
    let statePrice = [];
    let d = masterRecords[i];
    let dataSapCode = d["SAP Code"];
    let errors = {};

    ["SP", "PV", "MRP"].forEach((field) => {
      const value = d[field];

      // Check if value is not a valid number or less than or equal to 0

      if ((value && parseFloat(value) <= 0) || isNaN(+value)) {
        isValid = false;
        errors[field] = `${field} must be a number and greater than zero`;
      }

      // Check if value exceeds 8 digits (before or after decimal)
      if (value && value.toString().replace(".", "").length > 8) {
        isValid = false;
        errors[field] = `${field} should be less than or equal to 8 digits`;
      }
    });

    if (d["Is SP/PV Same In All States"] && !toBoolean(d["Is SP/PV Same In All States"])) {
      isValid = false;
      errors["Is SP/PV Same In All States"] =
        `Is SP/PV Same In All States should be either 0 or 1.`;
    }

    if (
      !d["Effective Date"] ||
      isEmpty(d["Effective Date"]) ||
      !isValidFutureDate(d["Effective Date"])
    ) {
      isValid = false;
      errors["Effective Date"] =
        "Effective Date must be in dd/mm/yyyy format and cannot be in the past.";
    }

    if (
      !d["SAP Code"] ||
      isEmpty(d["SAP Code"]) ||
      (d["SAP Code"] && parseInt(d["SAP Code"]) < 1) ||
      isNaN(+d[["SAP Code"]]) ||
      sapCodes.includes(d["SAP Code"])
    ) {
      isValid = false;
      errors["SAP Code"] = "SAP Code must be a unique number and cannot be empty or zero";
    }

    sapCodes.push(d["SAP Code"]);
    if (Object.keys(errors).length > 0) {
      isValid = false;

      if (Object.keys(errors).includes("SAP Code")) {
        errors["SAP Code"] = "SAP Code must be a unique number and cannot be empty or zero";
      }
    }

    for (let j = 0; j < statewiseRecords.length; j++) {
      let ds = statewiseRecords[j];
      let stateSapCode = ds["SAP Code"];
      let errorsState = {};
      if (dataSapCode === stateSapCode) {
        statePrice.push(ds);

        // if (booleanCheck(d["Is SP/PV Same In All States"]) === false && !ds["SP"]) {
        //   isValid = false;
        //   errorsState["SP"] = `Please provide the SP value for SAP Code: ${dataSapCode}.`;
        //   errors["statePrice"] = `Please provide the SP value for SAP Code: ${dataSapCode}.`;
        // }
        // if (booleanCheck(d["Is SP/PV Same In All States"]) === false && !ds["PV"]) {
        //   isValid = false;
        //   errorsState["PV"] = `Please provide the PV value for SAP Code: ${dataSapCode}.`;
        //   errors["statePrice"] = `Please provide the PV value for SAP Code: ${dataSapCode}.`;
        // }

        if ((ds["SP"] && parseFloat(ds["SP"]) <= 0) || isNaN(+ds["SP"])) {
          isValid = false;
          errorsState["SP"] = `${"SP"} must be a number and greater than zero`;
          errors["statePrice"] = "Error in state price";
        }
        if ((ds["PV"] && parseFloat(ds["PV"]) <= 0) || isNaN(+ds["PV"])) {
          isValid = false;
          errorsState["PV"] = `${"pV"} must be a number and greater than zero`;
          errors["statePrice"] = "Error in state price";
        }
        if (
          !ds["SAP Code"] ||
          isEmpty(ds["SAP Code"]) ||
          (ds["SAP Code"] && parseInt(d["SAP Code"]) < 1) ||
          isNaN(+d[["SAP Code"]])
        ) {
          isValid = false;
          errorsState["SAP Code"] = "SAP Code must be a unique number and cannot be empty or zero";
          errors["statePrice"] = "Error in state price";
        }
        ds["errorsState"] = errorsState;

        d["statePrice"] = statePrice;
      }
    }

    if (statePrice?.length === 0 && !booleanCheck(d["Is SP/PV Same In All States"])) {
      isValid = false;
      errors["statePrice"] =
        `Kindly enter data for SAP Code ${dataSapCode} in the 'State Price List' sheet, since the 'Is SP/PV Same In All States' flag is marked as 0.`;
    }
    statePrice = [];

    d["errors"] = errors;
    nodes.push({
      ...d,
      key: d["SAP Code"] + i
    });
  }
  return { nodes, isValid };
};
