export type SocialType = 'kakao' | 'google' | 'apple';
export type ProfileColor =
  | 'Blue'
  | 'Cyan'
  | 'Green'
  | 'Pink'
  | 'Purple'
  | 'Red'
  | 'Orange'
  | 'Yellow'
  | 'Brown'
  | 'Black';

export class User {
  user_id: string;
  social_id: string | null;
  social_type: SocialType | null;
  user_name: string | null;
  profile_image_url: string | null;
  profile_color: ProfileColor | null;
  is_connect: number;
  last_connected_at: Date | null;
  apple_refresh_token: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
