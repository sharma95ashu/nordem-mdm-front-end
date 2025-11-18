/* eslint-disable no-undef */
import { CloudUploadOutlined, DeleteOutlined, FilePdfOutlined } from "@ant-design/icons";
import {
  PermissionAction,
  snackBarErrorConf,
  snackBarSuccessConf,
  RULES_MESSAGES,
  ALLOWED_FILE_TYPES,
  RESOURCE_TYPES
} from "Helpers/ats.constants";
import { actionsPermissionValidator, validationNumber } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Skeleton,
  Spin,
  Typography,
  Upload,
  message,
  theme
} from "antd";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import POSResourceType from "./POSResourceType";
import ECOMResourceType from "./ECOMResourceType";
import { ALL_FORM_VALIDATIONS } from "Helpers/mdm.form.validate";
import { getFullImageUrl } from "Helpers/functions";

// Download Content Add/Edit Component
export default function DownloadAddEdit() {
  const params = useParams();
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [downloadImage, setdownloadImage] = useState();
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState(true); // state for action (download/link)
  const [checkfileFormat, setCheckFileFormat] = useState(false);
  const [thumbnailImagePreview, setThumbnailImagePreview] = useState(null);
  const [description, setDescription] = useState("");

  const [resourceType, setReourceType] = useState(null); // state for resuorce type (pos/e-com)

  const {
    token: { colorText, colorPrimary, colorBorder }
  } = theme.useToken();

  // styles
  const StyleSheet = {
    uploadStyle: {
      width: "100%",
      height: "100%",
      objectFit: "contain"
    },
    uploadBoxStyle: {
      position: "relative"
    },
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
    pdfIconStyle: {
      fontSize: "2.5rem",
      color: colorPrimary
    },
    uploadLoadingStyle: {
      marginTop: 8,
      color: colorText
    },
    verDividerStyle: {
      borderColor: colorBorder,
      height: 20
    },
    categoryStyle: {
      width: "100%",
      height: "100%",
      objectFit: "contain"
    }
  };

  // useQuery hook for fetching data of a single download content from the API
  const { refetch } = useQuery(
    "getSingleDownloadContentData",
    () => apiService.getSingleDownloadContent(params?.id),
    {
      enabled: false, //disable the query by default
      onSuccess: (data) => {
        try {
          if (data?.data) {
            try {
              form.setFieldsValue(data.data);
              const {
                resource_type,
                is_downloadable,
                download_doc,
                download_url,
                description,
                thumbnail_image
              } = data.data || {}; // destructure api data

              setReourceType(resource_type);
              setUploadType(is_downloadable); // set upload type based on is_downloadable
              description && setDescription(description);

              form.setFieldsValue({
                ...(is_downloadable
                  ? { download_doc: download_doc }
                  : { download_url: download_url })
              });

              // form.setFieldsValue({
              //   is_downloadable: true
              // });
              const formatCheck = download_doc?.split("."); // to show pdf placeholder image
              if (formatCheck && formatCheck[1] === "pdf") {
                setCheckFileFormat(true);
              }
              download_doc && setdownloadImage(getFullImageUrl(download_doc));

              thumbnail_image && setThumbnailImagePreview(getFullImageUrl(thumbnail_image));
            } catch (error) {}
          }
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  /**
   * Function to find type and show loader and upload file accordingly
   * @param {*} info
   * @param {*} type
   * @returns
   */
  const handleChange = (info, type, fileSize) => {
    try {
      const isJpgOrPngOrPdf =
        info.file.type === "image/jpeg" ||
        info.file.type === "image/png" ||
        info.file.type === "application/pdf";
      if (!isJpgOrPngOrPdf) {
        message.error("You can only upload JPG/PNG/PDF file!");
        return false;
      }

      // Check the size of the file

      const fileSizeLimit = (fileSize ? fileSize : 2) * 1024 * 1024; // 2MB in bytes

      if (info.file && info.file.size > fileSizeLimit) {
        message.error(`File must be smaller than ${fileSize ? fileSize : 2}MB!`);
        return;
      }

      // Proceed if the file size is within the limit
      if (info.file && info.fileList.length === 1) {
        if (info.file.type === "application/pdf") {
          setCheckFileFormat(true);
        }

        // Get this url from response in real world.
        convertFileToBase64(info.fileList[0].originFileObj, (url) => {
          setLoading(false);
          setdownloadImage(url);
        });
      }
    } catch (error) {}
  };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
  };

  /**
   * Function to submit form data
   * @param {*} value
   */

  const onFinish = (value) => {
    try {
      const {
        resource_name,
        resource_type,
        description,
        download_category_id,
        language_id,
        content_type_id,
        display_order,
        download_doc,
        thumbnail_image,
        download_url
        // is_downloadable
      } = value;

      let formData = new FormData();
      formData.append("resource_name", resource_name);
      formData.append("resource_type", resource_type == "pos" ? "pos" : "e-com");
      // formData.append("is_downloadable", true);

      if (downloadImage && download_doc?.file) {
        formData.append("download_doc", download_doc.file);
      }
      // else {
      //   formData.append("download_url", "");
      // }

      if (resource_type == "pos") {
        if (value?.store_code) {
          formData.append("store_code", value?.store_code);
        }
        if (Array.isArray(value?.to_puc_type)) {
          value?.to_puc_type.forEach((item, index) => {
            formData.append(`${"to_puc_type"}[${index}]`, item);
          });
        } else {
          formData.append("to_puc_type", value);
        }
        formData.append("download_url", download_url);
      } else {
        const fields = {
          description,
          download_category_id,
          language_id,
          content_type_id,
          display_order
        };

        Object.entries(fields).forEach(([key, field]) => {
          if (field !== undefined && field !== null) {
            formData.append(key, field || "");
          }
        });
        thumbnail_image?.file &&
          thumbnailImagePreview &&
          formData.append("thumbnail_image", thumbnail_image.file);
      }

      // console.log("formData", formData);
      if (!uploadType && download_url) {
        formData.append("download_url", download_url);
      }

      formData.append("is_downloadable", uploadType ? true : false);

      mutate(formData); // api call for add/update download content
    } catch (error) {}
  };

  // useMutation hook for creating/updating download content via API
  const { mutate, isLoading } = useMutation((data) => apiService.createDownload(params?.id, data), {
    onSuccess: (data) => {
      if (data) {
        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(data.message, snackBarSuccessConf);
        // Navigate to the current window pathname after removing a specified portion
        navigate(`/${Paths.downloadList}`);
        // Invalidate the "getAllRoles" query in the query client to trigger a refetch
        queryClient.invalidateQueries("fetchDownloadData");
      }
    },
    onError: (error) => {
      // Handle errors by displaying an error Snackbar notification
      enqueueSnackbar(error.message, snackBarErrorConf);
    }
  });

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
   * PDF Button UI
   */
  const pdfButton = (
    <button style={StyleSheet.uploadBtnStyle} type="button">
      <FilePdfOutlined style={StyleSheet.pdfIconStyle} />
    </button>
  );

  // Function to remove the uploaded download image
  const handleImgRemove = () => {
    if (downloadImage) {
      setdownloadImage(null);
      setCheckFileFormat(false);
      form.setFieldValue("download_doc", null);
    }
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
      title: "Downloads",
      icon: "downloads",
      titlePath: Paths.downloadList,
      subtitle: params?.id ? "Edit Download Content" : "Add Download Content",
      path: Paths.users
    });

    if (params?.id) {
      refetch(); // api call for single download content
    } else {
      form.setFieldValue("is_downloadable", true);
      form.setFieldValue("resource_type", "pos");
      setReourceType("pos");
    }
  }, []);

  // handle resource type dropdown change
  const handleResourceTypeChange = (val) => {
    try {
      setReourceType(val);

      // reset values
      form.setFieldsValue({
        to_puc_type: null,
        description: null,
        download_category_id: null,
        language_id: null,
        content_type_id: null,
        display_order: null,
        thumbnail_image: null
      });
      setThumbnailImagePreview(null);
    } catch (error) {
      console.log(error);
    }
  };

  // handle description change
  const handleDescription = (val) => {
    try {
      setDescription(val);
      form.setFields([{ name: "description", errors: [], value: val }]);
    } catch (error) {}
  };

  // hanndle action change (download/link)
  const uploadTypeFieldset = (e) => {
    setUploadType(e.target.value);
  };

  // handle thumbnail image preview
  const handleThumbnailImage = (val) => {
    setThumbnailImagePreview(val);
  };

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  ) ? (
    <>
      <Spin spinning={isLoading} fullscreen />
      <Typography.Title level={5}>{params?.id ? "Edit" : "Add"}</Typography.Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="resource_type"
              label="Resource Type"
              rules={[{ required: true, message: "Resource Type is required" }]}>
              <Select
                placeholder="Select Resource Type"
                size="large"
                allowClear
                onChange={handleResourceTypeChange}
                options={RESOURCE_TYPES}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="resource_name"
              label="Resource Name"
              rules={[
                { required: true, whitespace: true, message: "Resource name is required" },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                { pattern: /^[a-zA-Z0-9-_ ]+$/, message: "Please enter a valid resource name" },
                {
                  pattern: /^.{1,75}$/,
                  message: "The value must be between 1 and 75 characters long."
                },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                }
              ]}>
              <Input placeholder="Enter Resource Name" size="large" />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={24}>
            <Form.Item
              name="is_downloadable"
              label="Action"
              rules={[{ required: true, message: "Action name is required" }]}>
              <Radio.Group onChange={uploadTypeFieldset} value={uploadType}>
                <Radio value={true}>Download</Radio>
                <Radio value={false}>Link</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>

          {resourceType == "pos" ? (
            <POSResourceType form={form} />
          ) : (
            <ECOMResourceType
              form={form}
              thumbnailImagePreview={thumbnailImagePreview}
              handleThumbnailImage={handleThumbnailImage}
              description={description}
              handleDescription={handleDescription}
              styleSheet={StyleSheet}
            />
          )}
          {resourceType == "pos" && (
            <Col span={12}>
              <Form.Item
                name="store_code"
                label="Store Code"
                rules={[
                  ...ALL_FORM_VALIDATIONS.custom_no_validation(
                    "Store Code",
                    2, // Minimum length
                    10 // Maximum length
                  ).validations
                ]}>
                <Input size="large" onInput={validationNumber} maxLength={10} />
              </Form.Item>
            </Col>
          )}
          {resourceType == "e-com" && uploadType ? (
            <Col className="gutter-row" span={12}>
              <Form.Item
                name="download_doc"
                label="Upload"
                rules={[{ required: true, message: "Upload is required" }]}
                extra="Allowed formats: JPEG, PNG, PDF (Max size: 50MB)">
                <Upload
                  name="upload"
                  listType="picture-card"
                  className="avatar-uploader"
                  accept={[...ALLOWED_FILE_TYPES, "application/pdf"]}
                  showUploadList={false}
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={(e) => handleChange(e, "upload", 50)}>
                  {downloadImage ? (
                    <>
                      {checkfileFormat ? (
                        pdfButton
                      ) : (
                        <img src={downloadImage} alt="upload" style={StyleSheet.uploadStyle} />
                      )}
                    </>
                  ) : (
                    uploadButton
                  )}
                </Upload>
              </Form.Item>
            </Col>
          ) : (
            <Col className="gutter-row" span={resourceType !== "pos" ? 12 : 24}>
              {!uploadType && (
                <Form.Item
                  name="download_url"
                  label="URL"
                  rules={[
                    { required: true, whitespace: false, message: "URL is required" },
                    {
                      pattern:
                        /\b((?:(https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){3}|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?)\b/,
                      message: "Enter valid URL"
                    },
                    {
                      pattern: /^.{10,975}$/,
                      message: "The value must be at least 10 characters long"
                    },
                    {
                      pattern: /^\S*$/,
                      message: "Enter valid URL"
                    }
                  ]}>
                  <Input placeholder="Enter URL" size="large" />
                </Form.Item>
              )}
              {/* POS  */}
              {uploadType && (
                <div style={StyleSheet.uploadBoxStyle}>
                  <Form.Item
                    name="download_doc"
                    label="Upload"
                    rules={[{ required: true, message: "Upload is required" }]}
                    extra="Allowed formats: JPEG, PNG, PDF (Max size: 2MB)">
                    <Upload
                      name="upload"
                      listType="picture-card"
                      className="avatar-uploader"
                      accept={[...ALLOWED_FILE_TYPES, "application/pdf"]}
                      showUploadList={false}
                      maxCount={1}
                      beforeUpload={() => false}
                      onChange={(e) => handleChange(e, "upload")}>
                      {downloadImage ? (
                        <>
                          {checkfileFormat ? (
                            pdfButton
                          ) : (
                            <img src={downloadImage} alt="upload" style={StyleSheet.uploadStyle} />
                          )}
                        </>
                      ) : (
                        uploadButton
                      )}
                    </Upload>
                  </Form.Item>
                  {downloadImage && (
                    <div className="cover_delete" type="text" onClick={handleImgRemove}>
                      <DeleteOutlined />
                    </div>
                  )}
                </div>
              )}
            </Col>
          )}
        </Row>

        <Flex align="start" justify={"flex-end"}>
          <NavLink to={"/" + Paths.downloadList}>
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
