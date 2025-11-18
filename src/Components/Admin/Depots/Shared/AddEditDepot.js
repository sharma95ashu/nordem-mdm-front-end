/* eslint-disable no-unused-vars */
import {
  Flex,
  Form,
  Spin,
  Typography,
  Input,
  Row,
  Col,
  Button,
  Select,
  Switch,
  Popconfirm
} from "antd";
import { PopconfirmWrapper } from "Components/Shared/Wrappers/PopConfirmWrapper";
import { snackBarSuccessConf } from "Helpers/ats.constants";
import { depotValidateFields, panInput, panRegex } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Paths } from "Router/Paths";

const AddEditDepot = ({ isEdit = false }) => {
  const [statesList, setStatesList] = useState([]);
  const [depotDetails, setDepotDetails] = useState({});
  const [form] = Form.useForm();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const params = useParams();
  const navigate = useNavigate();

  // Set Breadcrumb
  useEffect(() => {
    setBreadCrumb({
      title: "Manage Depots",
      titlePath: Paths.depotList,
      subtitle: isEdit ? "Edit " : "Add ",
      path: Paths.depotList
    });
    form.setFieldValue("status", true); // set status
  }, []);

  // Form Finish
  const handleFinish = (values) => {
    // values = Object.fromEntries(Object.entries(values).filter(([_, value]) => Boolean(value)));

    // API Call
    if (isEdit) {
      updateDepot({
        depotData: {
          ...values,
          status: values?.status === false ? "inactive" : "active"
        }
      });
    } else {
      addDepot({
        depotData: {
          ...values,
          status: values?.status === false ? "inactive" : "active",
          ...(values?.create_ecom_login !== undefined && {
            create_ecom_login: values.create_ecom_login
          })
        }
      });
    }
  };

  // On Edit
  useEffect(() => {
    let depotId = params.id ?? null;
    if (isEdit && depotId) {
      getSingleDepotDetails(depotId);
    }
  }, [isEdit]);

  // States
  const { isLoading: statesLoading } = useQuery(
    ["states"],
    () => apiService.getAllStatesForDepot(),
    {
      enabled: true,
      onSuccess: (res) => {
        if (res?.success && res?.data) {
          const fields =
            res?.data?.map((e) => ({ label: e?.state_name, value: e?.state_code })) || [];
          setStatesList(fields);
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  // API Call to add depots
  const { mutate: updateDepot, isLoading: updateLoading } = useMutation(
    (data) => apiService.updateDepot(params.id, data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data.success && data?.data) {
          enqueueSnackbar(data.message, snackBarSuccessConf);
          navigate(`/${Paths.depotList}`);
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  // API Call to add depots
  const { mutate: addDepot, isLoading } = useMutation((data) => apiService.addNewDepot(data), {
    // Configuration options for the mutation
    onSuccess: (data) => {
      if (data.success && data?.data) {
        enqueueSnackbar(data.message, snackBarSuccessConf);
        navigate(`/${Paths.depotList}`);
      }
    },
    onError: (error) => {
      console.log(error);
    }
  });

  // Get Depot Details
  const { mutate: getSingleDepotDetails, isLoading: loading } = useMutation(
    (data) => apiService.getSingleDepot(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data.success && data?.data) {
          const depotData = data.data;
          setDepotDetails(depotData);
          form.setFieldsValue(depotData); // set all fields
          form.setFieldValue("status", depotData["status"] === "active" ? true : false); // set status
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  // Set Region On Load
  useEffect(() => {
    if (statesList.length > 0 && isEdit && depotDetails?.region) {
      const stateCode = statesList.find((e) => e.value === depotDetails?.region);
      form.setFieldValue("region", stateCode?.value);
    }
  }, [statesList, depotDetails]);

  return (
    <Spin spinning={updateLoading || statesLoading || isLoading || loading}>
      <Flex vertical gap={24}>
        <Typography.Title level={5} className="removeMargin">
          {!isEdit ? " Add Depot" : "Edit Depot"}
        </Typography.Title>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Row gutter={[24, 0]}>
            {/* Depot Code */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Depot Code"
                name="depot_code"
                rules={[
                  { required: true, message: "Please enter depot code" },
                  {
                    validator: (rule, value) => {
                      return depotValidateFields.depotCode(rule, value);
                    }
                  }
                ]}>
                <Input
                  size="large"
                  maxLength={10}
                  placeholder="Enter depot code"
                  disabled={isEdit && depotDetails?.depot_code}
                />
              </Form.Item>
            </Col>

            {/* Depot Name */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Depot Name"
                name="depot_name"
                rules={[
                  { required: true, message: "Please enter depot name" },
                  {
                    validator: (rule, value) => {
                      return depotValidateFields.depotName(rule, value);
                    }
                  }
                ]}>
                <Input size="large" maxLength={255} placeholder="Enter depot name" />
              </Form.Item>
            </Col>

            {/* Phone */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Please enter your phone number"
                  },
                  {
                    pattern: /^[6-9]\d{0,9}$/,
                    message: "Mobile number should start with a digit between 6 and 9."
                  }
                ]}>
                <Input
                  size="large"
                  maxLength={10}
                  placeholder="Enter phone number"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                  }}
                  disabled={isEdit && depotDetails?.phone}
                />
              </Form.Item>
            </Col>

            {/* Email */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email_id"
                rules={[{ type: "email", message: "Please enter valid email" }]}>
                <Input size="large" placeholder="Enter email" />
              </Form.Item>
            </Col>

            {/* GST Number */}
            <Col xs={24} md={12}>
              <Form.Item
                label="GST Number"
                name="gst_no"
                rules={[
                  {
                    pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/,
                    message: "Please enter valid GST number"
                  }
                ]}>
                <Input size="large" maxLength={15} placeholder="Enter GST number" />
              </Form.Item>
            </Col>

            {/* PAN Number */}
            <Col xs={24} md={12}>
              <Form.Item
                label="PAN Number"
                name="pan_no"
                rules={[
                  {
                    pattern: panRegex,
                    message: "Please enter valid PAN number"
                  }
                ]}>
                <Input
                  size="large"
                  maxLength={10}
                  placeholder="Enter PAN number"
                  onInput={panInput}
                />
              </Form.Item>
            </Col>

            {/* City */}
            <Col xs={24} md={12}>
              <Form.Item
                label="City"
                name="city"
                rules={[
                  { required: true, message: "Please enter city" },
                  {
                    validator: (rule, value) => {
                      return depotValidateFields.city(rule, value);
                    }
                  }
                ]}>
                <Input
                  size="large"
                  maxLength={50}
                  placeholder="Enter city"
                  disabled={isEdit && depotDetails?.city}
                />
              </Form.Item>
            </Col>

            {/* State */}
            <Col xs={24} md={12}>
              <Form.Item
                label="State"
                name="region"
                rules={[{ required: true, message: "Please choose state" }]}>
                <Select
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                  }
                  size="large"
                  options={statesList}
                  placeholder="Select State"
                  disabled={isEdit && depotDetails?.region}></Select>
              </Form.Item>
            </Col>

            {/* Pincode */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Pincode"
                name="pincode"
                rules={[
                  { required: true, message: "Please enter pincode" },
                  { pattern: /^[0-9]{6}$/, message: "Please enter valid 6 digit pincode" }
                ]}>
                <Input
                  size="large"
                  maxLength={6}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                  }}
                  placeholder="Enter pincode"
                  disabled={isEdit && depotDetails?.pincode}
                />
              </Form.Item>
            </Col>

            {/* Address Line 1 */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Address Line 1"
                name="address_1"
                rules={[
                  { required: true, message: "Please enter address line 1" },
                  {
                    validator: (rule, value) => {
                      return depotValidateFields.addressLine(rule, value);
                    }
                  }
                ]}>
                <Input size="large" maxLength={255} placeholder="Enter address line 1" />
              </Form.Item>
            </Col>

            {/* Address Line 2 */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Address Line 2"
                name="address_2"
                rules={[
                  {
                    validator: (rule, value) => {
                      return depotValidateFields.addressLine(rule, value);
                    }
                  }
                ]}>
                <Input size="large" maxLength={255} placeholder="Enter address line 2 (optional)" />
              </Form.Item>
            </Col>

            {/* Address Line 3 */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Address Line 3"
                name="address_3"
                rules={[
                  {
                    validator: (rule, value) => {
                      return depotValidateFields.addressLine(rule, value);
                    }
                  }
                ]}>
                <Input size="large" maxLength={255} placeholder="Enter address line 3 (optional)" />
              </Form.Item>
            </Col>

            {/* Address Line 4 */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Address Line 4"
                name="address_4"
                rules={[
                  {
                    validator: (rule, value) => {
                      return depotValidateFields.addressLine(rule, value);
                    }
                  }
                ]}>
                <Input size="large" maxLength={255} placeholder="Enter address line 4 (optional)" />
              </Form.Item>
            </Col>

            <Col xs={24} md={4}>
              <Form.Item label="Status" name="status" valuePropName="checked">
                <Switch checkedChildren="active" unCheckedChildren="inactive" />
              </Form.Item>
            </Col>
            {!isEdit && (
              <Col xs={24} md={8}>
                <Form.Item
                  label="Create Ecom Login"
                  name="create_ecom_login"
                  valuePropName="checked">
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col>
            )}
          </Row>

          {/*  Buttons */}

          <Flex justify="end" align="center" gap={12}>
            <Button size="large" onClick={() => navigate(`/${Paths.depotList}`)}>
              Cancel
            </Button>
            {isEdit ? (
              <PopconfirmWrapper
                title={"Update Depot"}
                description={"Are you sure want to update depot?"}
                onConfirm={() => {
                  form.submit(); // submit form on confirm
                }}
                okText="Yes"
                cancelText="No"
                ChildComponent={
                  <Button size="large" type="primary" htmlType="button">
                    Update
                  </Button>
                }
              />
            ) : (
              <PopconfirmWrapper
                title={"Add Depot"}
                description={"Are you sure want to add depot?"}
                onConfirm={() => {
                  form.submit(); // submit form on confirm
                }}
                okText="Yes"
                cancelText="No"
                ChildComponent={
                  <Button size="large" type="primary" htmlType="button">
                    Add
                  </Button>
                }
              />
            )}
          </Flex>
        </Form>
      </Flex>
    </Spin>
  );
};

export default AddEditDepot;
