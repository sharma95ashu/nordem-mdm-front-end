import { SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, DatePicker, Flex, Form, Input, Row, Select, Typography } from "antd";
import Search from "antd/es/input/Search";
import dayjs from "dayjs";
import { aadharNumberMaxLength, abNoMaxLength, DATEFORMAT } from "Helpers/ats.constants";
import {
  panInput,
  selectFieldRequired,
  validateAadharNo,
  validateABAndReferenceNumber,
  validateABnumber,
  validatebanAccNo,
  validateMobileNo,
  validatePAN,
  validateReferenceNumber,
  validationNumber
} from "Helpers/ats.helper";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";

// Search By Component
const SearchByComponent = forwardRef((props, ref) => {
  const {
    moduleName,
    handleSearchClick,
    searchLoading,
    handleClear,
    // inputField,
    // selectDropDownField,
    // dropDownLabel,
    dropdownOptions,
    // searchbtn,
    isFirstLoad = true
  } = props;

  const [form] = Form.useForm();

  // function to set the first option as selected in the dropdown
  useEffect(() => {
    if (moduleData[moduleName]?.selectDropDownField && dropdownOptions?.length > 0) {
      form.setFieldsValue({
        [moduleData[moduleName]?.selectFormKeyName]: dropdownOptions[0]?.value
      });
    }
  }, [dropdownOptions]);

  const StyleSheet = {
    marginTop8: {
      marginTop: "8px"
    },
    searchBarStyle: {
      marginBottom: 0,
      width: "50%"
    },
    iconStyle: {
      width: "80px",
      height: "80px"
    },
    fontSize14: {
      fontSize: "14px"
    }
  };

  // Expose resetFields to the parent component via ref
  useImperativeHandle(ref, () => ({
    resetFields: () => {
      form.resetFields();
    },
    setFormField: (name, value) => {
      form.setFieldValue(name, value);
    }
  }));

  // handle search submission
  const handleFinish = (values) => {
    try {
      if (
        ["ab_payment_detail", "ab_repurchase_summary_detail", "assign_kyc_lead"]?.includes(
          moduleName
        )
      ) {
        handleSearchClick(values); // pass the searched values
      } else {
        handleSearchClick(values.search_by); // pass the search value
      }
    } catch (error) {}
  };

  // // disable past date and today's date
  const disabledDate = (current) => {
    return (
      current && (dayjs(current).isBefore(dayjs(), "day") || dayjs(current).isSame(dayjs(), "day"))
    );
  };

  const moduleData = {
    bank_account_number: {
      title: "Bank Account Number",
      breadCrumbTitlePrimary: "Bank Account Number",
      breadCrumbTitleSecondary: "Search AB Details By /",
      searchInputLabel: "Bank Account Number",
      searchInputField: true
    },
    pan_number: {
      title: "PAN Number",
      breadCrumbTitlePrimary: "PAN Number",
      breadCrumbTitleSecondary: "Search AB Details By /",
      searchInputLabel: "PAN Number",
      searchInputField: true
    },
    registered_mobile_number: {
      title: "Registered Mobile Number",
      breadCrumbTitlePrimary: "Registered Mobile Number",
      breadCrumbTitleSecondary: "Search AB Details By /",
      searchInputLabel: "Registered Mobile Number",
      searchInputField: true
    },
    aadhar_number: {
      title: "Aadhar Number",
      breadCrumbTitlePrimary: "Aadhar Number",
      breadCrumbTitleSecondary: "Search AB Details By /",
      searchInputLabel: "Aadhar Number",
      searchInputField: true
    },
    stop_associate_buyer: {
      title: "Stop Associate Buyer",
      breadCrumbTitlePrimary: "AB ID Stop",
      breadCrumbTitleSecondary: "Associate Buyers /",
      searchInputLabel: "Associate Buyer Number / Reference Number",
      searchInputField: true
    },
    reset_associate_buyer_password: {
      title: "Reset Associate Buyer Password",
      breadCrumbTitleSecondary: "Associate Buyers /",
      breadCrumbTitlePrimary: "AB Password Reset",
      searchInputLabel: "Associate Buyer Number / Reference Number",
      searchInputField: true
    },
    associate_buyer_bank_account_delete: {
      title: "Associate Buyer Bank Account Details",
      breadCrumbTitleSecondary: "Enable Info /",
      breadCrumbTitlePrimary: "Associate Buyer Bank Account Details",
      searchInputLabel: "Associate Buyer Number",
      searchInputField: true
    },
    associate_buyer_pan_delete: {
      title: "Associate Buyer PAN",
      breadCrumbTitleSecondary: "Enable Info /",
      breadCrumbTitlePrimary: "Associate Buyer PAN",
      searchInputLabel: "Associate Buyer Number",
      searchInputField: true
    },
    associate_buyer_photo_delete: {
      title: "Associate Buyer Photo",
      breadCrumbTitleSecondary: "Enable Info /",
      breadCrumbTitlePrimary: "Associate Buyer Photo",
      searchInputLabel: "Associate Buyer Number",
      searchInputField: true
    },
    ab_pan_add: {
      title: "Associate Buyer PAN Update",
      breadCrumbTitleSecondary: "Document Update /",
      breadCrumbTitlePrimary: "AB PAN Update",
      searchInputLabel: "Associate Buyer Number / Reference Number",
      searchInputField: true
    },
    kyc_similar_entities: {
      title: "KYC Similar Entities",
      breadCrumbTitleSecondary: "KYC /",
      breadCrumbTitlePrimary: "KYC Similar Entities",
      searchInputLabel: "Associate Buyer Number / Reference Number",
      searchInputField: true
    },
    associate_buyer_detail: {
      title: "Associate Buyer Detail",
      breadCrumbTitleSecondary: "Associate Buyers /",
      breadCrumbTitlePrimary: "AB Details",
      searchInputLabel: "Associate Buyer Number / Reference Number",
      searchInputField: true
    },
    associate_buyer_uptree: {
      title: "Associate Buyer Uptree",
      breadCrumbTitleSecondary: "Associate Buyers /",
      breadCrumbTitlePrimary: "Associate Buyer Uptree",
      searchInputLabel: "Associate Buyer Number / Reference Number",
      searchInputField: true
    },
    kyc_document_update: {
      title: "Address & ID Proof Update",
      breadCrumbTitleSecondary: "Document Update /",
      breadCrumbTitlePrimary: "Address & ID Proof Update",
      searchInputLabel: "Associate Buyer Number",
      searchInputField: true
    },
    ab_photo_update: {
      title: "KYC Associate Buyer Photo Update",
      breadCrumbTitleSecondary: "KYC /",
      breadCrumbTitlePrimary: "KYC Associate Buyer Photo Update ",
      searchInputLabel: "Associate Buyer Number",
      searchInputField: true
    },
    kyc_new_entry: {
      title: "KYC New Entry (New Application)",
      breadCrumbTitleSecondary: "KYC /",
      breadCrumbTitlePrimary: "KYC New Entry ",
      searchInputLabel: "AB Reference Number",
      searchInputField: true
    },
    kyc_todays_users: {
      title: "KYC Todays Users",
      breadCrumbTitleSecondary: "KYC /",
      breadCrumbTitlePrimary: "KYC Todays Users ",
      searchInputLabel: "AB Reference Number",
      searchInputField: true
    },
    kyc_old_entry: {
      title: "KYC Old Entry  (Existing AB Application)",
      breadCrumbTitleSecondary: "KYC /",
      breadCrumbTitlePrimary: "KYC Old Entry ",
      searchInputLabel: "Associate Buyer Number",
      searchInputField: true
    },
    ab_payment_detail: {
      title: "Associate Buyer Payment Detail",
      breadCrumbTitleSecondary: "Associate Buyers /",
      breadCrumbTitlePrimary: "AB Stop Payment",
      searchInputLabel: "Associate Buyer Number",
      inputField: true,
      selectDropDownField: true,
      selectLabel: "Select Financial Year",
      selectFormKeyName: "fiscal_year",
      searchbtn: true
    },
    ab_repurchase_summary_detail: {
      title: "Associate Buyer Re-Purchase Summary & Detail",
      breadCrumbTitleSecondary: "Associate Buyers /",
      breadCrumbTitlePrimary: "AB Repurchase",
      searchInputLabel: "Associate Buyer Number",
      inputField: true,
      selectDropDownField: true,
      selectLabel: "Select Financial Year",
      selectFormKeyName: "fiscal_year",
      searchbtn: true
    },
    technical_leader_tree_view: {
      title: "Technical Leader Tree View",
      breadCrumbTitleSecondary: "Lists /",
      breadCrumbTitlePrimary: "Technical Leader Tree View",
      searchInputLabel: "Associate Buyer Number",
      searchInputField: true
    },
    terminate_ab: {
      title: "Terminate-Restore AB",
      breadCrumbTitleSecondary: "Terminate /",
      breadCrumbTitlePrimary: "Terminate-Restore AB",
      searchInputLabel: "Associate Buyer Number / Reference Number",
      searchInputField: true
    },
    address_id_proof_update: {
      title: "Address & ID Proof Update",
      breadCrumbTitlePrimary: "Address & ID Proof Update",
      breadCrumbTitleSecondary: "Document Update /",
      searchInputLabel: "Associate Buyer Number / Reference Number",
      searchInputField: true
    },
    kyc_enable_refill_kyc: {
      title: "Associate Buyer Enable Re-KYC (For Existing AB) ",
      breadCrumbTitleSecondary: "Enable Info /",
      breadCrumbTitlePrimary: "Re-KYC (For Existing AB)",
      searchInputLabel: "Associate Buyer Number",
      searchInputField: true
    },
    ab_not_purchase_otp: {
      title: "Associate Buyer Not Purchase OTP",
      breadCrumbTitlePrimary: "AB Not Purchase OTP",
      breadCrumbTitleSecondary: "Associate Buyers /",
      searchInputLabel: "Associate Buyer Number / Reference Number",
      searchInputField: true
    },
    ab_id_unstop: {
      title: "AB ID UnStop",
      breadCrumbTitlePrimary: "AB ID UnStop",
      breadCrumbTitleSecondary: "Miscellaneous /",
      searchInputLabel: "Associate Buyer Number",
      searchInputField: true
    },
    death_case: {
      title: "Death Case/Id Transfer",
      breadCrumbTitlePrimary: "Death Case/Id Transfer",
      breadCrumbTitleSecondary: "Associate Buyers /",
      searchInputLabel: "Associate Buyer Number / Reference Number",
      searchInputField: true
    },
    assign_kyc_lead: {
      title: "Assign KYC Lead",
      breadCrumbTitlePrimary: "Assign KYC Lead",
      breadCrumbTitleSecondary: "KYC /",
      dateField: true,
      searchbtn: true
    },
    soft_terminate_ab: {
      title: "Executive Feedbacks",
      breadCrumbTitlePrimary: "Executive Feedbacks",
      breadCrumbTitleSecondary: "Terminate /",
      searchInputLabel: "Associate Buyer Number",
      searchInputField: true
    },
    non_pruchasing_ab_report: {
      title: "Non Purchasing AB Report",
      breadCrumbTitleSecondary: "Reports /",
      breadCrumbTitlePrimary: "Non Purchasing AB Report"
    },
    reference_number: {
      title: "Search By Reference Number",
      breadCrumbTitleSecondary: "Search AB Details By /",
      breadCrumbTitlePrimary: "Search By Reference Number",
      searchInputLabel: "AB Reference Number",
      searchInputField: true
    },
    ab_bank_acnt_update: {
      title: "Associate Buyer Bank Account Update",
      breadCrumbTitlePrimary: "Associate Buyer Bank Account Update",
      breadCrumbTitleSecondary: "Associate Buyers /",
      searchInputLabel: "Associate Buyer Number / Reference Number",
      searchInputField: true
    },
    ab_name_update: {
      title: "Associate Buyer Name Update",
      breadCrumbTitleSecondary: "Associate Buyers /",
      breadCrumbTitlePrimary: "Associate Buyer Name Update",
      searchInputLabel: "Associate Buyer Number / Reference Number",
      searchInputField: true
    }
  };

  // validation rules
  const rules = {
    ["Bank Account Number"]: {
      onInput: validationNumber,
      validations: [{ validator: validatebanAccNo }],
      maxLength: 20
    },
    ["Registered Mobile Number"]: {
      onInput: validationNumber,
      validations: [{ validator: validateMobileNo }],
      maxLength: 10
    },
    ["PAN Number"]: {
      onInput: panInput,
      validations: [{ validator: validatePAN }],
      maxLength: 10
    },
    ["Associate Buyer Number"]: {
      onInput: validationNumber,
      validations: [{ validator: validateABnumber }],
      maxLength: abNoMaxLength
    },
    ["Select Financial Year"]: {
      validations: [{ validator: selectFieldRequired }]
    },
    ["Aadhar Number"]: {
      onInput: validationNumber,
      validations: [{ validator: validateAadharNo }],
      maxLength: aadharNumberMaxLength
    },
    ["AB Reference Number"]: {
      onInput: validationNumber,
      validations: [{ validator: validateReferenceNumber }],
      maxLength: abNoMaxLength
    },
    ["Associate Buyer Number / Reference Number"]: {
      onInput: validationNumber,
      validations: [{ validator: validateABAndReferenceNumber }],
      maxLength: abNoMaxLength
    }
  };

  // variable for card rendering
  const shouldRenderCard =
    moduleData[moduleName]?.searchInputField ||
    moduleData[moduleName]?.selectDropDownField ||
    moduleData[moduleName]?.inputField ||
    moduleData[moduleName]?.dateField;
  return (
    <>
      <Row gutter={[20, 24]} style={StyleSheet.marginTop8}>
        <Flex justify="space-between" vertical gap={8} className="fullWidth">
          <Typography.Title level={4} className="removeMargin">
            {moduleData[moduleName]?.title}
          </Typography.Title>
          <Typography.Text style={StyleSheet.fontSize14} className="removeMargin">
            <Typography.Text type="secondary">
              {moduleData[moduleName]?.breadCrumbTitleSecondary}
            </Typography.Text>{" "}
            {`${moduleData[moduleName]?.breadCrumbTitlePrimary}`}
          </Typography.Text>
        </Flex>
        {shouldRenderCard && (
          <Card className={"fullWidth"}>
            <Form name="search_form" form={form} layout="vertical" onFinish={handleFinish}>
              <Row gutter={[20, 24]}>
                {moduleData[moduleName]?.searchInputField && (
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="search_by"
                      label={moduleData[moduleName]?.searchInputLabel}
                      rules={rules[moduleData[moduleName]?.searchInputLabel]?.validations}
                      required
                      className="removeMargin">
                      <Search
                        placeholder={`Enter ${moduleData[moduleName]?.searchInputLabel}`}
                        size="large"
                        enterButton={
                          <Button icon={<SearchOutlined />} type="primary">
                            Search
                          </Button>
                        }
                        onSearch={() => form.submit()}
                        allowClear
                        loading={searchLoading}
                        disabled={searchLoading}
                        onChange={() => handleClear()}
                        onInput={rules[moduleData[moduleName]?.searchInputLabel]?.onInput}
                        maxLength={rules[moduleData[moduleName]?.searchInputLabel]?.maxLength}
                      />
                    </Form.Item>
                  </Col>
                )}

                {moduleData[moduleName]?.selectDropDownField && (
                  <Col span={12}>
                    <Form.Item
                      name={moduleData[moduleName]?.selectFormKeyName}
                      label={moduleData[moduleName]?.selectLabel}
                      rules={rules[moduleData[moduleName]?.selectLabel]?.validations}
                      className="removeMargin"
                      required>
                      <Select
                        placeholder={moduleData[moduleName]?.selectLabel}
                        showSearch
                        size="large"
                        options={dropdownOptions}
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        loading={false}
                        disabled={false}
                      />
                    </Form.Item>
                  </Col>
                )}

                {moduleData[moduleName]?.inputField && (
                  <Col span={8}>
                    <Form.Item
                      name={"dist_no"}
                      label={moduleData[moduleName]?.searchInputLabel}
                      rules={rules[moduleData[moduleName]?.searchInputLabel]?.validations}
                      required
                      className="removeMargin">
                      <Input
                        placeholder={`Enter ${moduleData[moduleName]?.searchInputLabel}`}
                        size="large"
                        type="text"
                        onInput={rules[moduleData[moduleName]?.searchInputLabel]?.onInput}
                        maxLength={rules[moduleData[moduleName]?.searchInputLabel]?.maxLength}
                      />
                    </Form.Item>
                  </Col>
                )}

                {moduleData[moduleName]?.dateField && (
                  <Col span={8}>
                    <Form.Item
                      name="search_date"
                      label="Select Date"
                      rules={[{ required: true, message: "Date is required" }]}
                      className="removeMargin">
                      <DatePicker
                        className="date-picker"
                        format={DATEFORMAT.RANGE_FORMAT}
                        {...(moduleName == "assign_kyc_lead" ? {} : { disabledDate: disabledDate })}
                        // disabledDate={disabledDate}
                      />
                    </Form.Item>
                  </Col>
                )}
                {moduleData[moduleName]?.searchbtn && (
                  <Col span={4}>
                    <Form.Item label=" " className="removeMargin">
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        {...(isFirstLoad ? { loading: searchLoading } : {})}
                        {...(isFirstLoad ? { disabled: searchLoading } : {})}
                        className="fullWidth"
                        style={{ marginBottom: "8px" }}
                        icon={<SearchOutlined />}>
                        Search
                      </Button>
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </Form>
          </Card>
        )}
      </Row>
    </>
  );
});

export default SearchByComponent;
