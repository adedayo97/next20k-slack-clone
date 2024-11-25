import { getUserData } from "@/actions/get-user-data";
import { getUserWorkspaceChannels } from "@/actions/get-user-workspace-channels";
import { getCurrentWorkspaceData, getUserWorkspaceData } from "@/actions/workspaces";
import ChatGroup from "@/components/chat-group";
  
import { Workspace as UserWorkspace } from "@/types/app";
import { redirect } from "next/navigation";

const ChannelId = async ({
  params: asyncParams,
}: {
  params: Promise<{
    workspaceId: string;
    channelId: string;
  }>;
}) => {
  // Await params before destructuring
  const { workspaceId, channelId } = await asyncParams;

  const userData = await getUserData();

  if (!userData) return redirect('/auth');

  const [userWorkspaceData] = await getUserWorkspaceData(userData.workspaces!);

  const [currentWorkspaceData] = await getCurrentWorkspaceData(workspaceId);

  const userWorkspaceChannels = await getUserWorkspaceChannels(
    currentWorkspaceData?.id,
    userData.id
  );
  const currentChannelData = userWorkspaceChannels.find(channel => channel.id ===channelId);

  if (!currentChannelData) return redirect('/');

  return (
    <div className="hidden md:block">
      <ChatGroup 
        type="Channel" 
        userData={userData} 
        currentChannelData={currentChannelData}
        currentWorkspaceData={currentWorkspaceData}
        slug={workspaceId}
        chatId={channelId}
        userWorkspaceChannels={userWorkspaceChannels}
        socketUrl="/api/web-socket/messages"
        socketQuery={{
          channelId:currentChannelData.id, 
          workspaceId:currentWorkspaceData
        }}
        apiUrl="/api/messages"
        paramKey="channelId"
        paramValue={channelId}
        userWorkspaceData={userWorkspaceData as UserWorkspace[]}
      />
    </div>
  );
};

export default ChannelId;
