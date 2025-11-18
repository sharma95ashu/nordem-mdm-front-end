import { Button, Card, Col, Form, Row, Select } from "antd";
import SearchByComponent from "Components/Shared/SearchByComponent";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import React, { useState } from "react";
import UserProfileCard from "../../UserProfileCard";
import ImageUploader from "Components/Shared/ImageUploader";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { getBase64 } from "Helpers/functions";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { PermissionAction } from "Helpers/ats.constants";
// import UserProfileCard from "../UserProfileCard";

const { Option } = Select;

const KycDocumentUpdate = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { apiService } = useServices();
  const [idProofOptions, setIdProofOptions] = useState([]);
  const [addressProofOptions, setAddressProofOptions] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);

  const StyleSheet = {
    Relative: {
      position: "relative"
    }
  };

  const uploadOnChange = (info) => {
    try {
      if (info.file) {
        setImageUrl(null); // Reset the image URL to null
        setImageLoading(true); // Set loading to true while processing the image
        // Get the base64 data of the first file
        getBase64(info.file, (url) => {
          setImageLoading(false);
          setImageUrl(url); // Set the new image URL after conversion
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const ABDetails = {
    dist_no: "10110",
    dist_name: "Rrrr",
    member_since: "2024-12-04T09:33:32.481Z",
    doc_path: "/kyc/7200000000/1733303311887-768124458.jpeg"
  };

  // Fetching the ID Proof Options
  useQuery(
    "getIdentityProof",
    // () => apiService.getIdentityProof(),
    () => apiService.getRequest("http://ecomapi.nordemtech.com/api/kyc/get-identity-proof"),
    {
      enabled: true, // Enable the query by default
      onSuccess: ({ data }) => {
        if (data?.length > 0) {
          setIdProofOptions(data); // setting the id proof option list
          form.setFieldValue("id_proof", data[0]?.doc_code); // setting the first option as selected on the option list
        }
      }
    }
  );

  // Fetching the Address Proof Options
  useQuery(
    "getAddressProof",
    // () => apiService.getAddressProof(),
    () => apiService.getRequest("http://ecomapi.nordemtech.com/api/kyc/get-address-proof"),
    {
      enabled: true, // Enable the query by default
      onSuccess: ({ data }) => {
        if (data?.length > 0) {
          setAddressProofOptions(data); // setting the address proof option list
          form.setFieldValue("address_proof", data[0]?.doc_code); // setting the first option as selected on the option list
        }
      }
    }
  );

  const handleSearch = (value) => {
    setShow(true);
    setIsLoading(false);
  };

  const handleUpdate = (values) => {
    //
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Row gutter={[20, 24]}>
      <Col span={24}>
        <SearchByComponent
          handleClear={() => {
            /** */
          }}
          handleSearchClick={handleSearch}
          searchLoading={isLoading}
          moduleName={"kyc_document_update"}
        />
      </Col>
      {show ? (
        <Card className="fullWidth">
          <Form form={form} layout={"vertical"} onFinish={handleUpdate}>
            <Row gutter={[0, 24]}>
              <Col span={24}>
                <UserProfileCard
                  moduleType={"kyc-document-update"}
                  className="fullWidth"
                  userDetails={ABDetails}
                  uploadOnChange={uploadOnChange}
                  loading={imageLoading}
                  imageUrl={imageUrl}
                />
              </Col>
              <Col span={24}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Row gutter={[0, 6]}>
                      <Col span={24}>
                        <Form.Item
                          name="id_proof"
                          label="ID Proof"
                          rules={[
                            {
                              required: true,
                              message: `ID Proof is required`
                            }
                          ]}>
                          <Select>
                            {idProofOptions.map((document) => {
                              return (
                                <Option key={document.doc_code} value={document.doc_code}>
                                  {document.doc_name}
                                </Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="id_proof_image"
                          label="Upload ID Proof Image"
                          rules={[{ required: true, message: "ID Proof Image is required" }]}>
                          <div style={StyleSheet.Relative}>
                            <ImageUploader
                              label="Upload ID Proof Image"
                              onChange={(url) => form.setFieldValue("id_proof_image", url)}
                            />
                          </div>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  <Col xs={24} md={12}>
                    <Row gutter={[0, 6]}>
                      <Col span={24}>
                        <Form.Item
                          name="address_proof"
                          label="Address Proof"
                          rules={[
                            {
                              required: true,
                              message: `Address Proof is required`
                            }
                          ]}>
                          <Select>
                            {addressProofOptions.map((document) => {
                              return (
                                <Option key={document.doc_code} value={document.doc_code}>
                                  {document.doc_name}
                                </Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="address_proof_image"
                          label="Upload Address Proof Image"
                          rules={[{ required: true, message: "Address Proof Image is required" }]}>
                          <div style={StyleSheet.Relative}>
                            <ImageUploader
                              label="Upload Address Proof Image"
                              onChange={(url) => form.setFieldValue("address_proof_image", url)}
                            />
                          </div>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Button
                  onClick={() => navigate(-1)}
                  htmlType="button"
                  size="large"
                  className="width100"
                  variant="outlined">
                  Back
                </Button>
              </Col>
              <Col span={12}>
                <Button htmlType="submit" size="large" className="width100" type="primary">
                  Update
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      ) : (
        <SearchByFallbackComponent
          title={"Search by Associate Buyer Number"}
          subTitle={
            "Quickly search the Associate Buyer Number to process the KYC similar entites details."
          }
        />
      )}
    </Row>
  ) : (
    <></>
  );
};

export default KycDocumentUpdate;
