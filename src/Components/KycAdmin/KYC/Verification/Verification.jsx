import { Button, Flex, Form, Modal, Spin, Tag, Typography } from "antd";
import React, { useState } from "react";
import { useReducer } from "react";
import { useMutation, useQuery } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { useEffect } from "react";
import dayjs from "dayjs";
import {
  actionsPermissionValidator,
  getDateTimeFormat,
  hasEditPermission,
  modifyCustomerResponse,
  safeString
} from "Helpers/ats.helper";
import { ChooseLeadForVerification } from "./ChooseLeadForVerification";
import { UserVerification } from "./UserVerification";
import { NoLeadAssigned } from "./NoLeadAssigned";
import { PermissionAction } from "Helpers/ats.constants";

const initialState = {
  hasKYC: false,
  KYCLeads: [],
  filteredKYCLeads: [],
  assignedUserKYC: null,
  showFilterCard: false,
  filterCount: 0,
  statusesFilter: [],
  assignedLeadNumber: null,
  showLeadAssignedModal: false
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_HAS_KYC":
      return { ...state, hasKYC: action.payload };
    case "SET_KYC_LEADS":
      return { ...state, KYCLeads: action.payload };
    case "SET_FILTERED_KYC_LEADS":
      return { ...state, filteredKYCLeads: action.payload };
    case "SET_ASSIGNED_USER_KYC":
      return { ...state, assignedUserKYC: action.payload };
    case "SET_SHOW_FILTER_CARD":
      return { ...state, showFilterCard: action.payload };
    case "SET_FILTER_COUNT":
      return { ...state, filterCount: action.payload };
    case "SET_STATUSES_FILTER":
      return { ...state, statusesFilter: action.payload };
    case "SET_ASSIGNED_LEAD_NUMBER":
      return { ...state, assignedLeadNumber: action.payload };
    case "SET_SHOW_LEAD_ASSIGNED_MODAL":
      return { ...state, showLeadAssignedModal: action.payload };
    default:
      return state;
  }
};

const Verification = () => {
  // States
  const [state, dispatch] = useReducer(reducer, initialState);
  const [datePayload, setDatePayload] = useState(null);
  const [filterForm] = Form.useForm(); // Form instance for filter form
  const { apiService } = useServices();

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

  // Table Columns
  const columns = [
    {
      title: "Sr. No.",
      dataIndex: "sr_no",
      key: "sr_no",
      sorter: (a, b) => a.sr_no - b.sr_no,
      render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
    },
    {
      title: "Join Date & Time",
      dataIndex: "join_date_and_time",
      key: "join_date_and_time",
      sorter: (a, b) =>
        new Date(a?.join_date_and_time)?.getTime() - new Date(b?.join_date_and_time)?.getTime(),
      render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
    },
    {
      title: "Associate Buyer No.",
      dataIndex: "associate_buyer_no",
      key: "associate_buyer_no",
      sorter: (a, b) => Number(a?.associate_buyer_no) - Number(b?.associate_buyer_no),
      render: (text, field) => (
        <>
          {field?.feedback_status === "pending" ? (
            <Typography.Text
              underline
              strong
              className="color-primary cursorPointer"
              onClick={() => {
                fetchAssignedKYCDetails(field?.associate_buyer_no);
              }}>
              {text ?? "-"}
            </Typography.Text>
          ) : (
            <Typography.Text>{text ?? "-"}</Typography.Text>
          )}
        </>
      )
    },
    {
      title: "AB Name",
      dataIndex: "associate_buyer_name",
      key: "associate_buyer_name",
      sorter: (a, b) =>
        safeString(a.associate_buyer_name).localeCompare(safeString(b.associate_buyer_name)),
      render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
    },
    {
      title: "User Name",
      dataIndex: "user_name",
      key: "user_name",
      sorter: (a, b) => safeString(a.user_name).localeCompare(safeString(b.user_name)),
      render: (text) => <Typography.Text>{text}</Typography.Text>
    },
    {
      title: "Application Status",
      dataIndex: "feedback_status",
      key: "feedback_status",
      sorter: (a, b) => safeString(a.feedback_status).localeCompare(safeString(b.feedback_status)),
      render: (text, field) => (
        <>
          {text === "pending" ? (
            <Flex gap={8}>
              <Tag color="blue">In Progress</Tag>
              <Button
                size="small"
                type="primary"
                onClick={() => {
                  fetchAssignedKYCDetails(field?.associate_buyer_no);
                }}>
                Review
              </Button>
            </Flex>
          ) : text === "approved" ? (
            <Tag color="green">Verified</Tag>
          ) : text === "rejected" ? (
            <Tag color="red">Rejected</Tag>
          ) : (
            <Typography.Text>{text ?? "-"}</Typography.Text>
          )}
        </>
      )
    }
  ];

  // Clear all reducer states on component unmount
  useEffect(() => {
    return () => {
      resetReducerStates();
    };
  }, []);

  const resetReducerStates = () => {
    filterForm.resetFields(); // Reset the filter form fields
    dispatch({ type: "SET_FILTER_COUNT", payload: 0 }); // Reset the status filter
    dispatch({ type: "SET_STATUSES_FILTER", payload: [] }); // Reset the status filter
    dispatch({ type: "SET_FILTERED_KYC_LEADS", payload: [] }); // Reset the status filter
    dispatch({ type: "SET_KYC_LEADS", payload: [] }); // Reset the status filter
    dispatch({ type: "SET_SHOW_FILTER_CARD", payload: false }); // close the filter card
    dispatch({ type: "SET_ASSIGNED_USER_KYC", payload: null });
    dispatch({ type: "SET_ASSIGNED_LEAD_NUMBER", payload: null });
    dispatch({ type: "SET_SHOW_LEAD_ASSIGNED_MODAL", payload: false });
  };

  const resetAllFilter = () => {
    resetReducerStates(); // reset all states
    fetchTodayKYCLeads(); // Fetch today's KYC leads again
    refetchLeads(); // Fetch today's KYC leads again
  };

  // Trigger on Apply filter button click
  const applyFilter = () => {
    const { date, status } = filterForm.getFieldsValue() || {}; // Get values from the filter form

    // Set the status filter in the state
    dispatch({ type: "SET_STATUSES_FILTER", payload: status ?? [] });

    // Set the filter count in the state
    let count = 0;
    date && count++;
    status?.length > 0 && count++;
    dispatch({ type: "SET_FILTER_COUNT", payload: count });

    // If Date is selected
    if (date) {
      const range = {
        start_date: dayjs(date).format("YYYY-MM-DD"),
        end_date: dayjs(date).add(1, "day").format("YYYY-MM-DD")
      };
      // Make API call with date range
      setDatePayload(range);
    }

    // close the filter card
    dispatch({ type: "SET_SHOW_FILTER_CARD", payload: false });
  };

  // handle Search
  const handleSearch = (value) => {
    try {
      dispatch({ type: "SET_SHOW_FILTER_CARD", payload: false }); // close the filter card

      //allowed keys for search
      const allowedKeys = ["associate_buyer_name", "associate_buyer_no", "user_name"];
      const filterTable =
        state.KYCLeads.length > 0 &&
        state.KYCLeads.filter((o) =>
          Object.keys(o).some((k) => {
            // Check if the key matches any of the specified columns and if the value contains the search text
            if (
              allowedKeys.includes(k) &&
              String(o[k])?.toLowerCase().includes(String(value)?.toLowerCase())
            ) {
              return true;
            }

            return false;
          })
        );

      dispatch({ type: "SET_FILTERED_KYC_LEADS", payload: filterTable }); // Set the filtered KYC leads in the state
    } catch (error) {
      // Handle error
      console.log(error);
    }
  };

  // function to handle search on key down or backspace
  const handleKeyDown = (e) => {
    dispatch({ type: "SET_SHOW_FILTER_CARD", payload: false }); // close the filter card

    if (e.nativeEvent.inputType === "deleteContentBackward") {
      if (e.target?.value?.length === 0) {
        dispatch({
          type: "SET_STATUSES_FILTER",
          payload: [...state.statusesFilter]
        }); // Set the filtered KYC leads in the state
      }
    }
  };

  // Trigger on Status filter change
  useEffect(() => {
    if (state.statusesFilter?.length > 0) {
      const filteredLeads = state.KYCLeads.filter((lead) =>
        state.statusesFilter.includes(lead.feedback_status)
      );
      dispatch({ type: "SET_FILTERED_KYC_LEADS", payload: filteredLeads });
    } else {
      dispatch({ type: "SET_FILTERED_KYC_LEADS", payload: state.KYCLeads });
    }
  }, [state.KYCLeads, state.statusesFilter]);

  // Fetching KYC data using react-query
  const { isLoading: fetchingLeads, refetch: refetchLeads } = useQuery(
    ["getAssignedKYCToExecutive", datePayload],
    () => apiService.getAssignedKYCToExecutive(datePayload),
    {
      enabled: !!datePayload,
      onSuccess: (data) => {
        if (data?.success && data?.data?.length > 0) {
          const sortedList = data.data.sort(
            (a, b) => parseInt(b?.associate_buyer_no || 0) - parseInt(a?.associate_buyer_no || 0)
          ); // reversing the order of leads

          // adding serial number to each lead
          const leadsWithSerialNo = sortedList.map((lead, index) => ({
            sr_no: index + 1,
            ...lead,
            join_date_and_time: getDateTimeFormat(lead.join_date_and_time)
          }));

          dispatch({ type: "SET_KYC_LEADS", payload: leadsWithSerialNo }); // setting the KYC leads
          dispatch({ type: "SET_HAS_KYC", payload: true }); // setting hasKYC to true
        } else {
          dispatch({ type: "SET_KYC_LEADS", payload: [] }); // setting the KYC leads
        }
      },
      onError: (error) => {
        filterForm.resetFields(); // Reset the filter form fields
        dispatch({ type: "SET_FILTER_COUNT", payload: 0 }); // Reset the status filter
        dispatch({ type: "SET_SHOW_FILTER_CARD", payload: false }); // close the filter card
        fetchTodayKYCLeads(); // Fetch today's KYC leads again
      }
    }
  );

  // Fetching assigned KYC lead Details by dist number
  const { mutate: fetchAssignedKYCDetails, isLoading: fetchingAssignedKYC } = useMutation(
    (distNumber) =>
      apiService.getAbDetailsForExecutiveReview({
        dist_no: distNumber
      }),
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          dispatch({ type: "SET_ASSIGNED_USER_KYC", payload: modifyCustomerResponse(data.data) });
        }
      },
      onError: (error) => {
        dispatch({ type: "SET_ASSIGNED_USER_KYC", payload: null });
        fetchTodayKYCLeads();
        refetchLeads();
      }
    }
  );

  // Mutation to assign new KYC to executive - trigger on GET KYC button click
  const { mutate: assignNewKYCToExecutive, isLoading: assigningKYC } = useMutation(
    () => apiService.assignNewKYCToExecutive(),
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          // If KYC Assignment is successful, update the state
          dispatch({ type: "SET_HAS_KYC", payload: true }); // setting hasKYC to true

          // set the lead assigned number and open modal popup
          dispatch({ type: "SET_ASSIGNED_LEAD_NUMBER", payload: data.data });
          dispatch({ type: "SET_SHOW_LEAD_ASSIGNED_MODAL", payload: true });

          // Fetch the updated KYC leads again
          fetchTodayKYCLeads();
        } else {
          console.error("Failed to assign KYC:", data?.message);
        }
      },
      onError: (error) => {
        console.error("Error assigning KYC:", error);
        fetchTodayKYCLeads(); // Fetch today's KYC leads again
        refetchLeads(); // Fetch today's KYC leads again
      }
    }
  );

  // Handle after KYC update action
  const handleAfterUpdate = async (proceedToNext) => {
    // If user chooses to proceed to the next lead
    if (proceedToNext) {
      assignNewKYCToExecutive();
      return;
    }

    // If the user chooses not to proceed to the next lead
    if (!proceedToNext) {
      // Resetting the assigned user KYC after update
      dispatch({ type: "SET_ASSIGNED_USER_KYC", payload: null });
      refetchLeads(); // Fetch today's KYC leads again
      return;
    }
  };

  // Fetch Today's KYC leads when the component mounts
  const fetchTodayKYCLeads = () => {
    const today = dayjs().format("YYYY-MM-DD");
    const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
    setDatePayload({
      start_date: today,
      end_date: tomorrow
    });
  };

  // Set the date payload only once when the component mounts
  useEffect(() => {
    if (!datePayload) {
      fetchTodayKYCLeads();
    }
  }, []);

  // Modal State

  const closeLeadAssignmentModal = () => {
    // close modal
    dispatch({ type: "SET_SHOW_LEAD_ASSIGNED_MODAL", payload: false });

    // set current user to null
    dispatch({ type: "SET_ASSIGNED_USER_KYC", payload: null });
    dispatch({ type: "SET_ASSIGNED_LEAD_NUMBER", payload: null });

    // get table list
    fetchTodayKYCLeads();
    refetchLeads();
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={fetchingLeads || assigningKYC || fetchingAssignedKYC}>
      <Flex gap={12} vertical>
        <div></div>
        <Flex gap={24} vertical>
          {/* ------------- Title & Breadcrumbs ------------- */}
          <Flex justify="space-between" vertical gap={8}>
            <Typography.Title level={4} className="removeMargin">
              Get KYC
            </Typography.Title>
            <Typography.Text className="removeMargin">
              <Typography.Text type="secondary">KYC /</Typography.Text> Verification
            </Typography.Text>
          </Flex>

          {/* ------------- User have selected Lead for KYC Verification ------------- */}
          {state.assignedUserKYC && state.hasKYC && (
            <UserVerification
              ABDetails={state.assignedUserKYC}
              handleAfterUpdate={handleAfterUpdate}
              handleBack={resetAllFilter}
              hasActionPermission={hasEditPermission()}
            />
          )}

          {/* ------------- User haven't selected the lead yet ------------- */}
          {state.hasKYC && !state.assignedUserKYC && (
            <ChooseLeadForVerification
              assignNewKYCToExecutive={assignNewKYCToExecutive}
              columns={columns}
              pagination={pagination}
              KYCLeads={state.filteredKYCLeads ? state.filteredKYCLeads : state.KYCLeads}
              allKYCLeads={state.KYCLeads}
              setDatePayload={setDatePayload}
              applyFilter={applyFilter}
              showFilterCard={state.showFilterCard}
              filterForm={filterForm}
              filterCount={state.filterCount}
              toggleFilterCard={() =>
                dispatch({ type: "SET_SHOW_FILTER_CARD", payload: !state.showFilterCard })
              }
              resetAllFilter={resetAllFilter}
              handleSearch={handleSearch}
              handleKeyDown={handleKeyDown}
            />
          )}

          {/* ------------- User don't have any leads assigned yet ------------- */}
          {!state.hasKYC && !state.assignedUserKYC && (
            <NoLeadAssigned assignNewKYCToExecutive={assignNewKYCToExecutive} />
          )}
        </Flex>
      </Flex>

      {/* Lead Assigned Modal */}
      <Modal
        title={"KYC Assignment"}
        onCancel={closeLeadAssignmentModal}
        cancelText="Close"
        open={state.showLeadAssignedModal && state.assignedLeadNumber}
        footer={null}>
        <Flex vertical gap={16} justify="center" align="center">
          <Typography.Title level={5} className="removeMargin">
            Congrats, A New KYC has been assigned to you!
          </Typography.Title>
          <Typography.Title level={5} className="removeMargin ">
            KYC Number -{" "}
            <Typography.Text
              style={{ fontSize: "var(--ant-font-size-heading-5)" }}
              className="color-primary">
              #{state.assignedLeadNumber}
            </Typography.Text>
          </Typography.Title>
          <Flex gap={12}>
            <Button size="large" onClick={closeLeadAssignmentModal}>
              Close
            </Button>
            <Button
              size="large"
              type="primary"
              onClick={() => {
                dispatch({ type: "SET_SHOW_LEAD_ASSIGNED_MODAL", payload: false });
                fetchAssignedKYCDetails(state.assignedLeadNumber);
              }}>
              Proceed
            </Button>
          </Flex>
        </Flex>
      </Modal>
    </Spin>
  ) : (
    <></>
  );
};

export default Verification;
