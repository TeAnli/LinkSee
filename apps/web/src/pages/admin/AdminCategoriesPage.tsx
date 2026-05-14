import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function AdminCategoriesPage() {
  const [loading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button>
          <Icon icon="mdi:plus" width={16} height={16} className="mr-2" />
          新建板块
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Icon icon="mdi:loading" width={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            板块管理功能开发中...
          </CardContent>
        </Card>
      )}
    </div>
  );
}
