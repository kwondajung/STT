import { addToQueue, getExistingQueue, findMatch, updateMatch, getSharedConversationId } from "@/api/supabase/match";
import { UserInfo } from "@/types/userType/userType";
import { getRandomNumber } from "@/utils/randomNumber";
import { v4 as uuidv4 } from "uuid";

export const initiateMatching = async (userInfo: UserInfo) => {
  const { data: existingQueue } = await getExistingQueue(userInfo);

  if (!existingQueue || existingQueue.length === 0) {
    await addToQueue(userInfo);
  }

  const { data: matchQueue } = await findMatch(userInfo);

  if (matchQueue && matchQueue.length > 0) {
    const idx = getRandomNumber(matchQueue.length);
    const matchPartner = matchQueue[idx];
    const roomId = (await getSharedConversationId(userInfo.id, matchPartner.user_id as string)) ?? uuidv4();
    await updateMatch(matchPartner.user_id as string, userInfo.id, roomId);
    return roomId;
  }

  return null;
};
