export interface UserInfo {
  user_id: string;
  social_type: string | null;
  user_name: string | null;
  profile_image_url: string | null;
  profile_color: string | null;
  is_connect: number;
  group_ids: string[] | null;
}
