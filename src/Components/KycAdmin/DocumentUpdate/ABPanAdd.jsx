import { Card, Row } from "antd";
import SearchByComponent from "Components/Shared/SearchByComponent";
import { useServices } from "Hooks/ServicesContext";
import React, { useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";

import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { enqueueSnackbar } from "notistack";
import { PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";

import { actionsPermissionValidator, hasEditPermission } from "Helpers/ats.helper";
import ABBasicDetails from "../AssociateBuyers/ABBasicDetails";
import UserProfileCard from "../UserProfileCard";
import InfoModal from "../AssociateBuyers/Shared/InfoModal";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";

const ABPanAdd = () => {
  const [searchPayload, setSearchPayload] = useState(null);
  const { apiService } = useServices();
  const [modal, setModal] = useState(false);
  const [panImgFile, setPanImgfile] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [displayInfoModal, setDisplayInfoModal] = useState(false);
  const searchRef = useRef();

  const handlePanImgFile = (val) => {
    setPanImgfile(val);
  };

  // api for fetching ab details by pan no
  const { data: fetchData, isLoading } = useQuery(
    ["fetchAbDetailsByAbNo", searchPayload],
    () => apiService.getDocUpdateAbDetailsByAbNo(searchPayload),
    {
      enabled: !!searchPayload, // Fetch only when payload is available
      select: (data) => {
        if (data?.data) {
          const {
            dist_no,
            dist_name,
            father_name,
            member_since,
            personal_details: { gender, marital_status, spouse_name },
            docs = [],
            proposer,
            proposer_name,
            sponsor,
            sponsor_name
          } = data?.data || {};

          return {
            card_data: {
              dist_no,
              dist_name,
              member_since,
              doc_path: docs?.[0]?.doc_path || ""
            },
            basic_details: {
              gender: gender == "M" ? "Male" : gender == "F" ? "Female" : gender,
              marital_status,
              father_husband_name:
                gender == "M"
                  ? father_name
                  : marital_status == "married"
                    ? spouse_name
                    : father_name,

              spouse_name: marital_status == "married" ? spouse_name : "N/A",
              proposer_number: proposer,
              proposer_name,
              sponsor_number: sponsor,
              sponsor_name
            }
          };
        } else {
          return {};
        }
      },
      onSuccess: (data) => {
        if (data?.card_data?.dist_no) {
          setShowDashboard(true); // show dashboard
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // handle modal fn
  const handleModal = (val) => {
    setModal(val);
  };

  // handle search click
  const handleSearchClick = (val) => {
    try {
      if (val) {
        const payload = {
          dist_no: val
        };
        setSearchPayload(payload);
      }
    } catch (error) {}
  };

  // handle search change / search clear
  const handleClear = () => {
    //
  };

  // on back click
  const onBackClick = () => {
    if (searchRef.current) {
      searchRef.current.resetFields(); // this will clear the search box
      setShowDashboard(false); //hide dashboard
      setSearchPayload(null);
    }
  };

  // api for add pan details
  const { mutate, loadingSubmission } = useMutation(
    "mutateAddPanDetails",
    (data) => apiService.addPanDetails(data),
    {
      onSuccess: (res) => {
        if (res?.success) {
          enqueueSnackbar(res.message, snackBarSuccessConf);
          handleModal(false);
          setSearchPayload(null);
          handlePanImgFile(null);
        }
      },
      onError: (error) => {
        //
        setDisplayInfoModal(false); // TO DO
      }
    }
  );

  // handle final submission
  const finalSubmit = (data) => {
    try {
      const formData = new FormData();
      formData.append("dist_no", searchPayload?.dist_no);
      panImgFile instanceof File && formData.append("pan_proof", panImgFile);
      formData.append("pan_no", data?.pan_no);
      mutate(formData); // api call
    } catch (error) {}
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <SearchByComponent
        moduleName={"ab_pan_add"}
        handleSearchClick={handleSearchClick}
        handleClear={handleClear}
        searchLoading={isLoading}
        searchInputField={true}
        ref={searchRef}
      />

      <Row gutter={[20, 24]}>
        {showDashboard && fetchData ? (
          <Card className="fullWidth marginTop24">
            <UserProfileCard moduleType={"pan-number"} userDetails={fetchData?.card_data} />
            <ABBasicDetails
              data={fetchData}
              module={"AB PAN Add"}
              danger={false}
              finalSubmit={finalSubmit}
              loadingSubmission={loadingSubmission}
              modal={modal}
              handleModal={handleModal}
              panDetails={true}
              handlePanImgFile={handlePanImgFile}
              onBackClick={onBackClick}
              hasActionPermission={hasEditPermission()}
            />
          </Card>
        ) : (
          <SearchByFallbackComponent
            title={"Search by Associate Buyer Number / Reference Number"}
            subTitle={
              "Quickly Search by Associate Buyer Number / Reference Number to process the Associate Buyer PAN update details."
            }
            image={searchByIcon}
          />
        )}
      </Row>

      {displayInfoModal && <InfoModal />}
    </>
  ) : (
    <></>
  );
};

export default ABPanAdd;
