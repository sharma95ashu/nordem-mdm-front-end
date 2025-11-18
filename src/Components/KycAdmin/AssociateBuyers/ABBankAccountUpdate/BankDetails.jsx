import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Col, Form, Image, Input, Row, Select, Tag, Typography, Upload } from "antd";
import TextArea from "antd/es/input/TextArea";
import { UploadButton } from "Components/Shared/UploadButton";
import { PopconfirmWrapper } from "Components/Shared/Wrappers/PopConfirmWrapper";
import {
  abBankDetails,
  ALLOWED_FILE_IMAGE_TYPES,
  bankAccountNumberValidation,
  MESSAGES,
  snackBarSuccessConf
} from "Helpers/ats.constants";
import {
  getDocumentPath,
  hasEditPermission,
  imageCompress,
  validateFileSize,
  validateRemarks,
  validationNumber
} from "Helpers/ats.helper";
import { getBase64, getFullImageUrl } from "Helpers/functions";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useMutation, useQueries } from "react-query";

const BankDetails = forwardRef(
  (
    {
      distNo,
      fetchedABBankDetails = [],
      resetApplicationStates,
      loadingABDetails,
      titleStyle,
      title
    },
    ref
  ) => {
    const [form] = Form.useForm();
    const { apiService } = useServices();
    const [bankNameCode, setBankNameCode] = useState(null);
    const [branchStateCode, setBranchStateCode] = useState(null);
    const [bank_acc_num_length, setBankAccNumLength] = useState(null);
    const [branchNameList, setBranchNameList] = useState([]);
    const [bankProofLoading, setBankProofLoading] = useState(false);
    const [bankProofPhoto, setBankProofPhoto] = useState(null);
    const [isPrevBankDetailsExits, setPrevBankDetailsExists] = useState(false);

    // exposing reset bank details for parent component.
    useImperativeHandle(ref, () => ({
      resetBankDetails: () => {
        resetAll(); // reset states
        form.resetFields(); // reset form
      }
    }));

    // fn to reset bank details component
    const resetAll = () => {
      setBankNameCode(null);
      setBranchStateCode(null);
      setBankAccNumLength(null);
      setBranchNameList([]);
      setPrevBankDetailsExists(false);
      setBankProofLoading(false);
      setBankProofPhoto(null);
    };

    // api call for bank name list and states list
    const [
      { data: banksNameList, isLoading: isBanksNameListLoading },
      { data: statesList, isLoading: isStatesListLoading }
    ] = useQueries([
      {
        queryKey: "fetchBankNamesList",
        queryFn: () => apiService.getBanksList(),
        select: (data) =>
          data?.success && data.data
            ? data.data.map((item) => ({
                label: item?.bank_name,
                value: item?.bank_code,
                acc_number_length: item?.acc_number_length
              }))
            : [],
        onError: (error) => {
          //
        }
      },
      {
        queryKey: "fetchstatesList",
        queryFn: () => apiService.getStatesListForBankUpdate(),

        select: (data) =>
          data?.success && data.data
            ? data.data.map((item) => ({
                label: item?.state_name,
                value: item?.state_code
              }))
            : [],
        onError: (error) => {
          //
        }
      }
    ]);

    // hook for fetching branch name based on bank name & branch state
    const { mutate: fetchBranchNameList } = useMutation(
      (payload) => apiService.getBankBranchesList(payload),
      {
        onSuccess: (res) => {
          if (res.success && res?.data) {
            const tempBranchNameList = res?.data?.map((item) => ({
              label: item?.b_name,
              value: item?.b_code
            }));
            setBranchNameList(tempBranchNameList);
            form.setFields([
              {
                name: abBankDetails.branch_name.fieldName,
                errors: []
              }
            ]);
          }
        },
        onError: (error) => {
          form.setFields([
            {
              name: abBankDetails.branch_name.fieldName,
              errors: []
            }
          ]);
        }
      }
    );

    // handle bank name change
    const handleBankNameChange = (val, accNumLength) => {
      try {
        form.setFields([
          {
            name: abBankDetails.branch_name.fieldName,
            value: null,
            errors: []
          },
          {
            name: abBankDetails.bank_acc_no.fieldName,
            value: null,
            errors: []
          }
        ]);
        if (val && branchStateCode) {
          const payload = {
            bank_code: val,
            state_code: branchStateCode
          };
          fetchBranchNameList(payload); // api call to fetch bank's branch list
        }
        accNumLength && setBankAccNumLength(accNumLength);
        setBankNameCode(val);
      } catch (error) {}
    };

    // handle bank state change
    const handleBranchStateChange = (val) => {
      try {
        setBranchStateCode(val);
        form.setFields([
          {
            name: abBankDetails.branch_name.fieldName,
            value: null,
            errors: []
          }
        ]);
        if (val && bankNameCode) {
          const payload = {
            bank_code: bankNameCode,
            state_code: val
          };
          fetchBranchNameList(payload); // api call to fetch bank's branch list
        }
      } catch (error) {}
    };

    // bank accnt validation
    const banAccNoValidation = (_, value) => {
      // Check for other validation conditions like length
      if (value && !bank_acc_num_length?.includes(String(value)?.length)) {
        return Promise.reject(`Invalid Bank Account Number`);
      }

      // Ensure at least one digit is from 1 to 9
      if (value && !bankAccountNumberValidation.regex.test(value)) {
        return Promise.reject(bankAccountNumberValidation.message);
      }
      return Promise.resolve();
    };

    // handle bank proof image change
    const handleImageChange = async (info) => {
      try {
        setBankProofLoading(true);
        // validate file size
        if (!validateFileSize(info.file)) {
          form.setFieldValue(abBankDetails.bank_proof.fieldName, null);
          setBankProofLoading(false);
          return;
        }
        if (info.file && info.fileList.length === 1) {
          const result = await imageCompress(info.fileList[0].originFileObj); //compressing the image
          // convert file to base64
          getBase64(info.fileList[0].originFileObj, (url) => {
            form.setFieldValue(abBankDetails.bank_proof.fieldName, result);

            setBankProofPhoto(url);
            setBankProofLoading(false);
          });
        }
      } catch (error) {}
    };

    // function to remove the uploaded image
    const handleImageRemove = () => {
      try {
        if (bankProofPhoto) {
          URL.revokeObjectURL(bankProofPhoto); // revoke the object URL to free up memory
          form.setFieldValue(abBankDetails.bank_proof.fieldName, null);
          setBankProofPhoto(null);
        }
      } catch (error) {}
    };

    // API call to update ban accnt details
    const { mutate: updateBankAccntDetails, isLoading: updatingBankDetails } = useMutation(
      "updateBankAccntDetails",
      (data) => apiService.updateABBankAccntDetails(data),
      {
        onSuccess: (data) => {
          if (data?.success) {
            enqueueSnackbar(data.message, snackBarSuccessConf);
            resetAll();
            resetApplicationStates();
          }
          return [];
        },
        onError: (error) => {
          //
        }
      }
    );

    const handleBckBtnClick = () => {
      resetAll();
      resetApplicationStates();
    };

    // handle form submission
    const onFinish = (values) => {
      try {
        const formData = new FormData();
        formData.append("dist_no", distNo);
        formData.append("bank_code", values?.bank_code);
        formData.append("branch_name", values?.branch_name);
        formData.append("bank_acc_no", values?.bank_acc_no);
        formData.append("remark", values?.remark);
        if (values?.bank_proof instanceof File) {
          formData.append("bank_proof", values?.bank_proof);
        }
        updateBankAccntDetails(formData); // api call to  bank accnt update details
      } catch (error) {}
    };

    // Update Bank Account Proof Photo is bank details already exists...
    useEffect(() => {
      const photoPath = fetchedABBankDetails["bank_proof_doc_path"];
      if (photoPath && fetchedABBankDetails?.bank_details !== null) {
        form.setFieldValue(abBankDetails.bank_proof.fieldName, photoPath);
        setBankProofPhoto(getFullImageUrl(photoPath));
        form.setFieldValue("bank_proof", photoPath);
      }
    }, []);

    useEffect(() => {
      try {
        if (Object.keys(fetchedABBankDetails?.bank_details)?.length > 0) {
          form.setFieldsValue(fetchedABBankDetails?.bank_details);
          setBankAccNumLength(fetchedABBankDetails?.bank_details?.bank_acc_num_length);
          const { branch_state_code, bank_code } = fetchedABBankDetails?.bank_details || {};
          setPrevBankDetailsExists(Object.values(fetchedABBankDetails?.bank_details)?.length > 0);
          if (branch_state_code && bank_code) {
            const payload = {
              bank_code: bank_code,
              state_code: branch_state_code
            };
            const path = getDocumentPath(fetchedABBankDetails?.docs, "bank_proof");
            path && form.setFieldValue("bank_proof", path);
            path && setBankProofPhoto(getFullImageUrl(path));
            fetchBranchNameList(payload); // api call to fetch branch names list
            setBankNameCode(bank_code);
          }
        }
      } catch (error) {}
    }, [fetchedABBankDetails]);

    return (
      <>
        <Form
          name="ab_update_bank_details"
          form={form}
          layout="vertical"
          onFinish={hasEditPermission() && onFinish}>
          <Row span={12} gutter={[20, 10]} className="formContent removeMargin">
            <Col span={24}>
              <Typography.Text strong style={titleStyle} className="color-primary">
                {title}
              </Typography.Text>
            </Col>
            <Col span={12}>
              <Form.Item
                name={abBankDetails.bank_name.fieldName}
                label="Bank Name"
                rules={abBankDetails.bank_name.validations}
                className="removeMargin">
                <Select
                  placeholder="Select Bank Name"
                  showSearch
                  size="large"
                  options={banksNameList}
                  onChange={(val, item) => handleBankNameChange(val, item?.acc_number_length)}
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  loading={isBanksNameListLoading}
                  disabled={isBanksNameListLoading || isPrevBankDetailsExits}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={abBankDetails.branch_state.fieldName}
                label="Branch State"
                rules={abBankDetails.branch_state.validations}
                className="removeMargin">
                <Select
                  placeholder="Select Branch State"
                  showSearch
                  size="large"
                  options={statesList}
                  onChange={handleBranchStateChange}
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  loading={isStatesListLoading}
                  disabled={isStatesListLoading || isPrevBankDetailsExits}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={abBankDetails.branch_name.fieldName}
                label="Branch Name"
                rules={abBankDetails.branch_name.validations}
                className="removeMargin">
                <Select
                  placeholder="Select Branch Name"
                  showSearch
                  size="large"
                  options={branchNameList}
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  disabled={!branchNameList?.length || isPrevBankDetailsExits}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={abBankDetails.bank_acc_no.fieldName}
                label="Bank Account Number"
                validateTrigger={["onChange", "onBlur"]}
                rules={[
                  {
                    required: true,
                    message: "Bank Account Number is required",
                    validateTrigger: "onChange"
                  },
                  { validator: banAccNoValidation, validateTrigger: "onBlur" }
                ]}
                className="removeMargin">
                <Input
                  placeholder="Enter Bank Account Number"
                  size="large"
                  type="text"
                  onInput={validationNumber}
                  disabled={bank_acc_num_length?.length == 0 || isPrevBankDetailsExits}
                  maxLength={
                    bank_acc_num_length?.length > 0 ? Math.max(...bank_acc_num_length) : 18
                  }
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <div className="bank-proof">
                <Form.Item
                  name={abBankDetails.bank_proof.fieldName}
                  label="Upload Bank Account Proof (Front Page of Passbook)"
                  rules={abBankDetails.bank_proof.validations}
                  className="removeMargin">
                  <Upload
                    style={{
                      height: "500px !important"
                    }}
                    className="upload-photo"
                    name="bank_proof"
                    listType="picture-card"
                    accept={ALLOWED_FILE_IMAGE_TYPES}
                    showUploadList={false}
                    maxCount={1}
                    beforeUpload={() => false}
                    disabled={isPrevBankDetailsExits}
                    onChange={(e) => handleImageChange(e)}>
                    {bankProofPhoto ? (
                      <Image
                        src={bankProofPhoto}
                        alt="identity's photo"
                        className="preview-image"
                        preview={true}
                      />
                    ) : (
                      <UploadButton loading={bankProofLoading} photo={bankProofPhoto} />
                    )}
                  </Upload>
                </Form.Item>
                {bankProofPhoto && !isPrevBankDetailsExits && (
                  <div className="cover_delete" type="text" onClick={handleImageRemove}>
                    <DeleteOutlined />
                  </div>
                )}
              </div>
            </Col>

            {!isPrevBankDetailsExits && (
              <Col span={24}>
                <Form.Item
                  name="remark"
                  label="Remarks"
                  required
                  className="removeMargin"
                  rules={[{ validator: validateRemarks }]}>
                  <TextArea rows={4} placeholder="Enter Remarks Here" />
                </Form.Item>
              </Col>
            )}
            {Object.values(fetchedABBankDetails?.bank_details || {})?.length > 0 && (
              <Col span={24}>
                <Tag icon={<ExclamationCircleOutlined />} color="warning">
                  Bank Details already exists.
                </Tag>
              </Col>
            )}
          </Row>
          <Row gutter={[12, 12]} className="marginTop16">
            <Col span={12}>
              <Button
                size="large"
                className="width100"
                variant="outlined"
                onClick={handleBckBtnClick}>
                Back{" "}
              </Button>
            </Col>
            <Col span={12}>
              <PopconfirmWrapper
                onConfirm={() => form.submit()}
                title={"Update Bank Details"}
                description={"Are you sure want to update bank details?"}
                okText="Yes"
                cancelText="No"
                ChildComponent={
                  <Button
                    size="large"
                    className="width100"
                    type="primary"
                    htmlType="button"
                    loading={loadingABDetails || updatingBankDetails}
                    disabled={
                      !hasEditPermission() ||
                      loadingABDetails ||
                      updatingBankDetails ||
                      isPrevBankDetailsExits
                    }>
                    Update
                  </Button>
                }
                addTooltTip={!hasEditPermission()}
                prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
              />
            </Col>
          </Row>
        </Form>
      </>
    );
  }
);

export default BankDetails;
