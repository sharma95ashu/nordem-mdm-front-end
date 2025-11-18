import { Button, Checkbox, Col, Form, Modal, Popconfirm, Row, Spin } from "antd";
import TextArea from "antd/es/input/TextArea";
import { RejectionReason, snackBarSuccessConf } from "Helpers/ats.constants";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import { useMutation, useQuery } from "react-query";

const TerminationDialog = ({
  distNumber,
  showDialog,
  setShowDialog,
  resetSearchBar,
  setShowDashboard,
  updateTerminationAPIMethod,
  module
}) => {
  const [checkboxOptions, setCheckboxOptions] = useState([]);
  const { apiService } = useServices();
  const [terminationForm] = Form.useForm();

  // this will be triggered when Dialog is closed...
  const onModalCancel = () => {
    setShowDialog(false);
    terminationForm.setFieldValue("dist_termination_remark", null); // emptying the remark field
    terminationForm.setFieldValue("dist_termination_reasons", null); // uncheck all the checkbox
  };

  // triggers on reason check/uncheck...
  const handleCheckboxChange = (checkedValues) => {
    if (checkedValues.indexOf(RejectionReason.Other) === -1) {
      terminationForm.setFieldValue("dist_termination_remark", null); // clear the remark box if OTHER is unchecked...
    }
  };

  //   Function will trigger on the final termination OK....
  const handleTermination = () => {
    const { dist_termination_remark, dist_termination_reasons } = terminationForm.getFieldsValue();
    const request = {
      dist_no: distNumber,
      // If OTHER is checked...
      ...(dist_termination_reasons?.indexOf(RejectionReason.Other) > -1 && {
        remark: dist_termination_remark
      }),
      // Termination Reasons...
      ...(dist_termination_reasons?.length > 0 && { reasons: dist_termination_reasons }),
      ...(module === "soft-terminate" && { status: "approved" })
    };

    terminateUserMutation(request); // Actual API Call made!
  };

  //   API Method for terminate User
  const { mutate: terminateUserMutation, isLoading: TerminateUserLoading } = useMutation(
    (request) => updateTerminationAPIMethod.call(apiService, request),
    {
      // Update confirmation
      onSuccess: (data) => {
        if (data?.success) {
          setShowDialog(false); // Close the modal after submission
          terminationForm.resetFields(); // reset the form fields
          enqueueSnackbar(data?.message, snackBarSuccessConf); // show confirmation
          resetSearchBar(); // reset search bar field
          setShowDashboard(false); // hide dashboard
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  // This function will fetch the list of reasons
  useQuery("getTerminationReasons", () => apiService.getKYCRejectionReasons(), {
    enabled: true, // fetching reasons on popup load
    onSuccess: ({ data, success }) => {
      if (success) {
        setCheckboxOptions(data);
      }
    },
    onError: (error) => {
      console.log(error);
    }
  });

  return (
    <Form form={terminationForm} layout="vertical" onFinish={handleTermination}>
      <Modal
        open={showDialog}
        width={1080}
        title={"Select Remarks"}
        onCancel={onModalCancel}
        footer={[
          <div
            key={"footer-buttons"}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              width: "100%"
            }}>
            <Button key="back" onClick={onModalCancel}>
              Cancel
            </Button>
            <Form.Item key="submit" shouldUpdate style={{ marginLeft: "8px", marginBottom: "0px" }}>
              {() => {
                const isAnySelected = !terminationForm.getFieldValue("dist_termination_reasons")
                  ?.length;
                return (
                  <Popconfirm
                    title="Terminate AB?"
                    description="Are you sure you want to Terminate AB?"
                    onConfirm={() => {
                      terminationForm
                        .validateFields()
                        .then(() => {
                          terminationForm.submit();
                        })
                        .catch((err) => console.error(err));
                    }}
                    okText="Yes"
                    cancelText="No">
                    <Button htmlType="submit" type="primary" disabled={isAnySelected} danger>
                      Yes, Terminate AB
                    </Button>
                  </Popconfirm>
                );
              }}
            </Form.Item>
          </div>
        ]}>
        <Spin spinning={TerminateUserLoading}>
          <div className="rejection__options__container">
            <Form.Item name="dist_termination_reasons" className="margin-bottom-0">
              <Checkbox.Group onChange={handleCheckboxChange}>
                <Row gutter={[24, 8]}>
                  {checkboxOptions.map((option) => (
                    <Col key={option.id} span={12}>
                      <Checkbox value={option.id}>{option.description}</Checkbox>
                    </Col>
                  ))}
                  <Col span={24}></Col>
                  <Col span={24}>
                    <Form.Item shouldUpdate className="margin-bottom-0">
                      {() => {
                        const otherChecked =
                          terminationForm
                            .getFieldValue("dist_termination_reasons")
                            ?.indexOf(RejectionReason.Other) > -1;
                        return (
                          <>
                            {otherChecked && (
                              <Form.Item
                                className="margin-bottom-0"
                                name="dist_termination_remark"
                                rules={[{ required: true, message: "Remark is required." }]}>
                                <TextArea rows={4} placeholder="Remark" />
                              </Form.Item>
                            )}
                          </>
                        );
                      }}
                    </Form.Item>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </div>
        </Spin>
      </Modal>
    </Form>
  );
};

export default TerminationDialog;
