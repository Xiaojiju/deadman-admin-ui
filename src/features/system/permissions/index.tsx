import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { permissionsApi } from '@/api/system'
import { PageLayout } from '@/components/layout/page-layout'
import { Main } from '@/components/layout/main'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function Permissions() {
  const { t } = useTranslation(['system', 'common'])

  const { data: catalog = [], isLoading: catalogLoading } = useQuery({
    queryKey: ['permissions', 'catalog'],
    queryFn: () => permissionsApi.catalog(),
  })

  const { data: flatList = [], isLoading: flatLoading } = useQuery({
    queryKey: ['permissions', 'flat'],
    queryFn: () => permissionsApi.listFlat(),
  })

  return (
    <PageLayout>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            {t('system:permissions.title')}
          </h2>
          <p className='text-muted-foreground'>
            {t('system:permissions.desc')}
          </p>
        </div>

        <Tabs defaultValue='catalog'>
          <TabsList>
            <TabsTrigger value='catalog'>
              {t('system:permissions.byGroup')}
            </TabsTrigger>
            <TabsTrigger value='flat'>
              {t('system:permissions.flatList')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value='catalog' className='space-y-4'>
            {catalogLoading ? (
              <p className='text-muted-foreground'>{t('common:loading')}</p>
            ) : (
              catalog.map((group) => (
                <Card key={group.code}>
                  <CardHeader>
                    <CardTitle>{group.label}</CardTitle>
                    <CardDescription className='font-mono'>
                      {group.code}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='flex flex-wrap gap-2'>
                      {group.permissions.map((perm) => (
                        <Badge key={perm.code} variant='secondary'>
                          {perm.label}
                          <span className='ms-1 font-mono text-xs opacity-70'>
                            {perm.code}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value='flat'>
            {flatLoading ? (
              <p className='text-muted-foreground'>{t('common:loading')}</p>
            ) : (
              <Card>
                <CardContent className='flex flex-wrap gap-2 pt-6'>
                  {flatList.map((perm) => (
                    <Badge key={perm.code} variant='outline'>
                      {perm.label}
                      <span className='ms-1 font-mono text-xs opacity-70'>
                        {perm.code}
                      </span>
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </Main>
    </PageLayout>
  )
}
