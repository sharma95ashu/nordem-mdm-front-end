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
  Skeleton,
  Spin,
  Switch,
  theme
} from "antd";
import { CloudUploadOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { useServices } from "Hooks/ServicesContext";
import { useMutation } from "react-query";
import { Typography } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { Paths } from "Router/Paths";
import { useUserContext } from "Hooks/UserContext";
import {
  ALLOWED_FILE_TYPES,
  PermissionAction,
  generalSettings,
  settingTypeOptions,
  snackBarSuccessConf,
  RULES_MESSAGES,
  settingTypeEcomOptions
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

const BannerList = () => {
  const navigate = useNavigate();
  const { Title } = Typography;
  const { setBreadCrumb } = useUserContext();
  const searchEnable = useRef();
  const { apiService } = useServices();
  const [modal, setModal] = useState(false);
  const [modalform] = useForm();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [loader, setLoader] = useState(false);
  const [images, setImages] = useState({});
  const [editorsValues, setEditorsValues] = useState({});
  const [saveSettingState, setSaveSettingState] = useState(true);
  const [codePlaceholder, setCodePlaceholder] = useState(generalSettings);

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

  // Function to fetch list
  const fetchTableData = async () => {
    try {
      setLoader(true);
      // Define the base URL for the API endpoint
      let baseUrl = `/settings/all/${"ecom"}`;
      // Construct the complete API URL with parameters
      const apiUrl = `${baseUrl}`;
      // Make an API call to get the table data
      const data = await apiService.getRequestWithParams(apiUrl);
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

  // Destructure data, mutate function, loading status, and refetching status from useMutation hook
  const { data, mutate: refetch } = useMutation("fetchsettingData", fetchTableData);

  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? refetch()
      : navigate("/", { state: { from: null }, replace: true });

    // setting breadcrumb
    setBreadCrumb({
      title: "Contact-Us",
      icon: "category",
      path: Paths.users
    });
  }, []);

  const modalSubmit = () => {
    modalform.submit();
  };

  const modalformFinish = (values) => {
    values["properties"] = values?.properties || codePlaceholder;
    values["module"] = "ecom";
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
      const payload = transformObject(val);
      updateSettings(payload);
    } catch (error) {}
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
      setCodePlaceholder(generalSettings);
    } else {
      setCodePlaceholder(generalSettings);
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

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Spin spinning={loader} fullscreen />
      <Row gutter={[12, 30]}>
        <Col className="gutter-row" span={24}>
          <Flex justify="space-between">
            <Title level={5}>Contact Us</Title>

            {/* {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
              <Button
                size="large"
                type="primary"
                className="wrapButton"
                onClick={() => {
                  setModal(true);
                }}>
                <PlusOutlined />
                Add New Setting
              </Button>
            )} */}
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
                                <Flex justify="end">
                                  <Form.Item
                                    name={`setting_id_boolean_${item?.setting_id}`}
                                    label="">
                                    <Switch
                                      size="large"
                                      checkedChildren="Active"
                                      unCheckedChildren="Inactive"
                                    />
                                  </Form.Item>
                                </Flex>
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
          setCodePlaceholder(generalSettings);
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
                    options={settingTypeEcomOptions}
                    filterOption={(input, option) =>
                      (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                    }
                    // onChange={handleBannerTypeSelect}
                  />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={24}>
                <Form.Item
                  name="platform_type"
                  label="Platform Type"
                  rules={[{ required: true, message: "Platform type is required" }]}>
                  <Select
                    mode="multiple"
                    size="large"
                    placeholder="Select platform type"
                    options={[
                      { label: "web", value: "web" },
                      {
                        label: "app",
                        value: "app"
                      }
                    ]}
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
              {/* <Col className="gutter-row" span={24}>
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
              </Col> */}
            </Row>
          </Form>
        </>
      </Modal>
    </>
  ) : (
    ""
  );
};
export default BannerList;
