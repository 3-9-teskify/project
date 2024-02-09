import Navbar from "./Navbar/Navbar";
import Sidebar from "./Sidebar/Sidebar";
import styles from "./BaseContainer.module.scss";
import classNames from "classnames/bind";
import { ReactNode, useEffect, useRef, useState } from "react";
import getDashBoards from "@/api/getDashBoards";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useIntersectionObserver } from "@/components/domains/dashboardid/utils/useIntersectionObserver";

const cx = classNames.bind(styles);

interface DashboardData {
  id: number;
  title: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  createdByMe: boolean;
  userId: number;
}

interface BaseContainerProps {
  currentPath: string;
  accessToken?: string;
  children: ReactNode;
}

export default function BaseContainer({ currentPath, accessToken, children }: BaseContainerProps) {
  const [isCreatedByMe, setIsCreatedByMe] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const bottomObserver = useRef<HTMLDivElement | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["dashboardList"],
    queryFn: ({ pageParam = 1 }) => getDashBoards("pagination", accessToken, 18, pageParam),
    initialPageParam: 1,
    getNextPageParam: () => {
      return currentPage + 1;
    },
  });

  const dashboardTotalCount = data?.pages[0].totalCount;
  const allDashboardDatas = data?.pages.flatMap(page => page.dashboards) ?? [];

  const fetchNextDashboard = () => {
    if (dashboardTotalCount === allDashboardDatas.length) return;

    if (!isFetchingNextPage && hasNextPage) {
      setCurrentPage(currentPage + 1);
      fetchNextPage();
    }
  };

  useIntersectionObserver(bottomObserver, fetchNextDashboard, { threshold: 0 });

  const [dashBoardTitle, setDashBoardTitle] = useState("");

  function handleChangeDashBoardTitle(selectedDashboard: DashboardData) {
    setDashBoardTitle(selectedDashboard.title);
    setIsCreatedByMe(selectedDashboard.createdByMe);
  }

  return (
    <div className={cx("grid")}>
      <div className={cx("grid-sidebar")}>
        <Sidebar
          handleChangeDashBoardTitle={handleChangeDashBoardTitle}
          dashboardDatas={allDashboardDatas}
          bottomObserver={bottomObserver}
        />
      </div>
      <div className={cx("grid-navbar")}>
        <Navbar
          currentPath={currentPath}
          dashBoardTitle={dashBoardTitle}
          isCreatedByMe={isCreatedByMe}
          dashboardTotalCount={dashboardTotalCount}
        />
      </div>
      <div className={cx("grid-content")}>{children}</div>
    </div>
  );
}
