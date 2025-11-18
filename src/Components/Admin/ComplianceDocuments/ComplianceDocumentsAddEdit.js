import { CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  // DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Skeleton,
  Spin,
  Switch,
  // Switch,
  theme,
  Upload
} from "antd";
// import RichEditor from "Components/Shared/richEditor";

import {
  ALLOWED_FILE_IMAGE_TYPES,
  PermissionAction,
  RULES_MESSAGES,
  snackBarSuccessConf
} from "Helpers/ats.constants";
import { actionsPermissionValidator, validateFilePdfSize } from "Helpers/ats.helper";
import { getFullImageUrl } from "Helpers/functions";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Paths } from "Router/Paths";
import pdfi from "Static/img/pdf-file.png";

// Ab Messgae Add/Edit Component
const ComplianceDocumentsAddEdit = (props) => {
  const params = useParams();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [description, setDescription] = useState(""); // text editor state
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState();
  const [pdf, setPdf] = useState();
  const [imageId, setImageId] = useState();

  const {
    token: { colorText }
  } = theme.useToken();

  // UseMutation hook for  fetching single ab message data
  const { mutate: fetchComplianceDocumentsData, isLoading: loadingComplianceDocumentsData } =
    useMutation((data) => apiService.getSingleComplianceDocumentsData(params?.id), {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          const {
            title,
            description: formDescription,
            status,
            display_order,
            file: { file_path, attachment_id, mime_type }
          } = data?.data || {}; // destructring single ab message data

          form.setFieldValue("title", title);
          form.setFieldValue("display_order", String(display_order));
          form.setFieldValue("status", status == "active" ? true : false);
          form.setFieldValue("description", formDescription);
          setDescription(formDescription);
          if (mime_type == "application/pdf") {
            setPdf(file_path);
          } else {
            setImage(
              file_path
                ? // eslint-disable-next-line no-undef
                  getFullImageUrl(file_path)
                : ""
            );
          }
          setImageId(attachment_id);
          form.setFieldValue("file", "dummyValue");
        }
      },
      onError: (error) => {
        //
      }
    });

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

      const { title, status, display_order } = value || {};

      formData.append("title", title || "");
      formData.append("status", status ? "active" : "inactive");
      formData.append("display_order", display_order || "");
      formData.append("description", description || "");

      // Handle image upload
      imageId && formData.append("file_id", imageId);
      value.file?.file && formData.append("file", value.file?.file);

      mutate(formData); // Make the API call
    } catch (error) {
      console.log("error", error);
    }
  };

  // UseMutation hook for add/edit ab message via API
  const { mutate, isLoading } = useMutation(
    (data) => apiService.addUpdateComplianceDocuments(params?.id, data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          navigate(`/${Paths.complianceDocumentsList}`);
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
      if (!validateFilePdfSize(info.file)) {
        form.setFieldValue("image", null);
        return false;
      }

      if (info.file && info.fileList.length === 1) {
        // Get this url from response in real world.
        if (info.file.type == "application/pdf") {
          setLoading(false);
          setPdf(info.file.name);
          form.setFieldValue("image", info);
        } else {
          getBase64(info.fileList[0].originFileObj, (url) => {
            setLoading(false);
            setImage(url);
            form.setFieldValue("image", info);
          });
        }
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
    if (image || pdf) {
      // Revoke the object URL to free up memory
      image && URL.revokeObjectURL(image);
      pdf && URL.revokeObjectURL(pdf);

      setImage(null); // Clear the image state
      setPdf(null); // Clear the image state
      form.setFieldValue("file", null);
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
      title: "Compliance Documents ",
      icon: "ComplianceDocuments",
      titlePath: Paths.ComplianceDocumentsList,
      subtitle: params?.id ? "Edit" : "Add New",
      path: Paths.users
    });

    if (params?.id) {
      fetchComplianceDocumentsData(); // api call for fetching single AB messgae data
    } else {
      //initializing default values
      form.setFieldValue("status", true);
    }
  }, []);

  return (
    <>
      <Spin spinning={loadingComplianceDocumentsData} fullscreen />
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[20, 10]}>
          <Col
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}
            className="gutter-row">
            <Form.Item
              name="title"
              label="Title"
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

          <Col className="gutter-row" span={8}>
            <div style={{ position: "relative" }}>
              <Form.Item
                name="file"
                label="Upload File"
                extra="Allowed formats: PDF, JPG, JPEG, PNG (Max size: 5MB)"
                rules={[{ required: true, message: `File is required` }]}>
                <Upload
                  name="image"
                  listType="picture-card"
                  className="avatar-uploader"
                  accept={ALLOWED_FILE_IMAGE_TYPES}
                  showUploadList={false}
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={(e) => handleChange(e)}>
                  {pdf ? (
                    <img src={pdfi} alt="pdf" style={StyleSheet.categoryStyle} />
                  ) : image ? (
                    <img src={image} alt="pdf" style={StyleSheet.categoryStyle} />
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

          {/* <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 20 }}>
            <Form.Item name="description" label="Description">
              <RichEditor
                name="description"
                placeholder="Enter Description Here"
                description={description}
                handleDescription={handleDescription}
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
*/}
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
              <NavLink to={"/" + Paths.complianceDocumentsList}>
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

export default ComplianceDocumentsAddEdit;
