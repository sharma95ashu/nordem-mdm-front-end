import { capitalizeFirstWord } from "./ats.helper";

//Validate Custom Number like Associate buyer number or customer number etc by passing name min and max value
const validateCustomNumber = (rule, value, name, min, max) => {
  try {
    // if (!value) {
    //   return Promise.reject(`Please enter your ${name} number.`);
    // }

    if (value && !/^\d+$/.test(value)) {
      return Promise.reject(`Please enter only numeric digits for ${name}.`);
    }
    if ((value && value.length < min) || (value && value.length > max)) {
      return Promise.reject(`${name} number must be between ${min} and ${max} digits long.`);
    }
    return Promise.resolve();
  } catch (error) {
    console.log(error);
  }
};

const validateCustomString = (rule, value, name, min, max) => {
  try {
    const trimmedValue = value?.trim();
    // Check for invalid characters (only letters and spaces allowed)
    if (value && !/^[A-Za-z\s]+$/.test(trimmedValue)) {
      return Promise.reject(`Only letters are allowed in ${name}.`);
    }
    if ((value && value.length < min) || (value && value.length > max)) {
      return Promise.reject(`${name} must be between ${min} and ${max} letters long.`);
    }
    return Promise.resolve();
  } catch (error) {
    console.log(error);
  }
};

const validateStrOnlyLength = (rule, value, name, min, max) => {
  try {
    if ((value && value.length < min) || (value && value.length > max)) {
      return Promise.reject(`${name} must be between ${min} and ${max} letters long.`);
    }
    return Promise.resolve();
  } catch (error) {
    console.log(error);
  }
};

//Function to validate the range of a number
const validateNumberRangeFunction = (rule, value, name, min, max) => {
  try {
    if (value === undefined || value === null || value === "") {
      return Promise.resolve(); // Skip range validation if value is empty
    }
    if (isNaN(value) || value < min || value > max) {
      return Promise.reject(`${name} must be between ${min} and ${max}`);
    }
    return Promise.resolve();
  } catch (error) {
    console.log(error);
  }
};

//Validate mobile no
const validateMobileNumber = (rule, value, text) => {
  if (value && !/^[6-9]\d{9}$/.test(value)) {
    const label = text ? "mobile" : "Mobile"; // Conditionally change case
    return Promise.reject(`${text ? text : ""} ${label} no. is invalid`);
  }

  return Promise.resolve();
};

//Validate Whatsapp no ot other type of Mobile no
const validateMobileNumberCustom = (rule, value, text) => {
  if (value && !/^[6-9]\d{9}$/.test(value)) {
    return Promise.reject(`${text ? text : ""}  no. is invalid`);
  }

  return Promise.resolve();
};

// validate name's character's length
const validateNameLength = (rule, value, name, min, max) => {
  if ((value && value.length < min) || (value && value.length > max)) {
    return Promise.reject(
      `${capitalizeFirstWord(name)} must be between ${min} and ${max} characters long.`
    );
  }
  const trimmedValue = value?.trim();

  // Check if there are leading or trailing spaces
  if (value && trimmedValue && value !== trimmedValue) {
    return Promise.reject("Name cannot have leading or trailing spaces.");
  }

  // Check for multiple consecutive spaces between words (double spaces or more)
  if (/ {2,}/.test(trimmedValue)) {
    return Promise.reject("Only one space between words is allowed.");
  }

  // Check for invalid characters (only letters and spaces allowed)
  if (value && !/^[A-Za-z\s]+$/.test(trimmedValue)) {
    return Promise.reject(`Only letters are allowed in the ${name || "name"}.`);
  }
  return Promise.resolve();
};

//Validate email address
const validateEmail = (rule, value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (value && !emailRegex.test(value)) {
    return Promise.reject("Please enter a valid email address.");
  }
  return Promise.resolve();
};
export const ALL_FORM_VALIDATIONS = {
  required_validation: (nameValue) => ({
    validations: [
      {
        required: true,
        message: `Please enter the ${nameValue}`
      }
    ]
  }),
  name_validation: (custom_name, minLength, maxLength) => ({
    validations: [
      {
        validator: (rule, value) =>
          validateNameLength(rule, value, custom_name, minLength, maxLength)
      }
    ]
  }),
  mobile_no_validation: (text) => ({
    validations: [
      {
        required: true,
        message: `Please enter mobile number`
      },
      {
        validator: (rule, value) => validateMobileNumber(rule, value, text)
      }
    ]
  }),
  mobile_no_validation_not_required: (text) => ({
    validations: [
      {
        validator: (rule, value) => validateMobileNumberCustom(rule, value, text)
      }
    ]
  }),

  custom_no_validation: (custom_name, minLength, maxLength) => ({
    validations: [
      {
        validator: (rule, value) =>
          validateCustomNumber(rule, value, custom_name, minLength, maxLength)
      }
    ]
  }),
  custom_string_validation: (custom_name, minLength, maxLength) => ({
    validations: [
      {
        validator: (rule, value) =>
          validateCustomString(rule, value, custom_name, minLength, maxLength)
      }
    ]
  }),
  custom_str_only_length: (custom_name, minLength, maxLength) => ({
    validations: [
      {
        validator: (rule, value) =>
          validateStrOnlyLength(rule, value, custom_name, minLength, maxLength)
      }
    ]
  }),
  mail: {
    validations: [
      {
        validator: validateEmail
      }
    ]
  },

  //Function to validate the range of a number
  validateNumberRange: (custom_name, min, max) => ({
    validations: [
      {
        validator: (rule, value) => validateNumberRangeFunction(rule, value, custom_name, min, max)
      }
    ]
  })
};
