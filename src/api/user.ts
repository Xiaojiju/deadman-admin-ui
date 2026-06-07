import { get, put } from '@/lib/http/request'
import {
  type UpdateMyProfileRequest,
  type UserProfileVO,
} from '@/types/api'

export const userApi = {
  getMyProfile() {
    return get<UserProfileVO>('/api/users/me')
  },

  updateMyProfile(body: UpdateMyProfileRequest) {
    return put<UserProfileVO>('/api/users/me', body)
  },
}
