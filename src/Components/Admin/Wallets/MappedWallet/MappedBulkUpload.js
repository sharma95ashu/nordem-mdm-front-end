import React, { useState } from "react";
import { Button, Col, Flex, Modal, Pagination, Row, Spin, Table, Tooltip, message } from "antd";
import Dragger from "antd/es/upload/Dragger";
import { DownloadOutlined, InboxOutlined, InfoCircleOutlined, UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { snackBarErrorConf, snackBarSuccessConf, mappedSheetData } from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import { isEmpty } from "lodash";
import { TextTruncate } from "Helpers/ats.helper";
import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
// import ProgressCount from "./ProgressCount";
import dayjs from "dayjs";

const MappedBulkUpload = (props) => {
    const [showType, setShowType] = useState("bulk_upload");
    const [dataSource, setDataSource] = useState([]);
    const [dataSourceCopy, setdataSourceCopy] = useState([]);
    const [dataSourceCount, setdataSourceCount] = useState(0);
    const [columns, setcolumns] = useState([]);
    const [recordFile, setrecordFile] = useState(null);
    const { apiService } = useServices();
    const [validFile, setvalidFile] = useState(false);
    const [showSpin, setshowSpin] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const stylesheet = {
        tableStyle: {
            marginBottom: '10px'
        }
    }

    const onPageChange = (page, pageSize) => {
        setDataSource([]);
        setCurrentPage(page);
        let d = dataSourceCopy.slice((page - 1) * pageSize, page * pageSize);
        setTimeout(() => {
            setDataSource(d);
        }, 100);
    };

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

    // This method used to handel model
    const handelModel = (flag) => {
        try {
            props.setshowBulkUploadModel(flag);
        } catch (error) { }
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
                    let records = XLSX.utils.sheet_to_json(worksheet, { raw: true, defval: "" }); //{  header: 1, range: 1 }

                    const formatDate = (val) => {
                        let date = new Date(Number(new Date(1899, 11, 30)) + (val * 24 * 60 * 60 * 1000)).toLocaleDateString().split("/")
                        return `${date[1]}-${date[0]}-${date[2]}`;

                    }


                    // const formatDate = (val) => {
                    //     const excelBaseDate = new Date(1900, 0, 1); // January 1, 1900
                    //     const offset = (val - 1); // Subtracting 1 because Excel considers 1900 as a leap year
                    //     const calculatedDate = new Date(excelBaseDate.getTime() + offset * 24 * 60 * 60 * 1000);
                    //     return calculatedDate.toISOString().slice(0, 10).split("-").reverse().join("-");
                    // };


                    records = records.map(e => ({ ...e, 'Expiry Date of Balance': typeof e['Expiry Date of Balance'] === "number" ? formatDate(e['Expiry Date of Balance']) : e['Expiry Date of Balance'] }))



                    // For Second sheet
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

                        const expectedColumnTitles = [
                            "AB ID",
                            "Wallet Name",
                            "Balance Amount",
                            "Expiry Date of Balance",
                            "Show On"
                        ];

                        const actualColumnTitles = columns.map((col) => col.title);
                        const allTitlesMatch = expectedColumnTitles.every((title) =>
                            actualColumnTitles.includes(title)
                        );


                        if (!allTitlesMatch) {
                            // At least one expected column title is missing in the actual titles
                            message.error("Invalid File");
                            setshowSpin(false);
                            return false;
                        }

                        setcolumns(columns);
                        const parentMap = await getParentData(records);
                        const res = await dataValidation(records, parentMap);
                        setShowType("show_list");
                        const recData = await convertDataToTree(res.records, true);
                        setvalidFile(!recData.isValid);
                        setDataSource(
                            recData.nodes.slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        );
                        let deepCopy = JSON.parse(JSON.stringify(recData.nodes));
                        setdataSourceCopy(deepCopy);
                        setdataSourceCount(recData?.nodes?.length || 0);
                        setshowSpin(false);
                    }
                };
                reader.readAsBinaryString(file);
            }
        } catch (error) {
            // setshowSpin(false);
        }
    };

    // this function used to generate column dynamically
    const generateColumn = (records) => {
        let column = [];
        return new Promise((resolve, reject) => {
            try {
                if (records?.length) {
                    let keys = Object.keys(records[0]);
                    keys.forEach((i, k) => {
                        column.push({
                            title: i,
                            dataIndex: i,
                            //sorter: (a, b) => a["Type"].localeCompare(b["Type"]),
                            key: i,
                            render: (value, record) => renderData(record, i)
                        });

                        if (k == keys.length - 1) {
                            resolve(column);
                        }
                    });
                }
            } catch (error) {
                resolve(column);
            }
        });
    };

    // this method used to get parent data from record based on master key
    const getParentData = (records) => {
        return new Promise((resolve, reject) => {
            try {
                let parentMap = {};
                records.forEach((obj, k) => {
                    if (k == records.length - 1) {
                        resolve(parentMap);
                    }
                });
            } catch (error) {
                resolve({});
            }
        });
    };

    // this method used to check file validation
    const dataValidation = (records, parentMap) => {
        return new Promise((resolve, reject) => {
            try {
                if (records?.length > 0) {
                    dataValidationFn(records, 0, true, parentMap, (res) => {
                        resolve(res);
                    });
                } else {
                    resolve(records);
                }
            } catch (error) { }
        });
    };

    //this method used to handle file validation in recusrion
    const dataValidationFn = (records, i, isValid, parentMap, fn) => {
        try {
            if (records?.[i]) {
                const rec = records?.[i];
                records[i]["errors"] = {};
                let parent = rec.Parent; //rec.Parent ? parseInt(rec.Parent) : null;
                if (parent !== null && parentMap[parent]) {
                    // Copy missing fields from parent to variation
                    Object.keys(parentMap[parent]).forEach((key) => {
                        // eslint-disable-next-line no-prototype-builtins
                        if ((key !== "Parent" && !rec.hasOwnProperty(key)) || isEmpty(rec[key])) {
                            records[i][key] = parentMap[parent][key];
                        }
                    });
                }

                i++;
                dataValidationFn(records, i, isValid, parentMap, fn);
            } else {
                fn({ records, isValid: isValid });
            }
        } catch (error) {
            fn({ records, isValid: isValid });
        }
    };

    // Iterate through data to find top-level nodes
    const convertDataToTree = async (data, isValid) => {
        try {
            // eslint-disable-next-line no-async-promise-executor
            return new Promise(async (resolve, reject) => {
                let nodes = [];
                for (let i = 0; i < data.length; i++) {
                    let d = data[i];



                    if (isEmpty(d["Parent"])) {
                        // Date format check
                        const regex = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-\d{4}$/;
                        const formetCheck = regex.test(d["Expiry Date of Balance"]);
                        let expDate = new Date(d["Expiry Date of Balance"]);

                        // Past date check
                        let isBeforeToday = null;
                        let day = null;
                        let month = null;
                        let year = null;
                        if (formetCheck) {
                            day = d["Expiry Date of Balance"].split('-')[0] //.getDay();
                            month = d["Expiry Date of Balance"].split('-')[1]; //getMonth();
                            year = d["Expiry Date of Balance"].split('-')[2] //.getFullYear();
                            let today = new Date();
                            expDate = new Date(`${year}-${month}-${day}`)
                            let expiryDate = dayjs(`${year}-${month}-${day}`);
                            isBeforeToday = expiryDate.isBefore(dayjs(today), "day");
                        }




                        const no_special_character = (value) => {
                            let sp_regex = /^[0-9]*$/;
                            return sp_regex.test(value);
                        }


                        let ab_formetCheck = no_special_character(d["AB ID"]);
                        let balance_formetCheck = no_special_character(d["Balance Amount"]);


                        // My data error check start
                        if (!d["AB ID"] || isEmpty(d["AB ID"].toString()) || parseInt(d["AB ID"]) <= 0 || !ab_formetCheck) {
                            isValid = false;
                            d["errors"]["AB ID"] = "AB ID cannot be empty,zero or negative and only numbers are allowed";
                        }

                        if (!d["Balance Amount"] || isEmpty(d["Balance Amount"].toString()) || parseInt(d["Balance Amount"]) <= 0 || !balance_formetCheck) {
                            isValid = false;
                            d["errors"]["Balance Amount"] = "Balance amount cannot be empty,zero or negative and only numbers are allowed";
                        }

                        if (!d["Wallet Name"] || isEmpty(d["Wallet Name"].toString())) {
                            isValid = false;
                            d["errors"]["Wallet Name"] = "Field cannot be empty";
                        }

                        if (
                            !d["Expiry Date of Balance"] ||
                            isEmpty(d["Expiry Date of Balance"]) ||
                            isNaN(expDate) ||
                            isBeforeToday || !formetCheck
                        ) {
                            isValid = false;
                            d["errors"]["Expiry Date of Balance"] = (isNaN(expDate)) ? 'Invalid date format' : "Field cannot be empty or past date or invalid date";
                        }

                        nodes.push({
                            ...d,
                            key: d["AB ID"]
                        });
                    }

                    if (i == data.length - 1) {
                        resolve({ nodes, isValid: isValid });
                    }
                }
            });
        } catch (error) { }
    };

    // this method used to manupulate item data in loop and show the error
    const itemdata = (item, value) => {
        return (
            <>
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
            const data = mappedSheetData.mappedSheet;

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
                { 'Column Name': "AB ID", Description: "Enter the valid ID of the associate buyer." },
                { 'Column Name': "Wallet Name", Description: "Enter the correct wallet name assigned to the associate buyer." },
                { 'Column Name': "Balance Amount", Description: "Enter the wallet balance amount in numeric format." },
                {
                    'Column Name': "Expiry Date of Balance",
                    Description:
                        "This is expiry date of balance  and should be future date and Date format is 15-05-2026(DD-MM-YYYY)"
                },
                { 'Column Name': "Show On", Description: "This will be visible on Web (E-com), App (E-com) and PUC as per the selection of check boxes appearing in Show On section." }
            ];
            const ws3 = XLSX.utils.json_to_sheet(instructionData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, ws, "Wallet List");
            XLSX.utils.book_append_sheet(workbook, ws3, "Instructions");
            XLSX.writeFile(workbook, "Wallet-Sample-sheet.xlsx");
        } catch (error) { }
    };

    function generateRandomID() {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let randomID = "";

        for (let i = 0; i < 7; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomID += characters.charAt(randomIndex);
        }

        return randomID;
    }

    // this method used to trigger upload file function
    const sendFile = () => {
        try {
            props.setPercentageCountLoading(true);
            const randomId = generateRandomID();
            localStorage.setItem("randomId", randomId);
            let formData = new FormData();
            formData.append("bulk_file", recordFile);
            const deepList = JSON.parse(JSON.stringify(dataSourceCopy));
            // setDataSource([]);
            let obj = { load: formData, deepList: deepList, randomId: randomId };

            mutate(obj);
        } catch (error) { }
    };

    // UseMutation hook for creating a new Category via API
    const { mutate, isLoading } = useMutation(
        // Mutation function to handle the API call for creating a new Category
        (data) => apiService.uploadMappedBulkUploadFile(data.load, data.randomId, true),
        {
            // Configuration options for the mutation
            onSuccess: (res, variables) => {
                if (res.success) {
                    handelModel(false);
                    // props.setPercentageCountLoading(false)
                    props.recallMappedApi();
                    enqueueSnackbar("Mapped wallets uploaded successfully", snackBarSuccessConf);
                } else {
                    setListError(variables.deepList, res?.data, 0);
                }
                // props.setPercentageCountLoading(false)
            },
            onError: (error, variables) => {
                props.setPercentageCountLoading(false);
                setListError(variables.deepList, error?.data, 0);
                setCurrentPage(1);
                // Handle errors by displaying an error Snackbar notification
                // enqueueSnackbar(error.message, snackBarErrorConf);
            }
        }
    );

    // this method used to set list error
    const setListError = (lists, data, i) => {
        try {
            if (data?.[i]) {
                // const indx = data[i]['index'] - 2;
                const indx = data[i]["index"] - 1;

                if (lists[indx]) {
                    lists[indx]["errors"] = data[i]["errors"];
                }
                i++;
                setListError(lists, data, i);
            } else {
                setDataSource(lists.slice(0, 1 * pageSize));
                setdataSourceCopy(lists);
            }
        } catch (error) { }
    };

    return (
        <>
            <Modal
                title="Upload"
                centered
                open={true}
                // onChange={handleTableChange} // Correctly handle pagination change
                onOk={() => handelModel(false)}
                onCancel={() => handelModel(false)}
                footer={
                    showType == "show_list"
                        ? [
                            // <ProgressCount key="progresscount" />,
                            <Button
                                key="back"
                                onClick={() => handelModel(false)}
                                loading={isLoading}
                                disabled={isLoading}>
                                Cancel
                            </Button>,
                            <Button
                                key="submit"
                                type="primary"
                                onClick={sendFile}
                                loading={isLoading}
                                disabled={isLoading || validFile}>
                                <UploadOutlined /> Import
                            </Button>
                        ]
                        : ""
                }
                width={1000}>
                <>
                    <div style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
                        {showType == "show_list" && (
                            <>
                                <Table
                                    style={stylesheet.tableStyle}
                                    columns={columns}
                                    dataSource={dataSource}
                                    pagination={false}
                                    bordered={true}
                                    scroll={{ x: "max-content" }}
                                    rowClassName={getRowClassName}
                                />
                                <Pagination
                                    current={currentPage}
                                    total={dataSourceCount}
                                    defaultPageSize={pageSize}
                                    onChange={onPageChange}
                                    showSizeChanger
                                    pageSizeOptions={["5", "10", "20", "50", "100"]}
                                />
                            </>
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
                                                    Support for a single or bulk upload. Strictly prohibited from uploading
                                                    company data or other banned files.
                                                </p>
                                            </Dragger>
                                        </Col>
                                    )}
                                </Row>
                            </>
                        )}
                    </div>
                </>
            </Modal>
        </>
    );
};

export default MappedBulkUpload;
