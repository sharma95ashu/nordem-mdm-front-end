import { CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Skeleton,
  Spin,
  Switch,
  theme,
  Upload
} from "antd";
// import RichEditor from "Components/Shared/richEditor";
import dayjs from "dayjs";
import {
  ALLOWED_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  DATEFORMAT,
  PermissionAction,
  RULES_MESSAGES,
  snackBarSuccessConf
} from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  convertRangeISODateFormat,
  validateImageSize
} from "Helpers/ats.helper";
import { getFullImageUrl } from "Helpers/functions";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Paths } from "Router/Paths";

// Ab Messgae Add/Edit Component
const ABMessageAddEdit = (props) => {
  const params = useParams();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [description, setDescription] = useState(""); // text editor state
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState();
  const [imageId, setImageId] = useState();

  const {
    token: { colorText }
  } = theme.useToken();

  // UseMutation hook for  fetching single ab message data
  const { mutate: fetchAbMessageData, isLoading: loadingAbMessageData } = useMutation(
    (data) => apiService.getSingleABmessageData(params?.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          const {
            message_title,
            description: formDescription,
            status,
            display_order,
            start_date,
            end_date,
            image: { file_path, attachment_id }
          } = data?.data || {}; // destructring single ab message data

          form.setFieldValue("message_title", message_title);
          form.setFieldValue("display_order", String(display_order));
          form.setFieldValue("status", status == "active" ? true : false);
          form.setFieldValue("description", formDescription);
          setDescription(formDescription);

          setImage(
            file_path
              ? // eslint-disable-next-line no-undef
                getFullImageUrl(file_path)
              : ""
          );
          setImageId(attachment_id);
          form.setFieldValue("image", "dummyValue");
          form.setFieldValue("dateRange", [dayjs(start_date), dayjs(end_date)]);
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // handle description change
  // const handleDescription = (value) => {
  //   try {
  //     setDescription(value);
  //     form.setFieldsValue({ description: value });
  //   } catch (error) {}
  // };

  const onFinish = (value) => {
    try {
      const formData = new FormData();
      const {
        message_title,
        description,
        status,
        display_order,
        dateRange,
        image: uploadedImage
      } = value || {};

      formData.append("message_title", message_title || "");
      formData.append("status", status ? "active" : "inactive");
      formData.append("display_order", display_order || "");
      formData.append("description", description || null);

      // Handle image upload
      imageId && formData.append("image_id", imageId);
      uploadedImage?.file && formData.append("image", uploadedImage?.file);

      // Handle date range conversion
      if (dateRange) {
        let { start, end } = convertRangeISODateFormat(dateRange);
        start = dayjs(start).format("YYYY-MM-DD");
        end = dayjs(end).format("YYYY-MM-DD");
        formData.append("start_date", start);
        formData.append("end_date", end);
      }

      mutate(formData); // Make the API call
    } catch (error) {
      //
    }
  };

  // UseMutation hook for add/edit ab message via API
  const { mutate, isLoading } = useMutation(
    (data) => apiService.addUpdateABMessage(params?.id, data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          navigate(`/${Paths.abMessageList}`);
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  // handle image change
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

  // Function to remove the uploaded image
  const handleImgRemove = () => {
    if (image) {
      // Revoke the object URL to free up memory
      URL.revokeObjectURL(image);
      setImage(null); // Clear the image state
      form.setFieldValue("image", null);
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
      title: "AB Message ",
      icon: "abMessage",
      titlePath: Paths.abMessageList,
      subtitle: params?.id ? "Edit" : "Add New",
      path: Paths.users
    });

    if (params?.id) {
      fetchAbMessageData(); // api call for fetching single AB messgae data
    } else {
      //initializing default values
      form.setFieldValue("status", true);
      form.setFieldValue("dateRange", [dayjs(), dayjs()]);
    }
  }, []);

  // Disable past dates
  const disabledDate = (current) => {
    return current && dayjs(current).isBefore(dayjs(), "day");
  };

  return (
    <>
      <Spin spinning={loadingAbMessageData} fullscreen />
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[20, 10]}>
          <Col
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}
            className="gutter-row">
            <Form.Item
              name="message_title"
              label="Message Title"
              rules={[
                { required: true, message: `Message Title is required` },
                { pattern: /^.{0,75}$/, message: "Value should not exceed 75 characters" },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                }
              ]}>
              <Input placeholder="Enter Message Title" size="large" />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
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

          <Col className="gutter-row" span={6}>
            <div style={{ position: "relative" }}>
              <Form.Item
                name="image"
                label="Upload Image"
                extra={`Allowed formats: JPEG, PNG (Max size: ${ALLOWED_FILE_SIZE}MB)`}
                rules={[{ required: true, message: `Image is required` }]}>
                <Upload
                  name="image"
                  listType="picture-card"
                  className="avatar-uploader"
                  accept={ALLOWED_FILE_TYPES}
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
            </div>
          </Col>

          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 18 }}>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: `Description is required` }]}>
              <Input.TextArea
                rows={6}
                name="description"
                placeholder="Enter Description Here"
                description={description}
              />
              {/* <RichEditor
                name="description"
                placeholder="Enter Description Here"
                description={description}
                handleDescription={handleDescription}
              /> */}
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              label="Start & End Date"
              name="dateRange"
              rules={[
                {
                  required: true,
                  message: "Please select dates"
                }
              ]}>
              <DatePicker.RangePicker
                block
                placeholder="Select Date"
                format={DATEFORMAT.RANGE_FORMAT}
                size={"large"}
                disabledDate={disabledDate}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>

          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 6 }}>
            <Form.Item name="status" label="Status">
              <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>

          <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
            <Flex align="start" justify={"flex-end"}>
              <NavLink to={"/" + Paths.abMessageList}>
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

export default ABMessageAddEdit;
