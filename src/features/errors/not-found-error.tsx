import { ErrorPage } from './error-page'

export function NotFoundError() {
  return (
    <ErrorPage code='404' titleKey='404.title' descKey='404.desc' />
  )
}
