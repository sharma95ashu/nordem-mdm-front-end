/* eslint-disable no-empty */
import { CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import RichEditor from "Components/Shared/richEditor";
import {
  PermissionAction,
  snackBarErrorConf,
  snackBarSuccessConf,
  RULES_MESSAGES,
  ALLOWED_FILE_SIZE,
  ALLOWED_UPLOAD_FILES
} from "Helpers/ats.constants";
import { actionsPermissionValidator, validateImage, validateImageMobile } from "Helpers/ats.helper";
import { getBase64, getFullImageUrl } from "Helpers/functions";
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
  Switch,
  theme,
  Typography,
  Upload
} from "antd";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";

export default function EditTag() {
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [description, setDescription] = useState("");
  const [tagImage, setTagImage] = useState();
  const [bannerImage, setBannerImage] = useState();
  const [bannerMobileImage, setBannerMobileImage] = useState();
  const [tagImageId, setTagImageId] = useState();
  const [bannerImageId, setBannerImageId] = useState();
  const [bannerMobileImageId, setBannerMobileImageId] = useState();
  const [loadingBanner, setLoadingBanner] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    token: { colorText, colorBorder }
  } = theme.useToken();

  /**
   * Category image css
   */

  const categoryStyle = {
    width: "100%",
    height: "100%",
    objectFit: "contain"
  };

  /**
   * Banner style css
   */
  const bannerStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  };

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
    verDividerStyle: {
      borderColor: colorBorder,
      height: 20
    },
    uploadBoxStyle: {
      position: "relative"
    }
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
  /**
   * Update Banner Button UI
   */

  const uploadBannerButton = (
    <button style={StyleSheet.uploadBtnStyle} type="button">
      {loadingBanner ? (
        <Skeleton.Image active={loadingBanner} />
      ) : (
        <CloudUploadOutlined style={StyleSheet.cloudIconStyle} />
      )}
      {!loadingBanner && <div style={StyleSheet.uploadLoadingStyle}>Upload</div>}
    </button>
  );

  // Function to remove the uploaded Tag image
  const handleImgRemove = () => {
    if (tagImage) {
      setTagImage(null);
      setTagImageId(null);
    }
  };

  // Function to remove the uploaded banner image
  const handleBannerRemove = () => {
    if (bannerImage) {
      setBannerImage(null);
      setBannerImageId(null);
    }
  };

  // Function to remove the uploaded mobile banner image
  const handleMobileBannerRemove = () => {
    if (bannerMobileImage) {
      setBannerMobileImage(null);
      setBannerMobileImageId(null);
    }
  };

  /**
   * Function to find type and show loader and upload file accordingly
   * @param {*} info
   * @param {*} type
   * @returns
   */
  const handleChange = async (info, type) => {
    const file = info.file;
    // Validate file based on type
    const isValid =
      type === "tag_mobile_banner" ? await validateImageMobile(file) : validateImage(file);

    if (!isValid) {
      if (type === "category") {
        form.setFieldValue("brand_logo", null);
      }

      if (type === "banner") {
        form.setFieldValue("banner_logo", null);
      }

      if (type === "tag_mobile_banner") {
        form.setFieldValue("tag_mobile_banner", null);
      }
      return false;
    }

    if (info.file && info.fileList.length === 1) {
      // Get this url from response in real world.
      getBase64(info.fileList[0].originFileObj, (url) => {
        if (type === "banner") {
          setLoadingBanner(false);
          setBannerImage(url);
        } else if (type === "tag_mobile_banner") {
          setBannerMobileImage(url);
        } else {
          setLoading(false);
          setTagImage(url);
        }
      });
    }
  };
  /**
   * Function to submit form data
   * @param {*} value
   */

  const onFinish = (value) => {
    let data = value;

    if (description && description != "") {
      data.tag_desc = description;
    }

    if (value?.show_in_category === null || value?.show_in_category === undefined) {
      value.show_in_category = false;
    }
    let formData = new FormData();
    formData.append("tag_name", value?.tag_name);
    if (description) {
      formData.append("tag_desc", description);
    }
    formData.append("tag_status", value?.tag_status ? "active" : "inactive");

    // Handle image
    if (value?.tag_image?.file && tagImage) {
      formData.append("tag_image", value?.tag_image?.file);
    }

    // Handle banner image
    if (value?.tag_banner?.file && bannerImage) {
      formData.append("tag_banner", value?.tag_banner?.file);
    }

    // Handle banner mobile image
    if (value?.tag_mobile_banner?.file && bannerMobileImage) {
      formData.append("tag_mobile_banner", value?.tag_mobile_banner?.file);
    }

    formData.append("show_in_category", value?.show_in_category);

    formData.append("tag_image_id", tagImageId);
    formData.append("banner_image_id", bannerImageId);
    formData.append("banner_mobile_image_id", bannerMobileImageId);

    let obj = { load: formData };

    // Initiate the user creation process by triggering the mutate function
    mutate(obj);
  };

  // UseMutation hook for creating a new user via API
  const { mutate, isLoading } = useMutation(
    // Mutation function to handle the API call for creating a new user
    (data) => apiService.updateTag(data.load, params.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(data.message, snackBarSuccessConf);

        // Navigate to the current window pathname after removing a specified portion
        navigate(`/${Paths.tagsList}`);

        // Invalidate the "getAllRoles" query in the query client to trigger a refetch
        queryClient.invalidateQueries("fetchTagData");
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // UseQuery hook for fetching data of a single user from the API
  const { refetch } = useQuery(
    "getSingletag",

    // Function to fetch data of a single user using apiService.getRequest
    () => apiService.getRequest(`/tags/${params.id}`),
    {
      // Configuration options
      enabled: false, //disable the query by default
      onSuccess: (data) => {
        // Set form values based on the fetched data

        if (data) {
          const { image, banner, banner_mobile } = data.data || {};
          if (image && image.file_path) {
            const { origin_type, file_path } = image;
            setTagImage(origin_type === "local" ? getFullImageUrl(file_path) : file_path);
            setTagImageId(data?.data?.image_id);
          }

          if (banner && banner.file_path) {
            const { origin_type, file_path } = banner;
            setBannerImage(origin_type === "local" ? getFullImageUrl(file_path) : file_path);
            setBannerImageId(data?.data?.banner_id);
          }
          if (banner_mobile && banner_mobile.file_path) {
            const { origin_type, file_path } = banner_mobile;
            setBannerMobileImage(origin_type === "local" ? getFullImageUrl(file_path) : file_path);
            setBannerMobileImageId(data?.data?.mobile_banner_id);
          }
          form.setFieldsValue(data?.data || {});
          form.setFieldValue("tag_status", data?.data?.tag_status === "active" ? true : false);
          data?.data?.tag_desc && setDescription(data?.data?.tag_desc);
          form.setFieldValue("show_in_category", data?.data?.show_in_category);
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  /**
   *  Description validation
   */
  const handleDescription = (value) => {
    setDescription(value);
    form.setFieldValue("tag_desc", value);
  };

  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT)
      ? refetch()
      : navigate("/", { state: { from: null }, replace: true });
    setBreadCrumb({
      title: "Tags",
      icon: "tags",
      titlePath: Paths.tagsList,
      subtitle: "Edit Tag",
      path: Paths.users
    });
  }, []);

  return actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) ? (
    <>
      <Typography.Title level={5}>Edit Tag</Typography.Title>

      <Form form={form} name="form_tags" layout="vertical" onFinish={onFinish}>
        <Col className="gutter-row" span={24}>
          <Row gutter={[24, 15]}>
            <Col className="gutter-row" xs={24} sm={24} md={8} lg={6} xl={4} xxl={4}>
              <div style={StyleSheet.uploadBoxStyle}>
                <Form.Item
                  name="tag_image"
                  label="Tag Image"
                  extra={
                    <>
                      Allowed formats : JPEG,PNG,JPG Max size : {ALLOWED_FILE_SIZE}MB, <br />{" "}
                      Resolution : 512 x 512 px
                    </>
                  }>
                  <Upload
                    name="tag_image"
                    listType="picture-card"
                    className="avatar-uploader"
                    accept={ALLOWED_UPLOAD_FILES}
                    showUploadList={false}
                    maxCount={1}
                    beforeUpload={() => false}
                    onChange={(e) => handleChange(e, "category")}>
                    {tagImage ? (
                      <img src={tagImage} alt="category" style={categoryStyle} />
                    ) : (
                      uploadButton
                    )}
                  </Upload>
                </Form.Item>
                {tagImage && (
                  <div className="cover_delete" type="text" onClick={handleImgRemove}>
                    <DeleteOutlined />
                  </div>
                )}
              </div>
            </Col>
            <Col className="gutter-row" xs={24} sm={24} md={8} lg={9} xl={10} xxl={10}>
              <div style={StyleSheet.uploadBoxStyle}>
                <Form.Item
                  name="tag_banner"
                  label="Banner Image(Web)"
                  extra={`Allowed formats : JPEG,PNG,JPG Max size : ${ALLOWED_FILE_SIZE}MB, Resolution : 1440x280 px`}>
                  <Upload
                    name="tag_banner"
                    listType="picture-card"
                    className="avatar-uploader"
                    accept={ALLOWED_UPLOAD_FILES}
                    showUploadList={false}
                    maxCount={1}
                    beforeUpload={() => false}
                    onChange={(e) => handleChange(e, "banner")}>
                    {bannerImage ? (
                      <img src={bannerImage} alt="Banner" style={bannerStyle} />
                    ) : (
                      uploadBannerButton
                    )}
                  </Upload>
                </Form.Item>
                {bannerImage && (
                  <div className="cover_delete" type="text" onClick={handleBannerRemove}>
                    <DeleteOutlined />
                  </div>
                )}
              </div>
            </Col>
            <Col className="gutter-row" xs={24} sm={24} md={8} lg={9} xl={10} xxl={10}>
              <div style={StyleSheet.uploadBoxStyle}>
                <Form.Item
                  name="tag_mobile_banner"
                  label="Banner Image(Mobile)"
                  extra={`Allowed formats : JPEG,PNG,JPG Max size : ${ALLOWED_FILE_SIZE}MB, Resolution : 340x120 px`}>
                  <Upload
                    name="tag_mobile_banner"
                    listType="picture-card"
                    className="avatar-uploader"
                    accept={ALLOWED_UPLOAD_FILES}
                    showUploadList={false}
                    maxCount={1}
                    beforeUpload={() => false}
                    onChange={(e) => handleChange(e, "tag_mobile_banner")}>
                    {bannerMobileImage ? (
                      <img src={bannerMobileImage} alt="tag_mobile_banner" style={bannerStyle} />
                    ) : (
                      uploadBannerButton
                    )}
                  </Upload>
                </Form.Item>
                {bannerMobileImage && (
                  <div className="cover_delete" type="text" onClick={handleMobileBannerRemove}>
                    <DeleteOutlined />
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Col>
        <Col className="gutter-row" span={24}>
          <Form.Item
            name="tag_name"
            label="Tag Name"
            rules={[
              { required: true, whitespace: true, message: "Tag name is required" },
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
            <Input placeholder="Enter Tag Name" size="large" />
          </Form.Item>
        </Col>

        <Col className="gutter-row" span={24}>
          <Form.Item name="tag_desc" label="Tag description">
            <RichEditor
              placeholder="Enter Description Here"
              description={description}
              handleDescription={handleDescription}
            />
          </Form.Item>
        </Col>

        <Row>
          <Col className="gutter-row" span={12}>
            <Form.Item name="show_in_category" label="Show in Category">
              <Switch size="large" checkedChildren="Yes" unCheckedChildren="No" defaultChecked />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={12}>
            <Form.Item name="tag_status" label="Status">
              <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
        </Row>

        <Flex align="start" justify={"flex-end"}>
          <NavLink to={"/" + Paths.tagsList}>
            <Button style={StyleSheet.backBtnStyle} disabled={isLoading}>
              Cancel
            </Button>
          </NavLink>
          <Button loading={isLoading} type="primary" htmlType="submit" disabled={isLoading}>
            Update
          </Button>
        </Flex>
      </Form>
    </>
  ) : (
    <></>
  );
}
