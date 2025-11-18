/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
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
import BannerModal from "./BannerModal";
import Link from "antd/es/typography/Link";
import { type } from "@testing-library/user-event/dist/type";
import BlogModal from "./BlogModal";
import { render } from "@testing-library/react";
import { getBase64, getFullImageUrl } from "Helpers/functions";
const { Title, Text } = Typography;
const { Search } = Input;

function Program({ brandID, platform_type }) {
  const {
    token: { colorText, colorBgContainer, paddingSM, paddingLG, colorBgLayout, colorBorder }
  } = theme.useToken();
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
  const { apiService } = useServices();
  const [form] = Form.useForm();
  const [carouselProgramImages, setCarouselProgramImages] = useState([{ imgUrl: null }]);
  const [programDetail, setProgramDetail] = useState(false);
  const [programDeleteId, setProgramDeleteId] = useState([]);
  const [programModal, setProgramModal] = useState(false);
  const [currentProgramIndex, setCurrentProgramIndex] = useState(0);
  const [error, setError] = useState(false);

  // Btn html
  const uploadButton = (
    <button style={StyleSheet.uploadBtnStyle} type="button">
      <CloudUploadOutlined style={StyleSheet.cloudIconStyle} />
      {<div style={StyleSheet.uploadLoadingStyle}>Upload image</div>}
    </button>
  );

  // UseMutation hook for Update a program
  const { mutate: UpdateProgramDetail, isLoading: updateProgramLoading } = useMutation(
    // Mutation function to handle the API call for Update a new Configuration
    (data) => apiService.keySoulUpdateProgramDetail(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          //   fetchSingleProgramBanner({
          //     id: brandID,
          //     type: "program"
          //   });
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // UseMutation hook for creating a new program
  const { mutate: addProgramDetail, isLoading: addProgramLoading } = useMutation(
    // Mutation function to handle the API call for creating a new Configuration
    (data) => apiService.keySoulCreateProgramDetail(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          //   fetchSingleProgramBanner({
          //     id: brandID,
          //     type: "program"
          //   });
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // UseMutation hook for creating a new Configuration via API
  const { mutate: fetchSingleProgramBanner, isLoading: programLoading } = useMutation(
    // Mutation function to handle the API call for creating a new Configuration
    (data) => apiService.getKeySoulProgramDetail(data.id, data.type, platform_type),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          if (data.success) {
            if (data?.data?.length > 0) {
              setCarouselProgramImages([]);
              const tempSliderProgramImgs = data?.data?.map((item) => {
                let obj = { ...item };

                obj["imgUrl"] = getFullImageUrl(item?.file_path);

                return obj;
              });
              setCarouselProgramImages([...tempSliderProgramImgs, { imgUrl: null }] || []);
              setProgramDetail(true);
              setProgramDeleteId([]);
            } else {
              setProgramDetail(false);
            }
          }
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  //Function call to delete the selected Program Image
  const handleProgramDelete = (index) => {
    try {
      const tempCopy = [...carouselProgramImages];

      // Get the blog_id before deletion
      const deletedBlogId = Number(tempCopy[index]?.blog_id);
      if (deletedBlogId) {
        // Set the deleted blog_id in setDelete
        setProgramDeleteId((prev) => [...prev, Number(deletedBlogId)]);
      }

      // Remove the item from the array
      tempCopy.splice(index, 1);
      setCarouselProgramImages(tempCopy);
    } catch (error) {
      console.error("Error deleting program:", error);
    }
  };

  // Function to submit form data for Program
  const onProgramFinish = (value) => {
    try {
      let formData = new FormData();
      if (carouselProgramImages?.length > 1) {
        const deepClonedArr = _.cloneDeep(carouselProgramImages);
        deepClonedArr.pop();
        const arr = deepClonedArr.map((obj) => {
          delete obj.imgUrl;
          return obj;
        });

        for (var i = 0; i < arr.length; i++) {
          if (arr[i].file) {
            formData.append("program_banner_images", arr[i].file);
          } else {
            formData.append("banner_details[" + i + "]" + "attachment_id", arr[i].attachment_id);
            formData.append("banner_details[" + i + "]" + "file_path", arr[i].file_path);
          }
          formData.append(
            "banner_details[" + i + "]" + "display_order",
            arr[i].display_order || ""
          );

          formData.append(
            "banner_details[" + i + "]" + "active",
            arr[i].active === undefined ? true : arr[i].active
          );
          formData.append("banner_details[" + i + "]" + "url", arr[i].url || "");
          if (arr[i].blog_id && programDetail) {
            formData.append("banner_details[" + i + "]" + "blog_id", arr[i].blog_id);
          }
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
      formData.append("brand_id", brandID);
      if (programDeleteId.length > 0) {
        formData.append("deleted_blogs", JSON.stringify(programDeleteId));
      }
      formData.append("type", "program");
      formData.append("platform_type", platform_type);

      if (programDetail) {
        // API Call to update program Detail
        UpdateProgramDetail(formData);
      } else {
        // API Call to create Program Detail
        addProgramDetail(formData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // function call - when file uploads
  const handleProgramUploadChange = (info, currIndex) => {
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
            const deepClonedArr = _.cloneDeep(carouselProgramImages);
            const fileExtension = `${currIndex}.${getFileExtension(info.file.name)}`;
            const modifiedFile = new File([info.file], fileExtension, {
              type: info.file.type,
              lastModified: info.file.lastModified
            });
            info.file = modifiedFile;
            deepClonedArr[currIndex].imgUrl = url;
            deepClonedArr[currIndex].file = info.file;
            setCarouselProgramImages(deepClonedArr);
          } else {
            if (carouselProgramImages?.length == 1) {
              const fileExtension = `0.${getFileExtension(obj.file.name)}`;
              const modifiedFile = new File([obj.file], fileExtension, {
                type: obj.file.type,
                lastModified: info.file.lastModified
              });
              obj.file = modifiedFile;
              handleProgramEditImage(carouselProgramImages?.length - 1);
              setCarouselProgramImages([obj, { imgUrl: null }]);
            } else {
              const fileExtension = `${carouselProgramImages?.length - 1}.${getFileExtension(
                obj.file.name
              )}`;
              const modifiedFile = new File([obj.file], fileExtension, {
                type: obj.file.type,
                lastModified: info.file.lastModified
              });
              obj.file = modifiedFile;
              handleProgramEditImage(carouselProgramImages?.length - 1);
              carouselProgramImages.pop();
              setCarouselProgramImages([...carouselProgramImages, obj, { imgUrl: null }]);
            }
          }
          setError(false);
          // setProgramModal(true);
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  //Function to close the modal fir Programs
  const handleProgramModalClose = () => {
    setProgramModal(false);
  };

  // Function to handle the editing of a specific program carousel image
  // Opens the program modal for editing the selected image based on the provided index
  const handleProgramEditImage = (index) => {
    try {
      setCurrentProgramIndex(index);
      setProgramModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  // Function to update the program carousel images
  // Sets the updated program carousel images and closes the program modal
  const handleCarouselProgramImages = (data) => {
    try {
      setCarouselProgramImages(data);
      setCurrentProgramIndex(null);
      setProgramModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  function getFileExtension(filename) {
    const lastDotIndex = filename.lastIndexOf(".");

    if (lastDotIndex === -1) return ""; // No extension found
    return filename.slice(lastDotIndex + 1); // Extract extension
  }

  //useEffect to run when the component mounts
  useEffect(() => {
    fetchSingleProgramBanner({
      id: brandID,
      type: "program"
    });
  }, []);

  return (
    <Spin spinning={programLoading}>
      <div style={StyleSheet.mainContainer}>
        <div style={StyleSheet.contentSubStyle}>
          <Form name="form_item_path" form={form} layout="vertical" onFinish={onProgramFinish}>
            <Row gutter={[24, 0]}>
              <Col className="gutter-row" span={24}>
                <Row gutter={[24, 0]}>
                  <Col className="gutter-row" span={24}>
                    <Form.Item
                      key={"banner_image"}
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
                        {carouselProgramImages?.map((item, index) => {
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
                                        onChange={(e) => handleProgramUploadChange(e, index)}>
                                        <Tooltip placement="bottom" title={"Edit Banner Image"}>
                                          <EditOutlined style={StyleSheet.editBannerImgIcon} />
                                        </Tooltip>
                                      </Upload>

                                      <Divider style={StyleSheet.verDividerStyle} type="vertical" />
                                      <Tooltip placement="bottom" title={"Edit Banner Details"}>
                                        <FormOutlined
                                          style={{ fontSize: "20px" }}
                                          onClick={() => handleProgramEditImage(index)}
                                        />
                                      </Tooltip>

                                      <Divider style={StyleSheet.verDividerStyle} type="vertical" />
                                      <Tooltip placement="bottom" title={"Delete Banner"}>
                                        <DeleteOutlined
                                          style={{ fontSize: "20px" }}
                                          onClick={() => handleProgramDelete(index)}
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
                                    onChange={(e) => handleProgramUploadChange(e)}>
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
                </Row>
              </Col>
            </Row>
            <Flex gap="middle" align="start" vertical>
              <Flex justify={"flex-end"} align={"center"} className="width_full">
                {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={addProgramLoading || updateProgramLoading}>
                    Save
                  </Button>
                )}
              </Flex>
            </Flex>
          </Form>
        </div>
        {programModal && (
          <BannerModal
            handleModalClose={handleProgramModalClose}
            carouselImages={carouselProgramImages}
            // setCurrentIndex={setCurrentIndex}
            setCarouselImages={setCarouselProgramImages}
            currentIndex={currentProgramIndex}
            handleCarouselImages={handleCarouselProgramImages}
          />
        )}
      </div>
    </Spin>
  );
}

export default Program;
