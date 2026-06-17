import { ErrorPage } from './error-page'

export function UnauthorisedError() {
  return <ErrorPage code='401' titleKey='401.title' descKey='401.desc' />
}
