import { PermissionAction, snackBarSuccessConf, RULES_MESSAGES } from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Skeleton,
  Spin,
  Switch,
  theme,
  Typography,
  Upload
} from "antd";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { ALLOWED_FILE_TYPES } from "Helpers/ats.constants";
import { CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { validateFileSize } from "Helpers/ats.helper";
import { getBase64, getFullImageUrl } from "Helpers/functions";

// Add/Edit Marketing Plan Language Component
export default function AddEditMarketingPlanLanguage() {
  const params = useParams();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [langImage, setLangImage] = useState();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState();
  const {
    token: { colorText }
  } = theme.useToken();

  /***
   * styles
   */
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
    uploadBoxStyle: {
      position: "relative",
      maxWidth: "105px"
    }
  };

  /**
   * Category image css
   */
  const categoryStyle = {
    width: "100%",
    height: "100%",
    objectFit: "contain"
  };

  /**
   * Update Button UI
   */

  const uploadButton = (
    <button style={StyleSheet.uploadBtnStyle} type="button">
      {loading ? (
        <Skeleton.Image active={loading} />
      ) : (
        <CloudUploadOutlined style={StyleSheet.cloudIconStyle} />
      )}
      {!loading && <div style={StyleSheet.uploadLoadingStyle}>Upload</div>}
    </button>
  );
  // hook for fetching single marketing plan language data
  const { mutate: fetchSingleMarketingPlanLanguageData, isLoading: loadingSingleLanguageData } =
    useMutation(
      "fetchSingleMarketingPlanLanguageData",
      () => apiService.getSingleMarketingPlanLanguage(params.id),
      {
        enabled: false, // Enable the query by default
        onSuccess: (data) => {
          try {
            if (data.success && data.data) {
              const { status } = data.data;
              form.setFieldsValue(data.data);
              form.setFieldValue("status", status == "active");
              setCode(data?.data?.mp_language_code);
              setLangImage(data?.data?.file_path ? getFullImageUrl(data?.data?.file_path) : "");
              form.setFieldValue("language_image", getFullImageUrl(data?.data?.file_path));
            }
          } catch (error) {}
        },
        onError: (error) => {
          // Handle errors by displaying a Snackbar notification
        }
      }
    );

  /**
   * Function to submit form data
   * @param {*} value
   */
  const onFinish = (values) => {
    try {
      const formData = new FormData();

      // Append form fields
      formData.append("mp_language_name", values.mp_language_name);
      formData.append("mp_language_code", values.mp_language_code.toUpperCase());
      formData.append("display_order", values.display_order);
      formData.append("status", values.status == false ? "inactive" : "active");

      // Handle image
      if (values?.language_image?.file && langImage) {
        formData.append("language_image", values?.language_image?.file);
      }
      mutate(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  // UseMutation hook for creating a new marketing plan language or updating existing marketing plan language via API
  const { mutate, isLoading } = useMutation(
    (data) => apiService.addEditMarketingPlanLanguage(data, params.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        try {
          if (data) {
            // Display a success Snackbar notification with the API response message
            enqueueSnackbar(data.message, snackBarSuccessConf);

            // Navigate to the current window pathname after removing a specified portion
            navigate(`/${Paths.marketingPlanLanguageList}`);
          }
        } catch (error) {}
      },
      onError: (error) => {
        //
      }
    }
  );

  const handleChange = (info) => {
    // Varify the size of file
    if (!validateFileSize(info.file)) {
      form.setFieldValue("language_image", null);
      return false;
    }

    if (info.file && info.fileList.length === 1) {
      // Get this url from response in real world.
      getBase64(info.fileList[0].originFileObj, (url) => {
        setLoading(false);
        setLangImage(url);
      });
    }
  };

  // Function to remove the uploaded Category image
  const handleImgRemove = () => {
    if (langImage) {
      setLangImage(null);
    }
    form.setFieldValue("language_image", null);
  };

  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    actionsPermissionValidator(
      window.location.pathname,
      params?.id ? PermissionAction.EDIT : PermissionAction.ADD
    )
      ? ""
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Languages",
      icon: "pincodeStore",
      titlePath: Paths.marketingPlanLanguageList,
      subtitle: params?.id ? "Edit Language" : "Add Language",
      path: Paths.users
    });

    params?.id ? fetchSingleMarketingPlanLanguageData() : form.setFieldValue("status", true);
  }, []);

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  ) ? (
    <>
      <Spin spinning={loadingSingleLanguageData} fullscreen />
      <Typography.Title level={5}>{params?.id ? "Edit" : "Add"} Language</Typography.Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="mp_language_name"
              label="Language Name"
              rules={[
                { required: true, message: "Language Name is required" },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                {
                  pattern: /^.{3,14}$/,
                  message: "The value must be between 3 and 14 characters long."
                },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                }
              ]}>
              <Input placeholder="Enter Marketing Plan Language Name" size="large" maxLength={14} />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={12}>
            <Form.Item
              name="mp_language_code"
              label="Language Code"
              rules={[
                { required: true, message: "Language Code is required" },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                {
                  min: 2, // Ensures at least 2 or 3 characters long
                  message: "Language Code must be 2 or 3 characters long"
                },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                }
              ]}>
              <Input
                placeholder="Enter Language Code"
                size="large"
                maxLength={3}
                disabled={params?.id ? true : false}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="display_order"
              label="Display Order"
              rules={[
                { required: true, message: `Display Order is required` },
                {
                  pattern: /^[1-9]\d*$/,
                  message: "Please enter valid number"
                },
                { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" }
              ]}>
              <Input placeholder="Enter Display Order" size="large" type="number" />
            </Form.Item>
          </Col>

          <Col className="gutter-row">
            <div className="fixed_size" style={StyleSheet.uploadBoxStyle}>
              <Form.Item
                name="language_image"
                label="Upload Image"
                extra="Allowed formats: JPEG, PNG (Max size: 2MB)"
                rules={[{ required: true, message: "Image is required" }]}>
                <Upload
                  name="language_image"
                  listType="picture-card"
                  className="avatar-uploader"
                  accept={ALLOWED_FILE_TYPES}
                  showUploadList={false}
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={(e) => handleChange(e)}>
                  {langImage ? (
                    <img src={langImage} alt="Notification Image" style={categoryStyle} />
                  ) : (
                    uploadButton
                  )}
                </Upload>
              </Form.Item>
              {langImage && (
                <div className="cover_delete" type="text" onClick={handleImgRemove}>
                  <DeleteOutlined />
                </div>
              )}
            </div>
          </Col>
          {code == "HI" || code == "EN" ? null : (
            <Col className="gutter-row" span={12}>
              <Form.Item name="status" label="Status">
                <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          )}
        </Row>

        <Flex align="start" justify={"flex-end"}>
          <NavLink to={"/" + Paths.marketingPlanLanguageList}>
            <Button style={StyleSheet.backBtnStyle} disabled={isLoading}>
              Cancel
            </Button>
          </NavLink>
          {actionsPermissionValidator(
            window.location.pathname,
            params?.id ? PermissionAction.EDIT : PermissionAction.ADD
          ) && (
            <Button loading={isLoading} type="primary" htmlType="submit" disabled={isLoading}>
              {params?.id ? "Update" : "Add"}
            </Button>
          )}
        </Flex>
      </Form>
    </>
  ) : (
    <></>
  );
}
