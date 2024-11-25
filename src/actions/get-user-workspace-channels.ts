'use server';

import { supabaseServerClient } from '@/supabase/supabaseServer';
import { Channel } from '@/types/app';

export const getUserWorkspaceChannels = async (
  workspaceId: string,
  userId: string
): Promise<Channel[]> => {
  try {
    const supabase = await supabaseServerClient();

    // Fetch the workspace data to get associated channels
    const { data: workspaceData, error: workspaceError } = await supabase
      .from('workspaces')
      .select('channels')
      .eq('id', workspaceId)
      .single();

    // Enhanced error logging for workspace errors
    if (workspaceError) {
      console.error("Supabase workspace error:", {
        message: workspaceError.message,
        details: workspaceError.details,
        hint: workspaceError.hint,
        code: workspaceError.code,
      });
      return [];
    }

    const channelIds = workspaceData?.channels;

    if (!channelIds || channelIds.length === 0) {
      console.log('No channels found');
      return [];
    }

    // Fetch channel data based on channel IDs from the workspace
    const { data: channelsData, error: channelsError } = await supabase
      .from('channels')
      .select('*')
      .in('id', channelIds);

    // Enhanced error logging for channels errors
    if (channelsError) {
      console.error("Supabase channels error:", {
        message: channelsError.message,
        details: channelsError.details,
        hint: channelsError.hint,
        code: channelsError.code,
      });
      return [];
    }

    // Filter channels based on user membership
    const userWorkspaceChannels = channelsData.filter(channel =>
      channel.members.includes(userId)
    );

    return userWorkspaceChannels as Channel[];

  } catch (error) {
    console.error("Unexpected error in getUserWorkspaceChannels:", error);
    return [];
  }
};
