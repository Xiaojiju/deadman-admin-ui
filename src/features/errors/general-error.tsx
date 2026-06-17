import { ErrorPage } from './error-page'

export function GeneralError() {
  return <ErrorPage code='500' titleKey='500.title' descKey='500.desc' />
}
