import { EmailOtpType } from "@supabase/supabase-js";
import { UUID } from "crypto";

export type UserInfo = {
  id: UUID;
  profile_url: string;
  nickname: string;
  gender: string;
  language: string;
  state_msg: string;
  is_deleted: boolean;
  is_blocked: boolean;
  created_at: Date;
  email: EmailOtpType;
};

export type BlockedUserInfo = {
  id: UUID;
  score: number;
  user_info: { is_blocked: boolean; nickname: string };
};

export type formatedTarget = {
  id: UUID;
};
