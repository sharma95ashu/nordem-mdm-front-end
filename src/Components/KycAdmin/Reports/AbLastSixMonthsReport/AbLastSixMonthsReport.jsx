import {
  CloudUploadOutlined,
  DownloadOutlined,
  PaperClipOutlined,
  RedoOutlined
} from "@ant-design/icons";
import { Button, Card, Col, Flex, Modal, Row, Spin, Table, Typography } from "antd";
import Link from "antd/es/typography/Link";
import Dragger from "antd/es/upload/Dragger";
import {
  ABSheetData,
  monthsMapping,
  PermissionAction,
  snackBarErrorConf
} from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import {
  actionsPermissionValidator,
  capitalizeFirstLetter,
  fileUploadHelper,
  handleExcelfile,
  validateABnumber
} from "Helpers/ats.helper";
import ListViewTable from "Components/KycAdmin/Lists/TechnicalCore/ListViewTable";

const { Title, Text } = Typography;

const AbLastSixMonthsReport = () => {
  const [showResults, setShowResults] = useState(false);
  const [showSpin, setShowSpin] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [sheetRows, setSheetRows] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [allRecords, setAllRecords] = useState([]);
  const [filteredData, setFilteredData] = useState(dataSource);

  // Modal States
  const [isUploadedFileValid, setIsUploadedFileValid] = useState(false);
  const [previewSheetModalColumns, setPreviewSheetModalColumns] = useState([]);
  const [previewSheetModalDataSource, setPreviewSheetModalDataSource] = useState([]);

  const { apiService } = useServices();

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

  /** --------------------------------------------------------------------------------------------------
   * Function to replace the MONTH NUMBER with the NAME...
   * @param {object} data = Object of months data - Example = { 1: "232", 2: "232", etc.... }
   * @returns {object} = Example = { oct: '232', nov: '232', etc... }
   -------------------------------------------------------------------------------------------------- */

  const replaceMonthNumberWithName = (data = {}) => {
    const transformedData = {};
    try {
      const CURRENT_MONTH_NUMBER = 6; // [1,2,3,4,5,6]
      const ACTUAL_CURRENT_MONTH = new Date().getMonth(); // [2 + 1 = 3] = MARCH (3)
      const SUM = ACTUAL_CURRENT_MONTH + CURRENT_MONTH_NUMBER;

      for (let index = 1; index <= CURRENT_MONTH_NUMBER; index++) {
        const difference = SUM + index > 12 ? SUM + index - 12 : SUM + index;
        transformedData[monthsMapping[difference]] = data[index] ?? "0.00";
        delete data[index]; // deleting the key from original object, e.g (1,2,3,4,5,6)
      }
    } catch (error) {}
    return { ...transformedData, ...data };
  };

  // -------------------------------------------------------------------------------------------
  // This method used to parse file data
  // -------------------------------------------------------------------------------------------

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

          const rLength = records.length;
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
          } else if (!fileUploadHelper.hasRequiredColumn(records, ["Associate Buyer"])) {
            handleReset();
            enqueueSnackbar("Uploaded file doesn't has the required columns", snackBarErrorConf);
            return;
          } else if (!fileUploadHelper.isAnyRowCellEmpty("Associate Buyer", records)) {
            setShowSpin(false);
            return enqueueSnackbar("Empty row fields are not allowed", snackBarErrorConf);
          } else {
            // Sheet Rows Modification...
            const { incorrectBuyerRows, associateBuyers } = await fileUploadHelper.getRowsInfo(
              records,
              "Associate Buyer",
              validateABnumber
            );

            // Generating Uploaded Sheet Table Columns
            let columnHeadings = Object.keys(records[0]);
            let tableColumns = fileUploadHelper.generateTableColumns(
              columnHeadings,
              incorrectBuyerRows // this will add the error column... if incorrect rows exist
            );
            setPreviewSheetModalColumns(tableColumns);

            // setting states
            setUploadFile(file);
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

  // this method used to download sample file
  const downloadSampleSheet = () => {
    try {
      const data = ABSheetData.AssociateBuyerSheet;
      const ws = XLSX.utils.json_to_sheet(data);
      // Freeze the first row
      ws["!freeze"] = {
        xSplit: 0,
        ySplit: 1,
        topLeftCell: "A2",
        activePane: "bottomRight",
        state: "frozen"
      };
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, ws, "Associate Buyers");
      XLSX.writeFile(workbook, "Associate-Buyer-Sample-Sheet.xlsx");
    } catch (error) {}
  };

  // reset all states and data on UI
  const handleReset = () => {
    setShowResults(false);
    setShowSpin(false);
    setUploadFile(null);
    setSheetRows({});
    setModalVisible(false);
    setIsUploadedFileValid(false);
    setPreviewSheetModalColumns([]);
    setPreviewSheetModalDataSource([]);
    setDataSource([]);
    setSearchValue("");
  };

  // Get Associate Buyer Last 6 Month Purchase
  const getPurchaseReport = () => {
    const distNumbers = [];
    allRecords.forEach((record) => {
      const { __rowNum__ } = record;
      distNumbers.push({
        key: __rowNum__,
        "Associate Buyer": record["Associate Buyer"] ? record["Associate Buyer"]?.toString() : ""
      });
    });

    // Create API request
    let request = {
      dist_nums: distNumbers
    };

    // Call Mutation
    setShowSpin(true);
    setModalVisible(false); // close modal
    getPurchaseReportMutate({ request: request, firstRecord: allRecords[0] });
  };

  const { mutate: getPurchaseReportMutate } = useMutation(
    (request) => apiService.getLastSixMonthsPurchaseReport(request.request),
    {
      // Update confirmation
      onSuccess: (result) => {
        if (result?.success && result?.data) {
          setFilteredData(null);
          setShowSpin(false); // stop spinning
          setShowResults(true); // show table

          // modifying the api response...
          if (Array.isArray(result?.data)) {
            const modifiedData = [];
            result?.data?.map((record, index) => {
              const { ab_no, ...other } = record;
              modifiedData.push({
                sr_no: index + 1,
                ab_no,
                ...replaceMonthNumberWithName(other)
              });
            });

            // generating dynamic table columns
            let [first] = modifiedData || [];

            if (typeof first === "object") {
              const customColumnName = {
                sr_no: "Sr. No.",
                ab_no: "AB No."
              };

              const columns = [];
              for (let key in first) {
                columns.push({
                  title: customColumnName[key] ? customColumnName[key] : capitalizeFirstLetter(key),
                  dataIndex: key,
                  key: key,
                  sorter: (a, b) => Number(a[key] ? a[key] : 0) - Number(b[key] ? b[key] : 0)
                });
              }

              // set table columns
              setTableColumns(columns);
            }

            // set records
            setDataSource(modifiedData || []);
          }
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
          let columnHeadings = Object.keys(request.firstRecord);
          let tableColumns = fileUploadHelper.generateTableColumns(columnHeadings, invalidEntries);
          setPreviewSheetModalColumns(tableColumns);

          setModalVisible(true); // show modal for displaying rows with errors
          setIsUploadedFileValid(false); // set invalid file
          setPreviewSheetModalDataSource(invalidEntries); // set incorrect records
        }
      }
    }
  );

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Row gutter={[0, 24]}>
      <Col span={24}>
        {/* Breadcrumbs */}
        <Flex justify="space-between" vertical>
          <Title level={4}>{"Associate Buyer Last 6 Month Purchase"}</Title>
          <Typography.Text style={StyleSheet.fontSize14}>
            <Typography.Text type="secondary">{"Associate Buyers /"}</Typography.Text>{" "}
            {`AB Last 6 Month Purchase`}
          </Typography.Text>
        </Flex>
      </Col>
      <Col span={24}>
        <Card>
          <Row gutter={[0, 24]}>
            <Col span={24}>
              <Row gutter={[0, 12]}>
                <Col span={24}>
                  <Flex gap={16} justify="space-between" vertical={uploadFile?.name && showResults}>
                    <Flex gap={12} align="center" justify="space-between">
                      <Text> Upload Excel File with column heading “Associate Buyer”</Text>

                      {showResults && (
                        <Button
                          icon={<RedoOutlined />}
                          size="small"
                          onClick={handleReset}
                          type="link">
                          <Link strong>Reset</Link>
                        </Button>
                      )}
                    </Flex>

                    {!showResults && (
                      <Button
                        size="large"
                        onClick={downloadSampleSheet}
                        variant="outlined"
                        icon={<DownloadOutlined />}>
                        {" "}
                        Download Sample Sheet
                      </Button>
                    )}

                    {uploadFile?.name && showResults && (
                      <Flex gap={8} align="center">
                        <PaperClipOutlined />
                        <Link>{uploadFile.name}</Link>
                      </Flex>
                    )}
                  </Flex>
                </Col>
                {showSpin && !showResults ? (
                  <Col span={24}>
                    <Flex
                      style={{ margin: 20 }}
                      justify={"center"}
                      width="100%"
                      vertical={true}
                      gap={5}
                      align="center">
                      <Spin />
                      <p className="ant-upload-text">Please wait. File is processing ...</p>
                    </Flex>
                  </Col>
                ) : !showSpin && !showResults ? (
                  <Col span={24}>
                    <Dragger {...config}>
                      <p className="ant-upload-drag-icon">
                        {" "}
                        <CloudUploadOutlined />{" "}
                      </p>
                      <p className="ant-upload-text">Click or drag file to this area to upload</p>
                      <p className="ant-upload-hint">Supports .xls, .xlsx & .csv file type </p>
                    </Dragger>
                  </Col>
                ) : (
                  <></>
                )}
              </Row>
            </Col>
          </Row>
        </Card>
      </Col>

      <Modal
        title={isUploadedFileValid ? "Preview File" : "Uploaded File Errors"}
        onCancel={() => setModalVisible(false)}
        width={900}
        cancelText="Close"
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
          <Button
            disabled={isUploadedFileValid ? false : true}
            key="import"
            type="primary"
            onClick={() => getPurchaseReport()}>
            Import
          </Button>
        ]}
        open={modalVisible}>
        <Table
          bordered={true}
          pagination={true}
          dataSource={previewSheetModalDataSource}
          columns={previewSheetModalColumns}
        />
      </Modal>

      {/* Results */}
      {showResults && (
        <Col span={24}>
          <ListViewTable
            columns={tableColumns}
            dataSource={dataSource}
            setSearchValue={setSearchValue}
            searchValue={searchValue}
            filteredData={filteredData}
            setFilteredData={setFilteredData}
            fileName={"ab-last-six-months-purchase"}
          />
        </Col>
      )}
    </Row>
  ) : (
    <></>
  );
};

export default AbLastSixMonthsReport;
