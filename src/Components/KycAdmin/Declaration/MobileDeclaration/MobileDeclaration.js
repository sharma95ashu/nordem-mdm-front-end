import { Button, Card, Col, Flex, Form, Input, Row, Space, Spin, Typography, theme } from "antd";

import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import React, { useState } from "react";
import UserProfileCard from "../UserProfileCard";
import { SearchOutlined } from "@ant-design/icons";
import {
  actionsPermissionValidator,
  filterDocument,
  hasEditPermission,
  validateABAndReferenceNumber,
  validateMobileNumber,
  validationNumber
} from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useMutation } from "react-query";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";
import { enqueueSnackbar } from "notistack";
import {
  abNoMaxLength,
  MESSAGES,
  PermissionAction,
  snackBarSuccessConf
} from "Helpers/ats.constants";
import { PopconfirmWrapper } from "Components/Shared/Wrappers/PopConfirmWrapper";
import { getFullImageUrl } from "Helpers/functions";

const MobileDeclaration = () => {
  const [mobileDeclareForm] = Form.useForm();
  const [searchForm] = Form.useForm();
  const { apiService } = useServices();
  const {
    token: { colorPrimary }
  } = theme.useToken();
  const [show, setShow] = useState(false);
  const [responseData, setResponseData] = useState([]);
  const [abNo, setAbNo] = useState(null);
  const [docImage, setDocImage] = useState(null);

  const StyleSheet = {
    colorTypePrimary: {
      color: colorPrimary
    },
    marginTop8: {
      marginTop: "8px"
    }
  };

  // Api method
  const { mutate: getAbDetails, isLoading: loadingAbDetails } = useMutation(
    (data) => apiService.getAbDetailsForMobileDeclarartion(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.success) {
          const documentImage = filterDocument(data?.data?.files_meta, ["applicant_photo"]);
          setDocImage(documentImage);
          setResponseData(data?.data);
          setShow(true);
          mobileDeclareForm.resetFields();
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  // Api method update mobile no
  const { mutate: updateMobileNo, isLoading: loadingUpdateApi } = useMutation(
    (data) => apiService.mobileDeclaration(data),
    {
      // Configuration options for the mutation
      onSuccess: (data, variable) => {
        if (data?.success) {
          setShow(false);
          enqueueSnackbar(data.message, snackBarSuccessConf);
          mobileDeclareForm.resetFields();
          setShow(false);
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  // handle search click
  const handleSearchClick = (values) => {
    try {
      setAbNo(values?.dist_no);
      const data = {
        dist_no: values?.dist_no
      };
      // api call
      getAbDetails(data);
    } catch (error) {
      console.log(error);
    }
  };

  // handle back button
  const handleBackButton = () => {
    setShow(false);
    mobileDeclareForm.resetFields();
  };

  // user card data
  const userDetails = {
    dist_no: responseData?.dist_no,
    member_since: responseData?.member_since,
    dist_name: responseData?.dist_name,
    image: getFullImageUrl(docImage?.applicant_photo?.doc_path)
  };

  // handle update mobile no
  const updateMobileNumber = () => {
    // Validate the form first
    mobileDeclareForm
      .validateFields()
      .then((values) => {
        const data = {
          dist_no: abNo,
          new_mobile_num: values.new_mobile_num
        };
        // api call
        updateMobileNo(data);
      })
      .catch((errorInfo) => {
        // If validation fails, log the error or handle it accordingly
      });
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={loadingAbDetails || loadingUpdateApi}>
      <Row gutter={[20, 24]} style={StyleSheet.marginTop8}>
        <Col span={24}>
          <Flex justify="space-between" vertical gap={8}>
            <Typography.Title level={4} className="removeMargin">
              {"Associate Buyer Registered Mobile Number"}
            </Typography.Title>
            <Typography.Text style={StyleSheet.fontSize14} className="removeMargin">
              <Typography.Text type="secondary">Declaration /</Typography.Text> Associate Buyer
              Registered Mobile Number
            </Typography.Text>
          </Flex>
        </Col>
        <Card className="fullWidth" bordered={true}>
          <Form
            name="search_mobile_declaration_form"
            form={searchForm}
            layout="vertical"
            onFinish={handleSearchClick}>
            <Col span={12} className="removePadding">
              <Form.Item
                name="dist_no"
                label={"Associate Buyer Number / Reference Number"}
                required
                rules={[
                  {
                    validator: validateABAndReferenceNumber
                  }
                ]}
                className="removeMargin">
                <Input.Search
                  onInput={validationNumber}
                  maxLength={abNoMaxLength}
                  placeholder="Enter Associate Buyer Number / Reference Number"
                  size="large"
                  enterButton={
                    <Button
                      icon={<SearchOutlined />}
                      loading={loadingAbDetails}
                      type="primary"
                      size="large"
                      onClick={() => searchForm.submit()}>
                      Search
                    </Button>
                  }
                  allowClear
                />
              </Form.Item>
            </Col>
          </Form>
        </Card>

        {show ? (
          <Card className="fullWidth">
            <UserProfileCard userDetails={userDetails} />
            <Form name="mobile_declaration_form" form={mobileDeclareForm} layout="vertical">
              <Row gutter={[0, 16]} className="mt-24">
                <Col span={24}>
                  <Typography.Text strong style={StyleSheet.colorTypePrimary}>
                    KYC Info
                  </Typography.Text>
                </Col>
                <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Space direction="vertical" size={2} className="paddingView">
                    <Typography.Text type="secondary">Gender</Typography.Text>
                    <Typography.Text>
                      {responseData?.personal_details?.gender || "-"}
                    </Typography.Text>
                  </Space>
                </Col>
                <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Space direction="vertical" size={2}>
                    <Typography.Text type="secondary">Marital Status</Typography.Text>
                    <Typography.Text>
                      {responseData?.personal_details?.marital_status || "-"}
                    </Typography.Text>
                  </Space>
                </Col>
                <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Space direction="vertical" size={2}>
                    <Typography.Text type="secondary">Sponsor Number</Typography.Text>
                    <Typography.Text>{responseData?.sponsor || "-"}</Typography.Text>
                  </Space>
                </Col>
                <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Space direction="vertical" size={2}>
                    <Typography.Text type="secondary">Sponsor Name</Typography.Text>
                    <Typography.Text>{responseData?.sponsor_name || "-"}</Typography.Text>
                  </Space>
                </Col>
                <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Space direction="vertical" size={2} className="paddingView">
                    <Typography.Text type="secondary">Proposer Number</Typography.Text>
                    <Typography.Text>{responseData?.proposer || "-"}</Typography.Text>
                  </Space>
                </Col>
                <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Space direction="vertical" size={2}>
                    <Typography.Text type="secondary">Proposer Name</Typography.Text>
                    <Typography.Text>{responseData?.proposer_name || "-"}</Typography.Text>
                  </Space>
                </Col>
                <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Space direction="vertical" size={2}>
                    <Typography.Text type="secondary">Registered Mobile Number</Typography.Text>
                    <Typography.Text>{responseData?.user_phone_number || "-"}</Typography.Text>
                  </Space>
                </Col>
                <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                  <Space direction="vertical" size={2} className="fullWidth">
                    <Form.Item
                      name="new_mobile_num"
                      label={<Typography.Text type="secondary">New Mobile Number</Typography.Text>}
                      rules={[
                        {
                          validator: (rule, value) =>
                            validateMobileNumber(rule, value, responseData?.user_phone_number)
                        }
                      ]}
                      onInput={validationNumber}
                      className="removeMargin"
                      required>
                      <Input
                        size="large"
                        placeholder="Enter New Mobile Number"
                        maxLength={10}
                        min={0}
                      />
                    </Form.Item>
                  </Space>
                </Col>
              </Row>
              <Flex justify="space-between" gap={10} className="mt-24">
                <Button size="large" block onClick={handleBackButton}>
                  Back
                </Button>
                <PopconfirmWrapper
                  title="Update Mobile Number"
                  description={
                    <Typography.Text type="secondary">
                      Are you sure want to update the mobile number?
                    </Typography.Text>
                  }
                  onConfirm={hasEditPermission() && updateMobileNumber}
                  okText="Yes"
                  cancelText="No"
                  ChildComponent={
                    <Button
                      disabled={!hasEditPermission()}
                      htmlType="button"
                      size="large"
                      type="primary"
                      block>
                      Update Mobile Number
                    </Button>
                  }
                  addTooltTip={!hasEditPermission()}
                  prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
                />
              </Flex>
            </Form>
          </Card>
        ) : (
          <Col span={24}>
            <SearchByFallbackComponent
              title={"Search by Associate Buyer Number / Reference Number"}
              subTitle={
                "Quickly search the Associate Buyer Number / Reference Number to process the associate buyer registered mobile number details."
              }
              image={searchByIcon}
            />
          </Col>
        )}
      </Row>
    </Spin>
  ) : (
    <></>
  );
};

export default MobileDeclaration;
