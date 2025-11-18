import {
  CloudUploadOutlined,
  DownloadOutlined,
  PaperClipOutlined,
  RedoOutlined
} from "@ant-design/icons";
import { Button, Card, Col, Flex, Modal, Radio, Row, Spin, Table, Typography } from "antd";
import Link from "antd/es/typography/Link";
import Dragger from "antd/es/upload/Dragger";
import { ABSheetData, PermissionAction, snackBarErrorConf } from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import ListViewTable from "./ListViewTable";
import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import {
  actionsPermissionValidator,
  handleExcelfile,
  safeString,
  validateABnumber
} from "Helpers/ats.helper";

const searchByOptions = [
  { label: "Technical", value: "technical" },
  { label: "Royalty", value: "royalty" }
];

const { Title, Text } = Typography;

const TechnicalCoreList = () => {
  const [selectedTab, setSelectedTab] = useState("technical");
  const [showResults, setShowResults] = useState(false);
  const [showSpin, setShowSpin] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [sheetRows, setSheetRows] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [dataSource, setDataSource] = useState([]);
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
      sorter: (a, b) => Number(a.serial_number) - Number(b.serial_number),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Associate Buyer No",
      dataIndex: "associate_buyer_no",
      key: "associate_buyer_no",
      sorter: (a, b) =>
        safeString(a.associate_buyer_no).localeCompare(safeString(b.associate_buyer_no)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: selectedTab === "technical" ? "Technical No." : "Royalty No.",
      dataIndex: selectedTab === "technical" ? "technical_no" : "royalty_no",
      key: selectedTab === "technical" ? "technical_no" : "royalty_no",
      sorter: (a, b) => {
        const field = selectedTab === "technical" ? "technical_no" : "royalty_no";
        return safeString(a[field]).localeCompare(safeString(b[field]));
      },
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: selectedTab === "technical" ? "Technical Name" : "Royalty Name",
      dataIndex: selectedTab === "technical" ? "technical_name" : "royalty_name",
      key: selectedTab === "technical" ? "technical_name" : "royalty_name",
      sorter: (a, b) => {
        const field = selectedTab === "technical" ? "technical_name" : "royalty_name";
        return safeString(a[field]).localeCompare(safeString(b[field]));
      },

      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Core No.",
      dataIndex: "core_no",
      key: "core_no",
      sorter: (a, b) => safeString(a.core_no).localeCompare(safeString(b.core_no)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Core Name",
      dataIndex: "core_name",
      key: "core_name",
      sorter: (a, b) => safeString(a.core_name).localeCompare(safeString(b.core_name)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    }
  ];

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
            const { incorrectBuyerRows, associateBuyers } =
              await fileUploadHelper.getRowsInfo(records);

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

  const fileUploadHelper = {
    checkFileExtension: (filename, extension) => {
      const regex = new RegExp("\\." + extension + "$", "i");
      return regex.test(filename);
    },
    hasRequiredColumn: (records, requiredColumns) => {
      const hasRequiredColumn = Object.keys(records[0]).some((columnName) =>
        requiredColumns.includes(columnName)
      );
      return hasRequiredColumn;
    },
    getRowsInfo: async (records) => {
      const incorrectBuyerRows = {};
      const associateBuyers = {};
      let allRecords = new Set();
      let duplicates = new Set();

      // Looping on all the excel sheet records
      for (let i = 0; i < records.length; i++) {
        let { __rowNum__, ...otherColumns } = records[i];
        let currentABNumber = records[i]["Associate Buyer"];
        associateBuyers[__rowNum__] = {
          ...fileUploadHelper.transformKeysToSnakeCase(otherColumns)
        };

        // Validating AB Number
        try {
          await validateABnumber(null, currentABNumber);
        } catch (error) {
          // If Invalid, pushing into array
          incorrectBuyerRows[__rowNum__] = {
            ...fileUploadHelper.transformKeysToSnakeCase(otherColumns),
            error: error
          };
        }

        // Validating Duplicate Entries

        if (allRecords.has(currentABNumber)) {
          duplicates.add({ __rowNum__, currentABNumber }); // exist
          incorrectBuyerRows[__rowNum__] = {
            ...fileUploadHelper.transformKeysToSnakeCase(otherColumns),
            error: "Duplicate Record"
          };
        } else {
          allRecords.add(currentABNumber); // unique
        }
      }
      return { incorrectBuyerRows, associateBuyers };
    },
    transformKeysToSnakeCase: (obj) => {
      return Object.keys(obj).reduce((acc, key) => {
        const newKey = fileUploadHelper.trimHeading(key);
        acc[newKey] = obj[key];
        return acc;
      }, {});
    },
    trimHeading: (text) => text.trim().replace(/\s+/g, "_").toLowerCase(),
    generateTableColumns: (headingArray, incorrectBuyerRows) => {
      let tableColumns = [];

      // Adding Row number
      tableColumns.push({
        title: "Row No.",
        dataIndex: "row_no",
        key: "row_no",
        width: 100,
        render: (value, record) => (
          <>
            <Typography.Text type={record.error ? "danger" : ""}>{value}</Typography.Text>
          </>
        )
      });

      // Sheet Columns
      headingArray.forEach((heading) => {
        tableColumns.push({
          title: heading,
          dataIndex: fileUploadHelper.trimHeading(heading),
          key: fileUploadHelper.trimHeading(heading),
          render: (value, record) => (
            <Typography.Text type={record.error ? "danger" : ""}>{value}</Typography.Text>
          )
        });
      });

      // Adding Error Column if any incorrect entry found...
      if (Object.keys(incorrectBuyerRows).length > 0) {
        tableColumns.push({
          title: "Error",
          dataIndex: "error",
          key: "error",
          render: (value, record) => (
            <Typography.Text type={record.error ? "danger" : ""}>{value}</Typography.Text>
          )
        });
      }

      return tableColumns;
    },
    isAnyRowCellEmpty: (columnName = "", records = []) => {
      let isUniform = true;
      let prevRow = records[0].__rowNum__; // assigning the first row number which has data

      if (records.length === 0) {
        return; // early return is sheet is empty...
      }

      if (prevRow !== 1) {
        return (isUniform = false); // early return is first row is empty...
      }

      // starting loop from 2nd row...
      for (let index = 1; index < records.length; index++) {
        const currentRow = records[index];

        // breaking loop if [ required column data is empty || if row is not in series ]
        if ((columnName && !currentRow[columnName]) || prevRow + 1 !== currentRow.__rowNum__) {
          isUniform = false;
          break;
        } else {
          prevRow = currentRow.__rowNum__;
        }
      }

      return isUniform;
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
      XLSX.writeFile(workbook, "Technicale-Core-Sample-Sheet.xlsx");
    } catch (error) {}
  };

  // reset all states and data on UI
  const handleReset = () => {
    setSelectedTab("technical");
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

  // Get  Technical Core Leaders
  const getTechnicalCoreLeaders = (associateBuyers) => {
    const distNumbers = {};
    Object.entries(associateBuyers).forEach(([key, value]) => {
      distNumbers[key] = value?.associate_buyer?.toString();
    });

    // Create API request
    let request = {
      dist_nums: distNumbers,
      dist_type: selectedTab.charAt(0).toUpperCase() // "T" for techical, and "R" fir royalty.
    };

    // Call Mutation
    setShowSpin(true);
    setModalVisible(false); // close modal
    getTechnicalCoreLeadersMutate({ request: request, firstRecord: allRecords[0] });
  };

  const { mutate: getTechnicalCoreLeadersMutate } = useMutation(
    (request) => apiService.getTechnicalCoreLeaders(request.request),
    {
      // Update confirmation
      onSuccess: ({ data, success }) => {
        if (success) {
          setFilteredData(null);
          setShowSpin(false); // stop spinning
          setShowResults(true); // show table
          if (Array.isArray(data)) {
            let result = data.map((record, index) => {
              return { serial_number: index + 1, ...record };
            });
            setDataSource(result || []); // set records
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
          <Title level={4}>{"Technical Core Leaders"}</Title>
          <Typography.Text style={StyleSheet.fontSize14}>
            <Typography.Text type="secondary">{"Lists /"}</Typography.Text> {`Technical Core List`}
          </Typography.Text>
        </Flex>
      </Col>
      <Col span={24}>
        <Card>
          <Row gutter={[0, 24]}>
            <Col span={24}>
              <Flex gap={12} align="center" justify="space-between">
                <Flex gap={12} align="center">
                  <Text strong> Search By :</Text>
                  <Radio.Group
                    disabled={showResults}
                    block
                    options={searchByOptions}
                    value={selectedTab}
                    onChange={(e) => setSelectedTab(e.target.value)}
                    optionType="button"
                  />
                </Flex>
                {showResults && (
                  <Button icon={<RedoOutlined />} size="small" onClick={handleReset} type="link">
                    <Link strong>Reset</Link>
                  </Button>
                )}
              </Flex>
            </Col>
            <Col span={24}>
              <Row gutter={[0, 12]}>
                <Col span={24}>
                  <Flex gap={16} justify="space-between" vertical={uploadFile?.name && showResults}>
                    <Text> Upload Excel File with column heading “Associate Buyer”</Text>
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
            onClick={() => getTechnicalCoreLeaders(sheetRows)}>
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
            fileName={selectedTab === "technical" ? "technical-core-list" : "royalty-core-list"}
          />
        </Col>
      )}
    </Row>
  ) : (
    <></>
  );
};

export default TechnicalCoreList;
