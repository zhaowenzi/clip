import { ClipboardRecord } from "@/types/clipboard";
import { Modal, Table } from "antd";
import type { TableProps } from "antd";
import { format, parseISO } from "date-fns";
import React, { useEffect, useRef, useState } from "react";

export default function Example() {
  const isInitialMount = useRef(true);
  const [records, setRecords] = useState<ClipboardRecord[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [page, setPage] = useState(1);
  const pageRef = useRef(page);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<string>();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const handleWindowResize = (size: number[]) => {
      console.log("size:", size);
      setWindowSize({ width: size[0], height: size[1] });
    };

    window.electron.ipcRenderer.on("window-resize", handleWindowResize);

    return () => {
      window.electron.ipcRenderer.removeListener(
        "window-resize",
        handleWindowResize
      );
    };
  }, []);

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const initialTotal = await window.electron.ipcRenderer.invoke(
          "get-clipboard-total"
        );
        setTotal(initialTotal);
      } catch (error) {
        console.log("Failed to fetch clipboard total:", error);
      }
    };

    const fetchRecords = async (page: number, pageSize: number) => {
      try {
        const initialRecords = await window.electron.ipcRenderer.invoke(
          "get-clipboard-contents",
          page,
          pageSize
        );
        setRecords(initialRecords);
      } catch (error) {
        console.error("Failed to fetch clipboard contents:", error);
      }
    };

    fetchRecords(page, pageSize);

    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchTotal();

      const handleClipboardChange = (record: ClipboardRecord) => {
        console.log("Clipboard content:", record);
        if (pageRef.current === 1) {
          setRecords((prevRecords) => {
            const updatedRecords = [record, ...prevRecords];
            return updatedRecords.slice(0, 10);
          });
        }

        setTotal((prevTotal) => prevTotal + 1);
      };

      window.electron.ipcRenderer.on(
        "clipboard-changed",
        handleClipboardChange
      );

      return () => {
        window.electron.ipcRenderer.removeListener(
          "clipboard-changed",
          handleClipboardChange
        );
      };
    }
  }, [page, pageSize]);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const showModal = (content: string) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePageChange = (page: number, pageSize: number) => {
    setPage(page);
  };

  const columns: TableProps<ClipboardRecord>["columns"] = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      render: (content: string) => (
        <div
          style={{ cursor: "pointer" }}
          onClick={() => {
            showModal(content);
          }}
        >
          {content}
        </div>
      ),
    },
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 200,
      render: (timestamp: string) => {
        const date = parseISO(timestamp);
        const formattedDate = format(date, "yyyy-MM-dd HH:mm:ss");
        return formattedDate;
      },
    },
  ];

  return (
    <>
      <Table
        pagination={{
          total: total,
          current: page,
          onChange: handlePageChange,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} items`,
        }}
        columns={columns}
        dataSource={records.map((record) => ({ ...record, key: record.id }))}
      ></Table>
      <Modal
        open={isModalOpen}
        footer={null}
        centered
        closable={false}
        onCancel={handleCancel}
        maskClosable={true}
        width="75%"
        styles={{
          body: {
            height: windowSize.height * 0.75,
            overflowY: "auto",
          },
        }}
      >
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {modalContent}
        </pre>
      </Modal>
    </>
  );
}
