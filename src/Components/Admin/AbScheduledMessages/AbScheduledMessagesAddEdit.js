import React, { useEffect, useState } from "react";
import { Button, Col, Form, Input, Row, Select, Switch, theme, Upload } from "antd";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { useMutation } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { enqueueSnackbar } from "notistack";

import {
  PermissionAction,
  snackBarSuccessConf,
  ALLOWED_FILE_IMAGE_TYPES,
  ALLOWED_FILE_SIZE
} from "Helpers/ats.constants";
import { actionsPermissionValidator, validateImageSize } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { getBase64, getFullImageUrl } from "Helpers/functions";

const { TextArea } = Input;
const { Option } = Select;

const AbScheduledMessagesAddEdit = () => {
  const params = useParams();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [image, setImage] = useState();
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);

  const {
    token: { colorBgContainer, colorBorder, colorBgLayout, paddingSM, paddingLG }
  } = theme.useToken();

  // Styles
  const StyleSheet = {
    contentWrapper: {
      paddingTop: paddingLG,
      paddingBottom: paddingSM,
      paddingLeft: paddingLG,
      paddingRight: paddingLG,
      marginRight: -paddingLG,
      marginLeft: -paddingLG,
      marginBottom: -paddingSM,
      marginTop: -16,
      background: colorBgLayout,
      minHeight: "calc(100vh - 195px)"
    },
    contentSubWrapper: {
      paddingTop: paddingSM,
      paddingBottom: paddingSM,
      paddingLeft: paddingLG,
      paddingRight: paddingLG,
      background: colorBgContainer,
      border: `1px solid ${colorBorder}`,
      borderRadius: "10px",
      margin: "0 0 20px",
      width: "100%"
    },
    formWrapper: {
      margin: "0 -10px",
      paddingTop: 0,
      paddingBottom: paddingSM,
      paddingLeft: paddingLG,
      paddingRight: paddingLG
    },
    submitButtonStyle: {
      marginTop: 0,
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px"
    },
    cancelButtonStyle: {
      marginRight: "10px"
    },
    dateRangeStyle: {
      width: "100%"
    },
    textAreaStyle: {
      resize: "vertical"
    },
    switchStyle: {
      marginTop: "8px"
    },
    uploadButton: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: 100,
      cursor: "pointer"
    },
    categoryStyle: {
      width: "100%",
      height: "100%",
      objectFit: "contain"
    }
  };

  // File upload state
  // eslint-disable-next-line no-unused-vars
  const [fileList, setFileList] = useState([]);

  // Upload button UI
  const uploadButton = (
    <div
      style={{
        width: 104,
        height: 104,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
      <UploadOutlined style={{ fontSize: 32 }} />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  // Fetch message data for edit mode
  const { mutate: fetchAbScheduledMessageData, isLoading: loadingAbScheduledMessageData } =
    useMutation(() => apiService.getSingleAbScheduledMessageData(params?.id), {
      onSuccess: (res) => {
        const data = res?.data || {};
        form.setFieldsValue({
          message_title: data.message_title,
          language: data.language,
          days_after_join: String(data.days_after_join),
          display_order: String(data.display_order),
          status: data.status === "active",
          message_template: data.message_template,
          user_type: data.user_type
          // dateRange: [dayjs(data.start_date), dayjs(data.end_date)]
        });

        if (data.message_file) {
          const fullImageUrl = getFullImageUrl(data.message_file);

          setImage(fullImageUrl);
          // setImageId(attachment_id);

          setFileList([
            {
              uid: "-1",
              name: "message_file",
              status: "done",
              url: fullImageUrl,
              thumbUrl: fullImageUrl
            }
          ]);
        }
      },
      onError: (error) => {
        enqueueSnackbar(error?.message || "Failed to load data", { variant: "error" });
      }
    });

  // Create/update mutation
  const { mutate, isLoading: isSaving } = useMutation(
    params?.id
      ? (data) => apiService.updateAbScheduledMessageData(data, params?.id)
      : (data) => apiService.createAbScheduledMessageData(data),
    {
      onSuccess: (response) => {
        enqueueSnackbar(response.message, snackBarSuccessConf);
        navigate(`/${Paths.abScheduledMessagesList}`);
      },
      onError: (error) => {
        enqueueSnackbar(error?.message || "An error occurred", { variant: "error" });
      }
    }
  );

  // Form submit handler
  const onFinish = (values) => {
    // const [startDate, endDate] = values.dateRange;
    const formData = new FormData();

    const { image: uploadedImage } = values || {};

    formData.append("message_title", values.message_title);
    formData.append("language", values.language);
    formData.append("days_after_join", parseInt(values.days_after_join, 10));
    formData.append("display_order", parseInt(values.display_order, 10));
    // formData.append("start_date", startDate.format("YYYY-MM-DD"));
    // formData.append("end_date", endDate.format("YYYY-MM-DD"));
    formData.append("message_template", values.message_template);
    formData.append("status", values.status ? "active" : "inactive");
    formData.append("user_type", values.user_type || "ab");

    // if (fileList.length > 0 && fileList[0].originFileObj) {
    //   formData.append("message_file", fileList[0].originFileObj);
    // }

    uploadedImage?.file && formData.append("message_file", uploadedImage?.file);

    mutate(formData);
  };

  // Disable past dates in date picker
  // const disabledDate = (current) => {
  //   return current && current < dayjs().startOf("day");
  // };

  // Set breadcrumb and permission check on mount
  useEffect(() => {
    setBreadCrumb({
      title: "AB Scheduled Messages",
      icon: "notification",
      titlePath: Paths.abScheduledMessagesList,
      subtitle: params?.id ? "Edit AB Scheduled Message" : "Add AB Scheduled Message",
      path: Paths.abScheduledMessagesAdd
    });

    const hasPermission = actionsPermissionValidator(
      window.location.pathname,
      params?.id ? PermissionAction.EDIT : PermissionAction.ADD
    );

    if (!hasPermission) {
      navigate("/", { state: { from: null }, replace: true });
      return;
    }

    if (params?.id) {
      fetchAbScheduledMessageData();
    } else {
      form.setFieldsValue({
        status: true,
        user_type: "ab",
        language: "hi"
      });
    }
  }, [params?.id, navigate, setBreadCrumb, fetchAbScheduledMessageData, form]);

  const hasPermission = actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  );

  if (!hasPermission) {
    return null;
  }

  const handleChange = (info) => {
    try {
      // Verify the size of file
      if (!validateImageSize(info.file)) {
        form.setFieldValue("image", null);
        return false;
      }

      if (info.file && info.fileList.length === 1) {
        // Get this url from response in real world.
        getBase64(info.fileList[0].originFileObj, (url) => {
          setLoading(false);
          setImage(url);
          form.setFieldValue("image", info);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to remove the uploaded image
  const handleImgRemove = () => {
    if (image) {
      // Revoke the object URL to free up memory
      URL.revokeObjectURL(image);
      setImage(null); // Clear the image state
      form.setFieldValue("image", null);
    }
  };

  return (
    <div style={StyleSheet.contentWrapper}>
      <div style={StyleSheet.contentSubWrapper}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          style={StyleSheet.formWrapper}>
          <Row gutter={[24, 0]}>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Message Title"
                name="message_title"
                rules={[
                  { required: true, message: "Message Title is required" },
                  { min: 3, message: "Message title must be at least 3 characters long" },
                  { max: 100, message: "Message title must not exceed 100 characters" }
                ]}>
                <Input placeholder="Enter message title" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Language"
                name="language"
                rules={[{ required: true, message: "Language is required" }]}>
                <Select placeholder="Select language">
                  <Option value="hi">Hindi</Option>
                  <Option value="en">English</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 0]}>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Days After Join"
                name="days_after_join"
                rules={[
                  { required: true, message: "Days After Join is required" },
                  {
                    pattern: /^[1-9]\d*$/,
                    message: "Please enter a valid positive number"
                  },
                  {
                    validator: (_, value) => {
                      const num = parseInt(value, 10);
                      if (num < 1 || num > 365) {
                        return Promise.reject(
                          new Error("Days after join must be between 1 and 365")
                        );
                      }
                      return Promise.resolve();
                    }
                  }
                ]}>
                <Input placeholder="Enter days after join" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Display Order"
                name="display_order"
                rules={[
                  { required: true, message: "Display Order is required" },
                  {
                    pattern: /^[1-9]\d*$/,
                    message: "Please enter a valid positive number"
                  },
                  {
                    validator: (_, value) => {
                      const num = parseInt(value, 10);
                      if (num < 1 || num > 1000) {
                        return Promise.reject(
                          new Error("Display order must be between 1 and 1000")
                        );
                      }
                      return Promise.resolve();
                    }
                  }
                ]}>
                <Input placeholder="Enter display order" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 0]}>
            {/* <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Date Range"
                name="dateRange"
                rules={[
                  { required: true, message: "Date Range is required" },
                  {
                    validator: (_, value) => {
                      if (value && value.length === 2) {
                        const [startDate, endDate] = value;
                        if (endDate.isBefore(startDate)) {
                          return Promise.reject(
                            new Error("End date must be greater than or equal to start date")
                          );
                        }
                      }
                      return Promise.resolve();
                    }
                  }
                ]}>
                <DatePicker.RangePicker
                  style={StyleSheet.dateRangeStyle}
                  disabledDate={disabledDate}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col> */}
            {/* <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="User Type"
                name="user_type"
                rules={[{ required: true, message: "User Type is required" }]}
                initialValue="ab" // Optional: set default value
              >
                <Select placeholder="Select user type" disabled>
                  <Option value="ab">AB</Option>
                </Select>
              </Form.Item>
            </Col> */}
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Status"
                name="status"
                valuePropName="checked"
                style={StyleSheet.switchStyle}>
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 0]}>
            <Col xs={24}>
              <Form.Item
                label="Message Template"
                name="message_template"
                rules={[
                  { required: true, message: "Message Template is required" },
                  { min: 10, message: "Message template must be at least 10 characters long" },
                  { max: 2000, message: "Message template must not exceed 2000 characters" }
                ]}>
                <TextArea
                  rows={6}
                  style={StyleSheet.textAreaStyle}
                  placeholder="Enter message template. You can use placeholders like {name}, {dist_no}, etc."
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 0]}>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                name="image"
                label="Upload Image"
                extra={`Allowed formats: JPEG, PNG (Max size: ${ALLOWED_FILE_SIZE}MB)`}>
                <Upload
                  name="image"
                  listType="picture-card"
                  className="avatar-uploader"
                  accept={ALLOWED_FILE_IMAGE_TYPES}
                  showUploadList={false}
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={(e) => handleChange(e)}>
                  {image ? (
                    <img src={image} alt="category" style={StyleSheet.categoryStyle} />
                  ) : (
                    uploadButton
                  )}
                </Upload>
              </Form.Item>
              {image && (
                <div className="cover_delete" type="text" onClick={handleImgRemove}>
                  <DeleteOutlined />
                </div>
              )}
            </Col>
          </Row>

          <Row gutter={[24, 0]}>
            <Col xs={24}>
              <div style={StyleSheet.submitButtonStyle}>
                <Button
                  size="large"
                  onClick={() => navigate(`/${Paths.abScheduledMessagesList}`)}
                  style={StyleSheet.cancelButtonStyle}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isSaving || loadingAbScheduledMessageData}>
                  {params?.id ? "Update" : "Submit"}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default AbScheduledMessagesAddEdit;
