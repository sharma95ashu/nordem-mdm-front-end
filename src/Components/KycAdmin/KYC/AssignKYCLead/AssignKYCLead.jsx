import { Button, Col, Flex, Form, Input, Modal, Row, Spin, Tag, theme, Typography } from "antd";
import React, { useEffect, useRef, useState } from "react";
import SearchByComponent from "Components/Shared/SearchByComponent";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { useServices } from "Hooks/ServicesContext";
import { useMutation, useQuery } from "react-query";
import {
  actionsPermissionValidator,
  capitalizeFirstLetter,
  validationNumber
} from "Helpers/ats.helper";
import { PermissionAction, snackBarErrorConf, snackBarSuccessConf } from "Helpers/ats.constants";
import SearchByDocument from "Static/KYC_STATIC/img/search_by_document.svg";
import dayjs from "dayjs";
import { enqueueSnackbar } from "notistack";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const AssignKYCLead = () => {
  const {
    token: { borderRadiusLG, colorBorder, borderColor }
  } = theme.useToken();

  const ref = useRef(); // Reference for the search component form
  const [form] = Form.useForm(); // Ant Design form instance
  const { apiService } = useServices(); // API service context

  // State variables
  const [payload, setPayload] = useState(null); // Stores the search payload
  const [date, setDate] = useState(null); // Selected search date
  const [inputValues, setInputValues] = useState({}); // Stores assigned lead counts per executive
  const [totalKycLeadsCount, setTotalKycLeadsCount] = useState(0); // Total available KYC leads
  const [modal, setModal] = useState(false);

  // Inline styles for various UI elements
  const StyleSheet = {
    fontSize14: {
      fontSize: "14px"
    },
    info: {
      border: "1px solid",
      borderColor: colorBorder,
      padding: "16px",
      borderRadius: borderRadiusLG,
      marginBottom: "16px"
    },
    content: {
      backgroundColor: borderColor,
      borderRadius: "12px",
      padding: "16px",
      marginTop: "16px"
    },
    icon: {
      color: "#FA8C16",
      fontSize: "24px",
      marginTop: 4
    }
  };

  let debounceTimer; // Declare a debounce timer

  /**
   * Handles input change and ensures the assigned lead count does not exceed the total available leads.
   * @param {string} index - The key representing the executive.
   * @param {number} value - The lead count entered by the user.
   */
  const handleInputChange = (index, value) => {
    try {
      clearTimeout(debounceTimer); // Clear previous timeout to reset the delay
      debounceTimer = setTimeout(() => {
        if (value !== "" && value !== null && value !== undefined) {
          let newValue = value; // Ensure it's a number
          const updatedInputs = { ...inputValues, [index]: newValue };
          const totalAssigned = Object.values(updatedInputs).reduce(
            (sum, num) => sum + (Number(num) || 0),
            0
          );
          if (totalAssigned > totalKycLeadsCount) {
            form.setFields([
              {
                name: index,
                value: 0 // Default vakue : Zero, Prevent assigning more than total available KYC leads
              }
            ]);
            setInputValues({ ...inputValues, [index]: 0 });
            return;
          }
          form.setFields([
            {
              name: index,
              errors: [], // Clear previous errors if any
              value: Number(newValue)
            }
          ]);
          setInputValues(updatedInputs);
          // form.setFieldsValue({ [index]: newValue }); // Update form values safely // Update form values
        } else {
          setInputValues({ ...inputValues, [index]: null });
          form.setFieldValue(index, null);
        }
      }, 300); // Delay of 300ms before execution
    } catch (error) {}
  };

  /**
   * Fetches the KYC Leads Count from the API.
   * @returns {Number} Total number of KYC leads.
   */
  const { isLoading } = useQuery(
    ["fetchTotalKYCLeadCount", payload],
    () => apiService.getNumberofKYCLeads(payload),
    {
      enabled: !!payload,
      onSuccess: (data) => setTotalKycLeadsCount(100 || 0),
      onError: (error) => console.error("Error fetching data:", error)
    }
  );

  /**
   * Fetches the list of executives from the API.
   * @returns {Array} List of executives with labels and values.
   */
  const { data: executivesList } = useQuery(
    "fetchExecutivesList",
    () => apiService.getExecutivesList(),
    {
      select: (data) =>
        data?.data?.map((item) => ({ label: item?.user_name, value: item?.user_id })) || [],
      onError: (error) => console.error("Error fetching data:", error)
    }
  );

  /**
   * Assigns KYC leads to executives.
   * On success, it resets the form and updates the UI.
   */
  const { mutate: assignKYC, isLoading: loadingSubmission } = useMutation(
    (data) => apiService.assignKycLeads(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          enqueueSnackbar(data?.message, snackBarSuccessConf);
          handleReset();
        }
      },
      onError: (error) => {
        enqueueSnackbar(error?.message, snackBarErrorConf);
      }
    }
  );

  /**
   * Handles the search button click event.
   * Updates the payload with the selected date range for fetching KYC leads.
   * @param {Object} param0 - Object containing the search date.
   */
  const handleSearchClick = ({ search_date }) => {
    if (search_date) {
      setDate(dayjs(search_date).format("DD-MMM-YYYY"));
      const searchPayload = {
        start_date: dayjs(search_date).startOf("day").utc().toISOString(),
        end_date: dayjs(search_date).endOf("day").utc().toISOString()
      };
      setPayload(searchPayload);
    }
  };

  /**
   * Handles the form submission.
   * Formats the assigned KYC data and triggers the API call.
   */
  const handleSubmit = () => {
    try {
      setModal(true);
    } catch (error) {}
  };

  /**
   * Automatically distributes KYC leads among executives.
   * Ensures that the leads are fairly assigned and updates the form fields accordingly.
   */
  useEffect(() => {
    if (executivesList?.length > 0 && totalKycLeadsCount) {
      // Calculate equal distribution of leads per executive
      const perExecutive = Math.floor(totalKycLeadsCount / executivesList.length);
      let remainingLeads = totalKycLeadsCount % executivesList.length; // Remainder leads to distribute

      // Distribute leads across executives
      const distributedLeads = executivesList.reduce((acc, executive) => {
        acc[executive.value] = perExecutive + (remainingLeads > 0 ? 1 : 0);
        remainingLeads -= remainingLeads > 0 ? 1 : 0;
        return acc;
      }, {});

      // Update state and form fields
      setInputValues(distributedLeads);
      form.setFieldsValue(distributedLeads);
    }
  }, [totalKycLeadsCount, executivesList, form]);

  /**
   * Calculates the total assigned lead count.
   * @constant {number} totalAssigned - The sum of all assigned lead counts.
   */
  const totalAssigned = Object.values(inputValues).reduce(
    (sum, num) => Number(sum) + (Number(num) || 0),
    0
  );

  /**
   * Calculates the remaining lead count available for assignment.
   * @constant {number} remaining - The remaining leads that can be assigned.
   */
  const remaining = (totalKycLeadsCount || 0) - totalAssigned;

  /**
   * Handles closing of the modal.
   */
  const handleModal = () => {
    setModal(false);
  };

  /**
   * Handles the confirmation click event.
   * Formats data from the executives list, filters out entries with zero assignments,
   * and triggers the `assignKYC` api call with the updated payload.
   */
  const handleConfirmationClick = () => {
    try {
      const formattedData = executivesList
        .map((item, index) => ({
          user_id: item?.value,
          assign_req: inputValues[item?.value] || 0
        }))
        .filter((entry) => entry.assign_req > 0); // Only include those with valid assignments

      const tempPayload = {
        ...payload,
        assign_users: formattedData
      };
      // Call the function to assign KYC leads
      assignKYC(tempPayload);
    } catch (error) {}
  };

  const handleReset = () => {
    try {
      setModal(false);
      setTotalKycLeadsCount(0);
      setInputValues({});
      setPayload(null);
      form.resetFields();
      ref.current && ref.current.resetFields();
    } catch (error) {}
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={isLoading}>
      {!totalKycLeadsCount ? (
        <>
          <SearchByComponent
            moduleName="assign_kyc_lead"
            handleSearchClick={handleSearchClick}
            handleClear={() => form.resetFields()}
            searchLoading={isLoading}
            searchInputField={true}
            ref={ref}
          />
          <Row gutter={[20, 24]}>
            <Col span={24}></Col>
            <SearchByFallbackComponent
              title="Search by Date"
              subTitle="Quickly Search by Date to Assign KYC Lead"
              image={SearchByDocument}
            />
          </Row>
        </>
      ) : (
        <>
          <Row gutter={[20, 24]} className="marginTop8">
            <Flex justify="space-between" vertical gap={8} className="fullWidth">
              <Typography.Title level={4} className="removeMargin">
                Assign KYC Lead
              </Typography.Title>
              <Typography.Text style={StyleSheet.fontSize14} className="removeMargin">
                <Typography.Text type="secondary">KYC /</Typography.Text> Assign KYC Lead
              </Typography.Text>
            </Flex>
          </Row>
          <Row gutter={[20, 24]}>
            <div className="kyc_admin_base">
              <Form name="executive_form" form={form} onFinish={handleSubmit}>
                <div style={StyleSheet.info}>
                  <Row gutter={[12, 12]}>
                    <Col span={8}>
                      <Flex vertical gap={8}>
                        <Typography.Text type="secondary">Date</Typography.Text>
                        <Tag color="blue" style={{ width: "fit-content" }}>
                          {date}
                        </Tag>
                      </Flex>
                    </Col>
                    <Col span={8}>
                      <Flex vertical gap={8}>
                        <Typography.Text type="secondary">No. of KYC</Typography.Text>
                        <Tag color="success" style={{ width: "fit-content" }}>
                          {totalKycLeadsCount}
                        </Tag>
                      </Flex>
                    </Col>
                    <Col span={8}>
                      <Flex vertical gap={8}>
                        <Typography.Text type="secondary">Remaining Assigned KYC</Typography.Text>
                        <Tag color="error" style={{ width: "fit-content" }}>
                          {remaining}
                        </Tag>
                      </Flex>
                    </Col>
                  </Row>
                </div>
                <Row gutter={[12, 12]}>
                  <Col span={24}>
                    <Typography.Title level={5}>All Executive List</Typography.Title>
                  </Col>
                  {executivesList?.map((item, index) => (
                    <Col key={index} xs={24} sm={12} md={8} lg={8} xl={8}>
                      <Form.Item
                        name={`${item?.value}`}
                        label={capitalizeFirstLetter(item?.label)}
                        labelCol={{ flex: "150px", style: { textAlign: "left" } }} // Fixed width & left-aligned text
                        wrapperCol={{ flex: "auto" }}
                        rules={[
                          { required: true, message: "Lead count is required" },
                          {
                            pattern: /^\d+$/,
                            message: "Only integer values are allowed"
                          }
                        ]}>
                        <Input
                          placeholder="Enter Lead Count"
                          // min={0}
                          onInput={validationNumber}
                          size="large"
                          style={{ width: "60%" }}
                          max={remaining}
                          onChange={(e) => {
                            handleInputChange(item?.value, e.target.value);
                          }}
                        />
                      </Form.Item>
                    </Col>
                  ))}
                </Row>
                <Row gutter={16} className="marginTop24">
                  <Col span={12}>
                    <Button
                      htmlType="button"
                      size="large"
                      className="width100"
                      variant="outlined"
                      onClick={handleReset}>
                      Back
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button size="large" className="width100" type="primary" htmlType="submit">
                      Submit
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </Row>

          {modal && (
            <Modal
              className="modal"
              open={true}
              onCancel={() => {
                handleModal(false);
              }}
              footer={[
                <Button size="large" key="back" onClick={() => handleModal(false)}>
                  Cancel
                </Button>,
                <Button
                  size="large"
                  key="submit"
                  loading={loadingSubmission}
                  disabled={loadingSubmission}
                  type="primary"
                  onClick={handleConfirmationClick}>
                  {"Yes, Assign"}
                </Button>
              ]}
              width={700}>
              <Row>
                <Col span={23}>
                  <Flex gap={16} align="start">
                    <ExclamationCircleOutlined style={StyleSheet.icon} />
                    <Flex vertical>
                      <Typography.Title level={5} className="removeMargin">
                        Confirm Assign KYC Lead
                      </Typography.Title>
                      <Typography.Text className="removeMargin" type="secondary">
                        Are you sure you want to proceed?
                      </Typography.Text>
                    </Flex>
                  </Flex>
                </Col>
              </Row>
              <Row gutter={[20, 10]} style={StyleSheet.content}>
                <>
                  <Col span={8}>
                    <Flex vertical>
                      <Typography.Text type="secondary">Date</Typography.Text>
                      <Typography.Text>{date}</Typography.Text>
                    </Flex>
                  </Col>
                  <Col span={8}>
                    <Flex vertical>
                      <Typography.Text type="secondary">No. of KYC</Typography.Text>
                      <Typography.Text>{totalKycLeadsCount}</Typography.Text>
                    </Flex>
                  </Col>
                  <Col span={8}>
                    <Flex vertical>
                      <Typography.Text type="secondary">Remaining Assigned KYC</Typography.Text>
                      <Typography.Text>{remaining}</Typography.Text>
                    </Flex>
                  </Col>
                </>
              </Row>
            </Modal>
          )}
        </>
      )}
    </Spin>
  ) : null;
};

export default AssignKYCLead;
