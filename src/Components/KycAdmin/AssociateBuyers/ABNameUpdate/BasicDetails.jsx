import { Button, Col, Flex, Form, Input, Row } from "antd";
import RowColumnData from "Components/KycAdmin/KYC/Shared/RowColumnData";
import { PopconfirmWrapper } from "Components/Shared/Wrappers/PopConfirmWrapper";
import { MESSAGES, snackBarSuccessConf } from "Helpers/ats.constants";

import { hasEditPermission, sanitizeName, validateNameField } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import React, { useEffect } from "react";
import { useMutation } from "react-query";

const BasicDetails = ({ ABDetails, reset }) => {
  const [form] = Form.useForm();
  const { apiService } = useServices();

  // Determine if the AB is married based on personal details
  const marriedStatus = ABDetails?.personal_details?.marital_status == "married";

  // Validation rules for name fields
  const nameValidations = [
    {
      validator: validateNameField
    }
  ];

  // Mutation function to update the AB name details
  const { mutate: updateABNameDetails, isLoading: updatingNames } = useMutation(
    (request) => apiService.updateABName(request),
    {
      onSuccess: ({ success, message }) => {
        if (success) {
          enqueueSnackbar(message, snackBarSuccessConf); // Show confirmation message
          reset(); // Reset the form on success
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  // Handle form submission
  const handleSubmit = (values) => {
    try {
      const tempPayload = {
        ...values,
        dist_no: ABDetails?.dist_no,
        ...(marriedStatus ? { spouse_name: values?.spouse_name } ?? null : {}) // Only add spouse_name if married
      };
      updateABNameDetails(tempPayload); // api call to mutate
    } catch (error) {}
  };

  /**
   * Populates form fields with existing data on component mount.
   */
  useEffect(() => {
    const temp = {
      ab_name: ABDetails?.dist_name || null,
      father_name: ABDetails?.father_name || null,
      nominee_name: ABDetails?.nominee_details?.nominee_name || null,
      ...(marriedStatus ? { spouse_name: ABDetails?.personal_details?.spouse_name } : {})
    };
    form.setFieldsValue(temp);
  }, [ABDetails]);

  return (
    <Form
      name="basic_deatils"
      form={form}
      layout="vertical"
      onFinish={hasEditPermission() && handleSubmit}>
      <Row gutter={[10, 32]}>
        <Flex className="fullWidth" span={24} vertical gap={12}>
          <>
            <RowColumnData
              titleStyle={StyleSheet.sectionHeading}
              columnData={ABDetails.AB_NAME_UPDATE_BASIC_DETAILS}
            />
          </>
        </Flex>
        <Col span={6}>
          <Form.Item
            name={"ab_name"}
            label={"Associate Buyer Name"}
            className="removeMargin"
            required
            rules={nameValidations}>
            <Input
              placeholder={`Enter Associate Buyer Name`}
              size="large"
              type="text"
              onInput={sanitizeName}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name={"father_name"}
            label={"Father Name"}
            className="removeMargin"
            required
            rules={nameValidations}>
            <Input
              placeholder={`Enter Father Name`}
              size="large"
              type="text"
              onInput={sanitizeName}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name={"spouse_name"}
            label={"Spouse Name"}
            className="removeMargin"
            required
            rules={marriedStatus ? nameValidations : []}>
            <Input
              placeholder={`Enter Spouse Name`}
              size="large"
              type="text"
              disabled={!marriedStatus}
              onInput={sanitizeName}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name={"nominee_name"}
            label={"Nominee Name"}
            className="removeMargin"
            required
            rules={nameValidations}>
            <Input
              placeholder={`Enter Nominee Name`}
              size="large"
              type="text"
              onInput={sanitizeName}
              disabled={ABDetails?.nominee_details?.is_ab}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[12, 12]} className="marginTop24">
        <Col span={12}>
          <Button size="large" className="width100" variant="outlined" onClick={reset}>
            Back{" "}
          </Button>
        </Col>
        <Col span={12}>
          <PopconfirmWrapper
            onConfirm={() => form.submit()}
            title="Update Basic Details"
            description="Are you sure want to update basic details?"
            okText="Yes"
            cancelText="No"
            ChildComponent={
              <Button
                size="large"
                className="width100"
                type="primary"
                htmlType="button"
                disabled={!hasEditPermission() || updatingNames}
                loading={updatingNames}>
                Update
              </Button>
            }
            addTooltTip={!hasEditPermission()}
            prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
          />
        </Col>
      </Row>
    </Form>
  );
};

export default BasicDetails;
