'use server';

import { supabaseServerClient } from '@/supabase/supabaseServer';
import { getUserData } from './get-user-data';

export const createChannel = async ({
  name,
  workspaceId,
  userId,
}: {
  workspaceId: string;
  name: string;
  userId: string;
}) => {
  const supabase = await supabaseServerClient();
  const userData = await getUserData();

  if (!userData) {
    return { error: 'No user data' };
  }

  const { error, data: channelRecord } = await supabase
    .from('channels')
    .insert({
      name,
      user_id: userId,
      workspace_id: workspaceId,
    })
    .select('*');

  if (error) {
    return { error: error.message || 'Insert Error' }; // Provide actual error message
  }

  try {
    // Run all updates concurrently
    const [updateChannelMembersData, updateChannelMembersError] = await updateChannelMembers(channelRecord[0].id, userId);
    if (updateChannelMembersError) throw new Error(updateChannelMembersError.message || 'Update members channel error');

    const [addChannelToUserData, addChannelToUserError] = await addChannelToUser(userData.id, channelRecord[0].id);
    if (addChannelToUserError) throw new Error(addChannelToUserError.message || 'Add channel to user error');

    const [updateWorkspaceChannelData, updateWorkspaceChannelError] = await updateWorkspaceChannel(channelRecord[0].id, workspaceId);
    if (updateWorkspaceChannelError) throw new Error(updateWorkspaceChannelError.message || 'Update workspace channel error');

    return { data: channelRecord[0] }; // Return the created channel data on success

  } catch (error) {
    return { error: error.message || 'An unknown error occurred' };
  }
};

export const addChannelToUser = async (userId: string, channelId: string) => {
  const supabase = await supabaseServerClient();

  const { data: addChannelData, error: addChannelError } = await supabase.rpc('update_user_channels', {
    user_id: userId,
    channel_id: channelId,
  });

  return [addChannelData, addChannelError];
};

export const updateChannelMembers = async (channelId: string, userId: string) => {
  const supabase = await supabaseServerClient();

  const { data: updateChannelData, error: updateChannelError } = await supabase.rpc('update_channel_members', {
    new_member: userId,
    channel_id: channelId,
  });

  return [updateChannelData, updateChannelError];
};

const updateWorkspaceChannel = async (channelId: string, workspaceId: string) => {
  const supabase = await supabaseServerClient();

  const { data: updateWorkspaceData, error: updateWorkspaceError } = await supabase.rpc('add_channel_to_workspace', {
    channel_id: channelId,
    workspace_id: workspaceId,
  });

  return [updateWorkspaceData, updateWorkspaceError];
};

export const updateChannelRegulators = async (userId: string, channelId: string) => {
  const supabase = await supabaseServerClient();

  const { data: updateChannelData, error: updateChannelError } = await supabase.rpc('update_channel_regulators', {
    new_regulator: userId,
    channel_id: channelId,
  });

  return [updateChannelData, updateChannelError];
};
