import { CloudUploadOutlined, DownloadOutlined } from "@ant-design/icons";

import { Button, Card, Col, Flex, Image, Modal, Row, Spin, Table, Typography } from "antd";
import Dragger from "antd/es/upload/Dragger";
import { PermissionAction, SMS_EXPORT_DATA, snackBarErrorConf } from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  downloadExcel,
  fileUploadHelper,
  handleExcelfile,
  validateMobileNoSms
} from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import { useMutation } from "react-query";
import * as XLSX from "xlsx";
import SuccessIcon from "Static/img/terminate_success.svg";

const SmsDiamondClub = () => {
  const { apiService } = useServices();
  const [showSpin, setShowSpin] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [previewSheetModalDataSource, setPreviewSheetModalDataSource] = useState([]);
  const [previewSheetModalColumns, setPreviewSheetModalColumns] = useState([]);
  const [isUploadedFileValid, setIsUploadedFileValid] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [sheetRows, setSheetRows] = useState({});
  const [allRecords, setAllRecords] = useState([]);
  const [pagination, setPagination] = useState({
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ["10", "20", "50", "100"],
    showTotal: (total, range) => `Total ${total} items`,
    onShowSizeChange: (current, size) => {
      setPagination((prevPagination) => ({ ...prevPagination, pageSize: size }));
    }
  });

  // uploader config
  const config = {
    name: "file",
    accept: ".xlsx,.xls, .csv",
    maxCount: 1,
    beforeUpload(file) {
      const isValid = handleExcelfile(file, fileReader);
      return isValid; // Return the validation result
    }
  };

  const fileReader = (eFile) => {
    try {
      const file = eFile;
      if (file) {
        setShowSpin(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = e.target.result;
          const workbook = XLSX.read(data, {
            type: "binary"
          });

          const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
          const worksheet = workbook.Sheets[sheetName];
          // Assuming the data starts from A2 (skip the header)
          let records = XLSX.utils.sheet_to_json(worksheet, { raw: true, defval: "" }); //{  header: 1, range: 1 }

          const rLength = records?.length;
          const maxSize = 4 * 1024 * 1024; // 4MB in bytes
          if (rLength === 0) {
            setShowSpin(false);
            return enqueueSnackbar("No records found in sheet", snackBarErrorConf);
          } else if (rLength > 1000) {
            setShowSpin(false);
            return enqueueSnackbar("Only 1000 records allowed at once", snackBarErrorConf);
          } else if (file.size > maxSize) {
            setShowSpin(false);
            return enqueueSnackbar("Only max 4MB file allowed", snackBarErrorConf);
          } else if (!fileUploadHelper.hasRequiredColumn(records, ["Mobile Number"])) {
            // handleReset();
            setShowSpin(false);
            enqueueSnackbar("Uploaded file doesn't has the required columns", snackBarErrorConf);
            return;
          } else if (!fileUploadHelper.isAnyRowCellEmpty("Mobile Number", records)) {
            setShowSpin(false);
            return enqueueSnackbar("Empty row fields are not allowed", snackBarErrorConf);
          } else {
            // Sheet Rows Modification...
            const { incorrectBuyerRows, associateBuyers } = await fileUploadHelper.getRowsInfo(
              records,
              "Mobile Number",
              validateMobileNoSms
            );

            // Generating Uploaded Sheet Table Columns
            let columnHeadings = Object.keys(records[0]);
            let tableColumns = fileUploadHelper.generateTableColumns(
              columnHeadings,
              incorrectBuyerRows // this will add the error column... if incorrect rows exist
            );
            setPreviewSheetModalColumns(tableColumns);

            // setting states
            setSheetRows(associateBuyers);
            setAllRecords(records);

            // Show Error Popup if any incorrect rows found!
            if (Object.keys(incorrectBuyerRows).length > 0) {
              let data = [];
              Object.keys(incorrectBuyerRows).forEach((row) => {
                data.push({
                  row_no: row,
                  ...incorrectBuyerRows[row]
                });
              });
              setPreviewSheetModalDataSource(data);
              setShowSpin(false);
              setModalVisible(true);
              setIsUploadedFileValid(false); // invalid file
              return;
            }

            // Show Popup with Preview!
            else {
              let data = [];
              Object.keys(associateBuyers).forEach((row) => {
                data.push({
                  row_no: row,
                  ...associateBuyers[row]
                });
              });
              setPreviewSheetModalDataSource(data);
              setModalVisible(true);
              setIsUploadedFileValid(true); // valid file
            }

            setShowSpin(false);
          }
        };
        reader.readAsBinaryString(file);
      }
    } catch (error) {
      setShowSpin(false);
    }
  };

  // api method
  const { mutate: getAbSmsDiamond, isLoading: loaderAbSmsDiamond } = useMutation(
    (request) => apiService.getSmsDiamondClub(request),
    {
      // Update confirmation
      onSuccess: (data) => {
        if (data?.success) {
          setShowSpin(false); // stop spinning
          setIsModalOpen(true);
        }
      },
      onError: ({ status, message, errors }, request) => {
        setShowSpin(false); // stop spinning
        if (status === 422 && message === "Validation failed") {
          // generating incorrect data sources
          let invalidEntries = [];
          errors.forEach((error) => {
            invalidEntries.push({
              row_no: error["key"],
              error: error["message"],
              ...fileUploadHelper.transformKeysToSnakeCase(sheetRows[error["key"]])
            });
          });

          // generating table columns, if any error found in uploaded sheet rows...
          let columnHeadings = Object.keys(allRecords[0]);
          let tableColumns = fileUploadHelper.generateTableColumns(columnHeadings, invalidEntries);

          setPreviewSheetModalColumns(tableColumns);

          setModalVisible(true); // show modal for displaying rows with errors
          setIsUploadedFileValid(false); // set invalid file
          setPreviewSheetModalDataSource(invalidEntries); // set incorrect records
        }
      }
    }
  );

  // method to import list and pass data to api
  const getImportDownloadList = () => {
    const mobile_numbers = [];

    allRecords.forEach((record) => {
      const { __rowNum__ } = record;
      mobile_numbers.push({
        key: __rowNum__,
        "Mobile Number": record["Mobile Number"] ? record["Mobile Number"]?.toString() : ""
      });
    });

    // Call Mutation
    setShowSpin(true);
    setModalVisible(false); // close modal

    const data = {
      mobile_numbers: mobile_numbers
    };

    // api call
    getAbSmsDiamond(data);
  };

  const StyleSheet = {
    uploadIconSize: {
      width: "32px",
      height: "32px"
    }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={loaderAbSmsDiamond}>
      <Row gutter={[20, 24]}>
        <Col xs={24} sm={24} md={24} lg={24}>
          {/* Breadcrumbs */}
          <Flex justify="space-between" vertical gap={8}>
            <Typography.Title level={4} className="removeMargin">
              SMS Diamond Club (Upload Mobile Numbers)
            </Typography.Title>
            <Typography.Text style={{ fontSize: "14px" }} className="removeMargin">
              <Typography.Text type="secondary">Associate Buyers / </Typography.Text>
              SMS Diamond Club
            </Typography.Text>
          </Flex>
        </Col>

        <Card className="fullWidth removeMargin">
          <Row gutter={[0, 24]}>
            <Col xs={24} sm={24} md={24} lg={24}>
              <Row gutter={[0, 8]}>
                <Col xs={24} sm={24} md={24} lg={24}>
                  <Flex gap={16} justify="space-between" wrap="wrap">
                    <Typography.Text>
                      Upload Excel File with column heading “Mobile Number”{" "}
                      <span className="red-asterisk">*</span>
                    </Typography.Text>

                    <Button
                      size="large"
                      variant="outlined"
                      icon={<DownloadOutlined />}
                      onClick={() => downloadExcel(SMS_EXPORT_DATA)}>
                      Download Sample Sheet
                    </Button>
                  </Flex>
                </Col>

                {showSpin ? (
                  <Col xs={24} sm={24} md={24} lg={24}>
                    <Flex justify="center" width="100%" vertical={true} gap={5} align="center">
                      <Spin />
                      <p className="ant-upload-text">Please wait. File is processing...</p>
                    </Flex>
                  </Col>
                ) : (
                  <>
                    <Col xs={24} sm={24} md={24} lg={24}>
                      <Dragger {...config}>
                        <p className="ant-upload-drag-icon removeMargin">
                          <CloudUploadOutlined style={StyleSheet.uploadIconSize} />
                        </p>
                        <p className="ant-upload-text removeMargin">
                          Click or drag file to this area to upload
                        </p>
                        <p className="ant-upload-hint removeMargin">
                          Supports .xls, .xlsx & .csv file type
                        </p>
                      </Dragger>
                    </Col>
                  </>
                )}
              </Row>
            </Col>
          </Row>
        </Card>

        <Modal
          title={isUploadedFileValid ? "Preview Uploaded File" : "Uploaded File Errors"}
          onCancel={() => setModalVisible(false)}
          cancelText="Close"
          width={800}
          closable={false}
          footer={[
            <Button key="cancel" onClick={() => setModalVisible(false)}>
              Close
            </Button>,

            <Button
              key="import"
              type="primary"
              disabled={isUploadedFileValid === false}
              onClick={() => getImportDownloadList()}>
              Import
            </Button>
          ]}
          open={isModalVisible}>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24}>
              <Table
                bordered={true}
                pagination={previewSheetModalDataSource?.length > 10 ? pagination : false}
                dataSource={previewSheetModalDataSource}
                columns={previewSheetModalColumns}
                scroll={{
                  x: "max-content"
                }}
              />
            </Col>
          </Row>
        </Modal>

        <Modal
          open={isModalOpen}
          footer={false}
          onCancel={() => setIsModalOpen(false)}
          className="removeModalFooter "
          styles={{ mask: { backdropFilter: "blur(2px)" } }}>
          <Flex vertical={true} align="center">
            <Image style={StyleSheet.imageSize} preview={false} src={SuccessIcon} alt="success" />
            <Flex vertical={true} align="center">
              <Typography.Text strong size="large">
                Success!
              </Typography.Text>
              <Typography.Text type="secondary" size="large">
                SMS Sent successfully
              </Typography.Text>
            </Flex>
          </Flex>
        </Modal>
      </Row>
    </Spin>
  ) : (
    <></>
  );
};

export default SmsDiamondClub;
