import {
  CloudUploadOutlined,
  DownloadOutlined,
  PaperClipOutlined,
  RedoOutlined
} from "@ant-design/icons";
import Link from "antd/es/typography/Link";
import { Button, Card, Col, Flex, Form, Modal, Row, Select, Spin, Table, Typography } from "antd";
import ListViewTable from "../Lists/TechnicalCore/ListViewTable";
import Dragger from "antd/es/upload/Dragger";
import { ABSheetData, PermissionAction, snackBarErrorConf } from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  actionsPermissionValidator,
  downloadExcel,
  fileUploadHelper,
  handleExcelfile,
  safeString,
  validateABnumber
} from "Helpers/ats.helper";
import { useMutation, useQueries } from "react-query";
import { useServices } from "Hooks/ServicesContext";

const { Title } = Typography;

const ABPurchaseDownload = () => {
  const [showResults, setShowResults] = useState(false);
  const [showSpin, setShowSpin] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [dataSource, setDataSource] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [form] = Form.useForm();
  const [sheetRows, setSheetRows] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [allRecords, setAllRecords] = useState([]);
  const [filteredData, setFilteredData] = useState(dataSource);

  // Modal States
  const [isUploadedFileValid, setIsUploadedFileValid] = useState(false);
  const [previewSheetModalColumns, setPreviewSheetModalColumns] = useState([]);
  const [previewSheetModalDataSource, setPreviewSheetModalDataSource] = useState([]);

  // Dropdown States
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [allowedMonths, setAllowedMonths] = useState([]);

  const { apiService } = useServices();

  // uploader config
  const config = {
    name: "file",
    accept: ".xlsx,.xls, .csv",
    maxCount: 1,
    // onChange(info) {
    // },
    beforeUpload(file) {
      const isValid = handleExcelfile(file, fileReader);
      return isValid; // Return the validation result
    }
  };

  // columns
  const columns = [
    {
      title: "Sr. No.",
      dataIndex: "serial_number",
      key: "serial_number",
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Associate Buyer No.",
      dataIndex: "associate_buyer_no",
      key: "associate_buyer_no",
      sorter: (a, b) =>
        safeString(a.associate_buyer_no).localeCompare(safeString(b.associate_buyer_no)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Associate Buyer Name",
      dataIndex: "associate_buyer_name",
      key: "associate_buyer_name",
      sorter: (a, b) =>
        safeString(a.associate_buyer_name).localeCompare(safeString(b.associate_buyer_name)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => safeString(a.amount).localeCompare(safeString(b.amount)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Purchase Volume",
      dataIndex: "purchase_volume",
      key: "purchase_volume",
      sorter: (a, b) => safeString(a.purchase_volume).localeCompare(safeString(b.purchase_volume)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Month Name",
      dataIndex: "month_name",
      key: "month_name",
      sorter: (a, b) => safeString(a.month_name).localeCompare(safeString(b.month_name)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    }
  ];

  const importFile = () => {
    form.submit();
  };

  // On form submission
  const handleFormSubmit = async () => {
    try {
      await form.validateFields(); // if the form is invalid it will be thrown into catch block...
      getAbPurchaseDownloadList();
    } catch (error) {
      console.error(error);
    }
  };

  // This method used to parse file data
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

  // reset all states and data on UI
  const handleReset = (resetForm = true) => {
    try {
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

      // Set the default YEAR and MONTH on reset
      resetForm &&
        form.setFieldsValue({
          year: availableYears[0].year,
          month: availableMonths[0].month
        });
    } catch (error) {}
  };

  // Get  Technical Core Leaders
  const getAbPurchaseDownloadList = () => {
    try {
      const distNumbers = [];
      const { year, month } = form.getFieldsValue();

      allRecords.forEach((record) => {
        const { __rowNum__ } = record;
        distNumbers.push({
          key: __rowNum__,
          "Associate Buyer": record["Associate Buyer"] ? record["Associate Buyer"]?.toString() : ""
        });
      });

      // Create API request
      let request = {
        dist_nums: distNumbers,
        fyear: parseInt(year, 10),
        month: parseInt(month, 10)
      };

      // Call Mutation
      setShowSpin(true);
      setModalVisible(false); // close modal
      getAbPurchaseDownloadListMutate({ request: request, firstRecord: allRecords[0] });
    } catch (error) {}
  };

  const { mutate: getAbPurchaseDownloadListMutate } = useMutation(
    (request) => apiService.getPurchaseDownloadReport(request.request),
    {
      // Update confirmation
      onSuccess: ({ data, success }) => {
        if (success) {
          setFilteredData(null);
          setShowSpin(false); // stop spinning
          setShowResults(true); // show table

          if (data?.length > 0) {
            let result = data.map((record, index) => {
              return { serial_number: index + 1, ...record };
            });
            setDataSource(result); // set records
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

  const getCurrentMonth = (data) => {
    const currentMonth = new Date().getUTCMonth() + 1; // for May, It will be 4 + 1 = 5th....
    let tempMonth = data?.find((item) => item?.month == currentMonth);
    return tempMonth?.month;
  };

  const getCurrentYear = (data) => {
    const currentYear = new Date().getUTCFullYear();
    let tempYear = data?.find((item) => item?.year == currentYear);
    return tempYear?.year;
  };

  const [
    { data: yearsData, isSuccess: yearsSuccess },
    { data: monthsData, isSuccess: monthsSuccess }
  ] = useQueries([
    {
      queryKey: ["getPurchaseDownloadAvailableYears"],
      queryFn: () => apiService.getPurchaseDownloadAvailableYears()
    },
    {
      queryKey: ["getPurchaseDownloadAvailableMonths"],
      queryFn: () => apiService.getPurchaseDownloadAvailableMonths()
    }
  ]);

  useEffect(() => {
    if (yearsSuccess && monthsSuccess) {
      if (yearsData?.success && monthsData?.success) {
        setAvailableYears(yearsData.data);
        setAvailableMonths(monthsData.data);
        form.setFieldsValue({
          year: getCurrentYear(yearsData?.data),
          month: getCurrentMonth(monthsData.data)
        });

        handleAllowedMonths(monthsData.data); // fn call to update allowed months list
      }
    }
  }, [yearsSuccess, monthsSuccess, yearsData, monthsData]);

  // this is gray out the months that can not be selected
  const handleAllowedMonths = (months) => {
    try {
      const currentMonth = new Date().getUTCMonth() + 1; // for May, It will be 4 + 1 = 5th....
      const currentYear = new Date().getUTCFullYear();
      const { year } = form.getFieldsValue(); // slected year in drop down

      // if current year is selected...
      if (currentYear == year) {
        let allowedMonths = months.filter((month) => month.month <= currentMonth);
        setAllowedMonths(allowedMonths); // filtered months
        form.setFieldsValue({ month: getCurrentMonth(months) });
      } else {
        setAllowedMonths(availableMonths); // allowing all months in dropdown
        form.setFieldsValue({ month: 1 }); // Reseting month to January
      }
    } catch (error) {}
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Row gutter={[0, 24]}>
      <Col span={24}>
        {/* Breadcrumbs */}
        <Flex justify="space-between" vertical>
          <Title level={4}>{" Associate Buyer Monthly Purchase Report"}</Title>
          <Typography.Text style={StyleSheet.fontSize14}>
            <Typography.Text type="secondary">{"Associate Buyers  /"}</Typography.Text>{" "}
            {`AB Purchase Download`}
          </Typography.Text>
        </Flex>
      </Col>
      <Col span={24}>
        <Card>
          <Row gutter={[0, 24]}>
            <Col span={24}>
              <Flex gap={24} align="center" justify="space-between">
                <Form
                  form={form}
                  layout="vertical"
                  className="fullWidth"
                  onFinish={handleFormSubmit}>
                  <Row gutter={[20, 24]}>
                    <Col span={12}>
                      <Form.Item
                        name="year"
                        label="Select Year"
                        rules={[{ required: true, message: "Year is required" }]}
                        className="removeMargin">
                        <Select
                          disabled={showResults}
                          block
                          onChange={() => handleAllowedMonths(availableMonths)}
                          size="large"
                          options={availableYears?.map((e) => ({
                            value: e.year,
                            label: e.year
                          }))}
                          placeholder="Select Year"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="month"
                        label="Select Month"
                        rules={[{ required: true, message: "Month is required" }]}
                        className="removeMargin">
                        <Select
                          disabled={showResults}
                          block
                          size="large"
                          options={allowedMonths?.map((e) => ({
                            value: e.month,
                            label: e.month_name
                          }))}
                          placeholder="Select Month"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
                {showResults && (
                  <Button
                    htmlType="button"
                    icon={<RedoOutlined />}
                    size="small"
                    onClick={handleReset}
                    type="link"
                    className="margin-bottom--30px">
                    <Link strong>Reset</Link>
                  </Button>
                )}
              </Flex>
            </Col>
            <Col span={24}>
              <Row gutter={[0, 12]}>
                <Col span={24}>
                  <Flex gap={16} justify="space-between" vertical={uploadFile?.name && showResults}>
                    <Typography.Text>
                      {" "}
                      Upload Excel File with column heading “Associate Buyer”
                    </Typography.Text>
                    {!showResults && (
                      <Button
                        size="large"
                        onClick={() => downloadExcel(ABSheetData.AssociateBuyerSheet)}
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
        title={isUploadedFileValid ? "Preview Uploaded File " : "Uploaded File Errors"}
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
            onClick={() => importFile()}>
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
            columns={columns}
            dataSource={dataSource}
            setSearchValue={setSearchValue}
            searchValue={searchValue}
            filteredData={filteredData}
            setFilteredData={setFilteredData}
            fileName={"ab-purchase-download"}
          />
        </Col>
      )}
    </Row>
  ) : (
    <></>
  );
};

export default ABPurchaseDownload;
