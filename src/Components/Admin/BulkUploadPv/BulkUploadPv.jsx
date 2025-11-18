/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Alert, Button, Col, Flex, Image, Modal, Row, Spin, Table, Tag, Tooltip } from "antd";
import Dragger from "antd/es/upload/Dragger";
import {
  DownloadOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  UploadOutlined
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import {
  bulkUploadSampleData,
  snackBarErrorConf,
  snackBarSuccessConf,
  URL_VALIDATION_REGEX
} from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import { findIndex, isEmpty, set } from "lodash";
import { TextTruncate } from "Helpers/ats.helper";
import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import ProgressCount from "Components/Shared/ProgressCount";

const BulkUpload = (props) => {
  const { setBreadCrumb } = useUserContext();
  const [showBulkUploadModel, setshowBulkUploadModel] = useState(true);
  const [showType, setShowType] = useState("bulk_upload");
  const [dataSource, setDataSource] = useState([]);
  const [columns, setcolumns] = useState([]);
  const [recordFile, setrecordFile] = useState(null);
  const { apiService } = useServices();
  const [validFile, setvalidFile] = useState(false);
  const [showSpin, setshowSpin] = useState(false);
  const [percentageCountLoading, setPercentageCountLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ["5", "10", "20", "50", "100"],
    onShowSizeChange: (current, size) => {
      setPagination((prevPagination) => ({ ...prevPagination, pageSize: size }));
    }
  });

  /**
   * UseEffect function to set breadcrumb
   */
  useEffect(() => {
    setBreadCrumb({
      title: "Bulk Update PV",
      icon: "category",
      path: Paths.bulkUploadPv
    });
  }, []);

  const config = {
    name: "file",
    accept: ".xlsx, .csv, .xls",
    maxCount: 1,
    // onChange(info) {
    // },
    beforeUpload(file, fileList) {
      handlefile(file);
    }
  };

  // this method used to handel file after choose
  const handlefile = (file) => {
    try {
      if (
        checkFileExtension(file.name, "csv") ||
        checkFileExtension(file.name, "xlsx") ||
        checkFileExtension(file.name, "xls")
      ) {
        fileReader(file);
      } else {
        enqueueSnackbar("Invalid file. Accept only xlsx, xls, CSV", snackBarErrorConf);
      }
    } catch (error) { }
  };

  // This method used to check file extension
  const checkFileExtension = (filename, extension) => {
    const regex = new RegExp("\\." + extension + "$", "i");
    return regex.test(filename);
  };
  // This method used to parse file data
  const fileReader = (eFile) => {
    try {
      const file = eFile;
      if (file) {
        setshowSpin(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = e.target.result;
          const workbook = XLSX.read(data, {
            type: "binary"
            // cellDates: true
          });

          const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
          const worksheet = workbook.Sheets[sheetName];
          // Assuming the data starts from A2 (skip the header)
          const records = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: "" }); //{  header: 1, range: 1 }
          // Assuming the data starts from A2 (skip the header)
          // eslint-disable-next-line no-unused-vars
          const rLength = records.length;
          const maxSize = 4 * 1024 * 1024; // 4MB in bytes
          if (rLength === 0) {
            return enqueueSnackbar("No records found in sheet", snackBarErrorConf);
          } else if (rLength > 4000) {
            setshowSpin(false);
            return enqueueSnackbar("Allow only 4000 records at once", snackBarErrorConf);
          } else if (file.size > maxSize) {
            return enqueueSnackbar("Allow only max 4MB file", snackBarErrorConf);
          } else {
            setrecordFile(file);

            const columns = await generateColumn(records);
            setcolumns(columns);

            const res = await dataValidation(records);

            setShowType("show_list");
            const recData = await checkData(res.records, true);

            setvalidFile(!recData.isValid);
            setDataSource(recData.nodes);
            setshowSpin(false);
          }
        };
        reader.readAsBinaryString(file);
      }
    } catch (error) {
      console.log(error);
      setshowSpin(false);
    }
  };

  // This function is used to generate columns dynamically
  const generateColumn = (records) => {
    let column = [];
    return new Promise((resolve, reject) => {
      try {
        if (records?.length) {
          let keys = Object.keys(records[0]);

          keys.forEach((i, k) => {
            if (i == "SAP Code") {
              column.push({
                title: i,
                dataIndex: i,
                key: i,
                render: (value, record) => renderData(record, i)
              });
              column.push(Table.EXPAND_COLUMN);
            } else {
              column.push({
                title: i,
                dataIndex: i,
                //sorter: (a, b) => a["Type"].localeCompare(b["Type"]),
                key: i,
                render: (value, record) => renderData(record, i)
              });
            }

            resolve(column);
          });
        }
      } catch (error) {
        console.log(error, "Check error");

        resolve(column);
      }
    });
  };

  // this method used to check file validation
  const dataValidation = (records) => {
    return new Promise((resolve, reject) => {
      try {
        if (records?.length > 0) {
          dataValidationFn(records, 0, true, (res) => {
            resolve(res);
          });
        } else {
          resolve(records);
        }
      } catch (error) { }
    });
  };

  //this method used to handle file validation in recusrion
  const dataValidationFn = (records, i, isValid, fn) => {
    try {
      if (records?.[i]) {
        const rec = records?.[i];
        records[i]["errors"] = {};
        i++;
        dataValidationFn(records, i, isValid, fn);
      } else {
        fn({ records, isValid: isValid });
      }
    } catch (error) {
      fn({ records, isValid: isValid });
    }
  };

  // Iterate through data to find any errors and push it into error array
  const checkData = async (data, isValid) => {
    try {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        let nodes = [];
        let sapCodes = [];
        for (let i = 0; i < data.length; i++) {
          let d = data[i];
          console.log('d["Purchase Volume"]', d["Purchase Volume"])
          let errors = {};
          if (
            !d["Purchase Volume"] ||
            isEmpty(d["Purchase Volume"]) ||
            (d["Purchase Volume"] && parseFloat(d["Purchase Volume"]) <= 0) ||
            isNaN(+d[["Purchase Volume"]])
          ) {
            isValid = false;
            errors["Purchase Volume"] =
              "Purchase Volume must be a number and cannot be empty or zero";
          }

          if (d?.["Purchase Volume"] && d["Purchase Volume"]?.length > 8) {
            isValid = false;
            errors["Purchase Volume"] = "Purchase Volume should be less than or equal to 8 digits";
          }


          if (
            !d["SAP Code"] ||
            isEmpty(d["SAP Code"]) ||
            (d["SAP Code"] && parseInt(d["SAP Code"]) < 1) ||
            isNaN(+d[["SAP Code"]]) ||
            sapCodes.includes(d["SAP Code"])
          ) {
            isValid = false;
            errors["SAP Code"] = "SAP Code must be a unique number and cannot be empty or zero";
          }

          sapCodes.push(d["SAP Code"]);
          if (Object.keys(errors).length > 0) {
            isValid = false;

            if (Object.keys(errors).includes("SAP Code")) {
              errors["SAP Code"] = "SAP Code must be a unique number and cannot be empty or zero";
            }
          }

          d["errors"] = errors;
          nodes.push({
            ...d,
            key: d["SAP Code"] + i
          });

          if (i == data.length - 1) {
            resolve({ nodes, isValid: isValid });
          }
        }
      });
    } catch (error) { }
  };

  // this method used to manupulate item data in loop and sho the error
  const itemdata = (item, value) => {
    return (
      <>
        {value == "Action" &&
          (item["Type"] == "Master" || item["Type"] == "master") &&
          item["statePrice"]?.length > 0 ? (
          <span>
            {item[value] && TextTruncate(item[value], 30, true)}&nbsp;
            <Tag color={"default"} key={"Price"}>
              <a href="jsvascript:void(0)">{"Check State Price"}</a>
            </Tag>
          </span>
        ) : (
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            {item?.errors && Object.keys(item.errors).length > 0 && item?.errors?.[value] ? (
              <>
                <span style={{ color: "#BB0A1E" }}>
                  {item[value] && TextTruncate(item[value], 30, true)}
                </span>
              </>
            ) : (
              <>
                <span>{item[value] && TextTruncate(item[value], 30, true)}</span>
              </>
            )}
            {item?.errors && Object.keys(item.errors).length > 0 && item?.errors?.[value] && (
              <>
                <Tooltip placement="bottom" title={item?.errors?.[value]} color={"#BB0A1E"}>
                  <span>
                    <InfoCircleOutlined />
                  </span>
                </Tooltip>
              </>
            )}
          </div>
        )}
      </>
    );
  };

  // this method used to replace render function in column
  const renderData = (record, value) => ({
    props: {
      style:
        record?.errors && Object.keys(record.errors).length > 0 && record?.errors?.[value]
          ? { background: "#fcf3f4", color: "#BB0A1E", fontSize: "16px" }
          : {}
    },
    children: itemdata(record, value)
  });

  // Function to determine row class name based on age
  const getRowClassName = (record, index) => {
    return record["Type"] == "Master" ? "parent-row" : "";
  };

  // this method used to download sample file
  const downloadSheet = () => {
    try {
      const data = bulkUploadSampleData;

      const ws = XLSX.utils.json_to_sheet(data);
      // Freeze the first row
      ws["!freeze"] = {
        xSplit: 0,
        ySplit: 1,
        topLeftCell: "A2",
        activePane: "bottomRight",
        state: "frozen"
      };

      const instructionData = [
        {
          "Column Name": "SAP Code",
          Description:
            "This is the unique SAP code assigned to the master product. It should be numeric. Please provide SAP Codes only for main and simple products. SAP Codes will not be updated for variant products ."
        },
        {
          "Column Name": "Purchase Volume",
          Description: "Enter the Purchase Volume for the SAP code. It will be a numeric value."
        }
      ];

      const ws3 = XLSX.utils.json_to_sheet(instructionData);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, ws, "Purchase Volume List");
      XLSX.utils.book_append_sheet(workbook, ws3, "Instructions");
      XLSX.writeFile(workbook, "BulkUploadPV-Sample-sheet.xlsx");
    } catch (error) { }
  };

  //Function to generate the randomIds for eventId
  function generateRandomID() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomID = "";

    for (let i = 0; i < 7; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomID += characters.charAt(randomIndex);
    }

    return randomID;
  }

  // This method is used to trigger upload file function
  const sendFile = () => {
    try {
      setPercentageCountLoading(true);
      const randomId = generateRandomID();
      localStorage.setItem("randomId", randomId);
      let formData = new FormData();
      formData.append("bulk_file", recordFile);
      const deepList = JSON.parse(JSON.stringify(dataSource));
      // setDataSource([]);
      let obj = { load: formData, deepList: deepList, randomId: randomId };

      mutate(obj);
    } catch (error) { }
  };

  // UseMutation hook for creating a new Category via API
  const { mutate, isLoading } = useMutation(
    // Mutation function to handle the API call for creating a new Category
    (data) => apiService.pvBulkUpload(data.load, data.randomId, true),
    {
      // Configuration options for the mutation
      onSuccess: (res, variables) => {
        if (res.success) {
          setPercentageCountLoading(false);
          enqueueSnackbar(res.message, snackBarSuccessConf);
        }
      },
      onError: (error, variables) => {
        if (error?.data?.length > 0) {
          setPercentageCountLoading(false);
          setDataSource(error.data);
        }
        // enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  const bulkUpload = (flag) => {
    setshowBulkUploadModel(flag);
  };

  return (
    <>
      {/* <Flex>
        <Alert
          message="Please provide SAP Codes only for main and simple products. SAP Codes will not be updated for variant products."
          banner
        />
      </Flex> */}
      <div
        style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
        className="tableBorder mt-30">
        {showType == "show_list" && (
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            bordered={true}
            scroll={{ x: "max-content" }}
            rowClassName={getRowClassName}
          />
        )}

        {showType == "bulk_upload" && (
          <>
            <Row gutter={[0, 20]}>
              <Col span={24}>
                <Flex justify={"space-between"} width="100%">
                  <span>
                    <InfoCircleOutlined /> Allow only .xlsx, .xls & .csv file type
                  </span>
                  <Button type="primary" onClick={downloadSheet} icon={<DownloadOutlined />}>
                    Download Sample Sheet
                  </Button>
                </Flex>
              </Col>
              {showSpin ? (
                <>
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
                </>
              ) : (
                <Col span={24}>
                  <Dragger {...config}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>

                    <p className="ant-upload-hint">
                      Support for a single upload. Strictly prohibited from uploading company data
                      or other banned files.
                    </p>
                  </Dragger>
                </Col>
              )}
            </Row>
          </>
        )}
      </div>

      {showType == "show_list" && (
        <>
          <Button key="back" onClick={() => setShowType("bulk_upload")} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className="ml-8"
            key="submit"
            type="primary"
            onClick={sendFile}
            loading={isLoading}
            disabled={isLoading || validFile}>
            <UploadOutlined /> Import
          </Button>
        </>
      )}
      <>
        {percentageCountLoading ? (
          <Modal
            title="Upload Progress"
            centered
            open={true}
            closable={false}
            width={700}
            footer={false}>
            <>
              <Flex justify="center" align="middle" style={{ height: "100%" }}>
                <ProgressCount setPercentageCountLoading={setPercentageCountLoading} />
              </Flex>
            </>
          </Modal>
        ) : (
          <></>
        )}
      </>
    </>
  );
};

export default BulkUpload;
