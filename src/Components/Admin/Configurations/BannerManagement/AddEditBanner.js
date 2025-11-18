/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import {
  Button,
  Carousel,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Switch,
  Tooltip,
  Typography,
  Upload,
  theme
} from "antd";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import {
  PermissionAction,
  snackBarSuccessConf,
  ALLOWED_FILE_TYPES,
  webORAppOptions,
  RULES_MESSAGES,
  DATEFORMAT
} from "Helpers/ats.constants";
import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import {
  actionsPermissionValidator,
  convertRangeISODateFormat,
  validateFileSizeGif
} from "Helpers/ats.helper";
import { CloudUploadOutlined, DeleteOutlined, EditOutlined, FormOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import BannerModal from "./BannerModal";
import _, { debounce, values } from "lodash";
import { getFullImageUrl } from "Helpers/functions";

export default function AddEditBanner() {
  const params = useParams();
  const navigate = useNavigate();
  const { Title } = Typography;

  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const [form] = Form.useForm();
  const [modalform] = Form.useForm();
  const [carouselImges, setCarouselImages] = useState([{ imgurl: null }]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [modal, setModal] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const carouselRef = React.createRef();
  const [error, setError] = useState(false);
  const [pincodeList, setPincodeList] = useState([]);
  const pincodeRef = useRef(0);
  const [pinCodeLoading, setPinCodeLoading] = useState(false);
  const {
    token: { colorText, colorBorder }
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
      background: "none",
      cursor: "pointer"
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
    verDividerStyle: {
      borderColor: "#5f5f5f",
      height: 20
    },
    carouselStyle: {
      marginBottom: "10px",
      border: "1px solid",
      borderColor: colorBorder,
      padding: "20px",
      height: "250px"
    },
    width: { width: "100%" },
    imgStyle: {
      height: "200px",
      objectFit: "cover",
      marginBottom: "10px",
      width: "100%"
    },
    contentStyle: {
      position: "relative",
      color: "#fff",
      textAlign: "center"
    },
    editBannerImgIcon: {
      fontSize: "22px",
      color: "white",
      marginTop: "5px"
    }
  };

  // UseMutation hook for creating a new Configuration via API
  const { mutate: fetchSingleBanner } = useMutation(
    // Mutation function to handle the API call for creating a new Configuration
    (data) => apiService.getSingleBannerdetails(params.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          const tempSliderImgs = data?.data?.banner_details?.map((item) => {
            let obj = { ...item };

            obj["imgurl"] = getFullImageUrl(item?.filePath);

            return obj;
          });

          setCarouselImages([...tempSliderImgs, { imgurl: null }] || []);

          form.setFieldsValue(data?.data);

          form.setFieldValue("status", data?.data?.status == "active" ? true : false);
          setDataLoading(false);
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  /**
   * Function to submit form data
   * @param {*} value
   */
  const onFinish = (value) => {
    try {
      const deepClonedArr = _.cloneDeep(carouselImges);
      deepClonedArr.pop();
      if (deepClonedArr?.length > 0) {
        const arr = deepClonedArr.map((obj) => {
          delete obj.imgurl;
          return obj;
        });
        // Start date (Today)
        const startDate = dayjs().utc().startOf("day").toISOString();

        // End date (3 months later)
        const endDate = dayjs().utc().add(3, "month").startOf("day").toISOString();
        let formData = new FormData();
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].file) {
            formData.append(`banner_details`, arr[i].file);
          } else {
            formData.append("banner_details[" + i + "]" + "attachment_id", arr[i].attachment_id);
            formData.append("banner_details[" + i + "]" + "filePath", arr[i].filePath);
          }
          formData.append("banner_details[" + i + "]" + "banner_order", arr[i].banner_order || "");
          formData.append("banner_details[" + i + "]" + "banner_type", arr[i].banner_type || "");
          formData.append(
            "banner_details[" + i + "]" + "slide_status",
            arr[i].slide_status || "active"
          );
          formData.append(
            "banner_details[" + i + "]" + "banner_redirection_link",
            arr[i].banner_redirection_link || ""
          );

          formData.append("banner_details[" + i + "]" + "heading", arr[i].heading || "");

          formData.append("banner_details[" + i + "]" + "sub_heading", arr[i].sub_heading || "");
          formData.append("banner_details[" + i + "]" + "button_text", arr[i].button_text || "");

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
              arr[i].start_date || startDate || null
            );
            formData.append(
              "banner_details[" + i + "]" + "end_date",
              arr[i].end_date || endDate || null
            );
          }
        }

        formData.append("section_name", value?.section_name);
        formData.append("status", value.status ? "active" : "inactive");
        formData.append("banner_type", value?.banner_type);
        value?.pincode && formData.append("pincode", JSON.stringify(value?.pincode));
        mutate(formData);
      } else {
        setError(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // UseMutation hook for creating a new Configuration via API
  const { mutate, isLoading: addUpdatelaoding } = useMutation(
    // Mutation function to handle the API call for creating a new Configuration
    (data) => apiService.addUpdateBannerdetails(params?.id, data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);

          // Navigate to the current window pathname after removing a specified portion
          navigate(`/${Paths.bannerList}`);
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // function call when component loads
  const fetchData = () => {
    if (params.id) {
      fetchSingleBanner();
      setDataLoading(true);
    }
  };

  /**
   * UseEffect function to set breadcrumb
   */
  useEffect(() => {
    actionsPermissionValidator(
      window.location.pathname,
      params?.id ? PermissionAction.EDIT : PermissionAction.ADD
    )
      ? fetchData()
      : navigate("/", { state: { from: null }, replace: true });

    form.setFieldValue("status", true);

    setBreadCrumb({
      title: "Banner Management",
      icon: "configurations",
      titlePath: Paths.bannerList,
      subtitle: params?.id ? "Edit" : "Add New",
      path: Paths.users
    });
  }, []);

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };
  // function call - when file uploads
  const handleChange = (info, currIndex) => {
    try {
      // Varify the size of file
      if (!validateFileSizeGif(info.file)) {
        return false;
      }

      if (info.file && info.fileList.length === 1) {
        // Get this url from response in real world.
        getBase64(info.fileList[0].originFileObj, (url) => {
          let obj = { imgurl: url, file: info.file };

          if (currIndex >= 0) {
            const deepClonedArr = _.cloneDeep(carouselImges);
            deepClonedArr[currIndex].imgurl = url;
            deepClonedArr[currIndex].file = info.file;
            setCarouselImages(deepClonedArr);
          } else {
            if (carouselImges?.length == 1) {
              setCarouselImages([obj, { imgurl: null }]);
            } else {
              carouselImges.pop();
              setCarouselImages([...carouselImges, obj, { imgurl: null }]);
            }
          }
          setError(false);
        });
      }
    } catch (error) {}
  };

  useEffect(() => {
    carouselRef.current.goTo(carouselImges.length > 1 ? carouselImges.length - 2 : 0);
  }, [carouselImges]);

  // Btn html
  const uploadButton = (
    <button style={StyleSheet.uploadBtnStyle} type="button">
      <CloudUploadOutlined style={StyleSheet.cloudIconStyle} />
      {<div style={StyleSheet.uploadLoadingStyle}>Upload image</div>}
    </button>
  );

  // funcation call - when specific image edit clicked
  const handleEditImage = (index) => {
    try {
      setCurrentIndex(index);
      setModal(true);
    } catch (error) {}
  };

  // function call - when specific image delte clicked
  const handleDelete = (index) => {
    try {
      const tempCopy = [...carouselImges];
      tempCopy.splice(index, 1);
      setCarouselImages(tempCopy);
    } catch (error) {}
  };

  const { mutate: fetchPincode, isLoading: loadingPincodes } = useMutation(
    "fetchPincode",
    (payload) => apiService.getStorePincodeList(payload.search),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data && data?.data?.length > 0) {
            const tempPincodeList = data?.data?.map((item) => ({
              label: item?.pincode,
              value: item?.pincode
            }));
            // updatePincodeList(tempPincodeList);
            setPincodeList(tempPincodeList);
          } else {
            enqueueSnackbar("Pincode not found", snackBarErrorConf);
            setPinCodeLoading(false);
          }
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  // for pincode - debounce
  const debounceFetcherPinCode = useMemo(() => {
    const loadOptions = (value) => {
      pincodeRef.current += 1;
      const fetchId = pincodeRef.current;
      const obj = { fetchId: fetchId, search: value };
      fetchPincode(obj);
    };
    return debounce(loadOptions, 1000);
  }, [fetchPincode]);

  const searchPinCode = (val) => {
    try {
      if (val && val.length >= 3) {
        const searchExist = pincodeList?.some((item) => String(item?.label).includes(val)); // Check if any item matches the condition
        if (!searchExist) {
          setPinCodeLoading(true);
          debounceFetcherPinCode(val);
        }
      }
    } catch (error) {}
  };

  const handleModalClose = () => {
    setModal(false);
  };

  const handleCarouselImages = (data) => {
    try {
      setCarouselImages(data);
      setCurrentIndex(null);
      setModal(false);
    } catch (error) {}
  };

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  ) ? (
    <>
      <Spin spinning={dataLoading} fullscreen />
      <Title level={5}>{`${params?.id ? "Edit" : "Add"}`}</Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={24}>
            <Row gutter={[24, 0]}>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="section_name"
                  label="Section Name"
                  type="text"
                  rules={[
                    { required: true, whitespace: true, message: "Section name is required" },
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
                  <Input placeholder="Enter Section Name" size="large" />
                </Form.Item>
              </Col>

              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="banner_type"
                  label="Type"
                  rules={[{ required: true, message: "Type is required" }]}>
                  <Select
                    // style={{ width: "100%" }}
                    size="large"
                    placeholder="Select Type"
                    options={webORAppOptions}
                    filterOption={(input, option) =>
                      (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>

              <Col className="gutter-row" span={12}>
                <Form.Item name="pincode" label="Pincode" whitespace={false}>
                  <Select
                    showSearch
                    mode="multiple"
                    block
                    size="large"
                    placeholder="Search Pincode"
                    onSearch={searchPinCode}
                    loading={loadingPincodes}
                    notFoundContent={loadingPincodes ? <Spin size="small" /> : null}
                    options={pincodeList}
                    allowClear
                    onClear={() => setPincodeList([])}
                    filterOption={(input, option) => {
                      const label = String(option?.label) ?? "";
                      return label.includes(String(input));
                    }}
                  />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item name="status" label="Status">
                  <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
              </Col>

              <Col className="gutter-row" span={24}>
                <Form.Item
                  extra={
                    <>Allowed formats : JPEG,PNG, Max size : 2MB, Resolution : 1528 x 720 px</>
                  }>
                  <Carousel
                    style={StyleSheet.carouselStyle}
                    arrows={true}
                    className="banner-carousel"
                    ref={carouselRef}>
                    {carouselImges?.map((item, index) => {
                      return (
                        <>
                          {item?.imgurl ? (
                            <div className="banner_box" style={StyleSheet.contentStyle} key={index}>
                              <img src={item?.imgurl} alt="category" style={StyleSheet.imgStyle} />
                              <div className="banner_overlay">
                                <Flex align="center" justify="center" style={{ height: "100%" }}>
                                  <Upload
                                    listType="picture-card"
                                    className="banner-uploader"
                                    accept={ALLOWED_FILE_TYPES}
                                    showUploadList={false}
                                    maxCount={1}
                                    beforeUpload={() => false}
                                    onChange={(e) => handleChange(e, index)}>
                                    <Tooltip placement="bottom" title={"Edit Banner Image"}>
                                      <EditOutlined style={StyleSheet.editBannerImgIcon} />
                                    </Tooltip>
                                  </Upload>

                                  <Divider style={StyleSheet.verDividerStyle} type="vertical" />
                                  <Tooltip placement="bottom" title={"Edit Banner Details"}>
                                    <FormOutlined
                                      style={{ fontSize: "20px" }}
                                      onClick={() => handleEditImage(index)}
                                    />
                                  </Tooltip>

                                  <Divider style={StyleSheet.verDividerStyle} type="vertical" />
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
                                onChange={(e) => handleChange(e)}>
                                {uploadButton}
                              </Upload>
                            </div>
                          )}
                        </>
                      );
                    })}
                  </Carousel>
                </Form.Item>
              </Col>
            </Row>
          </Col>
          {error && (
            <Typography.Paragraph type="danger">
              {"Please upload atleast 1 image."}
            </Typography.Paragraph>
          )}
        </Row>

        <Flex justify={"flex-end"} align={"center"} className="width_full">
          <NavLink to={"/" + Paths.bannerList}>
            <Button style={StyleSheet.backBtnStyle}>Cancel</Button>
          </NavLink>
          {actionsPermissionValidator(
            window.location.pathname,
            params?.id ? PermissionAction.EDIT : PermissionAction.ADD
          ) && (
            <Button
              type="primary"
              htmlType="submit"
              disabled={addUpdatelaoding}
              loading={addUpdatelaoding}>
              {params?.id ? "Update" : "Add"}
            </Button>
          )}
        </Flex>
      </Form>

      {modal && (
        <BannerModal
          handleModalClose={handleModalClose}
          carouselImges={carouselImges}
          // setCurrentIndex={setCurrentIndex}
          setCarouselImages={setCarouselImages}
          currentIndex={currentIndex}
          handleCarouselImages={handleCarouselImages}
        />
      )}
    </>
  ) : (
    <></>
  );
}
