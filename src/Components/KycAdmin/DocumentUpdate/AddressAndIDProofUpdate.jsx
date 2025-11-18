/* eslint-disable no-unused-vars */
import SearchByComponent from "Components/Shared/SearchByComponent";
import { useServices } from "Hooks/ServicesContext";
import React, { useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "react-query";
import UserProfileCard from "../UserProfileCard";
import { Button, Card, Col, Form, Popconfirm, Row, Select } from "antd";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";
import ImageUploader from "Components/Shared/ImageUploader";
import { getBase64, getFullImageUrl } from "Helpers/functions";
import { enqueueSnackbar } from "notistack";
import { MESSAGES, PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";
import { useRef } from "react";
import {
  actionsPermissionValidator,
  hasEditPermission,
  imageCompress,
  validateFileSize
} from "Helpers/ats.helper";
import { PopconfirmWrapper } from "Components/Shared/Wrappers/PopConfirmWrapper";

const AddressAndIDProofUpdate = () => {
  const queryClient = useQueryClient();
  const [searchPayload, setSearchPayload] = useState(null);
  const { apiService } = useServices();
  const [idProofImgFile, setIdProofImgFile] = useState(null);
  const [fetchData, setFetchData] = useState(null);
  const [addressProofImgFile, setAddressProofImgFile] = useState(null);
  const [form] = Form.useForm();
  const [applicantPhoto, setApplicantPhoto] = useState({
    url: null,
    file: null
  });
  const [applicantImgLoading, setApplicantImgLoading] = useState(false);
  const searchRef = useRef();

  const [
    { data: identityProofList, isLoading: isIdentityProofListLoading },
    { data: addressProofList, isLoading: isAddresProofListLoading }
  ] = useQueries([
    {
      queryKey: "fetchIdentityProofList",
      queryFn: () => apiService.getGenericIdentityProofList(),
      select: (data) =>
        data?.success && data?.data
          ? data?.data?.map((item) => ({
              label: item.doc_name,
              value: item.doc_code
            }))
          : [],
      onError: (error) => {
        //
      }
    },
    {
      queryKey: "fetchAddressProofList",
      queryFn: () => apiService.getGnenericAddressProofList(),
      select: (data) =>
        data?.success && data?.data
          ? data?.data?.map((item) => ({
              label: item.doc_name,
              value: item.doc_code
            }))
          : [],
      onError: (error) => {
        //
      }
    }
  ]);

  // api for fetching ab details by ab no
  const { isLoading } = useQuery(
    ["fetchAbDetailsByAbNo", searchPayload],
    () => apiService.getAbDetailsByAbNo(searchPayload),
    {
      enabled: !!searchPayload, // Fetch only when payload is available
      onSuccess: (data) => {
        if (data?.data) {
          const { dist_no, dist_name, member_since } = data?.data || {};
          const tempApplicantPhotoFile = data?.data?.files_meta?.find(
            (item) => item?.doc_type === "applicant_photo"
          );

          // modifying data
          const newData = {
            card_data: {
              dist_no,
              dist_name,
              member_since,
              applicantPhotoPath: tempApplicantPhotoFile?.doc_path || null // Pass doc_path for later use
            }
          };

          // setting application photo
          const applicantPhotoPath = newData?.card_data?.applicantPhotoPath;
          if (applicantPhotoPath) {
            setApplicantPhoto({
              url: getFullImageUrl(applicantPhotoPath),
              file: null
            });
          }

          // updating state
          setFetchData(newData);
        }
      },
      onError: (error) => {
        setFetchData(null);
        console.error(error);
      }
    }
  );

  // api for updating ID and Address proof
  const { mutate, isLoading: isUpdatingIDandAddressProof } = useMutation(
    (data) => apiService.updateAbAddressAndIdProof(data),
    {
      onSuccess: (resp) => {
        if (resp?.success) {
          try {
            enqueueSnackbar(resp?.message, snackBarSuccessConf);
            queryClient.setQueryData(["fetchAbDetailsByAbNo", searchPayload], null);
            form.resetFields();
            setSearchPayload(null);
            setApplicantPhoto({
              url: null,
              file: null
            });
            setIdProofImgFile(null);
            setAddressProofImgFile(null);
            setFetchData(null);
            // reset search field
            if (searchRef.current) {
              searchRef.current.resetFields();
            }
          } catch (error) {}
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // handle search click
  const handleSearchClick = (val) => {
    try {
      if (val) {
        const payload = {
          dist_no: val,
          req_bank_details: false
        };
        setSearchPayload(payload);
      }
    } catch (error) {}
  };

  // handle search change / search clear
  const handleClear = () => {
    //
  };

  // handle ID Proof Img
  const handleIDProofImgFile = (val) => {
    setIdProofImgFile(val);
  };

  // handle Address Proof Img
  const handleAddressProofImgFile = (val) => {
    setAddressProofImgFile(val);
  };

  // handle update btn click
  const handleSubmit = (values) => {
    try {
      const { id_proof_doc_type, addr_proof_doc_type } = values;
      const formData = new FormData();
      idProofImgFile instanceof File && formData.append("identity_proof", idProofImgFile);
      addressProofImgFile instanceof File && formData.append("address_proof", addressProofImgFile);
      applicantPhoto.file instanceof File &&
        formData.append("applicant_photo", applicantPhoto.file);
      id_proof_doc_type && formData.append("id_proof_doc_type", id_proof_doc_type);
      addr_proof_doc_type && formData.append("addr_proof_doc_type", addr_proof_doc_type);
      searchPayload?.dist_no && formData.append("dist_no", searchPayload?.dist_no);

      mutate(formData); // api call to upudate ID proof and address proof image
    } catch (error) {}
  };

  // fn to clear the dashboard on BACK button click
  const handleBack = () => {
    // reset states
    if (searchRef.current) {
      searchRef.current.resetFields();
    }
    form.resetFields();
    setFetchData(null);
    setSearchPayload(null);
  };

  // hanlde applicant image change
  const uploadOnChange = async (info) => {
    try {
      setApplicantImgLoading(true);
      if (info.file) {
        if (!validateFileSize(info.file)) {
          setApplicantPhoto({
            url: null,
            file: null
          });
          setApplicantImgLoading(false);
          return false;
        }

        setApplicantImgLoading(true); // Set loading to true while processing the image
        const selectedFile = info.file;
        const result = await imageCompress(selectedFile);
        getBase64(info.file, (url) => {
          setApplicantImgLoading(false);
          setApplicantPhoto({
            url: url,
            file: result
          }); // Set the new image URL after conversion
        });
      }
    } catch (error) {}
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <SearchByComponent
        moduleName={"address_id_proof_update"}
        handleSearchClick={handleSearchClick}
        handleClear={handleClear}
        searchLoading={isLoading}
        ref={searchRef}
      />
      <Row gutter={[20, 24]}>
        {fetchData ? (
          <Card className="fullWidth marginTop24">
            <UserProfileCard
              moduleType={"kyc-document-update"}
              userDetails={fetchData?.card_data}
              uploadOnChange={uploadOnChange}
              loading={applicantImgLoading}
              imageUrl={applicantPhoto.url}
            />
            <Form
              name="address_id_proof_form"
              form={form}
              layout="vertical"
              onFinish={hasEditPermission() && handleSubmit}
              className="marginTop24">
              <Row gutter={[16, 24]}>
                <Col span={12}>
                  <Form.Item
                    name="id_proof_doc_type"
                    label="ID Proof"
                    rules={[{ required: true, message: "ID Proof  is required" }]}>
                    <Select
                      block
                      placeholder="Select ID Proof"
                      size="large"
                      options={identityProofList}
                      disabled={isIdentityProofListLoading}
                    />
                  </Form.Item>
                  <Form.Item
                    name="identity_proof"
                    label="Upload ID Proof Image"
                    rules={[{ required: true, message: "ID Proof Image is required" }]}>
                    <div
                      style={{ position: "relative" }}
                      className="custom-image-uploader">
                      <ImageUploader
                        label="Upload File"
                        onChange={(url, file) => {
                          form.setFieldValue("identity_proof", url);
                          handleIDProofImgFile(file);
                        }}
                      />
                    </div>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="addr_proof_doc_type"
                    label="Address Proof"
                    rules={[{ required: true, message: "Address Proof is required" }]}>
                    <Select
                      block
                      placeholder="Select Address Proof"
                      size="large"
                      options={addressProofList}
                      disabled={isAddresProofListLoading}
                    />
                  </Form.Item>
                  <Form.Item
                    name="address_proof"
                    label="Upload Address Proof Image"
                    rules={[{ required: true, message: "Address Proof Image is required" }]}>
                    <div
                      style={{ position: "relative" }}
                      className="custom-image-uploader">
                      <ImageUploader
                        label="Upload File"
                        onChange={(url, file) => {
                          form.setFieldValue("address_proof", url);
                          handleAddressProofImgFile(file);
                        }}
                      />
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <Button onClick={handleBack} size="large" className="width100" variant="outlined">
                    Back{" "}
                  </Button>
                </Col>
                <Col span={12}>
                  <PopconfirmWrapper
                    title="Update Address & ID Proof"
                    description="Are you sure you want to update?"
                    onConfirm={() => form.submit()}
                    okText="Yes"
                    cancelText="No"
                    ChildComponent={
                      <Button
                        size="large"
                        className="width100"
                        type="primary"
                        htmlType="button"
                        loading={isUpdatingIDandAddressProof}
                        disabled={!hasEditPermission() || isUpdatingIDandAddressProof}>
                        Update
                      </Button>
                    }
                    addTooltTip={!hasEditPermission()}
                    prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
                  />
                </Col>
              </Row>
            </Form>
          </Card>
        ) : (
          <>
            <Col span={24}></Col>
            <SearchByFallbackComponent
              title={"Search by Associate Buyer Number / Reference Number"}
              subTitle={
                "Quickly search the Associate Buyer Number / Reference Number to process the Address & ID Proof update details."
              }
              image={searchByIcon}
            />
          </>
        )}
      </Row>
    </>
  ) : (
    <></>
  );
};

export default AddressAndIDProofUpdate;
