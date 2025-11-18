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
import TestimonialModal from "./TestimonialModal";
const { Title, Text } = Typography;
const { Search } = Input;

export default function Blog({ brandID, platform_type }) {
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

  // Btn html
  const uploadButton = (
    <button style={StyleSheet.uploadBtnStyle} type="button">
      <CloudUploadOutlined style={StyleSheet.cloudIconStyle} />
      {<div style={StyleSheet.uploadLoadingStyle}>Upload image</div>}
    </button>
  );

  const { apiService } = useServices();
  const [form] = Form.useForm();
  const [carouselBlogImages, setCarouselBlogImages] = useState([{ imgUrl: null }]);
  const [blogModal, setBlogModal] = useState(false);
  const [error, setError] = useState(false);
  const [currentBlogIndex, setCurrentBlogIndex] = useState(null);
  const [blogDetail, setBlogDetail] = useState(false);
  const [blogDeleteId, setBlogDeleteId] = useState([]);

  //API call to update blog details of keysoul brand
  const { mutate: updateBlogDetails, isLoading: updatingBlogs } = useMutation(
    (data) => apiService.keySoulUpdateBlogDetail(data),
    {
      onSuccess: (data) => {
        enqueueSnackbar(data.message, snackBarSuccessConf);
        fetchBlogsData({ id: brandID, type: "blog" });
      },
      onError: (error) => {
        //console.error("Error updating blogs:", error);
      }
    }
  );

  //API call to add blog details of keysoul brand
  const { mutate: addBlogDetails, isLoading: addingBlogs } = useMutation(
    (data) => apiService.keySoulCreateBlogDetail(data),
    {
      onSuccess: (data) => {
        enqueueSnackbar(data.message, snackBarSuccessConf);
        fetchBlogsData({ id: brandID, type: "blog" });
      },
      onError: (error) => {
        //console.error("Error adding blogs:", error);
      }
    }
  );

  //Api call to get the blogs data
  const { mutate: fetchBlogsData, isLoading: blogsLoading } = useMutation(
    (data) => apiService.getKeySoulBlogDetail(data.id, data.type, platform_type),
    {
      onSuccess: (data) => {
        if (data?.success && data?.data?.length > 0) {
          const tempSliderImages = data.data.map((item) => {
            let obj = { ...item };
            obj.imgUrl = getFullImageUrl(item.file_path);
            return obj;
          });
          setCarouselBlogImages([...tempSliderImages, { imgUrl: null }]);
          setBlogDetail(true);
          setBlogDeleteId([]);
        } else {
          setCarouselBlogImages([{ imgUrl: null }]);
          setBlogDetail(false);
        }
      },
      onError: (error) => {
        //console.error("Error fetching blogs:", error);
      }
    }
  );

  // Function to update the blog carousel images
  // Sets the updated blog carousel images and closes the blog modal
  const handleCarouselBlogImages = (data) => {
    try {
      setCarouselBlogImages(data);
      setCurrentBlogIndex(null);
      setBlogModal(false);
    } catch (error) {}
  };

  // Function to submit form data for blog
  const onBlogFinish = (value) => {
    try {
      let formData = new FormData();
      if (carouselBlogImages?.length > 1) {
        const deepClonedArr = _.cloneDeep(carouselBlogImages);
        deepClonedArr.pop();
        const arr = deepClonedArr.map((obj) => {
          delete obj.imgUrl;
          return obj;
        });

        //console.log('arr', arr);

        for (let i = 0; i < arr.length; i++) {
          if (arr[i].file) {
            formData.append("blog_images", arr[i].file);
          } else {
            formData.append("blog_details[" + i + "]" + "attachment_id", arr[i].attachment_id);
            formData.append("blog_details[" + i + "]" + "file_path", arr[i].file_path);
          }
          formData.append("blog_details[" + i + "]" + "heading", arr[i].heading || "");
          formData.append("blog_details[" + i + "]" + "subtext", arr[i].subtext || "");
          formData.append("blog_details[" + i + "]" + "tag", arr[i].tag || "");
          formData.append("blog_details[" + i + "]" + "display_order", arr[i].display_order || "");
          formData.append(
            "blog_details[" + i + "]" + "active",
            arr[i].active === undefined ? true : arr[i].active
          );
          formData.append("blog_details[" + i + "]" + "url", arr[i].url || "");
          if (arr[i].blog_id && blogDetail) {
            formData.append("blog_details[" + i + "]" + "blog_id", arr[i].blog_id);
          }
          if (arr[i].dateRange) {
            let dateRangeConversion = convertRangeISODateFormat(arr[i].dateRange);
            formData.append("blog_details[" + i + "]" + "start_date", dateRangeConversion.start);
            formData.append("blog_details[" + i + "]" + "end_date", dateRangeConversion.end);
          } else {
            formData.append(
              "blog_details[" + i + "]" + "start_date",
              arr[i].start_date || new Date()
            );
            formData.append("blog_details[" + i + "]" + "end_date", arr[i].end_date || new Date());
          }
        }
      }

      formData.append("brand_id", brandID);
      if (blogDeleteId.length > 0) {
        formData.append("deleted_blogs", JSON.stringify(blogDeleteId));
      }
      formData.append("type", "blog");
      formData.append("platform_type", platform_type);

      if (blogDetail) {
        updateBlogDetails(formData);
      } else {
        addBlogDetails(formData);
      }
    } catch (error) {
      //console.error("Error submitting blog form:", error);
    }
  };

  // Function to handle the editing of a specific blog carousel image
  // Opens the blog modal for editing the selected image based on the provided index
  const handleEditBlogImage = (index) => {
    try {
      setCurrentBlogIndex(index);
      setBlogModal(true);
    } catch (error) {}
  };

  //Function call to delete the selected Blog Image
  const handleBlogDelete = (index) => {
    try {
      const tempCopy = [...carouselBlogImages];

      // Get the blog_id before deletion
      const deletedBlogId = Number(tempCopy[index]?.blog_id);
      if (deletedBlogId) {
        // Set the deleted blog_id in setDelete
        setBlogDeleteId((prev) => [...prev, Number(deletedBlogId)]);
      }

      // Remove the item from the array
      tempCopy.splice(index, 1);
      setCarouselBlogImages(tempCopy);
    } catch (error) {
      //console.error("Error deleting program:", error);
    }
  };

  //function call - when blog changes
  const handleBlogUploadChange = (info, currIndex) => {
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
            const deepClonedArr = _.cloneDeep(carouselBlogImages);
            // info.file["index"] = currIndex;
            const fileExtension = `${currIndex}.${getFileExtension(info.file.name)}`;
            const modifiedFile = new File([info.file], fileExtension, {
              type: info.file.type,
              lastModified: info.file.lastModified
            });
            info.file = modifiedFile;
            deepClonedArr[currIndex].imgUrl = url;
            deepClonedArr[currIndex].file = info.file;
            setCarouselBlogImages(deepClonedArr);
          } else {
            if (carouselBlogImages?.length == 1) {
              const fileExtension = `0.${getFileExtension(obj.file.name)}`;
              const modifiedFile = new File([obj.file], fileExtension, {
                type: obj.file.type,
                lastModified: info.file.lastModified
              });
              obj.file = modifiedFile;
              handleEditBlogImage(carouselBlogImages?.length - 1);
              setCarouselBlogImages([obj, { imgUrl: null }]);
            } else {
              const fileExtension = `${carouselBlogImages?.length - 1}.${getFileExtension(
                obj.file.name
              )}`;
              const modifiedFile = new File([obj.file], fileExtension, {
                type: obj.file.type,
                lastModified: info.file.lastModified
              });
              obj.file = modifiedFile;
              handleEditBlogImage(carouselBlogImages?.length - 1);
              carouselBlogImages.pop();
              setCarouselBlogImages([...carouselBlogImages, obj, { imgUrl: null }]);
            }
          }
          setError(false);
          // setBlogModal(true);
        });
      }
    } catch (error) {
      //console.error(error, "error occured in handleBlogUploadChange");
    }
  };

  function getFileExtension(filename) {
    const lastDotIndex = filename.lastIndexOf(".");

    if (lastDotIndex === -1) return ""; // No extension found
    return filename.slice(lastDotIndex + 1); // Extract extension
  }

  //useEffect to run when componenet mounts
  useEffect(() => {
    fetchBlogsData({
      id: brandID,
      type: "blog"
    });
  }, []);

  return (
    <div style={StyleSheet.mainContainer}>
      <div style={StyleSheet.contentSubStyle}>
        <Form name="form_item_path" form={form} layout="vertical" onFinish={onBlogFinish}>
          <Row gutter={[24, 0]}>
            <Col className="gutter-row" span={24}>
              <Row gutter={[24, 0]}>
                <Col className="gutter-row" span={24}>
                  <Form.Item
                    label="Blog Image"
                    extra={
                      <>
                        Allowed formats: JPEG, PNG | Maximum size: 2 MB | Resolution: 1528 x 720 px
                      </>
                    }>
                    <Carousel
                      style={StyleSheet.carouselStyle}
                      arrows={true}
                      className="banner-carousel">
                      {carouselBlogImages?.map((item, index) => (
                        <>
                          {item?.imgUrl ? (
                            <div className="banner_box" style={StyleSheet.contentStyle} key={index}>
                              <img src={item?.imgUrl} alt="blog" style={StyleSheet.imgStyle} />
                              <div className="banner_overlay">
                                <Flex align="center" justify="center" style={{ height: "100%" }}>
                                  <Upload
                                    listType="picture-card"
                                    className="banner-uploader"
                                    accept={ALLOWED_FILE_TYPES}
                                    showUploadList={false}
                                    maxCount={1}
                                    beforeUpload={() => false}
                                    onChange={(e) => handleBlogUploadChange(e, index)}>
                                    <Tooltip placement="bottom" title={"Edit Blog Image"}>
                                      <EditOutlined style={StyleSheet.editBannerImgIcon} />
                                    </Tooltip>
                                  </Upload>

                                  <Divider style={StyleSheet.verDividerStyle} type="vertical" />
                                  <Tooltip placement="bottom" title={"Edit Blog Details"}>
                                    <FormOutlined
                                      style={{ fontSize: "20px" }}
                                      onClick={() => handleEditBlogImage(index)}
                                    />
                                  </Tooltip>

                                  <Divider style={StyleSheet.verDividerStyle} type="vertical" />
                                  <Tooltip placement="bottom" title={"Delete Blog"}>
                                    <DeleteOutlined
                                      style={{ fontSize: "20px" }}
                                      onClick={() => handleBlogDelete(index)}
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
                                onChange={(e) => handleBlogUploadChange(e)}>
                                {uploadButton}
                              </Upload>
                            </div>
                          )}
                        </>
                      ))}
                    </Carousel>
                  </Form.Item>
                  {error && (
                    <Typography.Paragraph type="danger">
                      {"Please upload at least 1 image."}
                    </Typography.Paragraph>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
          <Flex gap="middle" align="start" vertical>
            <Flex justify={"flex-end"} align={"center"} className="width_full">
              {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
              )}
            </Flex>
          </Flex>
        </Form>
      </div>
      {blogModal && (
        <BlogModal
          handleModalClose={() => setBlogModal(false)}
          carouselImages={carouselBlogImages}
          setCarouselImages={setCarouselBlogImages}
          currentIndex={currentBlogIndex}
          handleCarouselImages={handleCarouselBlogImages}
        />
      )}
    </div>
  );
}
