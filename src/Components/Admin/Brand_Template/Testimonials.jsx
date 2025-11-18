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

export default function Testimonials({ brandID, platform_type }) {
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

  /**
   * Banner style css
   */
  const bannerStyle = {
    width: "100px",
    height: "100px",
    objectFit: "cover"
  };
  const { apiService } = useServices();
  const [testimonialForm] = Form.useForm();
  const [testimonialsMainData, setTestimonialsMainData] = useState([]);
  const [isTestOpen, SetIsTestOpen] = useState(false);
  const [mediaType, setMediaType] = useState("url");
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // UseMutation hook for creating a new Configuration via API
  const { mutate: addTestimonialsDetail, isLoading: addTestimonialsLoading } = useMutation(
    // Mutation function to handle the API call for creating a new Configuration
    (data) => apiService.keySoulCreateTestimonialsDetail(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          fetchTestimonials({
            id: brandID,
            platform_type: platform_type
          });
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // UseMutation hook for creating a new Configuration via API
  const { mutate: fetchTestimonials, isLoading: TestimonialsLoading } = useMutation(
    // Mutation function to handle the API call for creating a new Configuration
    (data) =>
      apiService.getKeySoulTestimonialsDetail(
        data.id,
        data.type,
        platform_type || data.platform_type
      ),
    {
      // Configuration options for the mutation
      onSuccess: (data, varianbles) => {
        if (data) {
          if (data.success) {
            if (Array.isArray(data?.data)) {
              const arr = data?.data?.map((item) => ({
                testimonialType: item.testimonial_type,
                displayOrder: item.display_order,
                content: item.url,
                file_path: item.file_path,
                active: item.active,
                attachment_id: item?.attachment_id,
                testimonial_id: item?.testimonial_id
              }));

              setTestimonialsMainData(arr);
            }
          }
        }
      },
      onError: (error) => {
        enqueueSnackbar(data.message, snackBarErrorConf);
        console.error(error, "error occured in fetchTestimonials");
      }
    }
  );

  // UseMutation hook for Update a new Configuration via API
  const { mutate: updateTestimonials, isLoading: updateTestimonialsLoading } = useMutation(
    // Mutation function to handle the API call for Update a new Configuration
    (data) => apiService.keySoulUpdateTestimonialsDetail(data.load, data.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          fetchTestimonials({
            id: brandID,
            platform_type: platform_type
          });
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // UseMutation hook for deleting a testimonial
  const { mutate: deleteTestimonial, isLoading: deleteTestimonialsLoading } = useMutation(
    // Mutation function to handle the API call for deleting a testimonial
    (data) => apiService.deleteKeySoulTestimonial(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);

          fetchTestimonials({
            id: brandID,
            platform_type: platform_type
          });
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  //useEffect to run when component mounts
  useEffect(() => {
    //fetch all testimonials when component mounts
    fetchTestimonials({
      id: brandID,
      platform_type: platform_type
    });
  }, []);

  const columns = [
    {
      title: <Typography.Text type="secondary">Testimonial Type</Typography.Text>,
      dataIndex: "testimonialType",
      key: "testimonialType",
      render: (text) => <Tag color="processing">{text === "url" ? "URL" : "Media File"} </Tag>
    },
    {
      title: <Typography.Text type="secondary">Display Order</Typography.Text>,
      dataIndex: "displayOrder",
      key: "displayOrder"
    },
    {
      title: <Typography.Text type="secondary">Content</Typography.Text>,
      dataIndex: "content",
      key: "content",
      render: (text, record) =>
        record.testimonialType === "url" ? (
          <Link href={text} target="_blank" rel=" noReferrer">
            {text}
          </Link>
        ) : record?.content?.name?.split(".")[1] === "png" ||
          record?.file_path?.split(".")[1] === "png" ||
          record?.file_path?.split(".")[1] === "jpg" ||
          record?.content?.name?.split(".")[1] === "jpg" ? (
          <Image src={getFullImageUrl(record?.file_path)} height={100} width={100} />
        ) : (
          <video src={getFullImageUrl(record?.file_path)} height={100} width={100} />
        )
    },
    {
      title: <Typography.Text type="secondary">Status</Typography.Text>,
      dataIndex: "active",
      key: "active",
      render: (text) => (
        <Tag color={!text ? "error" : "success"}>{text ? "Active" : "InActive"} </Tag>
      )
    },
    {
      title: <Typography.Text type="secondary">Action</Typography.Text>,
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            type="link"
            disabled={updateTestimonialsLoading}
            onClick={() => {
              handleEdit(record);
            }}>
            Edit
          </Button>

          <Popconfirm
            placement="left"
            title="Delete testimonial"
            description="Are you sure you want to delete this testimonial?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDelete(record)}>
            <Button
              type="link"
              danger
              onClick={() => {
                // handleDelete(record);
              }}>
              Delete
            </Button>
          </Popconfirm>
        </>
      )
    }
  ];

  const showAddModal = () => {
    SetIsTestOpen(true);
    testimonialForm.resetFields();
    testimonialForm.setFieldValue("active", true);
    setMediaType("url");
    setIsEditing(false);
    setEditingRecord(null);
  };

  const handleDelete = (record) => {
    deleteTestimonial(record.testimonial_id);
  };

  const handleEdit = (record) => {
    setIsEditing(true);
    setEditingRecord(record);
    setMediaType(record.testimonialType);
    testimonialForm.setFieldsValue({
      testimonialType: record.testimonialType,
      displayOrder: record.displayOrder,
      url: record.content,
      file_path: record.file_path,
      active: record.active ? true : false
    });
    SetIsTestOpen(true);
  };

  // Testimonial submit
  const onTestimonialFinish = (testimonials, id) => {
    const formData = new FormData();
    if (testimonials.length > 0) {
      for (let i = 0; i < testimonials.length; i++) {
        formData.append(
          `testimonial_details[${i}]testimonial_type`,
          testimonials[i].testimonialType
        );
        formData.append(`testimonial_details[${i}]url`, testimonials[i].url);
        if (testimonials[i].content) {
          formData.append(`testimonial_files`, testimonials[i].content);
        }
        if (testimonials[i].file_path) {
          formData.append(`testimonial_details[${i}]attachment_id`, testimonials[i].attachment_id);
          formData.append(`testimonial_details[${i}]file_path`, testimonials[i].file_path);
        }
        formData.append(`testimonial_details[${i}]active`, testimonials[i].active ? true : false);
        formData.append(`testimonial_details[${i}]display_order`, testimonials[i].displayOrder);
      }
    }
    formData.append("brand_id", brandID);
    formData.append("platform_type", platform_type);

    // API Call to Add testimonials
    if (isEditing) {
      updateTestimonials({
        load: formData,
        id: id,
        platform_type: platform_type
      });
    } else {
      addTestimonialsDetail(formData);
    }
  };

  return (
    <Spin
      spinning={
        addTestimonialsLoading ||
        TestimonialsLoading ||
        updateTestimonialsLoading ||
        deleteTestimonialsLoading
      }>
      <div style={StyleSheet.mainContainer}>
        <div style={StyleSheet.contentSubStyle}>
          <br />
          <Row gutter={[24, 24]}>
            {!testimonialsMainData.length > 0 && (
              <Col className="gutter-row" span={24}>
                <Flex justify="center" align="center">
                  <Image src={KeySoulTestIcon} alt="key soul icon" preview={false} />
                </Flex>
              </Col>
            )}
            <Col span={24}>
              {testimonialsMainData.length > 0 && (
                <Table
                  dataSource={testimonialsMainData}
                  columns={columns}
                  pagination={false}
                  style={{ marginBottom: 16 }}
                />
              )}

              <Flex justify="center" align="center">
                <Button
                  icon={<PlusCircleOutlined />}
                  onClick={showAddModal}
                  type="primary"
                  loading={addTestimonialsLoading}
                  size="large">
                  Add Testimonials
                </Button>
              </Flex>
            </Col>
          </Row>
          {isTestOpen && (
            <TestimonialModal
              setIsModalOpen={SetIsTestOpen}
              form={testimonialForm}
              StyleSheet={StyleSheet}
              bannerStyle={bannerStyle}
              getBase64={getBase64}
              mediaType={mediaType}
              onTestimonialFinish={onTestimonialFinish}
              setMediaType={setMediaType}
              isEditing={isEditing}
              editingRecord={editingRecord}
            />
          )}
        </div>
      </div>
    </Spin>
  );
}
