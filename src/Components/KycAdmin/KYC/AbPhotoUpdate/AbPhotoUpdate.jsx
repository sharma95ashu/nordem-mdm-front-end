import { SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Flex, Form, Input, Row, Typography } from "antd";
import UserProfileCard from "Components/KycAdmin/UserProfileCard";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { PopconfirmWrapper } from "Components/Shared/Wrappers/PopConfirmWrapper";
import {
  abNoMaxLength,
  MESSAGES,
  PermissionAction,
  snackBarSuccessConf
} from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  getDateTimeFormat,
  hasEditPermission,
  imageCompress,
  validateABAndReferenceNumber,
  validateFileSize,
  validationNumber
} from "Helpers/ats.helper";
import { getBase64 } from "Helpers/functions";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import { useMutation } from "react-query";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";

const AbPhotoUpdate = () => {
  const { apiService } = useServices();
  const [photoUpdateForm] = Form.useForm();
  const [show, setShow] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState(null);

  const userDetails = {
    dist_name: responseData?.dist_name,
    dist_no: responseData?.dist_no,
    member_since: getDateTimeFormat(responseData?.member_since, '"DD / MMM / YYYY"')
  };

  // Api method
  const { mutate: getABPhotoUpdateData, isLoading: loadingAbPhotoUpdate } = useMutation(
    (data) => apiService.getABPhotoUpdate(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.success) {
          setResponseData(data?.data);
          setShow(true);
        }
      },
      onError: (error) => {
        setShow(false);
        setImageData(null);
        setImageUrl(null);
        console.log(error);
      }
    }
  );

  // Api method to update Ab image
  const { mutate: ABPhotoUpload, isLoading: loadingPhotoUpload } = useMutation(
    (data) => apiService.getABPhotoUpload(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.success) {
          enqueueSnackbar(data.message, snackBarSuccessConf);
          photoUpdateForm.resetFields();
          setShow(false);
          setImageData(null);
          setImageUrl(null);
        }
      },
      onError: (error) => {
        setImageData(null);
        setImageUrl(null);
        console.log(error);
      }
    }
  );

  // handle search click
  const handleSearchClick = (values) => {
    try {
      // api call to fetch report data
      getABPhotoUpdateData(values);
    } catch (error) {
      console.log(error);
    }
  };

  const uploadOnChange = async (info) => {
    try {
      if (info?.fileList[0]?.originFileObj && info?.file) {
        const file = info?.fileList[0].originFileObj;
        // Check if the file extension is either 'jpeg', 'jpg' or 'png' also checked file size
        if (!validateFileSize(info.file)) {
          setImageData(null); // Reset the image data to null
          setImageUrl(null); // Reset the image URL to null
          setLoading(true); // Set loading to true while processing the image
          return false;
        }

        if (info.file) {
          const selectedFile = info.file;
          const result = await imageCompress(selectedFile);

          // Get the base64 data of the file
          getBase64(file, (url) => {
            setLoading(false);
            setImageUrl(url); // Set the new image URL after conversion
            setImageData(result);
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // handle back button
  const handleBackButton = () => {
    setImageUrl(null);
    photoUpdateForm.resetFields();
    setShow(false);
    setImageData(null);
  };

  // handle update
  const handleButtonUpdate = () => {
    try {
      // create form data
      const formData = new FormData();
      formData.append("dist_no", responseData?.dist_no);
      formData.append("applicant_photo", imageData);

      // api call
      ABPhotoUpload(formData);
    } catch (error) {
      console.log(error);
    }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Row gutter={[20, 24]} className="marginTop8">
      <Col span={24}>
        <Flex justify="space-between" vertical gap={8}>
          <Typography.Title level={4} className="removeMargin">
            Associate Buyer Photo Update
          </Typography.Title>
          <Typography.Text style={StyleSheet.fontSize14} className="removeMargin">
            <Typography.Text type="secondary">Document Update /</Typography.Text> Associate Buyer
            Photo Update
          </Typography.Text>
        </Flex>
      </Col>

      <Card className="fullWidth">
        <Col
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 12 }}
          className="removePadding">
          <Form
            name="search_form_declaration_report"
            form={photoUpdateForm}
            layout="vertical"
            onFinish={handleSearchClick}>
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
                minLength={3}
                maxLength={abNoMaxLength}
                placeholder="Enter Associate Buyer Number / Reference Number"
                size="large"
                onInput={(e) => validationNumber(e)}
                enterButton={
                  <Button
                    icon={<SearchOutlined />}
                    loading={loadingAbPhotoUpdate}
                    type="primary"
                    size="large"
                    onClick={() => photoUpdateForm.submit()}>
                    Search
                  </Button>
                }
                allowClear
              />
            </Form.Item>
          </Form>
        </Col>
      </Card>

      {show ? (
        <Card className="fullWidth">
          <UserProfileCard
            userDetails={userDetails}
            uploadOnChange={uploadOnChange}
            loading={loading}
            imageUrl={imageUrl}
            moduleType={"kyc-ab-photo-update"}
          />

          <Row gutter={[20, 24]}>
            <Col span={24}></Col>
            <Col span={24}>
              <Flex gap={10}>
                <Button type="" size="large" block onClick={() => handleBackButton()}>
                  Back
                </Button>
                <PopconfirmWrapper
                  title="Update Photo"
                  description="Are you sure you want to Update Photo?"
                  onConfirm={hasEditPermission() && handleButtonUpdate}
                  okText="Yes"
                  cancelText="No"
                  ChildComponent={
                    <Button
                      type="primary"
                      size="large"
                      block
                      loading={loadingPhotoUpload}
                      disabled={!hasEditPermission() || imageUrl == null}>
                      Update
                    </Button>
                  }
                  addTooltTip={!hasEditPermission()}
                  prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
                />
              </Flex>
            </Col>
          </Row>
        </Card>
      ) : (
        <SearchByFallbackComponent
          title={"Search by Associate Buyer Number / Reference Number"}
          subTitle={
            "Quickly search the Associate Buyer Number / Reference Number to process Associate Buyer photo update details."
          }
          image={searchByIcon}
        />
      )}
    </Row>
  ) : (
    <></>
  );
};

export default AbPhotoUpdate;
