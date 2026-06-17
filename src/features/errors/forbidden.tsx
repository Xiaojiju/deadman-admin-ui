import { ErrorPage } from './error-page'

export function ForbiddenError() {
  return <ErrorPage code='403' titleKey='403.title' descKey='403.desc' />
}
