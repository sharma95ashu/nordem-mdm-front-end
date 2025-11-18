import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Switch,
  theme,
  Typography
} from "antd";

import {
  PermissionAction,
  RULES_MESSAGES,
  snackBarErrorConf,
  snackBarSuccessConf
} from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Paths } from "Router/Paths";

// Employee Add/Edit Component
const EmployeeAddEdit = () => {
  const params = useParams();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [alldepartment, setAllDepartment] = useState([]);
  const [allcompany, setAllCompany] = useState([]);

  useQuery(
    "getAllDepartmentList",
    // Function to fetch data of all department using apiService.getAllDepartment
    () => apiService.getAllDepartment(),
    {
      // Configuration options
      enabled: true, // Enable the query by default
      onSuccess: (data) => {
        if (data.success && data?.data?.length > 0) {
          const departments = data?.data?.map((val) => {
            return {
              label: val.department_name,
              value: val.department_id
            };
          });
          setAllDepartment(departments);
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // UseQuery hook for fetching data of all company from the API
  useQuery(
    "getAllCompanyList",

    // Function to fetch data of all company using apiService.getAllCompany
    () => apiService.getAllCompany(),
    {
      // Configuration options
      enabled: true, // Enable the query by default
      onSuccess: (data) => {
        if (data.success && data?.data?.length > 0) {
          const company = data?.data?.map((val) => ({
            label: val.company_name,
            value: val.company_id
          }));
          setAllCompany(company);
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  const {
    token: { colorText }
  } = theme.useToken();

  // UseMutation hook for  fetching single employee data
  const { mutate: fetchEmployeeData, isLoading: loadingEmployeeData } = useMutation(
    (data) => apiService.getSingleEmployeeData(params?.id),
    {
      // Configuration options for the mutation
      onSuccess: (response) => {
        if (response.data) {
          form.setFieldsValue(response.data);
        }
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
      }
    }
  );

  const onFinish = (value) => {
    try {
      mutate(value); // Make the API call
    } catch (error) {
      console.log("error", error);
    }
  };

  // UseMutation hook for add/edit employee via API
  const { mutate, isLoading } = useMutation(
    (data) => {
      const { company_id, dept_id, full_name, status, work_location } = data;
      const updatedData = {
        company_id,
        dept_id,
        employeeId: params?.id,
        full_name,
        status,
        work_location
      };

      // API call
      return apiService.addUpdateEmployee(params?.id, params?.id ? updatedData : data);
    },
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data.success) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          navigate(`/${Paths.employeeList}`);
        }
      },
      onError: (error) => {
        console.error("Error:", error);
        // Handle error (e.g., show error notification)
      }
    }
  );

  const StyleSheet = {
    backBtnStyle: {
      marginRight: "10px"
    },
    uploadBtnStyle: {
      border: 0,
      background: "none"
    },
    cloudIconStyle: {
      fontSize: "1.5rem",
      color: colorText
    },
    uploadLoadingStyle: {
      marginTop: 8,
      color: colorText
    },
    categoryStyle: {
      width: "100%",
      height: "100%",
      objectFit: "contain"
    }
  };

  useEffect(() => {
    actionsPermissionValidator(
      window.location.pathname,
      params?.id ? PermissionAction.EDIT : PermissionAction.ADD
    )
      ? ""
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Employee",
      icon: "employee",
      titlePath: Paths.employeeList,
      subtitle: params?.id ? "Edit Employee" : "Add Employee",
      path: Paths.employeeList
    });

    if (params?.id) {
      fetchEmployeeData(); // api call for fetching single employee data
    } else {
      //initializing default values
      form.setFieldValue("status", true);
    }
  }, []);

  return (
    <>
      <Spin spinning={loadingEmployeeData} fullscreen />
      <Typography.Title level={5}>
        {params?.id ? "Edit Employee" : "Add Employee"}
      </Typography.Title>

      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[20, 10]}>
          <Col
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}
            className="gutter-row">
            <Form.Item
              name="full_name"
              label="Full Name"
              rules={[
                { required: true, message: `Full Name is required` },
                { pattern: /^.{0,150}$/, message: "Value should not exceed 150 characters" },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                }
              ]}>
              <Input placeholder="Enter Full Name" size="large" />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              type="number"
              name="phone_number"
              label="Mobile Number"
              rules={[
                { required: true, message: "Mobile number is required" },
                { pattern: /^[6-9]{1}[0-9]{9}$/, message: "Please enter a valid phone number" }
              ]}>
              <Input
                maxLength={10}
                size="large"
                placeholder="Enter Mobile Number"
                disabled={params?.id}
              />
            </Form.Item>
          </Col>
          <Col
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}
            className="gutter-row">
            <Form.Item
              name="dept_id"
              label="Department"
              rules={[{ required: true, message: `Department is required` }]}>
              <Select
                size="large"
                allowClear
                showSearch
                placeholder="Select Department"
                options={alldepartment}
                filterOption={(input, option) =>
                  (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="work_location"
              label="Work Location"
              rules={[
                { required: true, message: "Work Location is required" },
                {
                  pattern: /^.{2,150}$/,
                  message: "The value must be between 2 and 150 characters long."
                },
              ]}>
              <Input size="large" placeholder="Enter Work Location" />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="company_id"
              label="Company"
              rules={[{ required: true, message: "Company is required" }]}>
              <Select
                placeholder="Select Company"
                allowClear
                size="large"
                options={allcompany}
              />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 6 }}>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>

          <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
            <Flex align="start" justify={"flex-end"}>
              <NavLink to={"/" + Paths.employeeList}>
                <Button style={StyleSheet.backBtnStyle} disabled={isLoading}>
                  Cancel
                </Button>
              </NavLink>
              {actionsPermissionValidator(
                window.location.pathname,
                params?.id ? PermissionAction.EDIT : PermissionAction.ADD
              ) && (
                <Button type="primary" htmlType="submit" loading={isLoading} disabled={isLoading}>
                  {params?.id ? "Update" : "Add"}
                </Button>
              )}
            </Flex>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default EmployeeAddEdit;
