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
import {
  MESSAGES,
  PermissionAction,
  snackBarErrorConf,
  snackBarSuccessConf
} from "Helpers/ats.constants";
import { actionsPermissionValidator, hasEditPermission } from "Helpers/ats.helper";
import { getFullImageUrl } from "Helpers/functions";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { KycAdminPaths } from "Router/KYCAdminPaths";

const ViewBankUpdateRequest = () => {
  const params = useParams();
  const { apiService } = useServices();
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [showRemarksField, setShowRemarksField] = useState(false);
  const [showModalRemarksField, setShowModalRemarksField] = useState(false);
  const [modal, setModal] = useState(false);
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

  // api call to fecth bank update request details
  const { data: fetchedData, isLoading: isLoadingViewRequestDetails } = useQuery(
    "fetchSingleBankUpdateRequestDetails",
    () =>
      apiService.getSingleBankRequestDetails({
        dist_no: params?.id
      }),
    {
      enabled: true,
      select: (res) => {
        if (res?.success && res?.data) {
          const {
            dist_name = "",
            dist_no = "",
            dist_join_date = "",
            docs = [],
            old_bank_details = {},
            new_bank_details = {}
          } = res?.data || {};
          return {
            card_data: {
              dist_name,
              dist_no,
              member_since: dist_join_date,
              doc_path: docs?.[0]?.doc_path || ""
            },
            existing_bank_accnt_info: {
              "Bank Account Number": old_bank_details?.bank_acc_no || "",
              "Bank Name": old_bank_details?.bank_name || "",
              "Branch Name": old_bank_details?.branch_name || "",
              "IFSC Code": old_bank_details?.ifsc_code || "",
              "Branch State": old_bank_details?.branch_state_name || ""
            },
            updated_bank_account_info: {
              "Bank Account Number": new_bank_details?.bank_acc_no || "",
              "Bank Name": new_bank_details?.bank_name || "",
              "Branch Name": new_bank_details?.branch_name || "",
              "IFSC Code": new_bank_details?.ifsc_code || "",
              "Branch State": new_bank_details?.branch_state_name || ""
            },
            bank_doc: new_bank_details?.doc_path || "",
            new_doc_name: "Bank Passbook / Cheque"
          };
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // hanlde navigation
  const handleNavigation = () => {
    navigate(`/${KycAdminPaths.bankUpdateRequest}`);
    handelModel(false);
  };

  // useMutation hook for updating bank update request
  const { mutate: updateBankUpdateReq, isLoading: isUpdateingBankReq } = useMutation(
    (data) => apiService.updatebankUpdateRequest(data),
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

  // handle status toggle change
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
      updateBankUpdateReq(payload); // api call to update bank update request
    } catch (error) {}
  };

  // hanlde modal display
  const handelModel = (val) => {
    setModal(val);
  };

  const handleReasonSelection = (val) => {
    val && setShowModalRemarksField(val == "Other");
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Spin spinning={isLoadingViewRequestDetails} fullscreen />
      <Row gutter={[20, 24]} className="marginTop8">
        <Col span={24}>
          <Flex justify="space-between" vertical gap={8}>
            <Typography.Title level={4} className="removeMargin">
              View Request
            </Typography.Title>
            <Typography.Text style={StyleSheet.fontSize14} className="removeMargin">
              <Typography.Text type="secondary">Update Request / Bank Update /</Typography.Text>{" "}
              View request
            </Typography.Text>
          </Flex>
        </Col>
      </Row>
      <Card className="fullWidth marginTop24">
        <UserProfileCard moduleType={"pan-number"} userDetails={fetchedData?.card_data || {}} />
        <Form form={form} layout="vertical" onFinish={hasEditPermission() && onFinish}>
          <Row gutter={[20, 0]} className="marginTop24">
            <Col span={24}>
              {fetchedData?.existing_bank_accnt_info && (
                <>
                  <RowColumnData
                    titleStyle={{ color: "#1755A6" }}
                    title={"Existing Bank Account Info"}
                    columnData={fetchedData?.existing_bank_accnt_info}
                    colSpan={6}
                    indentation={false}
                  />
                </>
              )}
            </Col>
            <Divider />
            <Col span={24}>
              {fetchedData?.updated_bank_account_info && (
                <>
                  <ImageTextDetails
                    ColumnData={fetchedData?.updated_bank_account_info}
                    title={"Updated Bank Account Info"}
                    document={{
                      type: fetchedData?.new_doc_name,
                      src: getFullImageUrl(fetchedData?.bank_doc)
                    }}
                    moduleType={"bank-update-request"}
                    handleStatusToggleChange={handleStatusToggleChange}
                  />
                </>
              )}
            </Col>
            {showRemarksField && (
              <Col span={24}>
                <Form.Item name="remarks" label="Remarks">
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
                  title="Update Bank"
                  description="Are you sure you want to Update Bank?"
                  onConfirm={() => form.submit()}
                  okText="Yes"
                  cancelText="No"
                  ChildComponent={
                    <Button
                      size="large"
                      className="width100"
                      type="primary"
                      loading={!modal ? isUpdateingBankReq : false}
                      disabled={!hasEditPermission() || (!modal ? isUpdateingBankReq : false)}>
                      Update
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
                      loading={!modal ? isUpdateingBankReq : false}
                      disabled={!hasEditPermission() || (!modal ? isUpdateingBankReq : false)}
                      onClick={() => setModal(true)}>
                      Add Remarks & Update
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
        title="Select Remark for Rejection"
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
            title="Reject Bank"
            description="Are you sure you want to reject Bank?"
            onConfirm={() => modalForm.submit()}
            okText="Yes"
            cancelText="No">
            <Button size="large" disabled={isUpdateingBankReq} type="primary" danger>
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
  ) : (
    <></>
  );
};

export default ViewBankUpdateRequest;
