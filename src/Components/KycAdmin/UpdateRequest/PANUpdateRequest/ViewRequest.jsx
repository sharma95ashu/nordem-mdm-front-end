import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Modal,
  Popconfirm,
  Row,
  Select,
  Spin,
  Typography
} from "antd";
import TextArea from "antd/es/input/TextArea";
import ImageTextDetails from "Components/KycAdmin/KYC/Shared/ImageTextDetails";
import RowColumnData from "Components/KycAdmin/KYC/Shared/RowColumnData";
import UserProfileCard from "Components/KycAdmin/UserProfileCard";
import { PopconfirmWrapper } from "Components/Shared/Wrappers/PopConfirmWrapper";
import { TooltipWrapper } from "Components/Shared/Wrappers/TooltipWrapper";
import { MESSAGES, snackBarErrorConf, snackBarSuccessConf } from "Helpers/ats.constants";
import { hasEditPermission } from "Helpers/ats.helper";
import { getFullImageUrl } from "Helpers/functions";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { KycAdminPaths } from "Router/KYCAdminPaths";

const ViewRequest = () => {
  const params = useParams();
  const { apiService } = useServices();
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [showRemarksField, setShowRemarksField] = useState(false);
  const [modal, setModal] = useState(false);
  const [showModalRemarksField, setShowModalRemarksField] = useState(false);
  const navigate = useNavigate();

  // api call for fetching rejection reasons
  const { data: fetchedResaonsList } = useQuery(
    "fetchreasons",
    () => apiService.getBankRejectionReasons(),
    {
      enabled: true,
      select: (resp) => {
        if (resp?.data) {
          return resp?.data?.map((item) => ({
            label: item?.description,
            value: item?.description
          }));
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  const { data: fetchedData, isLoading: isLoadingViewRequestDetails } = useQuery(
    "fetchSingleBankUpdateRequestDetails",
    () =>
      apiService.getSinglePANRequestDetails({
        dist_no: params?.id
      }),
    {
      enabled: true, // Fetch only when payload is available
      select: (res) => {
        if (res?.success && res?.data) {
          const { dist_name, dist_no, dist_join_date, docs, bank } = res?.data || {};
          const tempObj = {
            dist_name,
            dist_no,
            member_since: dist_join_date,
            doc_path: docs[0]?.doc_path
          };
          return {
            card_data: tempObj,
            existing_pan_info: {
              "PAN Number": bank?.pan_no
            },
            updated_pan_info: {
              "PAN Number": bank?.new_pan_no
            },
            pan_doc: bank?.new_doc_path,
            new_doc_name: "PAN Card Photo"
          };
        }
      },
      onError: (error) => {
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // hanlde navigation
  const handleNavigation = () => {
    navigate(`/${KycAdminPaths.panUpdateRequest}`);
    handelModel(false);
  };

  // UseMutation hook
  const { mutate: updatePANUpdateReq, isLoading: isUpdateingPanReq } = useMutation(
    (data) => apiService.updatePANUpdateRequest(data),
    {
      onSuccess: ({ success, message }) => {
        if (success && message) {
          enqueueSnackbar(message, snackBarSuccessConf);
        }
      },
      onError: ({ message }) => {
        enqueueSnackbar(message, snackBarErrorConf);
      },
      onSettled: () => {
        handleNavigation();
      }
    }
  );

  const handleStatusToggleChange = (val) => {
    setShowRemarksField(val);
  };

  const onFinish = (values) => {
    try {
      const payload = {
        dist_no: params?.id,
        status: values?.status ? "approved" : "rejected",
        remark: values?.remark ? values?.remark : values?.reason
      };
      updatePANUpdateReq(payload); // api call to update bank update request
    } catch (error) {}
  };

  const handelModel = (val) => {
    setModal(val);
  };
  const handleReasonSelection = (val) => {
    val && setShowModalRemarksField(val == "Other");
  };
  return (
    <>
      <Spin spinning={isLoadingViewRequestDetails} fullscreen />
      <Row gutter={[20, 24]} className="marginTop8">
        <Col span={24}>
          <Flex justify="space-between" vertical gap={8}>
            <Typography.Title level={4} className="removeMargin">
              View Request
            </Typography.Title>
            <Typography.Text style={StyleSheet.fontSize14} className="removeMargin">
              <Typography.Text type="secondary">Update Request / PAN Update /</Typography.Text> View
              request
            </Typography.Text>
          </Flex>
        </Col>
      </Row>

      <Card className="fullWidth marginTop24">
        <UserProfileCard moduleType={"pan-number"} userDetails={fetchedData?.card_data || {}} />
        <Form form={form} layout="vertical" onFinish={hasEditPermission() && onFinish}>
          <Row gutter={[20, 0]} className="marginTop24">
            <Col span={24}>
              {fetchedData?.existing_pan_info && (
                <>
                  <RowColumnData
                    titleStyle={{ color: "#1755A6" }}
                    title={"Existing PAN Info"}
                    columnData={fetchedData?.existing_pan_info}
                    colSpan={6}
                    indentation={false}
                  />
                </>
              )}
            </Col>
            <Divider />
            <Col span={24}>
              {fetchedData?.updated_pan_info && (
                <>
                  <ImageTextDetails
                    ColumnData={fetchedData?.updated_pan_info}
                    title={"Updated PAN Info"}
                    document={{
                      type: fetchedData?.new_doc_name,
                      src: getFullImageUrl(fetchedData?.pan_doc)
                    }}
                    moduleType={"bank-update-request"}
                    handleStatusToggleChange={handleStatusToggleChange}
                  />
                </>
              )}
            </Col>
            {showRemarksField && (
              <Col span={24}>
                <Form.Item name="remark" label="Remarks">
                  <TextArea rows={4} placeholder="Enter Remarks Here" />
                </Form.Item>
              </Col>
            )}
          </Row>
          <Row gutter={[12, 12]} className="marginTop24">
            <Col span={12}>
              <Button
                onClick={() => navigate(-1)}
                size="large"
                className="width100"
                variant="outlined">
                Back{" "}
              </Button>
            </Col>
            <Col span={12}>
              {showRemarksField ? (
                <PopconfirmWrapper
                  title="Update PAN"
                  description="Are you sure you want to Update PAN?"
                  onConfirm={() => form.submit()}
                  okText="Yes"
                  cancelText="No"
                  ChildComponent={
                    <Button
                      size="large"
                      className="width100"
                      type="primary"
                      loading={!modal ? isUpdateingPanReq : false}
                      disabled={!hasEditPermission() || (!modal ? isUpdateingPanReq : false)}>
                      {showRemarksField ? "Update" : "Add Remarks & Update"}
                    </Button>
                  }
                  addTooltTip={!hasEditPermission()}
                  prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
                />
              ) : (
                <TooltipWrapper
                  ChildComponent={
                    <Button
                      size="large"
                      className="width100"
                      type="primary"
                      onClick={() => setModal(true)}
                      loading={!modal ? isUpdateingPanReq : false}
                      disabled={!hasEditPermission() || (!modal ? isUpdateingPanReq : false)}>
                      {showRemarksField ? "Update" : "Add Remarks & Update"}
                    </Button>
                  }
                  addTooltTip={!hasEditPermission()}
                  prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
                />
              )}
            </Col>
          </Row>
        </Form>
      </Card>

      <Modal
        title="Select Reason for Rejection"
        centered
        open={modal}
        onOk={() => handelModel(false)}
        onCancel={() => handelModel(false)}
        footer={[
          <Button size="large" key="back" onClick={() => handelModel(false)}>
            Cancel
          </Button>,
          <Popconfirm
            key="yes"
            title="Reject PAN"
            description="Are you sure you want to reject PAN?"
            onConfirm={() => modalForm.submit()}
            okText="Yes"
            cancelText="No">
            <Button size="large" disabled={isUpdateingPanReq} type="primary" danger>
              Yes, Reject
            </Button>
          </Popconfirm>
        ]}
        width={500}>
        <Form form={modalForm} layout="vertical" onFinish={onFinish}>
          <Row gutter={[24, 16]}>
            <Col span={24}>
              <Form.Item
                name="reason"
                label="Select Reason"
                className="removeMargin"
                rules={[{ required: true, message: "Reason is required" }]}>
                <Select
                  placeholder="Select Reason"
                  size="large"
                  options={fetchedResaonsList}
                  onChange={handleReasonSelection}
                />
              </Form.Item>
            </Col>
            {showModalRemarksField && (
              <Col span={24}>
                <Form.Item
                  name="remarks"
                  label="Remarks"
                  className="removeMargin"
                  rules={[{ required: true, message: "Remarks is required" }]}>
                  <TextArea rows={4} placeholder="Enter Remarks Here" />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default ViewRequest;
