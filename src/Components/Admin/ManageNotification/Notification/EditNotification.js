/* eslint-disable no-undef */
/* eslint-disable no-empty */
import { CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  PermissionAction,
  snackBarErrorConf,
  snackBarSuccessConf,
  RULES_MESSAGES,
  ALLOWED_FILE_TYPES
} from "Helpers/ats.constants";
import { actionsPermissionValidator, validateFileSize } from "Helpers/ats.helper";
import { getFullImageUrl } from "Helpers/functions";
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
  Select,
  Switch,
  Typography,
  Upload,
  Skeleton,
  theme,
  Spin
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { debounce } from "lodash";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";

export default function EditNotification() {
  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const {
    token: { colorText }
  } = theme.useToken();

  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [notificationImage, setNotificationImage] = useState();
  const [notificationImageId, setNotificationImageId] = useState();
  const [notificationCategory, setNotificationCategory] = useState([]);

  const [disabledField, setDisabledField] = useState(false);

  const params = useParams();

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

  // UseQuery hook for fetching data of a single Category from the API
  const { refetch } = useQuery(
    "getSingleNotification",

    // Function to fetch data of a single Category using apiService.getRequest
    () => apiService.getRequest(`/notification_list/${params.id}`),
    {
      // Configuration options
      enabled: false, // Disable the query by default
      onSuccess: (data) => {
        // Set form values based on the fetched data

        if (data.success) {
          form.setFieldsValue(data?.data || {});

          setDisabledField(data?.data?.is_sent);

          setNotificationImage(
            data?.data?.notification_image?.file_path
              ? getFullImageUrl(data?.data?.notification_image?.file_path)
              : ""
          );

          form.setFieldValue("notification_image", data?.data?.notification_image);

          form.setFieldValue("status", data?.data?.status === "active" ? true : false);

          data?.data?.category_parent
            ? form.setFieldValue("parent_category", data?.data?.category_parent)
            : "";

          data?.data?.notification_image?.attachment_id
            ? setNotificationImageId(data?.data?.notification_image?.attachment_id)
            : "";
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  /**
   * Function to submit form data
   * @param {*} value
   */

  const onFinish = (value) => {
    try {
      let formData = new FormData();

      value?.notification_category_id
        ? formData.append("notification_category_id", value?.notification_category_id)
        : "";

      formData.append("notification_title", value?.notification_title);

      formData.append("notification_message", value?.notification_message);

      formData.append("status", value?.status ? "active" : "inactive");

      // Handle image
      if (value?.notification_image?.file && notificationImage) {
        formData.append("notification_image", value?.notification_image?.file);
      }

      if (notificationImageId) {
        formData.append("notification_image_id", notificationImageId);
      }

      let obj = { load: formData };
      mutate(obj);

      // Initiate the user creation process by triggering the mutate function
    } catch (error) {}
  };

  // UseMutation hook for creating a new user via API
  const { mutate, isLoading } = useMutation(
    // Mutation function to handle the API call for creating a new user
    (data) => apiService.updateNotification(data.load, params.id, true),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data.success) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);

          // Navigate to the current window pathname after removing a specified portion
          navigate(`/${Paths.notificationList}`);

          // Invalidate the "getAllRoles" query in the query client to trigger a refetch
          queryClient.invalidateQueries("fetchNotificationData");
        }
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

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

  /**
   * Function to find type and show loader and upload file accordingly
   * @param {*} info
   * @param {*} type
   * @returns
   */
  const handleChange = (info) => {
    // Varify the size of file
    if (!validateFileSize(info.file)) {
      form.setFieldValue("notification_image", null);
      return false;
    }

    if (info.file && info.fileList.length === 1) {
      // Get this url from response in real world.
      getBase64(info.fileList[0].originFileObj, (url) => {
        setLoading(false);
        setNotificationImage(url);
      });
    }
  };

  // Function to remove the uploaded Category image
  const handleImgRemove = () => {
    if (notificationImage) {
      setNotificationImage(null);
      // setNotificationImageId(null);
      form.setFieldValue("notification_image", null);
    }
  };

  const fetchData = () => {
    refetch();
  };

  const { mutate: fetchNotificationCategory, isLoading: loadingNotificationCategory } = useMutation(
    "fetchNotificationCategory",
    (payload) => apiService.getCategoryNotification(payload),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        if (data.success) {
          const notificationCategories =
            data?.data?.data.map((item) => ({
              value: item?.notification_category_id,
              label: item?.notification_category_name
            })) || [];
          setNotificationCategory(notificationCategories);

          let dataCheck = data?.data?.data;
          if (!dataCheck.length) {
            fetchNotificationCategory("");
          }
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  // for debounce
  const debounceNotificationCategory = useMemo(() => {
    const loadOptions = (val) => {
      fetchNotificationCategory(val);
    };
    return debounce(loadOptions, 1000);
  }, []);

  const searchCategory = (val) => {
    try {
      if (val && val.length >= 3) {
        debounceNotificationCategory(val);
      }
    } catch (error) {}
  };

  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    fetchNotificationCategory("");
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? fetchData()
      : navigate("/", { state: { from: null }, replace: true });
  }, []);

  useEffect(() => {
    setBreadCrumb({
      title: "Notification",
      icon: "manageNotification",
      titlePath: Paths.notificationList,
      subtitle: disabledField ? "View Notification" : "Edit Notification",
      path: Paths.users
    });
  }, [disabledField]);

  return actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) ? (
    <>
      <Typography.Title level={5}>
        {disabledField ? "View Notification" : "Edit Notification"}
      </Typography.Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="notification_category_id"
              label="Notification Category"
              whitespace={false}
              rules={[{ required: true, message: "Category name is required" }]}>
              <Select
                disabled={disabledField}
                allowClear
                showSearch
                onSearch={searchCategory}
                size="large"
                notFoundContent={loadingNotificationCategory ? <Spin size="small" /> : null}
                placeholder="Select Notification Category"
                options={notificationCategory}
                onClear={() => fetchNotificationCategory("")}
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="notification_title"
              label="Title"
              whitespace={false}
              rules={[
                { required: true, whitespace: true, message: "Title name is required" },
                {
                  pattern: /^.{1,50}$/,
                  message: RULES_MESSAGES.MIN_MAX_LENGTH_MESSAGE
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
              <Input disabled={disabledField} placeholder="Enter Title Name" size="large" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="notification_message"
              label="Message"
              rules={[
                { required: true, whitespace: true, message: "Message is required" },
                {
                  pattern: /^.{3,1000}$/,
                  message: "The value must be between 3 and 1000 characters long."
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
              <TextArea disabled={disabledField} rows={4} placeholder="Enter Message Here" />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <div className="fixed_size" style={StyleSheet.uploadBoxStyle}>
              <Form.Item
                name="notification_image"
                label="Upload Image"
                extra="Allowed formats: JPEG, PNG (Max size: 2MB)"
                rules={[{ required: true, message: "Image is required" }]}>
                <Upload
                  disabled={disabledField}
                  name="notification_image"
                  listType="picture-card"
                  className="avatar-uploader"
                  accept={ALLOWED_FILE_TYPES}
                  showUploadList={false}
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={(e) => handleChange(e, "notification_img")}>
                  {notificationImage ? (
                    <img src={notificationImage} alt="notification_img" style={categoryStyle} />
                  ) : (
                    uploadButton
                  )}
                </Upload>
              </Form.Item>
              {notificationImage && !disabledField && (
                <div className="cover_delete" type="text" onClick={handleImgRemove}>
                  <DeleteOutlined />
                </div>
              )}
            </div>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label="Status">
              <Switch
                disabled={disabledField}
                size="large"
                checkedChildren="Active"
                unCheckedChildren="Inactive"
              />
            </Form.Item>
          </Col>
        </Row>
        <Flex align="start" justify={"flex-end"}>
          <NavLink to={"/" + Paths.notificationList}>
            <Button style={StyleSheet.backBtnStyle} disabled={isLoading}>
              Cancel
            </Button>
          </NavLink>
          {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
            <Button loading={isLoading} type="primary" htmlType="submit" disabled={disabledField}>
              Update
            </Button>
          )}
        </Flex>
      </Form>
    </>
  ) : (
    <></>
  );
}
