import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Flex,
  Form,
  Modal,
  Popconfirm,
  Image,
  Row,
  Spin,
  Switch,
  Table,
  Typography
} from "antd";
import UserProfileCard from "Components/KycAdmin/UserProfileCard";
import { FALL_BACK, MESSAGES, RejectionReason, snackBarSuccessConf } from "Helpers/ats.constants";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { Link } from "react-router-dom";
import { KycAdminPaths } from "Router/KYCAdminPaths";
import RowColumnData from "../Shared/RowColumnData";
import ImageTextDetails from "../Shared/ImageTextDetails";
import TextArea from "antd/es/input/TextArea";
import { ArrowLeftOutlined, EyeOutlined } from "@ant-design/icons";
import { TooltipWrapper } from "Components/Shared/Wrappers/TooltipWrapper";
import { PopconfirmWrapper } from "Components/Shared/Wrappers/PopConfirmWrapper";
import { getFullImageUrl } from "Helpers/functions";
import KycTable from "../Shared/KycTable";
import { getDateTimeFormat } from "Helpers/ats.helper";

export const UserVerification = ({
  ABDetails,
  handleAfterUpdate,
  handleBack,
  hasActionPermission
}) => {
  // States
  const [declarationDataSource, setDeclarationDataSource] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [checkboxOptions, setCheckboxOptions] = useState([]);
  const [isSaveNext, setIsSaveNext] = useState(null);
  const [photosList, setPhotosList] = useState({});

  const [kycStatusForm] = Form.useForm();
  const { apiService } = useServices();

  const TableColumns = {
    Declaration: [
      {
        title: "AB ID",
        dataIndex: "dist_no",
        render: (ab_id) => {
          return (
            <Typography.Text underline>
              <Link to={`/${KycAdminPaths.abDetails}?ab_id=${ab_id}`}>{ab_id}</Link>
            </Typography.Text>
          );
        }
      },
      {
        title: "Name",
        dataIndex: "dist_name",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "Relation",
        dataIndex: "relation_name",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "Active",
        dataIndex: "status",
        render: (text) => <Typography.Text>{text ? "Y" : "N" ?? "-"}</Typography.Text>
      },
      {
        title: "Pin",
        dataIndex: "pin",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      }
    ],
    SimilarEntries: [
      {
        title: "AB Photo",
        dataIndex: "AB_Photo",
        width: 50,
        render: (_, field) => {
          return (
            <Flex justify="center">
              {photosList[field.dist_no] ? (
                <Image
                  width={40}
                  height={40}
                  fallback={FALL_BACK}
                  src={getFullImageUrl(photosList[field.dist_no])}
                />
              ) : (
                <Avatar
                  size={40}
                  icon={<EyeOutlined />}
                  className="cursorPointer"
                  onClick={() => {
                    getABPhotoMutate(field.dist_no);
                  }}
                />
              )}
            </Flex>
          );
        }
      },
      {
        title: "AB ID",
        dataIndex: "dist_no",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "AB Name",
        dataIndex: "dist_name",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "Father Name",
        dataIndex: "father_name",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "Nominee Name",
        dataIndex: "nominee_name",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "City",
        dataIndex: "city",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "Address",
        dataIndex: "address_line",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "Remark",
        dataIndex: "remark",
        width: 100,
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "Resign Date",
        dataIndex: "resign_date",
        width: 150,
        render: (text) => {
          return (
            <Typography.Text>
              {" "}
              {text ? getDateTimeFormat(text, "DD / MMM / YYYY") : "-"}{" "}
            </Typography.Text>
          );
        }
      }
    ]
  };

  // ---------------- Get Kyc Similar Entities ----------------
  const { mutate: getABPhotoMutate } = useMutation(
    `getABPhotoByDistNumber`,
    (distNumber) => apiService.getABPhotoByDistNumber({ dist_no: distNumber }),
    {
      // Configuration options for the mutation
      onSuccess: (response, distNumber) => {
        if (response?.success && response.data) {
          setPhotosList((prev) => ({
            ...prev,
            [distNumber]: response.data
          }));
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  // On Form Submit
  const onFinish = (values) => {
    const { is_checked } = values;

    // If KYC Status is NOT OK, Open dialog and Choose Remark
    if (!is_checked) {
      setModalVisible(true);
      return;
    }

    // If KYC Status is OK, Making Update API Call
    handleKycUpdate();
  };

  // Reset States
  const resetApplicationStates = (clearSearchField = false) => {
    setDeclarationDataSource([]);
    kycStatusForm.resetFields();
  };

  // Handle KYC update
  const handleKycUpdate = () => {
    // destructed form values
    const { is_checked, success_remark, rejection_remark, rejection_reasons } =
      kycStatusForm.getFieldsValue();

    const request = {
      dist_no: ABDetails.dist_no,
      status: is_checked ? "approved" : "rejected",

      // If Kyc checkox is OK, and remark exist!
      ...(is_checked && success_remark && { remark: success_remark }),

      // If Kyc checkox is NOT OK, and extra remark exist!
      ...(!is_checked &&
        rejection_reasons?.indexOf(RejectionReason.Other) > -1 && { remark: rejection_remark }),

      // Kyc NOT OK reasons
      ...(!is_checked && rejection_reasons?.length > 0 && { reasons: rejection_reasons })
    };
    updateKycStatusMutate(request); // Actual API Call made!
  };

  // KYC Status Update API Call
  const { mutate: updateKycStatusMutate, isLoading: KycUpdateLoading } = useMutation(
    (request) => apiService.updateKYCStatusByExecutive(request),
    {
      // Update confirmation
      onSuccess: ({ success, message }) => {
        if (success) {
          setModalVisible(false); // Close the modal after submission
          resetApplicationStates(); // reset page
          handleAfterUpdate(isSaveNext); // handle after update
          enqueueSnackbar(message, snackBarSuccessConf);
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  // Handle Modal Cancel
  const onModalCancel = () => {
    setModalVisible(false);
    kycStatusForm.setFieldValue("rejection_remark", null); // empty { NOT OK remark } on modal close!
    kycStatusForm.setFieldValue("rejection_reasons", null); // empty { selected options } on modal close!
  };

  // Handle Checkbox Change
  const handleCheckboxChange = (checkedValues) => {
    // Clear the NOT OK Remark Field, if Other is deselected!
    if (checkedValues.indexOf(RejectionReason.Other) === -1) {
      kycStatusForm.setFieldValue("rejection_remark", null);
    }
  };

  // api call to fetch the rejection reasons
  useQuery("getKYCRejectionReasons", () => apiService.getKYCRejectionReasons(), {
    enabled: true, //enabled the query by default
    onSuccess: (response) => {
      if (response?.success && response?.data) {
        const other = [response?.data.find((e) => e.id === 15)];
        const predefined = response?.data.filter((e) => e.id !== 15);
        const newData = [...predefined, ...other];
        setCheckboxOptions(newData);
      }
    },
    onError: (error) => {
      console.log(error);
    }
  });

  // Setting up default states of FORM

  useEffect(() => {
    // toggle button state updated
    kycStatusForm?.setFieldValue("is_checked", ABDetails?.kyc_status ? true : false);

    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [ABDetails]);

  return (
    <>
      <Card className="fullWidth">
        <Flex vertical gap={12}>
          <Flex justify="space-between" align="center">
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              Back
            </Button>
          </Flex>
          <Row gutter={[0, 32]}>
            <Col span={24} style={StyleSheet.nullPaddingInline}>
              <UserProfileCard className="fullWidth" userDetails={ABDetails} />
            </Col>
            <Flex className="fullWidth" span={24} vertical gap={12}>
              <>
                {/*--------------------- KYC Info ---------------------*/}
                {ABDetails?.kyc_info && (
                  <>
                    <RowColumnData title={"KYC Info"} columnData={ABDetails.KYC_INFO} />
                  </>
                )}

                {/*--------------------- Personal Info ---------------------*/}
                {ABDetails.personal_details && (
                  <>
                    <Divider></Divider>
                    <ImageTextDetails
                      ColumnData={ABDetails.PERSONAL_INFO}
                      title={"Personal Info"}
                      document={{
                        type: ABDetails.identity_proof_doc_name,
                        src: getFullImageUrl(ABDetails.identity_proof_doc_path)
                      }}
                    />
                  </>
                )}

                {/*--------------------- Associate Buyer Declaration ---------------------*/}
                {/* This will only be visible if ""PERSONAL_INFO Declaration is YES. */}
                {ABDetails?.PERSONAL_INFO?.Declaration?.toLowerCase()?.startsWith("y") &&
                  declarationDataSource.length > 0 && (
                    <Flex vertical gap={12}>
                      <Typography.Text strong style={StyleSheet.sectionHeading}>
                        {"Associate Buyer Declaration"}
                      </Typography.Text>
                      <Flex gap={10}>
                        <div></div>
                        <Table
                          className="fullWidth"
                          bordered
                          columns={TableColumns.Declaration}
                          dataSource={declarationDataSource}
                          pagination={false}
                          scroll={{ x: true }}
                        />
                      </Flex>
                    </Flex>
                  )}

                {/*--------------------- Sponsor/Proposer Info ---------------------*/}
                {ABDetails.sponsor && (
                  <>
                    <Divider></Divider>
                    <RowColumnData
                      title={"Sponsor/Proposer Info"}
                      columnData={ABDetails.SPONSOR_INFO}
                    />
                  </>
                )}

                {/*--------------------- Similar Entries Found ---------------------*/}
                {ABDetails.similar_entities && (
                  <>
                    <Divider></Divider>
                    <Flex vertical gap={12}>
                      <Typography.Text strong style={StyleSheet.sectionHeading}>
                        {"Similar Entries Found"}
                      </Typography.Text>
                      <Flex gap={10}>
                        <div></div>
                        <KycTable
                          columns={TableColumns.SimilarEntries}
                          data={ABDetails.similar_entities}
                          tableKey={"se-found"}></KycTable>
                      </Flex>
                    </Flex>
                  </>
                )}

                {/*--------------------- Nominee Info ---------------------*/}
                {ABDetails.nominee_details && (
                  <>
                    <Divider></Divider>
                    <RowColumnData title={"Nominee Info"} columnData={ABDetails.NOMINEE_INFO} />
                  </>
                )}

                {/*--------------------- Communication Info ---------------------*/}
                {ABDetails.communication_details && (
                  <>
                    <Divider></Divider>
                    <ImageTextDetails
                      ColumnData={ABDetails.COMMUNICATION_INFO}
                      title={"Communication Info"}
                      document={{
                        type: ABDetails.address_proof_doc_name,
                        src: getFullImageUrl(ABDetails.address_proof_doc_path)
                      }}
                      copyIcon
                    />
                  </>
                )}

                {/*--------------------- Bank Account Info ---------------------*/}
                {ABDetails.bank_details && (
                  <>
                    <Divider></Divider>
                    <ImageTextDetails
                      ColumnData={ABDetails.BANK_ACCOUNT_INFO}
                      title={"Bank Account Info"}
                      document={
                        ABDetails.pan_proof_doc_path
                          ? [
                              {
                                type: ABDetails.bank_proof_doc_name,
                                src: getFullImageUrl(ABDetails.bank_proof_doc_path)
                              },
                              {
                                type: ABDetails.pan_proof_doc_name,
                                src: getFullImageUrl(ABDetails.pan_proof_doc_path)
                              }
                            ]
                          : {
                              type: ABDetails.bank_proof_doc_name,
                              src: getFullImageUrl(ABDetails.bank_proof_doc_path)
                            }
                      }
                    />
                  </>
                )}
              </>

              {/*--------------------- KYC Status Update Section ---------------------*/}

              <Form
                form={kycStatusForm}
                layout="vertical"
                onFinish={hasActionPermission && onFinish}>
                <Row gutter={[0, 24]}>
                  <Col span={24}></Col>
                  <Col span={24}>
                    <Row gutter={[0, 6]}>
                      {/* Form Fields */}
                      <Col span={24}>
                        <Row gutter={24}>
                          {/* KYC Switch */}
                          <Col span={3}>
                            <Form.Item
                              name="is_checked"
                              label={"KYC Status"}
                              rules={[
                                {
                                  required: true,
                                  message: "This field is required."
                                }
                              ]}>
                              <Switch
                                className="color-switch"
                                checkedChildren={"OK"}
                                unCheckedChildren={"Terminate"}
                                defaultChecked
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>

                      {/* Action Button */}
                      <Col span={24}>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item shouldUpdate>
                              {() => {
                                const kycOk = kycStatusForm.getFieldValue("is_checked");
                                return (
                                  <>
                                    {kycOk ? (
                                      <PopconfirmWrapper
                                        title={"Mark KYC as OK"}
                                        description={"Are you sure you want to OK the KYC?"}
                                        onConfirm={() => {
                                          setIsSaveNext(false); // set save next to false
                                          kycStatusForm.submit(); // submit form on confirm
                                        }}
                                        okText="Yes"
                                        cancelText="No"
                                        ChildComponent={
                                          <Button
                                            disabled={!hasActionPermission}
                                            size="large"
                                            className="width100">
                                            Save
                                          </Button>
                                        }
                                        addTooltTip={!hasActionPermission}
                                        prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
                                      />
                                    ) : (
                                      <TooltipWrapper
                                        ChildComponent={
                                          <Button
                                            disabled={!hasActionPermission}
                                            htmlType="submit"
                                            size="large"
                                            className="width100"
                                            onClick={() => {
                                              setIsSaveNext(false); // set save next to false
                                            }}>
                                            Save
                                          </Button>
                                        }
                                        addTooltTip={!hasActionPermission}
                                        prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
                                      />
                                    )}
                                  </>
                                );
                              }}
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item shouldUpdate>
                              {() => {
                                const kycOk = kycStatusForm.getFieldValue("is_checked");
                                return (
                                  <>
                                    {kycOk ? (
                                      <PopconfirmWrapper
                                        title={"Mark KYC as OK"}
                                        description={"Are you sure you want to OK the KYC?"}
                                        onConfirm={() => {
                                          setIsSaveNext(true); // set save next to true
                                          kycStatusForm.submit(); // submit form on confirm
                                        }}
                                        okText="Yes"
                                        cancelText="No"
                                        ChildComponent={
                                          <Button
                                            disabled={!hasActionPermission}
                                            size="large"
                                            className="width100"
                                            type="primary">
                                            Save & Next
                                          </Button>
                                        }
                                        addTooltTip={!hasActionPermission}
                                        prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
                                      />
                                    ) : (
                                      <TooltipWrapper
                                        ChildComponent={
                                          <Button
                                            onClick={() => {
                                              setIsSaveNext(true); // set save next to true
                                            }}
                                            htmlType="submit"
                                            size="large"
                                            disabled={!hasActionPermission}
                                            className="width100"
                                            type="primary">
                                            Save & Next
                                          </Button>
                                        }
                                        addTooltTip={!hasActionPermission}
                                        prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
                                      />
                                    )}
                                  </>
                                );
                              }}
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                {/* KYC Not OK Modal */}
                <Modal
                  open={modalVisible}
                  width={1080}
                  title={"Select Remarks"}
                  onCancel={onModalCancel}
                  footer={[
                    <div key={"footer-buttons"}>
                      <Flex justify="end" align="center" className="fullWidth">
                        <Button size="large" key="back" onClick={onModalCancel}>
                          Cancel
                        </Button>
                        <Form.Item
                          key="submit"
                          shouldUpdate
                          style={{ marginLeft: "8px" }}
                          className="margin-bottom-0">
                          {() => {
                            const isAnySelected =
                              !kycStatusForm.getFieldValue("rejection_reasons")?.length;
                            return (
                              <Popconfirm
                                title={"Mark KYC as Terminated"}
                                description={"Are you sure you want to terminate the KYC?"}
                                onConfirm={() => {
                                  kycStatusForm
                                    .validateFields()
                                    .then((values) => {
                                      handleKycUpdate(values);
                                    })
                                    .catch((err) => {
                                      console.error(err);
                                      // Scroll to remark section
                                      document
                                        .getElementById("rejection_remark")
                                        ?.scrollIntoView({ behavior: "smooth" });
                                    });
                                }}
                                okText="Yes"
                                cancelText="No">
                                <Button size="large" type="primary" disabled={isAnySelected} danger>
                                  Update
                                </Button>
                              </Popconfirm>
                            );
                          }}
                        </Form.Item>
                      </Flex>
                    </div>
                  ]}>
                  <Spin spinning={KycUpdateLoading}>
                    <div className="rejection__options__container">
                      <Form.Item name="rejection_reasons" className="margin-bottom-0">
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
                                    kycStatusForm
                                      .getFieldValue("rejection_reasons")
                                      ?.indexOf(RejectionReason.Other) > -1;
                                  return (
                                    <>
                                      {otherChecked && (
                                        <Form.Item
                                          className="margin-bottom-0"
                                          name="rejection_remark"
                                          rules={[
                                            { required: true, message: "Remark is required." }
                                          ]}>
                                          <TextArea
                                            minLength={3}
                                            rows={4}
                                            placeholder="Remark"
                                            maxLength={150}
                                          />
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
            </Flex>
          </Row>
        </Flex>
      </Card>
    </>
  );
};
