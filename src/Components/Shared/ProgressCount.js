/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from "react";
import { NativeEventSource, EventSourcePolyfill } from "event-source-polyfill";

const EventSource = NativeEventSource || EventSourcePolyfill;
// OR: may also need to set as global property
global.EventSource = NativeEventSource || EventSourcePolyfill;
const ProgressCount = (props) => {
  const { setPercentageCountLoading } = props;
  const [progress, setProgres] = useState(2);

  useEffect(() => {
    // Initialize the incremental value

    const localRandomId = localStorage.getItem("randomId");
    const eventSource = new EventSourcePolyfill(
      `${process.env.REACT_APP_BASEAPI_URL}/generic/bulk-import-progress`
      // eventSourceInitDict,
    );
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      let parsedData = null;
      if (data?.message) {
        parsedData = JSON.parse(data?.message);
        if (parsedData.eventId == localRandomId) {
          if (parsedData.progress <= 100) {
            setProgres(parsedData.progress);
          }

          if (parsedData.progress == 100) {
            setTimeout(() => {
              setPercentageCountLoading(false);
            }, 2000);
          }
        }
      }
    };

    eventSource.onerror = (error) => {
      setPercentageCountLoading(false);
    };
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <>
      <div className="progress">
        <div
          className="progress-done"
          style={{
            opacity: 1,
            width: `${parseInt(progress.toString())}%`
          }}>
          {parseInt(progress.toString())}%
        </div>
      </div>
    </>
  );
};

export default ProgressCount;
