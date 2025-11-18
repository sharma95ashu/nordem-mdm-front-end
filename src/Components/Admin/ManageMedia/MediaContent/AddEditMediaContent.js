/* eslint-disable no-undef */
import {
  CloseCircleOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  EyeOutlined
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Col,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Skeleton,
  Spin,
  Switch,
  theme,
  Typography,
  Upload
} from "antd";
import {
  ALLOWED_FILE_SIZE,
  ALLOWED_UPLOAD_FILES,
  PermissionAction,
  RULES_MESSAGES,
  snackBarSuccessConf,
  urlRegex
} from "Helpers/ats.constants";
import { actionsPermissionValidator, validateImageSize } from "Helpers/ats.helper";
import { getFullImageUrl } from "Helpers/functions";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useMutation } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Paths } from "Router/Paths";

// Add/Edit Media content component
const AddEditMediaContent = () => {
  const { setBreadCrumb } = useUserContext();

  const { apiService } = useServices();
  const navigate = useNavigate();
  const params = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [thumbnailimage, setThumbnailimage] = useState();
  const [thumbnailimageId, setThumbnailimageId] = useState();
  const [mediaFileId, setMediFileId] = useState();
  const [previewVideoUrl, setPreviewVideoUrl] = useState("");
  const [categoriesList, setCategoriesList] = useState([]);
  const [subCategoriesList, setSubCategoriesList] = useState([]);
  const [mediaType, setMediaType] = useState("url");
  const [previewURLmodal, setPreviewURLmodal] = useState(false);
  const [error, setError] = useState(false);
  const [url, setURL] = useState(null);

  const {
    token: { colorText, colorPrimary }
  } = theme.useToken();

  // handle show video preview modal
  const showModal = () => {
    setPreviewURLmodal(true);
  };

  // handle close video preview modal
  const handlePreviewModalCancel = () => {
    try {
      setPreviewURLmodal(false);
      setError(false); // Reset error state when modal is closed
    } catch (error) {}
  };

  // handle react video player error
  const handleError = () => {
    setError(true);
  };

  // UseMutation hook for fetching single media content data via API
  const { mutate: fetchSingleMediaContentData, isLoading: singleMediaContentLoading } = useMutation(
    () => apiService.getSingleMediaContentData(params?.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          try {
            const {
              thumbnail_image,
              thumbnail_id,
              media_file,
              main_image_id,
              child,
              media_upload_type,
              media_url,
              status
            } = data.data;
            form.setFieldsValue(data?.data);
            setThumbnailimage(getFullImageUrl(thumbnail_image));
            setThumbnailimageId(thumbnail_id);
            form.setFieldValue("status", status == "active" ? true : false);
            if (media_upload_type == "url") {
              setURL(media_url);
            } else {
              setPreviewVideoUrl(getFullImageUrl(media_file));
              setMediFileId(main_image_id);
            }
            setMediaType(media_upload_type);
            setSubCategoriesList(child ? [child] : []);
          } catch (error) {}
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  //  UseMutation hook for fetching categories list via API
  const { mutate: fetchCatgeory, isLoading: categoriesLoading } = useMutation(
    () => apiService.getCategoriesListForMediaContent(),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          setCategoriesList(data?.data?.data || []);
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // UseMutation hook for fetching sub categories via API
  const { mutate: fetchSubCatgeory, isLoading: subCategoriesLoading } = useMutation(
    (data) => apiService.getSubCategoriesListForMediaContent(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          setSubCategoriesList(data?.data?.data || []);
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  const onFinish = (value) => {
    try {
      let formData = new FormData();

      formData.append("media_category_id", value?.media_category_id);
      if (value?.media_sub_category_id) {
        formData.append("media_sub_category_id", value?.media_sub_category_id);
      }
      formData.append("media_content_title", value?.media_content_title);
      formData.append("display_order", value?.display_order);
      formData.append("media_upload_type", value?.media_upload_type);

      formData.append("status", value?.status ? "active" : "inactive");
      formData.append("show_on_home", value?.show_on_home);
      formData.append("show_on_web", value?.show_on_web);
      formData.append("show_on_app", value?.show_on_app);
      // handle image
      if (value?.thumbnail_image?.file && thumbnailimage) {
        formData.append("thumbnail_image", value?.thumbnail_image?.file);
      }
      if (thumbnailimageId) {
        formData.append("thumbnail_id", thumbnailimageId);
      }
      // handle media upload type
      if (value?.media_upload_type == "url") {
        formData.append("media_url", value?.media_url);
      } else {
        // handle media file/video
        if (value?.media_file?.file) {
          formData.append("media_file", value?.media_file?.file);
        }
        if (mediaFileId) {
          formData.append("main_image_id", mediaFileId);
        }
      }

      mutate(formData); // api call for updating or creating new media content
    } catch (error) {}
  };

  // UseMutation hook for careting/updating media content via API
  const { mutate, isLoading } = useMutation(
    // Mutation function to handle the API call for creating a new Category
    (data) => apiService.addEditSingleMediaContent(params?.id, data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          navigate(`/${Paths.mediaContentList}`);
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

  // handle thumbnail image change
  const handleChange = (info) => {
    // Varify the size of file
    if (!validateImageSize(info.file)) {
      form.setFieldValue("thumbnail_image", null);
      return false;
    }
    if (info.file && info.fileList.length === 1) {
      // Get this url from response in real world.
      getBase64(info.fileList[0].originFileObj, (url) => {
        setLoading(false);
        setThumbnailimage(url);
      });
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
    },
    deleteBtn: {
      position: "absolute",
      top: "20px",
      right: "-6px"
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
    if (thumbnailimage) {
      // Revoke the object URL to free up memory
      URL.revokeObjectURL(thumbnailimage);
      setThumbnailimage(null); // Clear the image state
      form.setFieldValue("thumbnail_image", null);
    }
  };

  const handleCancel = () => {
    try {
      navigate(`/${Paths.mediaContentList}`);
    } catch (error) {}
  };

  /**
   * useEffect function
   */
  useEffect(() => {
    actionsPermissionValidator(
      window.location.pathname,
      params?.id ? PermissionAction.EDIT : PermissionAction.ADD
    )
      ? ""
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Media Content",
      titlePath: Paths.mediaContentList,
      icon: "manageMedia",
      subtitle: params?.id ? "Edit" : "Add",
      path: Paths.users
    });

    fetchCatgeory(); // api call for fetching categories list

    if (params?.id) {
      fetchSingleMediaContentData(); // api call for fetching singlemedia content data
    } else {
      // initializing default form values in case of add form
      form.setFieldValue("status", true);
      form.setFieldValue("show_on_home", false);
      form.setFieldValue("show_on_web", false);
      form.setFieldValue("show_on_app", false);
      form.setFieldValue("media_upload_type", "url");
    }
  }, []);

  // handle media video change
  const handleMediaFileChange = (info) => {
    try {
      const isMp4 = info.file.type === "video/mp4";
      if (!isMp4) {
        message.error("You can only upload MP4 files!");
        form.setFieldValue("media_file", null);
        return;
      }

      const is5MB = info.file.size < 5 * 1024 * 1024; // checking file size if 5 mb or less
      if (!is5MB) {
        message.error("File must be less than 5 MB!");
        form.setFieldValue("media_file", null);
        return;
      }
      if (info.file && info.fileList.length === 1) {
        getBase64(info.fileList[0].originFileObj, (url) => {
          setLoading(false);
          setPreviewVideoUrl(url);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to remove the uploaded media video
  const handleVideoRemove = () => {
    try {
      if (previewVideoUrl) {
        URL.revokeObjectURL(previewVideoUrl); // Revoke the object URL to free up memory
        setPreviewVideoUrl(null);
        form.setFieldValue("media_file", null);
      }
    } catch (error) {}
  };

  // handle category change
  const handleCategoryChange = (val) => {
    if (val) {
      fetchSubCatgeory(val); // api call for fetching sub-category list
      form.setFieldValue("media_sub_category_id", null);
    }
  };

  const handleRadioBtnChange = (val) => {
    setMediaType(val);
  };

  // handle url change
  const handleURLchange = (val) => {
    try {
      urlRegex.test(val) ? setURL(val) : setURL(null); // if url is valid , setting url for preview
    } catch (error) {}
  };

  return (
    <>
      <Spin spinning={singleMediaContentLoading || categoriesLoading} fullscreen />
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[20, 10]}>
          <Col
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}
            className="gutter-row">
            <Form.Item
              name="media_category_id"
              label="Media Category Name"
              rules={[{ required: true, message: "Media Category Name is required" }]}>
              <Select
                size="large"
                placeholder="Select Media Category"
                options={categoriesList}
                filterOption={(input, option) =>
                  (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                }
                onChange={handleCategoryChange}
                loading={categoriesLoading}
              />
            </Form.Item>
          </Col>

          <Col
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}
            className="gutter-row">
            <Form.Item name="media_sub_category_id" label="Media Sub Category Name">
              <Select
                size="large"
                allowClear
                placeholder="Select Media Sub Category"
                options={subCategoriesList}
                filterOption={(input, option) =>
                  (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                }
                loading={subCategoriesLoading}
              />
            </Form.Item>
          </Col>
          <Col
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}
            className="gutter-row">
            <Form.Item
              name="media_content_title"
              label="Media Title"
              rules={[
                { required: true, message: "Media Title is required" },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                {
                  pattern: /^.{3,50}$/,
                  message: "The value must be between 3 and 50 characters long."
                },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                }
              ]}>
              <Input placeholder="Enter Media Title" size="large" en />
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
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <div style={{ position: "relative" }}>
              <Form.Item
                name="thumbnail_image"
                label="Upload Thumbnail Image"
                extra={`Allowed formats: JPEG, PNG (Max size: ${ALLOWED_FILE_SIZE}MB)`}
                rules={[{ required: true, message: "Thumbnail Image is required" }]}>
                <Upload
                  name="thumbnail_image"
                  listType="picture-card"
                  className="avatar-uploader"
                  accept={ALLOWED_UPLOAD_FILES}
                  showUploadList={false}
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={(e) => handleChange(e)}>
                  {thumbnailimage ? (
                    <img src={thumbnailimage} alt="thubmnail" style={StyleSheet.categoryStyle} />
                  ) : (
                    uploadButton
                  )}
                </Upload>
              </Form.Item>
              {thumbnailimage && (
                <div className="cover_delete" type="text" onClick={handleImgRemove}>
                  <DeleteOutlined />
                </div>
              )}
            </div>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item name="media_upload_type" label="Media Upload Type">
              <Radio.Group onChange={(e) => handleRadioBtnChange(e.target.value)}>
                <Radio value={"url"}>URL</Radio>
                <Radio value={"media_file"}>Media File</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          {mediaType == "url" ? (
            <>
              <Col
                xs={{ span: 20 }}
                sm={{ span: 20 }}
                md={{ span: 20 }}
                lg={{ span: url ? 21 : 24 }}
                className="gutter-row">
                <Form.Item
                  name="media_url"
                  label="Media URL"
                  rules={[
                    {
                      pattern: urlRegex,
                      message: "Invalid Link"
                    },
                    { required: true, message: "Media URL is required" }
                  ]}>
                  <Input
                    placeholder="Enter Media URL"
                    size="large"
                    en
                    onChange={(e) => handleURLchange(e.target.value)}
                  />
                </Form.Item>
              </Col>
              {url && (
                <Col
                  xs={{ span: 4 }}
                  sm={{ span: 4 }}
                  md={{ span: 4 }}
                  lg={{ span: 3 }}
                  style={{ display: "flex" }}>
                  <Flex justify="center" align="center" gap={5}>
                    <EyeOutlined style={{ color: colorPrimary }} />
                    <Typography.Text
                      onClick={() => showModal()}
                      style={{ cursor: "pointer", color: colorPrimary }}>
                      View Preview
                    </Typography.Text>
                  </Flex>
                </Col>
              )}
            </>
          ) : (
            <Col
              className="gutter-row"
              xs={{ span: 24 }}
              sm={{ span: 24 }}
              md={{ span: 24 }}
              lg={{ span: 24 }}>
              <div style={{ position: "relative" }}>
                <Form.Item
                  name="media_file"
                  label="Upload Media File"
                  extra="Allowed formats: MP4 (Max size: 5MB)"
                  rules={[{ required: true, message: "Media File is required" }]}>
                  <Upload
                    name="media_file"
                    listType="picture-card"
                    className="video-uploader"
                    accept={"video/mp4"}
                    showUploadList={false}
                    maxCount={1}
                    beforeUpload={() => {
                      return false;
                    }}
                    onChange={handleMediaFileChange}>
                    {previewVideoUrl ? (
                      <video width="100%" controls style={StyleSheet.categoryStyle}>
                        <source src={previewVideoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      uploadButton
                    )}
                  </Upload>
                </Form.Item>
                {previewVideoUrl && (
                  <div style={StyleSheet.deleteBtn} type="text" onClick={handleVideoRemove}>
                    <CloseCircleOutlined style={{ fontSize: "medium" }} />
                  </div>
                )}
              </div>
            </Col>
          )}

          <Col
            className="gutter-row"
            xs={{ span: 6 }}
            sm={{ span: 6 }}
            md={{ span: 6 }}
            lg={{ span: 6 }}>
            <Form.Item name="status" label="Status">
              <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 6 }}
            sm={{ span: 6 }}
            md={{ span: 6 }}
            lg={{ span: 6 }}>
            <Form.Item name="show_on_web" label="Show on Web">
              <Switch size="large" checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 6 }}
            sm={{ span: 6 }}
            md={{ span: 6 }}
            lg={{ span: 6 }}>
            <Form.Item name="show_on_app" label="Show on App">
              <Switch size="large" checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 6 }}
            sm={{ span: 6 }}
            md={{ span: 6 }}
            lg={{ span: 6 }}>
            <Form.Item name="show_on_home" label="Show on Home">
              <Switch size="large" checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Flex align="start" justify={"flex-end"}>
              <Button
                style={StyleSheet.backBtnStyle}
                disabled={isLoading}
                onClick={() => handleCancel()}>
                Cancel
              </Button>

              {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                <Button type="primary" htmlType="submit" loading={isLoading} disabled={isLoading}>
                  {params?.id ? "Update" : "Add"}
                </Button>
              )}
            </Flex>
          </Col>
        </Row>
      </Form>
      {url && previewURLmodal && (
        <Modal
          title="Preview"
          centered
          open={true}
          closable={true}
          onCancel={handlePreviewModalCancel}
          width={800}
          footer={false}
          className="media_modal">
          <>
            <Flex justify="center" align="middle" className="fullHeight">
              {error ? (
                <Alert
                  message="Video Load Error"
                  description="The video could not be loaded. Please check the URL or try again later."
                  type="error"
                  showIcon
                />
              ) : (
                <ReactPlayer
                  url={url} // Replace with your video URL
                  width="100%"
                  height="100%"
                  controls
                  onError={handleError}
                />
              )}
            </Flex>
          </>
        </Modal>
      )}
    </>
  );
};

export default AddEditMediaContent;
