/* eslint-disable no-unused-vars */

import {
  Button,
  Carousel,
  Col,
  Divider,
  Flex,
  Form,
  Image,
  Input,
  Popconfirm,
  Row,
  Select,
  Skeleton,
  Space,
  Spin,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload,
  theme
} from "antd";
import React, { useEffect, useState } from "react";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import {
  PermissionAction,
  snackBarSuccessConf,
  RULES_MESSAGES,
  ALLOWED_FILE_TYPES,
  snackBarErrorConf
} from "Helpers/ats.constants";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import {
  actionsPermissionValidator,
  convertRangeISODateFormat,
  firstlettCapital,
  validateFileSize
} from "Helpers/ats.helper";
import {
  CloudUploadOutlined,
  DeleteOutlined,
  EditOutlined,
  FormOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  PlusSquareOutlined
} from "@ant-design/icons";
import StickyBox from "react-sticky-box";
import KeySoulTestIcon from "Static/img/keysoul_testimonial.svg";
import _ from "lodash";
import Link from "antd/es/typography/Link";
import { type } from "@testing-library/user-event/dist/type";
import { render } from "@testing-library/react";
import { getBase64, getFullImageUrl } from "Helpers/functions";
import BannerModal from "../BannerModal";
import BannerModalMobile from "../BannerModalMobile";
const { Title, Text } = Typography;
const { Search } = Input;

export default function BasicDetail({ onSave }) {
  const {
    token: { colorText, colorBgContainer, paddingSM, paddingLG, colorBgLayout, colorBorder }
  } = theme.useToken();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [showHideAdd, setshowHideAdd] = useState(false);
  const [carouselImages, setCarouselImages] = useState([{ imgUrl: null }]);
  const [carouselImagesM, setCarouselImagesM] = useState([{ imgUrl: null }]);

  const { apiService } = useServices();
  const [error, setError] = useState(false);
  const [modal, setModal] = useState(false);
  const [modalM, setModalM] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [currentIndexM, setCurrentIndexM] = useState(null);
  const [brandID, setBrandId] = useState("");
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1, // Current page
    pageSize: 5, // Default page size
    total: 0 // Total items (fetched dynamically)
  });
  const [templateName, setTemplateName] = useState("");
  const [editedFormId, setEditedFormId] = useState();
  const [templateType, setTemplateType] = useState("");
  const [allBrandsList, setallBrandsList] = useState([]);
  // const [platformType, setPlatformType] = useState("web");
  const [category, setCategory] = useState([]);
  const StyleSheet = {
    backBtnStyle: {
      marginRight: "10px"
    },
    editBannerImgIcon: {
      fontSize: "22px",
      color: "white",
      marginTop: "10px"
    },
    uploadBtnStyle: {
      border: 0,
      background: "none"
    },
    carouselStyle: {
      marginBottom: "10px",
      border: "1px solid",
      borderColor: colorBorder,
      padding: "20px",
      height: "250px"
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
    },
    formStyle: {
      margin: "0 -10px",
      paddingTop: 0,
      paddingBottom: paddingSM,
      paddingLeft: paddingLG,
      paddingRight: paddingLG
    },
    TitleStyle: {
      marginTop: 0
    },
    contentSubStyle: {
      paddingTop: paddingSM,
      paddingBottom: paddingSM,
      paddingLeft: paddingLG,
      paddingRight: paddingLG,
      background: colorBgContainer,
      border: `1px solid ${colorBorder}`,
      borderRadius: "10px",
      margin: "0 0 20px",
      width: "100%"
    },
    mainContainer: {
      paddingTop: "40px",
      paddingBottom: paddingSM,
      paddingLeft: paddingLG,
      paddingRight: paddingLG,
      marginRight: -paddingLG,
      marginLeft: -paddingLG,
      marginBottom: -paddingSM,
      marginTop: -16,
      background: colorBgLayout,
      minHeight: "calc(100vh - 195px)"
    },
    contentStyle: {
      position: "relative",
      color: "#fff",
      textAlign: "center"
    },
    imgStyle: {
      height: "200px",
      objectFit: "cover",
      marginBottom: "10px",
      width: "100%"
    }
  };

  // Opens the modal for editing the selected image based on the provided index
  const handleEditImage = (index) => {
    try {
      setCurrentIndex(index);
      setModal(true);
    } catch (error) {}
  };
  // Opens the mobile modal for editing the selected image based on the provided index
  const handleEditImageM = (index) => {
    try {
      setCurrentIndexM(index);
      setModalM(true);
    } catch (error) {}
  };

  // function call - when file uploads
  const handleUploadChange = (info, currIndex) => {
    try {
      // Verify the size of file
      if (!validateFileSize(info.file)) {
        return false;
      }

      if (info.file && info.fileList.length === 1) {
        // Get this url from response in real world.
        getBase64(info.fileList[0].originFileObj, (url) => {
          let obj = { imgUrl: url, file: info.file };

          if (currIndex >= 0) {
            const deepClonedArr = _.cloneDeep(carouselImages);
            deepClonedArr[currIndex].imgUrl = url;
            deepClonedArr[currIndex].file = info.file;
            setCarouselImages(deepClonedArr);
          } else {
            if (carouselImages?.length == 1) {
              handleEditImage(carouselImages.length - 1);
              setCarouselImages([obj, { imgUrl: null }]);
            } else {
              handleEditImage(carouselImages.length - 1);
              carouselImages.pop();
              setCarouselImages([...carouselImages, obj, { imgUrl: null }]);
            }
          }
          setError(false);
          setModal(true);
        });
      }
    } catch (error) {}
  };

  // function call - when file uploads for mobile
  const handleUploadChangeM = (info, currIndex) => {
    try {
      // Verify the size of file
      if (!validateFileSize(info.file)) {
        return false;
      }

      if (info.file && info.fileList.length === 1) {
        // Get this url from response in real world.
        getBase64(info.fileList[0].originFileObj, (url) => {
          let obj = { imgUrl: url, file: info.file };

          if (currIndex >= 0) {
            const deepClonedArr = _.cloneDeep(carouselImagesM);
            deepClonedArr[currIndex].imgUrl = url;
            deepClonedArr[currIndex].file = info.file;
            setCarouselImagesM(deepClonedArr);
          } else {
            if (carouselImagesM?.length == 1) {
              setCarouselImagesM([obj, { imgUrl: null }]);
            } else {
              carouselImagesM.pop();
              setCarouselImagesM([...carouselImagesM, obj, { imgUrl: null }]);
            }
          }
          setError(false);
          setModalM(true);
        });
      }
    } catch (error) {}
  };

  // UseMutation hook for Updating a basic detail
  const { mutate: UpdateBasicDetail, isLoading: updateLoading } = useMutation(
    // Mutation function to handle the API call for Update a new Configuration
    (data) => apiService.keySoulUpdateBasicDetail(data.load, data.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);

          // Reset the table pagination to the first page
          setPagination((prev) => ({
            ...prev,
            current: 1, // Set current page to 1
            pageSize: 5 // Keep the same page size or reset if needed
          }));
          // API Call to fetch all details
          getAllBasicDetails({
            current: 1,
            pageSize: 5,
            searchTerm: "",
            brand_id: brandID
          });
          setshowHideAdd(false);
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // UseMutation hook for deleting a basic detail
  const { mutate: deleteBasicDetail, isLoading: deleteLoading } = useMutation(
    (data) => apiService.keySoulDeleteBasicDetail(data.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          // API Call to fetch all details
          getAllBasicDetails({
            current: 1,
            pageSize: 5,
            searchTerm: "",
            brand_id: brandID
          });
          setshowHideAdd(false);
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // UseMutation hook for creating a new Configuration via API
  const { mutate, isLoading: addLoading } = useMutation(
    // Mutation function to handle the API call for creating a new Configuration
    (data) => apiService.keySoulCreateBasicDetail(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data && data.success) {
          setshowHideAdd(false);
          enqueueSnackbar(data.message, snackBarSuccessConf);
          onSave(brandID); // Trigger the callback to enable tabs
          const newPathname = Paths.brandTemplateEdit + "/" + (data?.data?.brand_detail_id || "");
          navigate(`/${newPathname}`);
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // UseMutation hook for editing a basic detail
  const { mutate: fetchSingleBanner, isLoading: basicLoading } = useMutation(
    (data) => apiService.getKeySoulBasicDetail(data.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          if (data.success) {
            const tempSliderImgs = data?.data?.banner_images?.map((item) => {
              let obj = { ...item };

              obj["imgUrl"] = getFullImageUrl(item?.filePath);

              return obj;
            });
            const tempSliderImgsM = data?.data?.banner_mobile_images?.map((item) => {
              let obj = { ...item };

              obj["imgUrl"] = getFullImageUrl(item?.filePath);

              return obj;
            });

            setCarouselImages([...tempSliderImgs, { imgUrl: null }] || []);
            setCarouselImagesM([...tempSliderImgsM, { imgUrl: null }] || []);

            form.setFieldValue("template_name", data?.data?.template_name);
            form.setFieldValue("template_type", data?.data?.template_type);
            form.setFieldValue("category_ids", data?.data?.category_ids);
            form.setFieldValue("active", data?.data?.active);
            setshowHideAdd(true);
          }
        }
      },
      onError: (error) => {
        console.error(error, "error occured in fetchSingleBanner");
      }
    }
  );

  // Function to submit form data for basic detail
  const onFinish = (value) => {
    try {
      let formData = new FormData();
      if (carouselImages?.length > 1) {
        const deepClonedArr = _.cloneDeep(carouselImages);
        deepClonedArr.pop();
        const arr = deepClonedArr.map((obj) => {
          delete obj.imgUrl;
          return obj;
        });

        for (let i = 0; i < arr.length; i++) {
          if (arr[i].file) {
            formData.append("banner_images", arr[i].file);
          } else {
            formData.append("banner_details[" + i + "]" + "attachment_id", arr[i].attachment_id);
            formData.append("banner_details[" + i + "]" + "filePath", arr[i].filePath);
          }
          formData.append(
            "banner_details[" + i + "]" + "display_order",
            arr[i].display_order || ""
          );

          if (arr[i].active === "undefined") {
            formData.append("banner_details[" + i + "]" + "active", true);
          } else {
            formData.append(
              "banner_details[" + i + "]" + "active",
              arr[i].active === undefined ? true : arr[i].active
            );
          }

          formData.append("banner_details[" + i + "]" + "url", arr[i].url || "");

          if (arr[i].dateRange) {
            // Get ISO start and end Date
            let dateRangeConversion = convertRangeISODateFormat(arr[i].dateRange);
            formData.append(
              "banner_details[" + i + "]" + "start_date",
              dateRangeConversion["start"]
            );
            formData.append("banner_details[" + i + "]" + "end_date", dateRangeConversion["end"]);
          } else {
            formData.append(
              "banner_details[" + i + "]" + "start_date",
              arr[i].start_date || new Date()
            );
            formData.append(
              "banner_details[" + i + "]" + "end_date",
              arr[i].end_date || new Date()
            );
          }
        }
      }
      if (carouselImagesM?.length > 1) {
        const deepClonedArr = _.cloneDeep(carouselImagesM);
        deepClonedArr.pop();
        const arr = deepClonedArr.map((obj) => {
          delete obj.imgUrl;
          return obj;
        });

        for (let i = 0; i < arr.length; i++) {
          if (arr[i].file) {
            formData.append("banner_mobile_images", arr[i].file);
          } else {
            formData.append(
              "banner_details_mobile[" + i + "]" + "attachment_id",
              arr[i].attachment_id
            );
            formData.append("banner_details_mobile[" + i + "]" + "filePath", arr[i].filePath);
          }
          formData.append(
            "banner_details_mobile[" + i + "]" + "display_order",
            arr[i].display_order || ""
          );

          if (arr[i].active === "undefined") {
            formData.append("banner_details_mobile[" + i + "]" + "active", true);
          } else {
            formData.append("banner_details_mobile[" + i + "]" + "active", arr[i].active);
          }

          formData.append("banner_details_mobile[" + i + "]" + "url", arr[i].url || "");

          if (arr[i].dateRange) {
            // Get ISO start and end Date
            let dateRangeConversion = convertRangeISODateFormat(arr[i].dateRange);
            formData.append(
              "banner_details_mobile[" + i + "]" + "start_date",
              dateRangeConversion["start"]
            );
            formData.append(
              "banner_details_mobile[" + i + "]" + "end_date",
              dateRangeConversion["end"]
            );
          } else {
            formData.append(
              "banner_details_mobile[" + i + "]" + "start_date",
              arr[i].start_date || null
            );
            formData.append(
              "banner_details_mobile[" + i + "]" + "end_date",
              arr[i].end_date || null
            );
          }
        }
      }

      formData.append("template_name", value?.template_name);
      if (value.active === undefined) {
        formData.append("active", true);
      } else {
        formData.append("active", value.active);
      }
      formData.append("category_ids", JSON.stringify(value?.category_ids));
      formData.append("template_type", value?.template_type);
      formData.append("brand_id", brandID);
      formData.append("platform_type", value?.platform_type || "web");

      // for (var pair of formData.entries()) {
      //   console.log(pair[0] + ', ' + pair[1]);
      // }
      mutate(formData);
    } catch (error) {
      console.log(error);
    }
  };

  //Function to edit record of basic details
  const handleEditRecord = (record) => {
    setEditedFormId(record.brand_detail_id);
    fetchSingleBanner({ id: record.brand_detail_id });
  };

  //Function to delete record of basic details
  const handleDeleteRecord = (record) => {
    deleteBasicDetail({ id: record.brand_detail_id });
  };
  // Table columns configuration
  const basicDetailcolumns = [
    {
      title: "Template Name",
      dataIndex: "templateName", // Maps to the data source field
      key: "templateName",
      sorter: (a, b) => a.templateName.localeCompare(b.templateName),
      render: (name) => <Text type="secondary">{name}</Text>
    },
    {
      title: "Template Type",
      dataIndex: "template_type", // Maps to the data source field
      key: "template_type",
      render: (template_type) => <Text type="secondary">{template_type}</Text>
    },
    {
      title: "Status",
      dataIndex: "status", // Maps to the data source field
      key: "status",
      render: (status, record) => (
        <Tag color={status ? "success" : "error"}>{status ? "Active" : "Inactive"} </Tag>
      ),

      sorter: (a, b) => (a.status === b.status ? 0 : a.status ? -1 : 1)
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => {
              handleEditRecord(record);
            }}>
            Edit
          </Button>

          <Popconfirm
            placement="left"
            title="Delete detail"
            description="Are you sure you want to delete this record?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDeleteRecord(record)}>
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  //Call get all category by brand to fetch all categories according to brand
  const { mutate: getAllCategorybyBrand, isLoading: AllCategoriesLoading } = useMutation(
    (data) => apiService.getCategoryByBrand(data),
    {
      onSuccess: (data) => {
        setCategory([]);
        if (data?.data?.data?.length) {
          setBrandId(data?.data?.brand_id);

          const updateCategory = data?.data?.data.map(({ category_id, category_name }) => ({
            value: category_id,
            label: category_name
          }));
          setCategory(updateCategory);
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  const { mutate: getAllBasicDetails, isLoading: detailsLoading } = useMutation(
    (data) =>
      apiService.getBrandBasicDetails(data.brand_id, data.current, data.pageSize, data.searchTerm),
    {
      onSuccess: (data) => {
        setDataSource(
          data?.data?.data?.map((val, key) => {
            return {
              key,
              templateName: val.template_name,
              template_type: val.template_type,
              status: val.active,
              brand_detail_id: val.brand_detail_id
            };
          })
        );

        setPagination((prev) => ({
          ...prev,
          total: data?.data?.total_count || 0
        }));
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  // Handle pagination changes
  const handleTableChange = (paginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    }));

    // Fetch data for the new page or page size
    getAllBasicDetails({
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      searchTerm: templateName,
      brand_id: brandID
    });
  };

  // Btn html
  const uploadButton = (
    <button style={StyleSheet.uploadBtnStyle} type="button">
      <CloudUploadOutlined style={StyleSheet.cloudIconStyle} />
      {<div style={StyleSheet.uploadLoadingStyle}>Upload image</div>}
    </button>
  );

  //Function to close the modal
  const handleModalClose = () => {
    setModal(false);
  };

  //Function to close the mobile modal
  const handleModalCloseM = () => {
    setModalM(false);
  };
  //Function to handle Carousel Images
  const handleCarouselImages = (data) => {
    try {
      setCarouselImages(data);
      setCurrentIndex(null);
      setModal(false);
    } catch (error) {}
  };
  //Function to handle Carousel Images for mobile
  const handleCarouselImagesM = (data) => {
    try {
      setCarouselImagesM(data);
      setCurrentIndexM(null);
      setModalM(false);
    } catch (error) {}
  };

  //Function to search by template name
  const handleSearch = (val) => {
    // API Call to fetch all details
    getAllBasicDetails({
      page: pagination.current,
      pageSize: pagination.pageSize,
      searchTerm: val,
      brand_id: brandID
    });
  };

  //Function to run when the value of template name changes
  const handleOnChange = (e) => {
    setTemplateName(e.target.value);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset to first page
  };

  //Function call to delete the selected Image
  const handleDelete = (index) => {
    try {
      const tempCopy = [...carouselImages];
      tempCopy.splice(index, 1);
      setCarouselImages(tempCopy);
    } catch (error) {}
  };
  //Function call to delete the selected Image for Mobile
  const handleDeleteM = (index) => {
    try {
      const tempCopy = [...carouselImagesM];
      tempCopy.splice(index, 1);
      setCarouselImagesM(tempCopy);
    } catch (error) {}
  };

  //Function to go back to template lists
  const handleCancel = () => {
    setshowHideAdd(false);
    form.resetFields();
    setCarouselImages([{ imgUrl: null }]);
    navigate(`/${Paths.brandTemplateList}`);
  };

  //Function to add basic detail
  const handleAdd = () => {
    setshowHideAdd(true);
  };
  //UseEffect to run when the value of template changes
  useEffect(() => {
    let timer;

    // Trigger API call when the debounced term changes
    if (brandID) {
      timer = setTimeout(() => {
        getAllBasicDetails({
          page: pagination.current,
          pageSize: pagination.pageSize,
          searchTerm: templateName,
          brand_id: brandID
        });
      }, 500); // 500ms debounce delay
    }

    // Cleanup function to cancel previous timeout
    return () => clearTimeout(timer);
  }, [templateName]);

  useEffect(() => {
    getAllBrands();
  }, []);

  const templateTypeChange = (val) => {
    if (val) {
      setTemplateType(val);
      getAllCategorybyBrand(val);
    } else {
      setTemplateType("");
      setCategory([]);
      form.setFieldValue("category_ids", []);
    }
  };

  // UseMutation hook for editing a basic detail
  const { mutate: getAllBrands } = useMutation((data) => apiService.getAllBrandsList(), {
    // Configuration options for the mutation
    onSuccess: (data) => {
      if (data.success) {
        setallBrandsList(data?.data || []);
      }
    },
    onError: (error) => {
      console.error(error, "error occured in fetchSingleBanner");
    }
  });

  return (
    <Spin
      spinning={
        addLoading ||
        updateLoading ||
        detailsLoading ||
        basicLoading ||
        deleteLoading ||
        AllCategoriesLoading
      }>
      <div style={StyleSheet.mainContainer}>
        <div style={StyleSheet.contentSubStyle}>
          <>
            <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={[24, 0]}>
                <Col className="gutter-row" span={24}>
                  <Row gutter={[24, 0]}>
                    <Col className="gutter-row" span={12}>
                      <Form.Item
                        name="template_name"
                        label="Template Name"
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "Template Name is required"
                          },
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
                        <Input placeholder="Enter Template Name" size="large" />
                      </Form.Item>
                    </Col>
                    <Col className="gutter-row" span={12}>
                      <Form.Item
                        name="template_type"
                        label="Brand"
                        rules={[{ required: true, message: "Brand is required" }]}>
                        <Select
                          size="large"
                          options={allBrandsList}
                          showSearch
                          // mode="multiple"
                          allowClear
                          value={templateType}
                          onChange={templateTypeChange}
                          placeholder="Select Brand"
                          filterOption={(input, option) =>
                            (option?.label.toLowerCase() ?? "").includes(input?.toLowerCase())
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col className="gutter-row" span={12}>
                      <Form.Item
                        name="category_ids"
                        label="Brand Categories"
                        rules={[{ required: true, message: "Brand Categories is required" }]}>
                        <Select
                          size="large"
                          options={category}
                          showSearch
                          allowClear
                          filterOption={(input, option) =>
                            (option?.label.toLowerCase() ?? "").includes(input?.toLowerCase())
                          }
                          mode="multiple"
                          placeholder="Select Brand Categories"
                        />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" span={12}>
                      <Form.Item
                        name="platform_type"
                        label="Platform type"
                        rules={[{ required: true, message: "Platform Type is required" }]}>
                        <Select
                          size="large"
                          options={[
                            { label: "Web (E-com)", value: "web" },
                            { label: "App (E-com)", value: "app" }
                          ]}
                          // showSearch
                          // mode="multiple"
                          allowClear
                          // value={templateType}
                          // onChange={templateTypeChange}
                          placeholder="Select Platform Type"
                        />
                      </Form.Item>
                    </Col>

                    <Col className="gutter-row" span={24}>
                      <Form.Item
                        label="Banner Image"
                        extra={
                          <>
                            Allowed formats: JPEG, PNG | Maximum size: 2 MB | Resolution: 1528 x 720
                            px
                          </>
                        }>
                        <Carousel
                          style={StyleSheet.carouselStyle}
                          arrows={true}
                          className="banner-carousel">
                          {carouselImages?.map((item, index) => {
                            return (
                              <>
                                {item?.imgUrl ? (
                                  <div
                                    className="banner_box"
                                    style={StyleSheet.contentStyle}
                                    key={index}>
                                    <img
                                      src={item?.imgUrl}
                                      alt="category"
                                      style={StyleSheet.imgStyle}
                                    />
                                    <div className="banner_overlay">
                                      <Flex
                                        align="center"
                                        justify="center"
                                        style={{ height: "100%" }}>
                                        <Upload
                                          listType="picture-card"
                                          className="banner-uploader"
                                          accept={ALLOWED_FILE_TYPES}
                                          showUploadList={false}
                                          maxCount={1}
                                          beforeUpload={() => false}
                                          onChange={(e) => handleUploadChange(e, index)}>
                                          <Tooltip placement="bottom" title={"Edit Banner Image"}>
                                            <EditOutlined style={StyleSheet.editBannerImgIcon} />
                                          </Tooltip>
                                        </Upload>

                                        <Divider
                                          style={StyleSheet.verDividerStyle}
                                          type="vertical"
                                        />
                                        <Tooltip placement="bottom" title={"Edit Banner Details"}>
                                          <FormOutlined
                                            style={{ fontSize: "20px" }}
                                            onClick={() => handleEditImage(index)}
                                          />
                                        </Tooltip>

                                        <Divider
                                          style={StyleSheet.verDividerStyle}
                                          type="vertical"
                                        />
                                        <Tooltip placement="bottom" title={"Delete Banner"}>
                                          <DeleteOutlined
                                            style={{ fontSize: "20px" }}
                                            onClick={() => handleDelete(index)}
                                          />
                                        </Tooltip>
                                      </Flex>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="upload_box_cover" style={StyleSheet.contentStyle}>
                                    <Upload
                                      listType="picture-card"
                                      className="avatar-uploader"
                                      accept={ALLOWED_FILE_TYPES}
                                      showUploadList={false}
                                      maxCount={1}
                                      beforeUpload={() => false}
                                      onChange={(e) => handleUploadChange(e)}>
                                      {uploadButton}
                                    </Upload>
                                  </div>
                                )}
                              </>
                            );
                          })}
                        </Carousel>
                      </Form.Item>
                      {error && (
                        <Typography.Paragraph type="danger">
                          {"Please upload atLeast 1 image."}
                        </Typography.Paragraph>
                      )}
                    </Col>

                    {/* <Col className="gutter-row" span={24}>
                      <Form.Item
                        label="Banner Mobile Image"
                        extra={
                          <>
                            Allowed formats: JPEG, PNG | Maximum size: 2 MB | Resolution: 1528 x 720
                            px
                          </>
                        }>
                        <Carousel
                          style={StyleSheet.carouselStyle}
                          arrows={true}
                          className="banner-carousel">
                          {carouselImagesM?.map((item, index) => {
                            return (
                              <>
                                {item?.imgUrl ? (
                                  <div
                                    className="banner_box"
                                    style={StyleSheet.contentStyle}
                                    key={index}>
                                    <img
                                      src={item?.imgUrl}
                                      alt="category"
                                      style={StyleSheet.imgStyle}
                                    />
                                    <div className="banner_overlay">
                                      <Flex
                                        align="center"
                                        justify="center"
                                        style={{ height: "100%" }}>
                                        <Upload
                                          listType="picture-card"
                                          className="banner-uploader"
                                          accept={ALLOWED_FILE_TYPES}
                                          showUploadList={false}
                                          maxCount={1}
                                          beforeUpload={() => false}
                                          onChange={(e) => handleUploadChangeM(e, index)}>
                                          <Tooltip
                                            placement="bottom"
                                            title={"Edit Mobile Banner Image "}>
                                            <EditOutlined style={StyleSheet.editBannerImgIcon} />
                                          </Tooltip>
                                        </Upload>

                                        <Divider
                                          style={StyleSheet.verDividerStyle}
                                          type="vertical"
                                        />
                                        <Tooltip
                                          placement="bottom"
                                          title={"Edit Mobile Banner Details"}>
                                          <FormOutlined
                                            style={{ fontSize: "20px" }}
                                            onClick={() => handleEditImageM(index)}
                                          />
                                        </Tooltip>

                                        <Divider
                                          style={StyleSheet.verDividerStyle}
                                          type="vertical"
                                        />
                                        <Tooltip placement="bottom" title={"Delete Mobile Banner"}>
                                          <DeleteOutlined
                                            style={{ fontSize: "20px" }}
                                            onClick={() => handleDeleteM(index)}
                                          />
                                        </Tooltip>
                                      </Flex>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="upload_box_cover" style={StyleSheet.contentStyle}>
                                    <Upload
                                      listType="picture-card"
                                      className="avatar-uploader"
                                      accept={ALLOWED_FILE_TYPES}
                                      showUploadList={false}
                                      maxCount={1}
                                      beforeUpload={() => false}
                                      onChange={(e) => handleUploadChangeM(e)}>
                                      {uploadButton}
                                    </Upload>
                                  </div>
                                )}
                              </>
                            );
                          })}
                        </Carousel>
                      </Form.Item>
                      {error && (
                        <Typography.Paragraph type="danger">
                          {"Please upload atLeast 1 image."}
                        </Typography.Paragraph>
                      )}
                    </Col> */}
                    {/* <Col className="gutter-row" span={12}>
                        <Form.Item name="active" label="Status">
                          <Switch
                            size="large"
                            defaultValue={true}
                            defaultChecked={true}
                            checkedChildren="Active"
                            unCheckedChildren="Inactive"
                          />
                        </Form.Item>
                      </Col> */}
                  </Row>
                </Col>
              </Row>
              <Flex gap="middle" align="start" vertical>
                <Flex justify={"space-between"} align={"center"} className="width_full">
                  <Button onClick={handleCancel}>Cancel</Button>

                  {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                    <Button type="primary" htmlType="submit" loading={false}>
                      Save
                    </Button>
                  )}
                </Flex>
              </Flex>
            </Form>
            {modal && (
              <BannerModal
                handleModalClose={handleModalClose}
                carouselImages={carouselImages}
                setCarouselImages={setCarouselImages}
                currentIndex={currentIndex}
                handleCarouselImages={handleCarouselImages}
              />
            )}

            {modalM && (
              <BannerModalMobile
                handleModalCloseM={handleModalCloseM}
                carouselImagesM={carouselImagesM}
                setCarouselImagesM={setCarouselImagesM}
                currentIndexM={currentIndexM}
                handleCarouselImagesM={handleCarouselImagesM}
              />
            )}
          </>
        </div>
      </div>
    </Spin>
  );
}
