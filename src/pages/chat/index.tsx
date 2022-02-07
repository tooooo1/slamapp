import type { NextPage } from "next";
import React from "react";
import { useNavigationContext } from "@contexts/hooks";
import { withRouteGuard } from "@hocs/.";

const ChatroomListPage: NextPage = () => {
  const { useMountPage } = useNavigationContext();
  useMountPage((page) => page.CHATROOM);

  return <div>Chatroom List Page</div>;
};

export default withRouteGuard("private", ChatroomListPage);
