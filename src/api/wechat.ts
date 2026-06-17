import { type WechatWebInitiateVO } from '@/types/api'
import { get } from '@/lib/http/request'

export const wechatApi = {
  initiateWebLogin() {
    return get<WechatWebInitiateVO>('/api/wechat/login/wechat-web/initiate')
  },
}
