/* eslint-disable no-empty */
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Skeleton,
  Switch,
  Typography,
  Upload,
  theme
} from "antd";
import { CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { NavLink, useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import {
  ALLOWED_FILE_TYPES,
  PermissionAction,
  snackBarErrorConf,
  snackBarSuccessConf,
  RULES_MESSAGES,
  ALLOWED_FILE_SIZE
} from "Helpers/ats.constants";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import RichEditor from "Components/Shared/richEditor";
import { actionsPermissionValidator, validateImage, validateImageMobile } from "Helpers/ats.helper";

//
const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};

export default function BrandsAdd() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { Title } = Typography;

  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingBanner, setLoadingBanner] = useState(false);
  const [description, setDescription] = useState("");

  const [brandLogo, setBrandLogo] = useState();
  const [brandBanner, setBrandBanner] = useState();
  const [brandMobileBanner, setBrandMobileBanner] = useState();
  const [categories, setCategories] = useState([]);

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

  /**
   * Banner style css
   */
  const bannerStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  };

  /**
   * Category image css
   */

  const categoryStyle = {
    width: "100%",
    height: "100%",
    objectFit: "contain"
  };

  //API call to get all the parent categories

  const { isLoading: categoriesLoading } = useQuery(
    "getAllParentCategories",
    () => apiService.getAllParentCategories(),
    {
      enabled: true,
      onSuccess: (res) => {
        if (res?.data?.length > 0) {
          const data = res.data.map((el) => {
            return { label: el.category_name, value: el.category_id };
          });
          setCategories(data);
        }
      },
      onError: (error) => {
        console.log(error, "error occured in getAllParentCategories");
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

      formData.append("brand_name", value?.brand_name);
      if (description) formData.append("brand_desc", description);

      // Handle image
      if (value?.brand_logo?.file) {
        formData.append("brand_logo", value?.brand_logo?.file);
      }
      // Handle banner image
      if (value?.banner_logo?.file && brandBanner) {
        formData.append("brand_banner", value?.banner_logo?.file);
      }

      if (value?.brand_mobile_banner?.file && brandBanner) {
        formData.append("brand_mobile_banner", value?.brand_mobile_banner?.file);
      }

      if (value?.category && Array.isArray(value.category)) {
        formData.append("categories", JSON.stringify(value.category));
      }
      // value?.brand_logo?.file ? formData.append("brand_logo", value?.brand_logo?.file) : "";
      // value?.banner_logo?.file ? formData.append("brand_banner", value?.banner_logo?.file) : "";

      formData.append("brand_status", value?.status ? "active" : "inactive");
      let obj = { load: formData };
      mutate(obj);
    } catch (error) {}
  };

  // UseMutation hook for creating a new Brand via API
  const { mutate, isLoading } = useMutation(
    // Mutation function to handle the API call for creating a new Brand
    (data) => apiService.createBrand(data.load, true),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(data.message, snackBarSuccessConf);

        // Navigate to the current window pathname after removing a specified portion
        navigate(`/${Paths.brandList}`);

        // Invalidate the "getAllRoles" query in the query client to trigger a refetch
        queryClient.invalidateQueries("fetchBrandData");
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
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
  const handleChange = async (info, type) => {
    const file = info.file;
    // Validate file based on type
    const isValid =
      type === "category_mobile_banner" ? await validateImageMobile(file) : validateImage(file);

    if (!isValid) {
      if (type === "category") {
        form.setFieldValue("brand_logo", null);
      }

      if (type === "banner") {
        form.setFieldValue("banner_logo", null);
      }

      if (type === "brand_mobile_banner") {
        form.setFieldValue("brand_mobile_banner", null);
      }
      return false;
    }

    if (info.file && info.fileList.length === 1) {
      // Get this url from response in real world.
      getBase64(info.fileList[0].originFileObj, (url) => {
        if (type === "banner") {
          setLoadingBanner(false);
          setBrandBanner(url);
        } else if (type === "brand_mobile_banner") {
          setLoadingBanner(false);
          setBrandMobileBanner(url);
        } else {
          setLoading(false);
          setBrandLogo(url);
        }
      });
    }
  };

  /**
   *  Description validation
   */
  const handleDescription = (value) => {
    setDescription(value);
    form.setFieldValue("brand_body", value);
  };

  /**
   * UseEffect function to set breadcrumb
   */
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? ""
      : navigate("/", { state: { from: null }, replace: true });

    form.setFieldValue("status", true);
    setBreadCrumb({
      title: "Brands",
      icon: "Brands",
      titlePath: Paths.brandList,
      subtitle: "Add Brand",
      path: Paths.users
    });
  }, []);

  // Function to remove the uploaded image
  const handleImgRemove = () => {
    if (brandLogo) {
      // Revoke the object URL to free up memory
      URL.revokeObjectURL(brandLogo);
      setBrandLogo(null); // Clear the image state
      form.setFieldValue("brand_logo", null);
    }
  };

  // Function to remove the uploaded banner image
  const handleBannerRemove = () => {
    if (brandBanner) {
      // Revoke the object URL to free up memory
      URL.revokeObjectURL(brandBanner);
      setBrandBanner(null); // Clear the image state
    }
  };

  // Function to remove the uploaded banner image
  const handleMobileBannerRemove = () => {
    if (brandMobileBanner) {
      // Revoke the object URL to free up memory
      URL.revokeObjectURL(brandBanner);
      setBrandMobileBanner(null); // Clear the image state
    }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) ? (
    <>
      <Title level={5}>Add Brand</Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={24}>
            <Row gutter={[24, 15]}>
              <Col className="gutter-row" xs={24} sm={24} md={8} lg={6} xl={4} xxl={4}>
                <div style={StyleSheet.uploadBoxStyle}>
                  <Form.Item
                    name="brand_logo"
                    label="Brand Logo"
                    rules={[{ required: true, message: "Brand Logo is required" }]}
                    extra={
                      <>
                        Allowed formats : JPEG,PNG,JPG Max size : {ALLOWED_FILE_SIZE}MB, <br />{" "}
                        Resolution : 512 x 512 px
                      </>
                    }>
                    <Upload
                      name="brand_logo"
                      listType="picture-card"
                      className="avatar-uploader"
                      accept={ALLOWED_FILE_TYPES}
                      showUploadList={false}
                      maxCount={1}
                      beforeUpload={() => false}
                      onChange={(e) => handleChange(e, "category")}>
                      {brandLogo ? (
                        <img src={brandLogo} alt="category" style={categoryStyle} />
                      ) : (
                        uploadButton
                      )}
                    </Upload>
                  </Form.Item>
                  {brandLogo && (
                    <div className="cover_delete" type="text" onClick={handleImgRemove}>
                      <DeleteOutlined />
                    </div>
                  )}
                </div>
              </Col>
              <Col className="gutter-row" xs={24} sm={24} md={8} lg={9} xl={10} xxl={10}>
                <div style={StyleSheet.uploadBoxStyle}>
                  <Form.Item
                    name="banner_logo"
                    label="Banner Image(Web)"
                    extra={`Allowed formats : JPEG,PNG,JPG Max size : ${ALLOWED_FILE_SIZE}MB, Resolution : 1440x280 px`}>
                    <Upload
                      name="banner_logo"
                      listType="picture-card"
                      className="avatar-uploader"
                      accept={ALLOWED_FILE_TYPES}
                      showUploadList={false}
                      maxCount={1}
                      beforeUpload={() => false}
                      onChange={(e) => handleChange(e, "banner")}>
                      {brandBanner ? (
                        <img src={brandBanner} alt="Banner" style={bannerStyle} />
                      ) : (
                        uploadBannerButton
                      )}
                    </Upload>
                  </Form.Item>
                  {brandBanner && (
                    <div className="cover_delete" type="text" onClick={handleBannerRemove}>
                      <DeleteOutlined />
                    </div>
                  )}
                </div>
              </Col>
              <Col className="gutter-row" xs={24} sm={24} md={8} lg={9} xl={10} xxl={10}>
                <div style={StyleSheet.uploadBoxStyle}>
                  <Form.Item
                    name="brand_mobile_banner"
                    label="Banner Image(Mobile)"
                    extra={`Allowed formats : JPEG,PNG,JPG Max size : ${ALLOWED_FILE_SIZE}MB, Resolution : 340x120 px`}>
                    <Upload
                      name="brand_mobile_banner"
                      listType="picture-card"
                      className="avatar-uploader"
                      accept={ALLOWED_FILE_TYPES}
                      showUploadList={false}
                      maxCount={1}
                      beforeUpload={() => false}
                      onChange={(e) => handleChange(e, "brand_mobile_banner")}>
                      {brandMobileBanner ? (
                        <img
                          src={brandMobileBanner}
                          alt="brand_mobile_banner"
                          style={bannerStyle}
                        />
                      ) : (
                        uploadBannerButton
                      )}
                    </Upload>
                  </Form.Item>
                  {brandMobileBanner && (
                    <div className="cover_delete" type="text" onClick={handleMobileBannerRemove}>
                      <DeleteOutlined />
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Col>
          <Col className="gutter-row" span={24}>
            <Row gutter={[24, 0]}>
              <Col className="gutter-row" span={24}>
                <Form.Item
                  name="brand_name"
                  label="Brand Name"
                  type="number"
                  rules={[
                    { required: true, whitespace: true, message: "Brand Name is required" },
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
                  <Input placeholder="Enter Brand Name" size="large" />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={24}>
                <Form.Item
                  name="category"
                  label="Select Category"
                  rules={[{ required: true, message: "Category is required" }]}>
                  <Select
                    mode="multiple"
                    allowClear
                    showSearch
                    loading={categoriesLoading}
                    className="width_full"
                    size="large"
                    options={categories}
                    filterOption={(input, option) =>
                      (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                    }
                    placeholder="Select Category"
                  />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={24}>
                <Form.Item name="brand_body" label="Description">
                  <RichEditor
                    placeholder="Enter Description Here"
                    handleDescription={handleDescription}
                    description={description}
                  />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item name="status" label="Status">
                  <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Flex gap="middle" align="start" vertical>
          <Flex justify={"flex-end"} align={"center"} className="width_full">
            <NavLink to={"/" + Paths.brandList}>
              <Button disabled={isLoading} style={StyleSheet.backBtnStyle}>
                Cancel
              </Button>
            </NavLink>
            {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
              <Button loading={isLoading} type="primary" htmlType="submit" disabled={isLoading}>
                Add
              </Button>
            )}
          </Flex>
        </Flex>
      </Form>
    </>
  ) : (
    <></>
  );
}
