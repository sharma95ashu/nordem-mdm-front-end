/* eslint-disable no-undef */
/* eslint-disable no-empty */
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Skeleton,
  Switch,
  TreeSelect,
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
  // allSupportedStores
} from "Helpers/ats.constants";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import RichEditor from "Components/Shared/richEditor";
import {
  actionsPermissionValidator,
  firstlettCapital,
  validateImageMobile,
  validateImage
} from "Helpers/ats.helper";
import { getFullImageUrl } from "Helpers/functions";

const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};

export default function CategoryAdd() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const { Title } = Typography;
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingBanner, setLoadingBanner] = useState(false);
  const [categoryImage, setCategoryImage] = useState();
  const [categoryImageId, setCategoryImageId] = useState(null);
  const [parentCategory, setParentCategory] = useState([]);
  const [bannerImage, setBannerImage] = useState();
  const [bannerImageId, setBannerImageId] = useState(null);
  const [bannerMobileImage, setBannerMobileImage] = useState();
  const [bannerMobileImageId, setBannerMobileImageId] = useState(null);
  const [description, setDescription] = useState("");
  const [allLoading, setAllLoading] = useState(false);
  const [categoryImageDeleted, setCategoryImageDeleted] = useState(false);

  const [tempBannerId, setTempBannerId] = useState(null);
  const [tempMobileBannerId, setTempMobileBannerId] = useState(null);
  const location = useLocation();

  // const [checkedList, setCheckedList] = useState([]);

  //Function to check if all stores are selected
  // const checkAll = () => {
  //   try {
  //     return allSupportedStores?.length === checkedList?.length;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const {
    token: { colorText }
  } = theme.useToken();

  /*
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
    if (info?.file && info?.fileList?.length === 1) {
      // Get this url from response in real world.
      getBase64(info.fileList[0].originFileObj, (url) => {
        if (type === "banner") {
          setLoadingBanner(false);
          setBannerImage(url);
        } else if (type === "category_mobile_banner") {
          setBannerMobileImage(url);
        } else {
          setLoading(false);
          setCategoryImage(url);
          setCategoryImageDeleted(false);
        }
      });
    }
  };

  /**
   * function to filter by label in multi select dropdown
   * @param {} inputValue
   * @param {*} treeNode
   * @returns
   */
  const filterTreeNode = (inputValue, treeNode) => {
    // Check if the input value matches any part of the label of the treeNode
    return treeNode.label.toLowerCase().includes(inputValue.toLowerCase());
  };
  // UseQuery hook for fetching data of a single Category from the API
  const { refetch } = useQuery(
    "getSingleCategory",

    // Function to fetch data of a single Category using apiService.getRequest
    () => apiService.getRequest(`/categories/${params.id}`),
    {
      // Configuration options
      enabled: false, // Disable the query by default
      onSuccess: (data) => {
        // Set form values based on the fetched data
        form.setFieldsValue(data?.data || {});
        const { image, banner, banner_mobile } = data.data || {};

        if (image && image.file_path) {
          const { origin_type, file_path } = image;
          setCategoryImage(origin_type === "local" ? getFullImageUrl(file_path) : file_path);
        }

        if (banner && banner.file_path) {
          const { origin_type, file_path } = banner;
          setBannerImage(origin_type === "local" ? getFullImageUrl(file_path) : file_path);
        }
        if (banner_mobile && banner_mobile.file_path) {
          const { origin_type, file_path } = banner_mobile;
          setBannerMobileImage(origin_type === "local" ? getFullImageUrl(file_path) : file_path);
        }

        form.setFieldValue("status", data?.data?.category_status === "active" ? true : false);
        form.setFieldValue("show_out_of_stock_product", data?.data?.show_out_of_stock_product);
        form.setFieldValue("display_order", data?.data?.category_display_order);
        form.setFieldValue("category_body", data?.data?.category_body);
        setDescription(data?.data?.category_body ? data?.data?.category_body : "");
        form.setFieldValue("category_image", data?.data?.image?.attachment_id);
        form.setFieldValue("banner_image", data?.data?.banner?.attachment_id);
        form.setFieldValue("banner_mobile_image", data?.data?.banner_mobile?.attachment_id);
        data?.data?.category_parent
          ? form.setFieldValue("parent_category", data?.data?.category_parent)
          : "";
        if (data?.data?.banner?.attachment_id) {
          setBannerImageId(data?.data?.banner?.attachment_id);
          setTempBannerId(data?.data?.banner?.attachment_id);
        }
        if (data?.data?.banner_mobile?.attachment_id) {
          setBannerMobileImageId(data?.data?.banner_mobile?.attachment_id);
          setTempMobileBannerId(data?.data?.banner_mobile?.attachment_id);
        }

        data?.data?.image?.attachment_id
          ? setCategoryImageId(data?.data?.image?.attachment_id)
          : "";
        setAllLoading(true);
        // setCheckedList(supported_stores);
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // const filterData = {
  //   status: "active",
  //   id: params.id
  // };

  // Convert filterData to JSON string
  // const convertData = JSON.stringify(filterData);

  // If sort is provided, set the sorting state

  // Construct parameters for the API request
  // const paramsList = {
  //   filterTerm: convertData
  // };

  // Construct the complete API URL with parameters
  const apiUrl = `/categories/all/0/500`;

  // UseQuery hook for fetching data of a All Category from the API
  const { refetch: fetchCategories } = useQuery(
    "getAllCategory",
    // Function to fetch data of a single Category using apiService.getRequest
    () => apiService.getRequest(apiUrl),
    {
      // Configuration options
      enabled: false, // Disable the query by default
      onSuccess: (data) => {
        // Set form values based on the fetched data
        setParentCategory([]);

        data?.data?.data.map((item) =>
          setParentCategory((prev) => [
            ...prev,
            {
              value: item.category_id,
              label: firstlettCapital(item.category_name),
              // children: item?.children?.map((child) => ({
              //   value: child.category_id,
              //   label: firstlettCapital(child.category_name),
              //   children: child?.children?.map((subchild) => ({
              //     value: subchild.category_id,
              //     label: firstlettCapital(subchild.category_name)
              //   }))
              // }))
              children: item?.children?.map((child) => ({
                value: child.category_id,
                label: firstlettCapital(child.category_name),
                children: child?.children?.map((subchild) => ({
                  value: subchild.category_id,
                  label: firstlettCapital(subchild.category_name),
                  children: subchild?.children?.map((level4) => ({
                    value: level4.category_id,
                    label: firstlettCapital(level4.category_name),
                    children: level4?.children?.map((level5) => ({
                      value: level5.category_id,
                      label: firstlettCapital(level5.category_name),
                      children: level5?.children?.map((level6) => ({
                        value: level6.category_id,
                        label: firstlettCapital(level6.category_name),
                        children: level6?.children?.map((level7) => ({
                          value: level7.category_id,
                          label: firstlettCapital(level7.category_name)
                        }))
                      }))
                    }))
                  }))
                }))
              }))
            }
          ])
        );
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

      // Handle image
      if (!categoryImageDeleted) {
        if (categoryImageId) {
          formData.append("category_image_id", categoryImageId);
        }

        if (value?.category_image?.file) {
          formData.append("category_image", value.category_image.file);
        }
      }

      // Handle banner image
      if (value?.banner_image?.file) {
        formData.append("category_banner", value?.banner_image?.file);
        tempBannerId && formData.append("category_banner_id", tempBannerId);
      } else {
        bannerImageId && formData.append("category_banner_id", bannerImageId);
      }

      if (value?.category_mobile_banner?.file) {
        formData.append("category_mobile_banner", value?.category_mobile_banner?.file);
        tempMobileBannerId && formData.append("category_mobile_banner_id", tempMobileBannerId);
      } else {
        bannerMobileImageId && formData.append("category_mobile_banner_id", bannerMobileImageId);
      }

      formData.append("category_name", value?.category_name);
      value?.parent_category ? formData.append("category_parent", value?.parent_category) : "";
      if (description) {
        formData.append("category_body", description);
      }
      formData.append("display_order", value?.display_order);
      formData.append("is_featured", value?.is_featured || false);

      // if (Array.isArray(value?.show_on_type)) {
      //   value?.show_on_type.forEach((item, index) => {
      //     formData.append(`${"show_on_type"}[${index}]`, item);
      //   });
      // } else {
      //   formData.append("show_on_type", value);
      // }

      // if (Array.isArray(value?.supported_stores)) {
      //   value?.supported_stores.forEach((item, index) => {
      //     formData.append(`${"supported_stores"}[${index}]`, item);
      //   });
      // }

      formData.append(`${"show_on_type"}[${0}]`, "web");
      formData.append(`${"show_on_type"}[${1}]`, "app");

      formData.append("status", value?.status === true ? "active" : "inactive");
      formData.append("category_template_type", "");
      formData.append("show_out_of_stock_product", value?.show_out_of_stock_product);
      let obj = { load: formData };
      mutate(obj);
    } catch (error) {}
  };

  // UseMutation hook for creating a update Category via API
  const { mutate, isLoading } = useMutation(
    // Mutation function to handle the API call for creating a update Category
    (data) => apiService.updateCategory(data.load, params.id, true),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(data.message, snackBarSuccessConf);

        // Navigate to the current window pathname after removing a specified portion
        const searchParams = new URLSearchParams(location.search);
        const page = searchParams.get("page") || "1";
        const pageSize = searchParams.get("pageSize") || "10";
        navigate(`/${Paths.categoryList}?page=${page}&pageSize=${pageSize}`);

        // Invalidate the "getAllRoles" query in the query client to trigger a refetch
        queryClient.invalidateQueries("fetchCategoryData");
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
        // enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  const fetchData = () => {
    refetch();
    fetchCategories();
  };
  /**
   *  Description validation
   */
  const handleDescription = (value) => {
    setDescription(value);
    form.setFieldValue("category_body", value);
  };

  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT)
      ? fetchData()
      : navigate("/", { state: { from: null }, replace: true });
    setBreadCrumb({
      title: "Categories",
      icon: "category",
      titlePath: Paths.categoryList,
      subtitle: "Edit Category",
      path: Paths.users
    });
  }, []);

  // Function to remove the uploaded image
  const handleImgRemove = () => {
    if (categoryImage) {
      // Revoke the object URL to free up memory
      setCategoryImage(null); // Clear the image state
      // setCategoryImageId(null); // Clear the image state
      // form.setFieldValue("brand_logo", null);
      setCategoryImageDeleted(true);
    }
  };

  // Function to remove the uploaded banner image
  const handleBannerRemove = () => {
    if (bannerImage) {
      // Revoke the object URL to free up memory
      setBannerImage(null); // Clear the image state
      setBannerImageId(null); // Clear the image state
    }
  };

  // Function to remove the uploaded banner image
  const handleMobileBannerRemove = () => {
    if (bannerMobileImage) {
      // Revoke the object URL to free up memory
      setBannerMobileImage(null); // Clear the image state
      setBannerMobileImageId(null); // Clear the image state
    }
  };

  // const onChange = (list) => {
  //   setCheckedList(list);
  // };
  // const onCheckAllChange = (e) => {
  //   setCheckedList(e.target.checked ? allSupportedStores : []);
  //   form.setFieldValue("supported_stores", e.target.checked ? allSupportedStores : []);
  //   form.validateFields(["supported_stores"]);
  // };

  //Function to go back to the Category listing page
  const handleCancel = () => {
    const searchParams = new URLSearchParams(location.search);
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "10";
    navigate(`/${Paths.categoryList}?page=${page}&pageSize=${pageSize}`);
  };

  return allLoading &&
    actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) ? (
    <>
      <Title level={5}>Edit Category</Title>

      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={24}>
            <Row gutter={[24, 15]}>
              <Col className="gutter-row" xs={24} sm={24} md={8} lg={6} xl={4} xxl={4}>
                <div style={{ position: "relative" }}>
                  <Form.Item
                    name="category_image"
                    label="Category Image"
                    extra={
                      <>
                        Allowed formats : JPEG,PNG,JPG Max size : {ALLOWED_FILE_SIZE}MB, <br />{" "}
                        Resolution : 512 x 512 px
                      </>
                    }>
                    <Upload
                      name="category_image"
                      listType="picture-card"
                      className="avatar-uploader"
                      accept={ALLOWED_FILE_TYPES}
                      showUploadList={false}
                      maxCount={1}
                      beforeUpload={() => false}
                      onChange={(e) => handleChange(e, "category")}>
                      {categoryImage ? (
                        <img src={categoryImage} alt="category" style={categoryStyle} />
                      ) : (
                        uploadButton
                      )}
                    </Upload>
                  </Form.Item>
                  {categoryImage && (
                    <div className="cover_delete" type="text" onClick={handleImgRemove}>
                      <DeleteOutlined />
                    </div>
                  )}
                </div>
              </Col>
              <Col className="gutter-row" xs={24} sm={24} md={8} lg={9} xl={10} xxl={10}>
                <div style={StyleSheet.uploadBoxStyle}>
                  <Form.Item
                    name="banner_image"
                    label="Banner Image(Web)"
                    extra={`Allowed formats : JPEG,PNG,JPG Max size : ${ALLOWED_FILE_SIZE}MB, Resolution : 1440x280 px`}>
                    <Upload
                      name="banner_image"
                      listType="picture-card"
                      className="avatar-uploader"
                      accept={ALLOWED_FILE_TYPES}
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
                    name="category_mobile_banner"
                    label="Banner Image(Mobile)"
                    extra={`Allowed formats : JPEG,PNG,JPG Max size : ${ALLOWED_FILE_SIZE}MB, Resolution : 340x120 px`}>
                    <Upload
                      name="category_mobile_banner"
                      listType="picture-card"
                      className="avatar-uploader"
                      accept={ALLOWED_FILE_TYPES}
                      showUploadList={false}
                      maxCount={1}
                      beforeUpload={() => false}
                      onChange={(e) => handleChange(e, "category_mobile_banner")}>
                      {bannerMobileImage ? (
                        <img
                          src={bannerMobileImage}
                          alt="category_mobile_banner"
                          style={bannerStyle}
                        />
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
            <Row gutter={[24, 0]}>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="category_name"
                  label="Category Name"
                  rules={[
                    { required: true, whitespace: true, message: "Category name is required" },
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
                  <Input placeholder="Enter Category Name" size="large" />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item name="parent_category" label="Parent Category">
                  <TreeSelect
                    allowClear
                    showSearch
                    treeDefaultExpandAll
                    size="large"
                    treeData={parentCategory}
                    placeholder="Select Parent Category"
                    filterTreeNode={filterTreeNode}
                  />
                </Form.Item>
              </Col>
              {/* <Col className="gutter-row" span={12}>
                <Form.Item
                  name="category_template_type"
                  label="Category Template Type"
                  rules={[{ required: true, message: "Category Template Type is required" }]}>
                  <Select
                    size="large"
                    placeholder="Select Category Template Type"
                    options={templateOptions}
                    filterOption={(input, option) =>
                      (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col> */}
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="display_order"
                  label="Display Order"
                  type="number"
                  rules={[
                    { required: true, message: "Display order is required" },
                    { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" },
                    {
                      pattern: /^[1-9]\d*$/,
                      message: "Please enter valid number"
                    }
                  ]}>
                  <Input placeholder="Enter Category Display Order" size="large" />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item name="show_out_of_stock_product" label="Show Out of Stock Product">
                  <Switch size="large" checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col>
              {/* <Col className="gutter-row" span={12}>
                <Form.Item name="is_featured" label="Is Featured">
                  <Switch size="large" checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col> */}
              <Col className="gutter-row" span={24}>
                <Form.Item name="category_body" label="Description">
                  <RichEditor
                    placeholder="Enter Description Here"
                    setDescription={setDescription}
                    handleDescription={handleDescription}
                    description={description}
                  />
                </Form.Item>
              </Col>
              {/* <Col className="gutter-row" span={8}>
                <Form.Item
                  name="show_on_type"
                  label="Available on"
                  rules={[{ required: true, message: "Available on is required" }]}>
                  <Checkbox.Group>
                    <Checkbox value="web">Web</Checkbox>
                    <Checkbox value="app">App</Checkbox>
                    <Checkbox value="offline">Offline</Checkbox>
                  </Checkbox.Group>
                </Form.Item>
              </Col> */}
              {/* <Col span={10}>
                <Flex wrap="wrap" align="start">
                  <Form.Item label="Supported Stores" className="margin-bottom-zero">
                    <Checkbox onChange={onCheckAllChange} checked={checkAll()}>
                      All
                    </Checkbox>
                  </Form.Item>
                  <Form.Item
                    name="supported_stores"
                    rules={[{ required: true, message: "Supported Stores is required" }]}>
                    <Checkbox.Group
                      options={allSupportedStores.map((store) => ({
                        label: formatLabel(store),
                        value: store
                      }))}
                      value={checkedList}
                      onChange={onChange}
                    />
                  </Form.Item>
                </Flex>
              </Col> */}
            </Row>
          </Col>
        </Row>
        <Flex gap="middle">
          <Form.Item name="status" label="Status">
            <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
          <Flex justify={"flex-end"} align={"center"} className="width_full">
            <Button disabled={isLoading} style={StyleSheet.backBtnStyle} onClick={handleCancel}>
              Cancel
            </Button>

            {actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) && (
              <Button loading={isLoading} type="primary" htmlType="submit" disabled={isLoading}>
                Update
              </Button>
            )}
          </Flex>
        </Flex>
      </Form>
    </>
  ) : (
    <Skeleton active />
  );
}
