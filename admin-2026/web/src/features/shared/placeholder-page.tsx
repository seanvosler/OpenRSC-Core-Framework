import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6">
      <Card className="panel-etched">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This route is scaffolded and ready for the first OpenRSC adapter/API.
        </CardContent>
      </Card>
    </div>
  )
}
