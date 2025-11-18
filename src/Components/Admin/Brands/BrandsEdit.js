/* eslint-disable no-undef */
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
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import { actionsPermissionValidator, validateImage } from "Helpers/ats.helper";
import { getFullImageUrl } from "Helpers/functions";

const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};

export default function BrandsEdit() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const { Title } = Typography;
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingBanner, setLoadingBanner] = useState(false);
  const [brandLogo, setBrandLogo] = useState();
  const [brandLogoId, setBrandLogoId] = useState();
  const [brandBanner, setBrandBanner] = useState();
  // const [brandBannerId, setBrandBannerId] = useState();
  const [description, setDescription] = useState("");
  const [tempBannerId, setTempBannerId] = useState();

  const [brandMobileBanner, setBrandMobileBanner] = useState();
  // const [brandMobileBannerId, setBrandMobileBannerId] = useState();
  const [tempMobileBannerId, setTempMobileBannerId] = useState();
  const [categories, setCategories] = useState([]);

  const location = useLocation();

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
   * brand image css
   */

  const brandStyle = {
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

  const handleDescription = (value) => {
    setDescription(value);

    // form.setFieldValue("short_desc", "abchcj")

    form.setFieldsValue({ short_desc: value });
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

  // UseQuery hook for fetching data of a single brand from the API
  const { refetch } = useQuery(
    "getSingleBrand",

    // Function to fetch data of a single brand using apiService.getRequest
    () => apiService.getRequest(`/brands/${params.id}`),
    {
      // Configuration options
      enabled: true, // Enable the query by default
      onSuccess: (data) => {
        if (data) {
          const {
            brand_desc,
            brand_name,
            brand_status,
            banner,
            logo,
            mobile_banner,
            relation_data
          } = data.data;

          // Set form values based on the fetched data
          form.setFieldValue("brand_name", brand_name);
          form.setFieldValue("brand_body", brand_desc);

          if (relation_data?.length) {
            const categories = relation_data.map((el) => el.category_id);
            form.setFieldValue("category", categories);
          }

          brand_desc && setDescription(brand_desc);

          if (logo) {
            const { origin_type, file_path, attachment_id } = logo;
            setBrandLogo(origin_type === "local" ? getFullImageUrl(file_path) : file_path);
            attachment_id && setBrandLogoId(attachment_id);
            attachment_id && form.setFieldValue("brand_logo", attachment_id);
          }
          if (banner) {
            const { origin_type, file_path, attachment_id } = banner;
            setBrandBanner(origin_type === "local" ? getFullImageUrl(file_path) : file_path);
            attachment_id && setTempBannerId(attachment_id);
            attachment_id && form.setFieldValue("banner_id", tempBannerId);
          }

          if (mobile_banner) {
            const { origin_type, file_path, attachment_id } = mobile_banner;
            setBrandMobileBanner(origin_type === "local" ? getFullImageUrl(file_path) : file_path);
            attachment_id && setTempMobileBannerId(attachment_id);
            attachment_id && form.setFieldValue("brand_mobile_banner_id", tempMobileBannerId);
          }

          form.setFieldValue("status", brand_status === "active");
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
      const { brand_name, brand_logo, banner_logo, brand_mobile_banner } = value;
      let formData = new FormData();

      brand_name && formData.append("brand_name", brand_name);
      description && formData.append("brand_desc", description);

      // Handle image
      brand_logo?.file && formData.append("brand_logo", brand_logo.file);
      // Append IDs if they exist
      // Handle banner image
      if (value?.banner_logo?.file) {
        banner_logo?.file && formData.append("brand_banner", banner_logo.file);
        tempBannerId && formData.append("banner_id", tempBannerId);
      } else {
        tempBannerId && formData.append("banner_id", tempBannerId);
      }
      brandLogoId && formData.append("logo_id", brandLogoId);

      if (value?.brand_mobile_banner?.file) {
        formData.append("brand_mobile_banner", brand_mobile_banner?.file);
        tempMobileBannerId && formData.append("brand_mobile_banner_id", tempMobileBannerId);
      } else {
        tempMobileBannerId && formData.append("brand_mobile_banner_id", tempMobileBannerId);
      }

      if (value?.category && Array.isArray(value.category)) {
        formData.append("categories", JSON.stringify(value.category));
      }

      formData.append("brand_status", value?.status ? "active" : "inactive");
      let obj = { load: formData };
      mutate(obj); // api call for update
    } catch (error) {
      console.log(error, "error occured in form submission");
    }
  };

  // UseMutation hook for creating a update brand via API
  const { mutate, isLoading } = useMutation(
    // Mutation function to handle the API call for creating a update brand
    (data) => apiService.updateBrand(data.load, params.id, true),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(data.message, snackBarSuccessConf);

        // Navigate to the current window pathname after removing a specified portion
        const searchParams = new URLSearchParams(location.search);
        const page = searchParams.get("page") || "1";
        const pageSize = searchParams.get("pageSize") || "10";
        navigate(`/${Paths.brandList}?page=${page}&pageSize=${pageSize}`);

        // Invalidate the "getAllRoles" query in the query client to trigger a refetch
        queryClient.invalidateQueries("fetchbrandData");
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
        // enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT)
      ? refetch()
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Brands",
      icon: "Brands",
      titlePath: Paths.brandList,
      subtitle: "Edit brand",
      path: Paths.users
    });
  }, []);

  // Function to remove the uploaded image
  const handleImgRemove = () => {
    if (brandLogo) {
      // Revoke the object URL to free up memory
      setBrandLogo(null); // Clear the image state
      // setBrandLogoId(null); // Clear the image state
      form.setFieldValue("brand_logo", null);
    }
  };

  // Function to remove the uploaded banner image
  const handleBannerRemove = () => {
    if (brandBanner) {
      setBrandBanner(null); // Clear the image state
      // setBrandBannerId(null); // Clear the image state
    }
  };

  const handleMobileBannerRemove = () => {
    if (brandMobileBanner) {
      setBrandMobileBanner(null); // Clear the image state
      // setBrandMobileBannerId(null); // Clear the image state
    }
  };

  //Function to go back to the Category listing page
  const handleCancel = () => {
    const searchParams = new URLSearchParams(location.search);
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "10";
    navigate(`/${Paths.brandList}?page=${page}&pageSize=${pageSize}`);
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) ? (
    <>
      <Title level={5}>Edit Brand</Title>
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
                        Resolution : 512 x 512 px{" "}
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
                      onChange={(e) => handleChange(e, "brand")}>
                      {brandLogo ? (
                        <img src={brandLogo} alt="brand" style={brandStyle} />
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
                  <Input size="large" placeholder="Enter Brand Name" />
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
                    // setDescription={setDescription}
                    description={description}
                    handleDescription={handleDescription}
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
            <Button disabled={isLoading} style={StyleSheet.backBtnStyle} onClick={handleCancel}>
              Cancel
            </Button>
            <Button loading={isLoading} type="primary" htmlType="submit" disabled={isLoading}>
              Update
            </Button>
          </Flex>
        </Flex>
      </Form>
    </>
  ) : (
    <></>
  );
}
