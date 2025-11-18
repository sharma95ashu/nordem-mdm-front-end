import { CloudUploadOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Row,
  Skeleton,
  Spin,
  Switch,
  theme,
  Upload,
  Typography,
  Input
} from "antd";
const { Title } = Typography;

import dayjs from "dayjs";
import {
  ALLOWED_FILE_TYPES,
  ALLOWED_UPLOAD_FILES,
  PermissionAction,
  RULES_MESSAGES,
  snackBarSuccessConf
} from "Helpers/ats.constants";
import { actionsPermissionValidator, validateImageSize } from "Helpers/ats.helper";
import { getFullImageUrl } from "Helpers/functions";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Paths } from "Router/Paths";

// About Us History Add/Edit Component
const AddEditAboutUsHistory = () => {
  const params = useParams();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState();
  // eslint-disable-next-line no-unused-vars
  const [imageId, setImageId] = useState();
  const {
    token: { colorText }
  } = theme.useToken();

  const disableFutureDates = (current) => {
    // Disable dates after today
    return current && current.isAfter(dayjs().endOf("day"));
  };

  // UseMutation hook for  fetching single abt us - history
  const { mutate: fetchAboutUsHistoryData, isLoading: loadingAboutUsHistoryData } = useMutation(
    (data) => apiService.getSingleAboutUsHistory(params?.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          const {
            desc,
            status,
            year,
            image: { file_path, attachment_id },
            sub_texts
          } = data?.data || {}; // destructring single ab message data
          form.setFieldValue("desc", desc);
          form.setFieldValue("year", dayjs(`${year}`, "YYYY"));
          form.setFieldValue("status", status == "active" ? true : false);
          form.setFieldValue("sub_texts", sub_texts || []); // Populate 'sub_texts' field with default empty array

          setImage(
            file_path
              ? // eslint-disable-next-line no-undef
                getFullImageUrl(file_path)
              : ""
          );
          setImageId(attachment_id);
          form.setFieldValue("image", file_path);
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  const onFinish = (value) => {
    try {
      const formData = new FormData();
      const { year, desc, status, image } = value || {};

      formData.append("year", dayjs(year).format("YYYY"));
      formData.append("desc", desc);
      formData.append("status", status ? "active" : "inactive");
      formData.append("sub_texts", JSON.stringify(value.sub_texts));
      // Handle image upload
      imageId && formData.append("image_id", imageId);
      image?.file && formData.append("image", image?.file);

      mutate(formData); // Make the API call
    } catch (error) {
      //
    }
  };

  // UseMutation hook for add/edit abt us - history via API
  const { mutate, isLoading } = useMutation(
    (data) => apiService.addEditAboutUsHistory(params?.id, data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          navigate(`/${Paths.aboutUsHistoryList}`);
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
      title: "About Us - History",
      icon: "pincodeStore",
      titlePath: Paths.aboutUsHistoryList,
      subtitle: params?.id ? "Edit" : "Add New",
      path: Paths.users
    });
    if (params?.id) {
      fetchAboutUsHistoryData(); // api call for fetching single abt us - history data
    } else {
      //initializing default values
      form.setFieldValue("status", true);
    }
  }, []);

  return (
    <>
      <Spin spinning={loadingAboutUsHistoryData} fullscreen />
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[20, 10]}>
          <Col className="gutter-row" span={6}>
            <div style={{ position: "relative" }}>
              <Form.Item
                name="image"
                label="Upload Icon / Image"
                extra={`Allowed formats: JPEG, PNG ,Max size: ${ALLOWED_UPLOAD_FILES}MB, Aspect Ratio : 1:1`}
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
            <Flex vertical>
              <Form.Item
                label="Year"
                name="year"
                rules={[
                  {
                    required: true,
                    message: "Year is required"
                  }
                ]}>
                <DatePicker
                  block
                  placeholder="Select Year"
                  size={"large"}
                  className="fullWidth"
                  picker="year"
                  disabledDate={disableFutureDates}
                />
              </Form.Item>
              {/* <Form.Item
                name={"desc"}
                label="Title"
                rules={[
                  {
                    required: true,
                    message: "Title is required"
                  },
                  {
                    pattern: /^.{3,100}$/,
                    message: "The value must be between 3 and 100 characters long."
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
                <Input type="text" placeholder="Enter Title" maxLength={100} />
              </Form.Item> */}
              <Row gutter={[24, 0]}>
                <Title level={5} style={{ marginLeft: "14px" }}>
                  Sub title
                </Title>
                <Form.List name="sub_texts">
                  {(fields, { add, remove }) => (
                    <>
                      <div className="fullWidth">
                        <>
                          {fields.map(({ key, name, ...restField }, index) => (
                            <div key={index} style={{ marginBottom: "10px" }}>
                              <Row gutter={[20, 20]}>
                                <Col span={2}>
                                  <Flex align="center" justify="flex-end" className="fullHeight">
                                    <Typography.Text code>{1 + name}</Typography.Text>
                                  </Flex>
                                </Col>
                                <Col span={21}>
                                  <Form.Item
                                    style={{ margin: "0" }}
                                    {...restField}
                                    name={[name, "text_desc"]} // Functionality part for the key
                                    rules={[
                                      {
                                        required: true,
                                        message: "Sub title is required"
                                      },
                                      {
                                        pattern: /^.{3,150}$/,
                                        message:
                                          "The value must be between 3 and 150 characters long."
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
                                    <Input placeholder="Enter sub title here" maxLength={150} />
                                  </Form.Item>
                                </Col>
                                <Col span={1}>
                                  <Flex align="center" justify="flex-start" className="fullHeight">
                                    <DeleteOutlined
                                      style={{ fontSize: "large", color: "#DC2626" }}
                                      onClick={() => remove(name)} // Functionality for removing a field
                                    />
                                  </Flex>
                                </Col>
                              </Row>
                            </div>
                          ))}
                        </>
                      </div>
                      <Col span={24} style={{ marginTop: "10px" }}>
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => {
                              add();
                            }}
                            block
                            icon={<PlusOutlined />}>
                            Add field
                          </Button>
                        </Form.Item>
                      </Col>
                    </>
                  )}
                </Form.List>
              </Row>
            </Flex>
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
              <NavLink to={"/" + Paths.aboutUsHistoryList}>
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

export default AddEditAboutUsHistory;
