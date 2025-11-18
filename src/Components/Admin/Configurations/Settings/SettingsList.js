/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Col,
  Row,
  Flex,
  Modal,
  Form,
  Select,
  Input,
  List,
  Upload,
  Spin,
  Switch,
  theme,
  Space
} from "antd";
import { CloudUploadOutlined, PlusOutlined } from "@ant-design/icons";
import { useServices } from "Hooks/ServicesContext";
import { useMutation, useQuery } from "react-query";
import { Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { Paths } from "Router/Paths";
import { useUserContext } from "Hooks/UserContext";
import {
  ALLOWED_FILE_TYPES,
  PermissionAction,
  advancedExampleData,
  generalExampleData,
  settingTypeOptions,
  snackBarSuccessConf,
  RULES_MESSAGES,
  KYC_SCHEDULE_MAINTENANCE
} from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  checkIfEditorEmpty,
  firstlettCapital,
  validateFileSize
} from "Helpers/ats.helper";
import { useForm } from "antd/es/form/Form";
import TextArea from "antd/es/input/TextArea";
import JSONInput from "react-json-editor-ajrm";
import locale from "react-json-editor-ajrm/locale/en";
import { enqueueSnackbar } from "notistack";
import RichEditor from "Components/Shared/richEditor";
import MaintenanceModeModal from "./MaintenanceModeModal";
import dayjs from "dayjs";

const BannerList = () => {
  const navigate = useNavigate();
  const { Title } = Typography;
  const { setBreadCrumb } = useUserContext();
  const searchEnable = useRef();
  const { apiService } = useServices();
  const [modal, setModal] = useState(false);
  const [modalform] = useForm();
  const [maintenanceForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [loader, setLoader] = useState(false);
  const [images, setImages] = useState({});
  const [editorsValues, setEditorsValues] = useState({});
  const [saveSettingState, setSaveSettingState] = useState(true);
  const [codePlaceholder, setCodePlaceholder] = useState(generalExampleData);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [scheduleList, setScheduleList] = useState({});
  const [dateRange, setDateRange] = useState([]);
  const [permissionsArr, setPermissionsArr] = useState([]);
  const [schedulerId, setSchedularId] = useState(null);
  const [modules, setModules] = useState([]);
  const [optionValue, setOptionValue] = useState(null);

  const [initialValues, setInitialValues] = useState({});

  const {
    token: { colorText }
  } = theme.useToken();

  const StyleSheet = {
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
    uploadBoxStyle: {
      position: "relative"
    },
    categoryStyle: {
      width: "100%",
      height: "100%",
      objectFit: "contain"
    }
  };

  const { refetch: modulesData } = useQuery("kycModules", () => apiService.getAllKycModules(), {
    onSuccess: (data) => {
      if (data?.data) {
        setModules(data.data);
      }
    }
  });

  // Function to fetch list
  const fetchTableData = async () => {
    try {
      setLoader(true);
      // Define the base URL for the API endpoint
      let baseUrl = `/settings/all/${"mdm"}`;
      // Construct the complete API URL with parameters
      const apiUrl = `${baseUrl}`;
      // Make an API call to get the table data
      const data = await apiService.getRequest(apiUrl);
      // Check if the API call is successful
      if (data.success) {
        searchEnable.current = false;

        let tableData = data?.data.map((item, index) => ({ ...item, key: index }));

        const tempObj = {};

        const tempImages = {};
        data?.data?.forEach((item, k) => {
          if (item?.type == "image") {
            tempImages[`setting_id_${item?.setting_id}`] = item?.option_value;
          }
          if (item?.type == "switch") {
            tempObj[`setting_id_boolean_${item?.setting_id}`] =
              item?.option_value == "true" ? true : false;
          } else {
            tempObj[`setting_id_${item?.setting_id}`] = item?.option_value;
            editorsValues[`setting_id_${item?.setting_id}`] = item?.option_value;
            // setEditorsValues({ [`setting_id_${item?.setting_id}`]: item?.option_value, ...editorsValues });
          }

          if (item.option_slug === KYC_SCHEDULE_MAINTENANCE && item?.properties?.modules) {
            const { start_date, end_date, modules } = item.properties;
            setDateRange([dayjs(Number(start_date)), dayjs(Number(end_date))]);
            setScheduleList({ start_date, end_date, modules });
            setPermissionsArr(modules);
            setOptionValue([item.properties]);
            // api to call kyc module list
            modulesData();
          } else if (item.option_slug === KYC_SCHEDULE_MAINTENANCE) {
            // reset if no modules
            setOptionValue([]);
            setPermissionsArr([]);
          }

          if (k == data?.data?.length - 1) {
            setEditorsValues(editorsValues);
          }
        });
        setInitialValues(tempObj);
        form.setFieldsValue(tempObj);
        setImages(tempImages);
        setLoader(false);
        // Return the fetched data
        return tableData;
      }
    } catch (error) {
      // Handle errors by displaying a Snackbar notification
    }
  };

  // function to close maintenance modal
  const handleCancelMaintenanceModal = () => {
    try {
      if (!scheduleList.start_date) {
        form.setFieldValue(schedulerId, false);
      }
      setShowMaintenance(false);
    } catch (error) {}
  };

  const submitHandleMaintenance = () => {
    setShowMaintenance(false);
  };

  // Destructure data, mutate function, loading status, and refetching status from useMutation hook
  const { data, mutate: refetch } = useMutation("fetchsettingData", fetchTableData);

  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? refetch()
      : navigate("/", { state: { from: null }, replace: true });

    // setting breadcrumb
    setBreadCrumb({
      title: "Settings",
      icon: "category",
      path: Paths.users
    });
  }, []);

  const modalSubmit = () => {
    modalform.submit();
  };

  const modalformFinish = (values) => {
    values["properties"] = values?.properties || codePlaceholder;
    values["module"] = "mdm";
    try {
      let tempObj = { ...values };
      setLoader(true);
      mutate(tempObj);
    } catch (error) {}
  };

  // UseMutation hook for creating a new setting via API
  const { mutate, isLoading: createSettinglaoding } = useMutation(
    // Mutation function to handle the API call for creating a new setting
    (data) => apiService.createSetting(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        // Display a success Snackbar notification with the API response message
        if (data) {
          setModal(false);
          enqueueSnackbar(data.message, snackBarSuccessConf);
          modalform.resetFields();
          refetch();
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // function  to handle view module
  const handleViewModule = (id) => {
    try {
      setSchedularId(id);
      setShowMaintenance(true);
    } catch (error) {}
  };

  const handleFileChange = (info, id) => {
    // Varify the size of file
    if (!validateFileSize(info.file)) {
      return false;
    }
    const getBase64 = (img, callback) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => callback(reader.result));
      reader.readAsDataURL(img);
    };

    if (info.file && info.fileList.length === 1) {
      // Get this url from response in real world.
      getBase64(info.fileList[0].originFileObj, (url) => {
        form.setFieldValue(`setting_id_${id}`, url);
        setImages({ ...images, [`setting_id_${id}`]: url });
      });
    }
  };

  const uploadButton = (
    <button style={StyleSheet.uploadBtnStyle} type="button">
      <CloudUploadOutlined style={StyleSheet.cloudIconStyle} />

      {!loading && <div style={StyleSheet.uploadLoadingStyle}>Upload</div>}
    </button>
  );

  // UseMutation hook for creating a new setting via API
  const { mutate: updateSettings, isLoading: saveSettingLoading } = useMutation(
    // Mutation function to handle the API call for creating a new setting
    (data) => apiService.updateAllSettings(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        // Display a success Snackbar notification with the API response message
        if (data) {
          setPermissionsArr([]);
          setScheduleList({});
          setModal(false);
          enqueueSnackbar(data.message, snackBarSuccessConf);
          form.resetFields();
          refetch();
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // tranforming form object data for payload
  const transformObject = (inputObject) => {
    try {
      const outputArray = [];
      for (const key in inputObject) {
        let settingId = key.replace(/^setting_id(?:_boolean)?_/, ""); // Extract settingId
        let optionValue = key.includes("_boolean")
          ? String(!!inputObject[key])
          : inputObject[key]
            ? inputObject[key]
            : null; // Extract optionValue
        outputArray.push({ setting_id: settingId, option_value: optionValue }); // Push to outputArray
      }

      return outputArray;
    } catch (error) {
      return []; // Return an empty array in case of error
    }
  };

  const onFinish = (val) => {
    try {
      // Transform the form values into API-ready payload
      let payload = transformObject(val);

      // If schedulerId exists, attach scheduleList to the relevant setting
      if (schedulerId) {
        payload = payload.map((item) => {
          if (parseInt(item.setting_id) === schedulerId && item.option_value != "false") {
            item.properties = scheduleList;
          }
          return item;
        });
      }

      // Call API to update settings
      updateSettings(payload);
    } catch (error) {
      console.error(error);
    }
  };

  const maxHandleDescription = (value, field) => {
    try {
      let updatedValue = checkIfEditorEmpty(value);
      let obj = { ...editorsValues, [field]: updatedValue };
      setEditorsValues(obj);
      form.setFieldValue(field, value);
      handleValuesChange(null, obj);
    } catch (error) {}
  };

  const settingTypeCheck = (value) => {
    if (value == "text" || value == "number") {
      setCodePlaceholder(advancedExampleData);
    } else {
      setCodePlaceholder(generalExampleData);
    }
  };

  // You can perform further logic based on the changed fields
  const handleValuesChange = (changedValues, allValues) => {
    const allValuesSame = Object.keys(allValues).every((key) => {
      if (initialValues[key] !== allValues[key]) {
        if (initialValues[key] === null && allValues[key] === "") {
          return true;
        } else {
          return false;
        }
      }
      return true;
    });
    setSaveSettingState(allValuesSame);
  };

  // Event handler to update form data on change
  const handleChange = (id, value, type) => {
    try {
      if (type === KYC_SCHEDULE_MAINTENANCE && value) {
        setSchedularId(id);
        setShowMaintenance(true);
      }
    } catch (error) {}
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Spin spinning={loader} fullscreen />
      <Row gutter={[12, 30]}>
        <Col className="gutter-row" span={24}>
          <Flex justify="space-between">
            <Title level={5}>All Settings</Title>

            {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
              <Button
                size="large"
                type="primary"
                className="wrapButton"
                onClick={() => {
                  setModal(true);
                }}>
                <PlusOutlined />
                Add New Setings
              </Button>
            )}
          </Flex>
        </Col>
        <Col span={24}>
          <Form
            onValuesChange={handleValuesChange}
            name="form_item_path"
            form={form}
            layout="vertical"
            onFinish={onFinish}>
            <Row>
              <Col className="gutter-row" span={24}>
                <List
                  itemLayout="horizontal"
                  dataSource={data}
                  renderItem={(item, index) => (
                    <List.Item>
                      {item?.type == "editor" ? (
                        <>
                          <Row style={{ width: "100%" }}>
                            <Col span={24}>
                              <List.Item.Meta
                                title={firstlettCapital(item?.option_name)}
                                description={firstlettCapital(item?.description)}
                              />
                            </Col>
                            <Col span={24} style={{ marginTop: "10px" }}>
                              <Form.Item name={`setting_id_${item?.setting_id}`} label="">
                                <RichEditor
                                  placeholder="Type Here.."
                                  description={editorsValues[`setting_id_${item?.setting_id}`]}
                                  handleDescription={(val) => {
                                    maxHandleDescription(val, `setting_id_${item?.setting_id}`);
                                  }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </>
                      ) : (
                        <>
                          <Row style={{ width: "100%" }}>
                            <Col span={20}>
                              <List.Item.Meta
                                title={firstlettCapital(item?.option_name)}
                                description={firstlettCapital(item?.description)}
                              />
                            </Col>
                            <Col span={4}>
                              {item?.type == "number" || item?.type == "text" ? (
                                <Form.Item
                                  name={`setting_id_${item?.setting_id}`}
                                  label=""
                                  rules={
                                    item?.type === "number"
                                      ? [
                                          { pattern: /^\d+(\.\d+)?$/, message: "Invalid value" },
                                          {
                                            min: item?.properties?.minLength,
                                            message: `Length must be at least ${item?.properties?.minLength} digits!`
                                          },
                                          {
                                            max: item?.properties?.maxLength,
                                            message: `Length cannot exceed ${item?.properties?.maxLength} digits!`
                                          }
                                        ]
                                      : [
                                          {
                                            min: item?.properties?.minLength,
                                            message: `Length must be at least ${item?.properties?.minLength} characters!`
                                          },
                                          {
                                            max: item?.properties?.maxLength,
                                            message: `Length cannot exceed ${item?.properties?.maxLength} characters!`
                                          }
                                        ]
                                  }>
                                  <Input
                                    addonAfter={item?.properties?.suffix}
                                    addonBefore={item?.properties?.prefix}
                                    placeholder={
                                      item?.type === "number" ? "Enter number" : "Enter text"
                                    }
                                    type={item?.type === "number" ? "number" : "text"}
                                    size="large"
                                    // min={item?.type === "number" ? 0 : undefined}
                                  />
                                </Form.Item>
                              ) : item?.type == "image" ? (
                                <>
                                  <Form.Item
                                    name={`setting_id_${item?.setting_id}`}
                                    label=""
                                    extra="Allowed formats: JPEG, PNG (Max size: 2MB)">
                                    <Upload
                                      listType="picture-card"
                                      className="avatar-uploader"
                                      accept={ALLOWED_FILE_TYPES}
                                      showUploadList={false}
                                      maxCount={1}
                                      beforeUpload={() => false}
                                      onChange={(e) => handleFileChange(e, item?.setting_id)}>
                                      {images[`setting_id_${item?.setting_id}`] ? (
                                        <img
                                          src={images[`setting_id_${item?.setting_id}`]}
                                          alt="category"
                                          style={StyleSheet.categoryStyle}
                                        />
                                      ) : (
                                        uploadButton
                                      )}
                                    </Upload>
                                  </Form.Item>
                                </>
                              ) : (
                                <Space direction="vertical" align="center" size={0}>
                                  <Flex vertical={true} align="center" justify="center">
                                    <Form.Item
                                      name={`setting_id_boolean_${item?.setting_id}`}
                                      label=""
                                      style={{ marginBottom: 0 }}>
                                      <Switch
                                        size="large"
                                        checkedChildren="Active"
                                        unCheckedChildren="Inactive"
                                        onChange={(checked) =>
                                          handleChange(
                                            item.setting_id || false,
                                            checked,
                                            item.option_slug
                                          )
                                        }
                                      />
                                    </Form.Item>
                                    {item.option_slug == KYC_SCHEDULE_MAINTENANCE &&
                                    form.getFieldValue(`setting_id_boolean_${item?.setting_id}`) ? (
                                      <Button
                                        type="link"
                                        onClick={() =>
                                          handleViewModule(
                                            item.setting_id || false,
                                          )
                                        }>
                                        View Config
                                      </Button>
                                    ) : null}
                                  </Flex>
                                </Space>
                              )}
                            </Col>
                          </Row>
                        </>
                      )}
                    </List.Item>
                  )}
                />
              </Col>
              {data?.length > 0 && (
                <Col span={24}>
                  <Flex justify="end">
                    {/* <Button disabled={!form.isFieldsTouched()} type="primary" htmlType="submit" loading={saveSettingLoading}>
                      Save Settings
                    </Button> */}

                    <Button
                      disabled={saveSettingState}
                      type="primary"
                      htmlType="submit"
                      loading={saveSettingLoading}>
                      Save Settings
                    </Button>
                  </Flex>
                </Col>
              )}
            </Row>
          </Form>
        </Col>
      </Row>

      <Modal
        title="Add Settings Info"
        centered
        open={modal}
        closable={true}
        onCancel={() => {
          setModal(false);
          setCodePlaceholder(generalExampleData);
        }}
        width={700}
        footer={[
          <Button key="back" type="primary" loading={createSettinglaoding} onClick={modalSubmit}>
            Add
          </Button>
        ]}>
        <>
          <Form name="form_item_path" form={modalform} layout="vertical" onFinish={modalformFinish}>
            <Row gutter={[24, 0]}>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="option_name"
                  label="Setting Name"
                  type="text"
                  rules={[
                    { required: true, whitespace: true, message: "Setting Name is required" },
                    {
                      pattern: /^.{1,75}$/,
                      message: "The value must be between 1 and 75 characters long."
                    },
                    {
                      pattern: /^\S(.*\S)?$/,
                      message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE
                    },
                    {
                      pattern: /^(?!.*\s{2,}).*$/,
                      message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                    }
                  ]}>
                  <Input placeholder="Enter Setting Name" type="text" size="large" />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="type"
                  label="Setting Type"
                  rules={[{ required: true, whitespace: true, message: "Type is required" }]}>
                  <Select
                    // style={{ width: "100%" }}
                    onChange={(e) => settingTypeCheck(e)}
                    size="large"
                    placeholder="Select Setting Type"
                    options={settingTypeOptions}
                    filterOption={(input, option) =>
                      (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                    }
                    // onChange={handleBannerTypeSelect}
                  />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={24}>
                <Form.Item
                  name="description"
                  label="Setting Description"
                  rules={[
                    { required: true, whitespace: true, message: "Setting Description is required" }
                  ]}>
                  {/* <Input placeholder="Content" size="large" type="text" /> */}
                  <TextArea rows={4} placeholder="Enter here.. " />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={24}>
                <Form.Item name="properties" label="Properties">
                  <JSONInput
                    id={1}
                    placeholder={codePlaceholder}
                    // theme="light_mitsuketa_tribute"
                    locale={locale}
                    height="auto"
                    style={{ body: { minHeight: "100px", borderRadius: "4px" } }}
                    width="100%"
                    // value={codePlaceholder}
                    onChange={(val) => {
                      modalform.setFieldValue("properties", val.jsObject);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </>
      </Modal>

      <MaintenanceModeModal
        open={showMaintenance}
        submitHandleMaintenance={submitHandleMaintenance}
        handleCancelMaintenanceModal={handleCancelMaintenanceModal}
        StyleSheet={StyleSheet}
        permissionsArr={permissionsArr}
        setPermissionsArr={setPermissionsArr}
        modules={modules}
        setScheduleList={setScheduleList}
        dateRange={dateRange}
        setDateRange={setDateRange}
        optionValue={optionValue}
        form={maintenanceForm}
        setSaveSettingState={setSaveSettingState}
      />
    </>
  ) : (
    ""
  );
};
export default BannerList;
